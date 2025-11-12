import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Users, Clock, TrendingUp, Plus, History as HistoryIcon, User, Lock, Mail, PlayCircle, BarChart3, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Stats {
  totalQuizzes: number;
  totalSessions: number;
  totalResponses: number;
  recentSessions: number;
}

interface Quiz {
  id: string;
  title: string;
  created_at: string;
}

const DashboardOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalQuizzes: 0,
    totalSessions: 0,
    totalResponses: 0,
    recentSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
    fetchStats();
    fetchRecentQuizzes();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        
        // Fetch profile data if exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        
        setUserName(profile?.full_name || user.email?.split('@')[0] || "User");
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
    }
  };

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

  const fetchRecentQuizzes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, created_at')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentQuizzes(data || []);
    } catch (error: any) {
      console.error('Error fetching recent quizzes:', error);
    } finally {
      setQuizzesLoading(false);
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

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Password updated successfully",
      });

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-primary">{userName}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your quizzes and track your session performance
          </p>
        </div>
        <Link to="/quiz/new">
          <Button className="bg-gradient-primary shadow-md hover:shadow-lg transition-shadow">
            <Plus className="w-4 h-4 mr-2" />
            Create New Quiz
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Statistics</h2>
          <Link to="/dashboard/reports">
            <Button variant="ghost" size="sm" className="text-xs">
              View Reports
              <BarChart3 className="w-3 h-3 ml-2" />
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <Card 
                key={card.title} 
                className="hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{card.value}</div>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {card.subtitle}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Quizzes Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Quizzes</h2>
          <Link to="/dashboard/quizzes">
            <Button variant="ghost" size="sm" className="text-xs">
              View All
              <BookOpen className="w-3 h-3 ml-2" />
            </Button>
          </Link>
        </div>

        {quizzesLoading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : recentQuizzes.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {recentQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow group">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base line-clamp-1">{quiz.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Created {new Date(quiz.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link to={`/session/start/${quiz.id}`}>
                    <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <PlayCircle className="w-3 h-3 mr-2" />
                      Start Session
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground text-sm mb-4">No quizzes yet</p>
              <Link to="/quiz/new">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="group hover:shadow-md transition-shadow border-l-4 border-l-primary/50">
          <CardHeader className="pb-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center mb-2">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-base">Create Quiz</CardTitle>
            <CardDescription className="text-xs">Build custom quizzes</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link to="/quiz/new" className="block">
              <Button size="sm" className="w-full bg-gradient-primary">
                Get Started
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-shadow border-l-4 border-l-green-500/50">
          <CardHeader className="pb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-2 border border-green-500/30">
              <PlayCircle className="w-5 h-5 text-green-600" />
            </div>
            <CardTitle className="text-base">Start Session</CardTitle>
            <CardDescription className="text-xs">Launch live quiz</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link to="/dashboard/quizzes" className="block">
              <Button size="sm" variant="outline" className="w-full">
                My Quizzes
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-shadow border-l-4 border-l-orange-500/50">
          <CardHeader className="pb-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mb-2 border border-orange-500/30">
              <HistoryIcon className="w-5 h-5 text-orange-600" />
            </div>
            <CardTitle className="text-base">View History</CardTitle>
            <CardDescription className="text-xs">Past sessions</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link to="/dashboard/history" className="block">
              <Button size="sm" variant="outline" className="w-full">
                Session History
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Account Settings Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-primary" />
            Account Settings
          </CardTitle>
          <CardDescription className="text-xs">Manage your profile and security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground text-xs">
                <User className="w-3 h-3" />
                Username
              </Label>
              <div className="px-4 py-3 bg-background/50 rounded-lg font-medium border">
                {userName}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground text-xs">
                <Mail className="w-3 h-3" />
                Email Address
              </Label>
              <div className="px-4 py-3 bg-background/50 rounded-lg font-medium border">
                {userEmail}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto border-primary/30 hover:bg-primary/5">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your new password below. Make sure it's at least 6 characters long.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="bg-gradient-primary"
                  >
                    {changingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
