import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

const Participate = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [participantName, setParticipantName] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState<string>("waiting");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      navigate("/join");
      return;
    }

    const name = localStorage.getItem(`participant_${sessionId}`);
    if (!name) {
      navigate("/join");
      return;
    }

    setParticipantName(name);
    fetchSessionData();
    setupRealtimeSubscription();

    return () => {
      supabase.channel(`session_${sessionId}`).unsubscribe();
    };
  }, [sessionId]);

  const fetchSessionData = async () => {
    if (!sessionId) return;

    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select("*, quizzes!inner(id)")
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;

      setSessionStatus(sessionData.status);

      if (sessionData.status === "ended") {
        toast({
          title: "Session Ended",
          description: "This quiz session has concluded. Thank you for participating!",
        });
        return;
      }

      // Get total questions count
      const { count } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("quiz_id", sessionData.quiz_id);

      setTotalQuestions(count || 0);

      if (sessionData.current_question_id) {
        await fetchQuestion(sessionData.current_question_id, sessionData.quiz_id);
      }
    } catch (error: any) {
      console.error("Session fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to load session",
        variant: "destructive",
      });
      navigate("/join");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestion = async (questionId: string, quizId: string) => {
    try {
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select("*")
        .eq("id", questionId)
        .single();

      if (questionError) throw questionError;

      setCurrentQuestion(questionData);
      setHasAnswered(false);
      setSelectedAnswer(null);

      // Calculate question number based on order_index
      const { count } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("quiz_id", quizId)
        .lt("order_index", questionData.order_index);

      setQuestionNumber((count || 0) + 1);

      // Check if user already answered this question
      const { data: existingResponse } = await supabase
        .from("responses")
        .select("id")
        .eq("session_id", sessionId!)
        .eq("question_id", questionId)
        .eq("participant_name", participantName)
        .maybeSingle();

      if (existingResponse) {
        setHasAnswered(true);
      }
    } catch (error: any) {
      console.error("Question fetch error:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${sessionId}`,
        },
        async (payload) => {
          const newSession = payload.new as any;
          setSessionStatus(newSession.status);

          if (newSession.status === "ended") {
            toast({
              title: "Session Ended",
              description: "Thank you for participating!",
            });
            return;
          }

          if (newSession.current_question_id && newSession.current_question_id !== currentQuestion?.id) {
            await fetchQuestion(newSession.current_question_id, newSession.quiz_id);
          }
        }
      )
      .subscribe();
  };

  const handleAnswerSelect = async (answer: string) => {
    if (hasAnswered || !currentQuestion || !sessionId) return;

    setSelectedAnswer(answer);

    try {
      const { error } = await supabase.from("responses").insert({
        session_id: sessionId,
        question_id: currentQuestion.id,
        participant_name: participantName,
        selected_answer: answer,
        is_correct: answer === currentQuestion.correct_answer,
      });

      if (error) throw error;

      setHasAnswered(true);
      toast({
        title: "Answer Submitted!",
        description: "Waiting for the next question...",
      });
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive",
      });
      setSelectedAnswer(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-lg">Loading quiz...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionStatus === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <CardTitle className="text-3xl">Welcome, {participantName}!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-muted-foreground">
              The quiz hasn't started yet. Please wait for the presenter to begin.
            </p>
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionStatus === "ended") {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <CardTitle className="text-3xl">Quiz Ended</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <p className="text-lg">Thank you for participating, {participantName}!</p>
            <Button onClick={() => navigate("/join")} className="mt-4">
              Join Another Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl text-center">
          <CardContent className="pt-6">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Waiting for next question...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Question {questionNumber} of {totalQuestions}</span>
              <span>{participantName}</span>
            </div>
            <Progress value={(questionNumber / totalQuestions) * 100} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            {currentQuestion.question_text}
          </h2>

          {hasAnswered ? (
            <div className="text-center space-y-4 py-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <p className="text-xl font-semibold text-green-600">Answer Submitted!</p>
              <p className="text-muted-foreground">
                Waiting for the next question...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {["A", "B", "C", "D"].map((option) => {
                const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof Question] as string;
                const isSelected = selectedAnswer === option;
                
                return (
                  <Button
                    key={option}
                    onClick={() => handleAnswerSelect(option)}
                    variant={isSelected ? "default" : "outline"}
                    className={`h-auto min-h-[60px] p-4 text-left justify-start text-base md:text-lg ${
                      isSelected ? "bg-primary" : ""
                    }`}
                    disabled={hasAnswered}
                  >
                    <span className="font-bold mr-3 text-xl">{option}</span>
                    <span className="flex-1">{optionText}</span>
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Participate;
