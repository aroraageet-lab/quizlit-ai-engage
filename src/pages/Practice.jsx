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

const Practice = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState("10");
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
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
    } catch (error) {
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
        title: "No Answer Selected",
        description: "Please select an answer before submitting",
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
      title: isCorrect ? "Correct!" : "Incorrect",
      description: isCorrect 
        ? "Great job! Moving to next question." 
        : `The correct answer was: ${currentQuestion.correct_answer}`,
      variant: isCorrect ? "default" : "destructive",
    });

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer("");
      } else {
        setShowResult(true);
      }
    }, 1500);
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Practice Mode
          </h1>
          <p className="text-muted-foreground">
            Generate AI-powered quizzes and test your knowledge
          </p>
        </div>

        {!questions.length && !showResult && (
          <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <CardTitle>AI Quiz Generator</CardTitle>
              </div>
              <CardDescription>
                Let AI create quiz questions for you instantly
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
                className="w-full mt-6"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Quiz with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {questions.length > 0 && !showResult && currentQuestion && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </CardTitle>
                  <div className="text-sm font-medium">
                    Score: {score}/{questions.length}
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </CardHeader>
              <CardContent className="space-y-6">
                <h2 className="text-xl font-semibold">
                  {currentQuestion.question_text}
                </h2>

                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                  <div className="space-y-3">
                    {['option_a', 'option_b', 'option_c', 'option_d'].map((optionKey) => (
                      <div
                        key={optionKey}
                        className={`flex items-center space-x-2 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 ${
                          selectedAnswer === currentQuestion[optionKey]
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        }`}
                        onClick={() => setSelectedAnswer(currentQuestion[optionKey])}
                      >
                        <RadioGroupItem
                          value={currentQuestion[optionKey]}
                          id={optionKey}
                        />
                        <Label
                          htmlFor={optionKey}
                          className="flex-1 cursor-pointer"
                        >
                          {currentQuestion[optionKey]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  className="w-full"
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
              <div className="mx-auto w-20 h-20 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                {score / questions.length >= 0.7 ? (
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                ) : (
                  <XCircle className="w-12 h-12 text-destructive" />
                )}
              </div>
              <CardTitle className="text-3xl mb-2">Quiz Complete!</CardTitle>
              <CardDescription className="text-lg">
                You scored {score} out of {questions.length} questions correctly
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">
                {Math.round((score / questions.length) * 100)}%
              </div>
              <p className="text-muted-foreground">
                {score / questions.length >= 0.7
                  ? "Great job! Keep up the good work!"
                  : "Keep practicing to improve your score!"}
              </p>
              <Button onClick={handleRestart} size="lg" className="mt-4">
                <RotateCcw className="mr-2 h-5 w-5" />
                Start New Quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Practice;
