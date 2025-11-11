import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Users, Clock, TrendingUp, Plus, History as HistoryIcon, User, Lock, Mail, Sparkles, PlayCircle, BarChart3, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
        <div className="relative px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Welcome Back
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Hello, <span className="text-primary">{userName}</span>!
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Ready to create engaging quizzes? Your dashboard is your command center for interactive learning.
              </p>
            </div>
            <Link to="/quiz/new">
              <Button size="lg" className="bg-gradient-primary shadow-glow text-lg px-8 py-6 h-auto">
                <Plus className="w-6 h-6 mr-2" />
                Create New Quiz
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Statistics</h2>
          <Link to="/dashboard/reports">
            <Button variant="ghost" size="sm">
              View All Reports
              <BarChart3 className="w-4 h-4 ml-2" />
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
              <Card 
                key={card.title} 
                className="hover:shadow-lg hover:scale-105 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`p-3 rounded-xl ${card.bgColor}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-1">{card.value}</div>
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

      {/* Quick Actions Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-3 shadow-glow">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl">Create Quiz</CardTitle>
            <CardDescription>Build your custom quiz with AI or manually</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Link to="/quiz/new" className="block">
              <Button className="w-full bg-gradient-primary group-hover:shadow-glow transition-all">
                Get Started
                <Zap className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-secondary/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-3 border border-green-500/30">
              <PlayCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">Start Session</CardTitle>
            <CardDescription>Launch a live quiz session with participants</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Link to="/dashboard/quizzes" className="block">
              <Button variant="outline" className="w-full border-green-500/30 hover:bg-green-500/10">
                View My Quizzes
                <BookOpen className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-accent/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-3 border border-orange-500/30">
              <HistoryIcon className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-xl">View History</CardTitle>
            <CardDescription>Check past sessions and analytics</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Link to="/dashboard/history" className="block">
              <Button variant="outline" className="w-full border-orange-500/30 hover:bg-orange-500/10">
                Session History
                <BarChart3 className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Account Settings Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-muted/30 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Account Settings
          </CardTitle>
          <CardDescription>Manage your profile and security</CardDescription>
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
