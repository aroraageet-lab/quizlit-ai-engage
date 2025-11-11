import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Users, Clock, TrendingUp, Plus, History as HistoryIcon } from "lucide-react";

interface Stats {
  totalQuizzes: number;
  totalSessions: number;
  totalResponses: number;
  recentSessions: number;
}

const DashboardOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalQuizzes: 0,
    totalSessions: 0,
    totalResponses: 0,
    recentSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch total quizzes
      const { count: quizCount } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);

      // Fetch total sessions
      const { count: sessionCount } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);

      // Fetch sessions from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentCount } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      // Fetch total responses across all sessions
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('created_by', user.id);

      let totalResponses = 0;
      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map(s => s.id);
        const { count: responseCount } = await supabase
          .from('responses')
          .select('*', { count: 'exact', head: true })
          .in('session_id', sessionIds);
        
        totalResponses = responseCount || 0;
      }

      setStats({
        totalQuizzes: quizCount || 0,
        totalSessions: sessionCount || 0,
        totalResponses,
        recentSessions: recentCount || 0,
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

  const statCards = [
    {
      title: "Total Quizzes",
      value: stats.totalQuizzes,
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Sessions",
      value: stats.totalSessions,
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Responses",
      value: stats.totalResponses,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Recent Sessions",
      value: stats.recentSessions,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      subtitle: "Last 7 days",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold mb-2">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your quizzes.
          </p>
        </div>
        <Link to="/quiz/new">
          <Button size="lg" className="bg-gradient-primary shadow-glow">
            <Plus className="w-5 h-5 mr-2" />
            Create Quiz
          </Button>
        </Link>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <Card key={card.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.subtitle}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/quiz/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Create New Quiz
              </Button>
            </Link>
            <Link to="/dashboard/quizzes" className="block">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                View All Quizzes
              </Button>
            </Link>
            <Link to="/dashboard/history" className="block">
              <Button variant="outline" className="w-full justify-start">
                <HistoryIcon className="w-4 h-4 mr-2" />
                View Session History
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p className="mb-3">
                Welcome to QuizLit! Here's how to get started:
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Create your first quiz with questions</li>
                <li>Start a live session to get a 6-digit code</li>
                <li>Share the code with participants</li>
                <li>View real-time responses and results</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
