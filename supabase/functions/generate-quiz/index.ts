import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, difficulty, questionCount } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Generating ${questionCount} quiz questions on topic: ${topic}, difficulty: ${difficulty}`);

    const systemPrompt = `You are an expert quiz question generator. Create EXACTLY ${questionCount} high-quality, educational multiple-choice questions about "${topic}" at ${difficulty} difficulty level.

Requirements:
- Generate EXACTLY ${questionCount} questions
- Each question must have 4 distinct options (A, B, C, D)
- Mark one correct answer using the letter (A, B, C, or D)
- Questions should be clear, accurate, and educational
- Difficulty: ${difficulty === 'easy' ? 'Simple, foundational concepts' : difficulty === 'medium' ? 'Moderate complexity, requires understanding' : 'Advanced, challenging concepts'}
- Vary the correct answer position (don't always make it option A)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt 
          },
          { 
            role: 'user', 
            content: `Generate ${questionCount} quiz questions about: ${topic}` 
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_quiz_questions',
              description: 'Generate quiz questions with multiple choice options',
              parameters: {
                type: 'object',
                properties: {
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        question_text: { type: 'string', description: 'The question text' },
                        option_a: { type: 'string', description: 'First option' },
                        option_b: { type: 'string', description: 'Second option' },
                        option_c: { type: 'string', description: 'Third option' },
                        option_d: { type: 'string', description: 'Fourth option' },
                        correct_answer: { type: 'string', enum: ['A', 'B', 'C', 'D'], description: 'The correct answer letter' }
                      },
                      required: ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer']
                    }
                  }
                },
                required: ['questions']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_quiz_questions' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response received');

    // Extract structured output from tool call
    let parsedQuestions;
    try {
      const toolCall = data.choices[0].message.tool_calls?.[0];
      if (toolCall && toolCall.function) {
        const functionArgs = JSON.parse(toolCall.function.arguments);
        parsedQuestions = functionArgs;
      } else {
        // Fallback to content parsing if tool call not present
        const aiResponse = data.choices[0].message.content;
        console.log('Fallback to content parsing');
        const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || 
                         aiResponse.match(/```\n?([\s\S]*?)\n?```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : aiResponse;
        parsedQuestions = JSON.parse(jsonStr);
      }
      
      // Validate we got the expected number of questions
      if (!parsedQuestions.questions || parsedQuestions.questions.length !== questionCount) {
        console.warn(`Expected ${questionCount} questions, got ${parsedQuestions.questions?.length || 0}`);
      }
      
      console.log(`Successfully generated ${parsedQuestions.questions.length} questions`);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI-generated questions');
    }

    return new Response(
      JSON.stringify(parsedQuestions),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});