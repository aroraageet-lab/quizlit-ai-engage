import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Copy, Play, Square, Users, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Session {
  id: string;
  session_code: string;
  status: string;
  quiz_id: string;
  current_question_id: string | null;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
}

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  order_index: number;
}

const SessionPresent = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [session, setSession] = useState<Session | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  const fetchSessionData = async () => {
    if (!sessionId) {
      navigate("/dashboard");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('created_by', user.id)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      // Fetch quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', sessionData.quiz_id)
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData);

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', sessionData.quiz_id)
        .order('order_index');

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

    } catch (error: any) {
      console.error('Session fetch error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load session",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const copySessionCode = () => {
    if (session?.session_code) {
      navigator.clipboard.writeText(session.session_code);
      toast({
        title: "Copied!",
        description: "Session code copied to clipboard",
      });
    }
  };

  const startSession = async () => {
    if (!session || questions.length === 0) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          status: 'active',
          current_question_id: questions[0].id,
        })
        .eq('id', session.id);

      if (error) throw error;

      setSession({ ...session, status: 'active', current_question_id: questions[0].id });
      toast({
        title: "Session Started!",
        description: "Participants can now join and answer questions",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const nextQuestion = async () => {
    if (!session || currentQuestionIndex >= questions.length - 1) return;

    const nextIndex = currentQuestionIndex + 1;
    const nextQuestion = questions[nextIndex];

    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          current_question_id: nextQuestion.id,
        })
        .eq('id', session.id);

      if (error) throw error;

      setCurrentQuestionIndex(nextIndex);
      setSession({ ...session, current_question_id: nextQuestion.id });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const endSession = async () => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      if (error) throw error;

      toast({
        title: "Session Ended",
        description: "Thank you for using QuizLit!",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading Session...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Session Code Card */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle>Session Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-6xl font-bold tracking-wider text-primary mb-2">
                  {session?.session_code}
                </div>
                <p className="text-muted-foreground">
                  Share this code with participants to join
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={copySessionCode} variant="outline" size="lg">
                  <Copy className="w-5 h-5 mr-2" />
                  Copy Code
                </Button>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>{participantCount} participants</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{quiz?.title}</CardTitle>
            {quiz?.description && (
              <p className="text-muted-foreground">{quiz.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground">
                {questions.length} questions total
              </div>
              {session?.status === 'waiting' ? (
                <Button onClick={startSession} size="lg" className="bg-gradient-primary">
                  <Play className="w-5 h-5 mr-2" />
                  Start Quiz
                </Button>
              ) : (
                <Button onClick={endSession} variant="destructive" size="lg">
                  <Square className="w-5 h-5 mr-2" />
                  End Session
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Question */}
        {session?.status === 'active' && questions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardTitle>
                {currentQuestionIndex < questions.length - 1 && (
                  <Button onClick={nextQuestion}>
                    Next Question
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">
                  {questions[currentQuestionIndex].question_text}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <div
                      key={option}
                      className={`p-4 rounded-lg border-2 ${
                        questions[currentQuestionIndex].correct_answer === option
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-border'
                      }`}
                    >
                      <span className="font-bold mr-2">{option}.</span>
                      {questions[currentQuestionIndex][`option_${option.toLowerCase()}` as keyof Question]}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SessionPresent;
