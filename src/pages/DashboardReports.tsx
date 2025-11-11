import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, PieChart, TrendingUp, CheckCircle } from "lucide-react";

interface ReportData {
  totalSessions: number;
  completedSessions: number;
  totalParticipants: number;
  averageResponsesPerSession: number;
  quizPerformance: Array<{
    quizTitle: string;
    sessionCount: number;
    totalResponses: number;
  }>;
}

const DashboardReports = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalSessions: 0,
    completedSessions: 0,
    totalParticipants: 0,
    averageResponsesPerSession: 0,
    quizPerformance: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          id,
          status,
          quizzes!inner(id, title)
        `)
        .eq('created_by', user.id);

      if (sessionsError) throw sessionsError;

      const totalSessions = sessions?.length || 0;
      const completedSessions = sessions?.filter(s => s.status === 'ended').length || 0;

      // Fetch all responses
      const sessionIds = sessions?.map(s => s.id) || [];
      let totalResponses = 0;
      
      if (sessionIds.length > 0) {
        const { count } = await supabase
          .from('responses')
          .select('*', { count: 'exact', head: true })
          .in('session_id', sessionIds);
        
        totalResponses = count || 0;
      }

      // Calculate quiz performance
      const quizMap = new Map<string, { title: string; sessions: number; responses: number }>();
      
      for (const session of sessions || []) {
        const quizId = (session.quizzes as any).id;
        const quizTitle = (session.quizzes as any).title;
        
        if (!quizMap.has(quizId)) {
          quizMap.set(quizId, {
            title: quizTitle,
            sessions: 0,
            responses: 0,
          });
        }
        
        const quiz = quizMap.get(quizId)!;
        quiz.sessions += 1;

        // Get responses for this session
        const { count } = await supabase
          .from('responses')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id);
        
        quiz.responses += count || 0;
      }

      const quizPerformance = Array.from(quizMap.values()).map(q => ({
        quizTitle: q.title,
        sessionCount: q.sessions,
        totalResponses: q.responses,
      }));

      setReportData({
        totalSessions,
        completedSessions,
        totalParticipants: totalResponses,
        averageResponsesPerSession: totalSessions > 0 ? Math.round(totalResponses / totalSessions) : 0,
        quizPerformance,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: "Total Sessions",
      value: reportData.totalSessions,
      icon: BarChart3,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Completed Sessions",
      value: reportData.completedSessions,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Participants",
      value: reportData.totalParticipants,
      icon: PieChart,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Avg. Responses/Session",
      value: reportData.averageResponsesPerSession,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold mb-2">Reports & Analytics</h2>
        <p className="text-muted-foreground">
          Detailed insights into your quiz performance
        </p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-12 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <Card key={metric.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metric.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {reportData.quizPerformance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Quiz Performance</CardTitle>
                <CardDescription>
                  Sessions and responses breakdown by quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.quizPerformance.map((quiz, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 rounded-lg border"
                    >
                      <div>
                        <h4 className="font-medium">{quiz.quizTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                          {quiz.sessionCount} session{quiz.sessionCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{quiz.totalResponses}</div>
                        <p className="text-sm text-muted-foreground">responses</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardReports;
