import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Users, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Session {
  id: string;
  session_code: string;
  status: string;
  created_at: string;
  ended_at: string | null;
  quiz: {
    title: string;
  };
  responseCount: number;
}

const DashboardHistory = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch sessions with quiz title
      const { data: sessionsData, error } = await supabase
        .from('sessions')
        .select(`
          id,
          session_code,
          status,
          created_at,
          ended_at,
          quizzes!inner(title)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch response counts for each session
      const sessionsWithCounts = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const { count } = await supabase
            .from('responses')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          return {
            ...session,
            quiz: { title: (session.quizzes as any).title },
            responseCount: count || 0,
          };
        })
      );

      setSessions(sessionsWithCounts);
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      waiting: "secondary",
      active: "default",
      ended: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold mb-2">Session History</h2>
        <p className="text-muted-foreground">
          View all your past quiz sessions and their results
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-2xl font-bold mb-2">No sessions yet</h3>
            <p className="text-muted-foreground mb-6">
              Start a quiz session to see it appear here
            </p>
            <Link to="/dashboard/quizzes">
              <Button className="bg-gradient-primary">
                View My Quizzes
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="mb-2">{session.quiz.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(session.created_at), "MMM dd, yyyy")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(session.created_at), "hh:mm a")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {session.responseCount} responses
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(session.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">Session Code:</span>{" "}
                    <code className="px-2 py-1 bg-muted rounded text-primary font-mono">
                      {session.session_code}
                    </code>
                  </div>
                  {session.status === 'active' && (
                    <Link to={`/session/${session.id}/present`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Session
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardHistory;
