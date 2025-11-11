import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users } from "lucide-react";
import Navbar from "@/components/Navbar";

const Join = () => {
  const [sessionCode, setSessionCode] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionCode.trim() || sessionCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit session code",
        variant: "destructive",
      });
      return;
    }

    if (!participantName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: session, error } = await supabase
        .from('sessions')
        .select('id, status')
        .eq('session_code', sessionCode.toUpperCase())
        .single();

      if (error || !session) {
        throw new Error("Invalid session code");
      }

      if (session.status !== 'active' && session.status !== 'waiting') {
        throw new Error("This session has ended");
      }

      // Store participant name in localStorage for this session
      localStorage.setItem(`participant_${session.id}`, participantName);

      navigate(`/participate/${session.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Join a Quiz</CardTitle>
          <CardDescription>
            Enter the 6-digit session code to participate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Session Code</Label>
              <Input
                id="code"
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="000000"
                maxLength={6}
                className="text-center text-3xl font-bold tracking-widest"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary"
              size="lg"
              disabled={loading}
            >
              {loading ? "Joining..." : "Join Quiz"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have a code?{" "}
              <a href="/" className="text-primary hover:underline">
                Learn more about QuizLit
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Join;