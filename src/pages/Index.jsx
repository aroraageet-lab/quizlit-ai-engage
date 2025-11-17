import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground leading-tight">
              Create. Engage. <span className="bg-gradient-primary bg-clip-text text-transparent">Analyze.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Interactive quizzes powered by AI. Get everyone participating with real-time results and instant insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full text-base px-8 h-12">
                  Get started free
                </Button>
              </Link>
              <Link to="/join">
                <Button size="lg" variant="outline" className="rounded-full text-base px-8 h-12">
                  Join a quiz
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-8 rounded-xl">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Quiz Generator</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Generate 10, 20, or 30 questions on any topic instantly. Choose your difficulty level and let AI do the work.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Results</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Watch responses come in live as your audience participates. See results update instantly.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Participation</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Audience joins with a simple 6-digit code. No login required. Works perfectly on mobile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create engaging quizzes in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Create or Generate</h3>
              <p className="text-muted-foreground">
                Build your quiz manually or let AI generate questions on any topic you choose.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Share the Code</h3>
              <p className="text-muted-foreground">
                Start a session and share the 6-digit code with your audience. They join instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Analyze Results</h3>
              <p className="text-muted-foreground">
                Watch responses in real-time and review detailed analytics after the quiz ends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Educators Section */}
      <section id="educators" className="py-20 bg-gradient-to-br from-primary/5 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Perfect for Educators</h2>
              <p className="text-xl text-muted-foreground">
                Trusted by teachers and trainers worldwide
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Classroom Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Turn any lesson into an interactive experience. Students love the game-like atmosphere and instant feedback.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Corporate Training</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Make onboarding and training sessions more engaging. Track employee understanding with detailed analytics.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Remote Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Perfect for virtual classrooms. Works seamlessly across devices with no installation required.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Continuous Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Regular knowledge checks keep students on track. Identify gaps early and adjust your teaching accordingly.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Quizzes?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of educators creating engaging learning experiences
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8 h-12 text-base">
                Start creating for free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
