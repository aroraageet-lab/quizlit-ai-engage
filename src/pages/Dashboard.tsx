import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, Sparkles, Play, Pencil, Trash2 } from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

const Dashboard = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    fetchQuizzes();
  };

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const deleteQuiz = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
      fetchQuizzes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              QuizLit
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold mb-2">My Quizzes</h2>
            <p className="text-muted-foreground">Create and manage your interactive quizzes</p>
          </div>
          <Link to="/quiz/new">
            <Button size="lg" className="bg-gradient-primary shadow-glow">
              <Plus className="w-5 h-5 mr-2" />
              Create Quiz
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
              <h3 className="text-2xl font-bold mb-2">No quizzes yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first quiz to get started
              </p>
              <Link to="/quiz/new">
                <Button className="bg-gradient-primary">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {quiz.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Link to={`/quiz/${quiz.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Link to={`/session/new/${quiz.id}`} className="flex-1">
                      <Button className="w-full bg-gradient-primary">
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteQuiz(quiz.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;