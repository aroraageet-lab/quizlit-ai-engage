import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Sparkles, Plus, Trash2, GripVertical } from "lucide-react";
import { Link } from "react-router-dom";
import AIQuizGenerator from "@/components/AIQuizGenerator";

interface Question {
  id?: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  order_index: number;
}

const QuizBuilder = () => {
  const { id } = useParams();
  const isEdit = id !== "new";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "A",
      order_index: 0,
    },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchQuiz();
    }
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();

      if (quizError) throw quizError;

      setTitle(quiz.title);
      setDescription(quiz.description || "");

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', id)
        .order('order_index');

      if (questionsError) throw questionsError;

      if (questionsData && questionsData.length > 0) {
        setQuestions(questionsData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a quiz title",
        variant: "destructive",
      });
      return;
    }

    const validQuestions = questions.filter(
      (q) =>
        q.question_text.trim() &&
        q.option_a.trim() &&
        q.option_b.trim() &&
        q.option_c.trim() &&
        q.option_d.trim()
    );

    if (validQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one complete question",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      let quizId = id;

      if (!isEdit) {
        const { data: userData } = await supabase.auth.getUser();
        
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .insert({
            title,
            description,
            created_by: userData.user?.id,
          })
          .select()
          .single();

        if (quizError) throw quizError;
        quizId = quizData.id;
      } else {
        const { error: updateError } = await supabase
          .from('quizzes')
          .update({ title, description })
          .eq('id', quizId);

        if (updateError) throw updateError;

        // Delete existing questions
        const { error: deleteError } = await supabase
          .from('questions')
          .delete()
          .eq('quiz_id', quizId);

        if (deleteError) throw deleteError;
      }

      // Insert questions
      const questionsToInsert = validQuestions.map((q, index) => ({
        quiz_id: quizId,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        order_index: index,
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast({
        title: "Success",
        description: isEdit ? "Quiz updated successfully" : "Quiz created successfully",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
        order_index: questions.length,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleAIGenerated = (generatedQuestions: any[]) => {
    const newQuestions = generatedQuestions.map((q, index) => ({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      order_index: questions.length + index,
    }));

    setQuestions([...questions, ...newQuestions]);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">
                {isEdit ? "Edit Quiz" : "Create Quiz"}
              </h1>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Quiz"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter quiz description (optional)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <AIQuizGenerator onQuestionsGenerated={handleAIGenerated} />

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Questions</h2>
            <Button onClick={addQuestion} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>

          {questions.map((question, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                  </div>
                  {questions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Question Text *</Label>
                  <Input
                    value={question.question_text}
                    onChange={(e) => updateQuestion(index, "question_text", e.target.value)}
                    placeholder="Enter your question"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Option A *</Label>
                    <Input
                      value={question.option_a}
                      onChange={(e) => updateQuestion(index, "option_a", e.target.value)}
                      placeholder="Option A"
                    />
                  </div>
                  <div>
                    <Label>Option B *</Label>
                    <Input
                      value={question.option_b}
                      onChange={(e) => updateQuestion(index, "option_b", e.target.value)}
                      placeholder="Option B"
                    />
                  </div>
                  <div>
                    <Label>Option C *</Label>
                    <Input
                      value={question.option_c}
                      onChange={(e) => updateQuestion(index, "option_c", e.target.value)}
                      placeholder="Option C"
                    />
                  </div>
                  <div>
                    <Label>Option D *</Label>
                    <Input
                      value={question.option_d}
                      onChange={(e) => updateQuestion(index, "option_d", e.target.value)}
                      placeholder="Option D"
                    />
                  </div>
                </div>

                <div>
                  <Label>Correct Answer *</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={question.correct_answer}
                    onChange={(e) => updateQuestion(index, "correct_answer", e.target.value)}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default QuizBuilder;