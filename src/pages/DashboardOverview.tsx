import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Users, Clock, TrendingUp, Plus, History as HistoryIcon, User, Lock, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
    fetchStats();
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold mb-2">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome back, {userName}! Here's what's happening with your quizzes.
          </p>
        </div>
        <Link to="/quiz/new">
          <Button size="lg" className="bg-gradient-primary shadow-glow">
            <Plus className="w-5 h-5 mr-2" />
            Create Quiz
          </Button>
        </Link>
      </div>

      {/* User Profile Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            My Profile
          </CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                Username
              </Label>
              <div className="px-3 py-2 bg-muted/50 rounded-lg font-medium">
                {userName}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <div className="px-3 py-2 bg-muted/50 rounded-lg font-medium">
                {userEmail}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
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
