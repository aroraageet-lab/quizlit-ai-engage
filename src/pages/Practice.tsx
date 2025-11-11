import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";

interface Question {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

const Practice = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState("10");
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the Practice page",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    setCheckingAuth(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnsweredQuestions([]);
    setShowResult(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          topic: topic.trim(),
          difficulty,
          questionCount: parseInt(questionCount),
        },
      });

      if (error) throw error;

      if (data && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnsweredQuestions(new Array(data.questions.length).fill(false));
        toast({
          title: "Success!",
          description: `Generated ${data.questions.length} questions. Start practicing!`,
        });
      } else {
        throw new Error("No questions generated");
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      toast({
        title: "Please select an answer",
        variant: "destructive",
      });
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    if (isCorrect) {
      setScore(score + 1);
    }

    const newAnsweredQuestions = [...answeredQuestions];
    newAnsweredQuestions[currentQuestionIndex] = true;
    setAnsweredQuestions(newAnsweredQuestions);

    toast({
      title: isCorrect ? "Correct! 🎉" : "Incorrect",
      description: isCorrect 
        ? "Great job!" 
        : `The correct answer was ${currentQuestion.correct_answer}`,
      variant: isCorrect ? "default" : "destructive",
    });

    setSelectedAnswer("");

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 1500);
    } else {
      setTimeout(() => {
        setShowResult(true);
      }, 1500);
    }
  };

  const handleRestart = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnsweredQuestions([]);
    setShowResult(false);
    setSelectedAnswer("");
    setTopic("");
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">Practice Quiz</h1>
          <p className="text-muted-foreground text-lg">
            Generate AI-powered quizzes and test your knowledge
          </p>
        </div>

        {!questions.length && !showResult && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <CardTitle>Generate Practice Quiz</CardTitle>
              </div>
              <CardDescription>
                Create a personalized quiz to test your knowledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., World History, Mathematics, Science"
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="count">Number of Questions</Label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger id="count">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                      <SelectItem value="30">30 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full mt-6 bg-gradient-primary"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Practice Quiz
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {questions.length > 0 && !showResult && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </CardTitle>
                    <div className="text-sm font-medium">
                      Score: {score}/{answeredQuestions.filter(Boolean).length}
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{currentQuestion.question_text}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <div
                        key={option}
                        className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <RadioGroupItem value={option} id={`option-${option}`} />
                        <Label
                          htmlFor={`option-${option}`}
                          className="flex-1 cursor-pointer text-base"
                        >
                          <span className="font-semibold mr-2">{option}.</span>
                          {currentQuestion[`option_${option.toLowerCase()}` as keyof Question]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  className="w-full mt-6 bg-gradient-primary"
                  size="lg"
                >
                  Submit Answer
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {showResult && (
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {score / questions.length >= 0.7 ? (
                  <CheckCircle2 className="w-20 h-20 text-green-500" />
                ) : (
                  <XCircle className="w-20 h-20 text-orange-500" />
                )}
              </div>
              <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
              <CardDescription className="text-lg mt-2">
                You scored {score} out of {questions.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {Math.round((score / questions.length) * 100)}%
                </div>
                <p className="text-muted-foreground">
                  {score / questions.length >= 0.9
                    ? "Outstanding! 🌟"
                    : score / questions.length >= 0.7
                    ? "Great job! 👏"
                    : score / questions.length >= 0.5
                    ? "Good effort! Keep practicing! 💪"
                    : "Keep learning! You'll do better next time! 📚"}
                </p>
              </div>

              <div className="grid gap-3">
                <Button
                  onClick={handleRestart}
                  className="w-full bg-gradient-primary"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Start New Practice Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Practice;
