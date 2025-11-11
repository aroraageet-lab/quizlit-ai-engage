import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Users, Award, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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

interface Response {
  id: string;
  question_id: string;
  participant_name: string;
  selected_answer: string;
  is_correct: boolean;
}

interface QuestionStats {
  question: Question;
  totalResponses: number;
  correctCount: number;
  incorrectCount: number;
  correctPercentage: number;
  answerDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
}

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

const SessionResults = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [sessionCode, setSessionCode] = useState<string>("");
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStats[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [averageScore, setAverageScore] = useState(0);

  useEffect(() => {
    fetchResultsData();
  }, [sessionId]);

  const fetchResultsData = async () => {
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
        .select('*, quizzes!inner(id, title)')
        .eq('id', sessionId)
        .eq('created_by', user.id)
        .single();

      if (sessionError) throw sessionError;

      setSessionCode(sessionData.session_code);
      setQuizTitle(sessionData.quizzes.title);

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', sessionData.quiz_id)
        .order('order_index');

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

      // Fetch responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .eq('session_id', sessionId);

      if (responsesError) throw responsesError;
      setResponses(responsesData || []);

      // Calculate statistics
      calculateStats(questionsData || [], responsesData || []);

    } catch (error: any) {
      console.error('Results fetch error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load results",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (questions: Question[], responses: Response[]) => {
    // Calculate unique participants
    const uniqueParticipants = new Set(responses.map(r => r.participant_name));
    setTotalParticipants(uniqueParticipants.size);

    // Calculate average score
    if (uniqueParticipants.size > 0 && questions.length > 0) {
      const participantScores = Array.from(uniqueParticipants).map(participant => {
        const participantResponses = responses.filter(r => r.participant_name === participant);
        const correctAnswers = participantResponses.filter(r => r.is_correct).length;
        return (correctAnswers / questions.length) * 100;
      });
      const avgScore = participantScores.reduce((sum, score) => sum + score, 0) / participantScores.length;
      setAverageScore(Math.round(avgScore));
    }

    // Calculate per-question statistics
    const stats: QuestionStats[] = questions.map(question => {
      const questionResponses = responses.filter(r => r.question_id === question.id);
      const correctCount = questionResponses.filter(r => r.is_correct).length;
      const totalResponses = questionResponses.length;
      
      const answerDistribution = {
        A: questionResponses.filter(r => r.selected_answer === 'A').length,
        B: questionResponses.filter(r => r.selected_answer === 'B').length,
        C: questionResponses.filter(r => r.selected_answer === 'C').length,
        D: questionResponses.filter(r => r.selected_answer === 'D').length,
      };

      return {
        question,
        totalResponses,
        correctCount,
        incorrectCount: totalResponses - correctCount,
        correctPercentage: totalResponses > 0 ? Math.round((correctCount / totalResponses) * 100) : 0,
        answerDistribution,
      };
    });

    setQuestionStats(stats);
  };

  const exportToCSV = () => {
    if (responses.length === 0) {
      toast({
        title: "No Data",
        description: "No responses to export",
        variant: "destructive",
      });
      return;
    }

    // Create CSV header
    const header = "Participant,Question,Selected Answer,Correct Answer,Is Correct\n";
    
    // Create CSV rows
    const rows = responses.map(response => {
      const question = questions.find(q => q.id === response.question_id);
      return [
        response.participant_name,
        question?.question_text || 'Unknown',
        response.selected_answer,
        question?.correct_answer || '',
        response.is_correct ? 'Yes' : 'No'
      ].map(field => `"${field}"`).join(',');
    }).join('\n');

    // Download file
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_results_${sessionCode}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: "Results downloaded as CSV",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading Results...</h2>
        </div>
      </div>
    );
  }

  const overallStats = questionStats.length > 0 ? {
    totalCorrect: questionStats.reduce((sum, stat) => sum + stat.correctCount, 0),
    totalResponses: questionStats.reduce((sum, stat) => sum + stat.totalResponses, 0)
  } : { totalCorrect: 0, totalResponses: 0 };

  const overallPieData = [
    { name: 'Correct', value: overallStats.totalCorrect, color: '#10B981' },
    { name: 'Incorrect', value: overallStats.totalResponses - overallStats.totalCorrect, color: '#EF4444' }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/dashboard/reports")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{quizTitle}</h1>
              <p className="text-muted-foreground">Session Code: {sessionCode}</p>
            </div>
          </div>
          <Button onClick={exportToCSV} className="bg-gradient-primary">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalParticipants}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{averageScore}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {overallStats.totalResponses > 0 
                  ? Math.round((overallStats.totalCorrect / overallStats.totalResponses) * 100)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Correct/Incorrect Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overallPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {overallPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Per-Question Analysis */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Question Analysis</h2>
          
          {questionStats.map((stat, index) => {
            const chartData = [
              { answer: 'A', responses: stat.answerDistribution.A, isCorrect: stat.question.correct_answer === 'A' },
              { answer: 'B', responses: stat.answerDistribution.B, isCorrect: stat.question.correct_answer === 'B' },
              { answer: 'C', responses: stat.answerDistribution.C, isCorrect: stat.question.correct_answer === 'C' },
              { answer: 'D', responses: stat.answerDistribution.D, isCorrect: stat.question.correct_answer === 'D' },
            ];

            return (
              <Card key={stat.question.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {index + 1}: {stat.question.question_text}
                  </CardTitle>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{stat.totalResponses} responses</span>
                    <span className="text-green-600 font-semibold">
                      {stat.correctPercentage}% correct
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="answer" />
                      <YAxis />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
                                <p className="font-semibold">Option {data.answer}</p>
                                <p className="text-sm">{data.responses} responses</p>
                                {data.isCorrect && (
                                  <p className="text-green-600 text-sm font-semibold">✓ Correct Answer</p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="responses" 
                        fill="#8B5CF6"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-semibold">A:</span> {stat.question.option_a}
                      {stat.question.correct_answer === 'A' && <span className="text-green-600 ml-2">✓</span>}
                    </div>
                    <div>
                      <span className="font-semibold">B:</span> {stat.question.option_b}
                      {stat.question.correct_answer === 'B' && <span className="text-green-600 ml-2">✓</span>}
                    </div>
                    <div>
                      <span className="font-semibold">C:</span> {stat.question.option_c}
                      {stat.question.correct_answer === 'C' && <span className="text-green-600 ml-2">✓</span>}
                    </div>
                    <div>
                      <span className="font-semibold">D:</span> {stat.question.option_d}
                      {stat.question.correct_answer === 'D' && <span className="text-green-600 ml-2">✓</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default SessionResults;
