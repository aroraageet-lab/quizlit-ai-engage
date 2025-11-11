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
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Create or Generate</h3>
              <p className="text-muted-foreground">
                Build your quiz manually or let AI generate questions instantly on any topic
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Share Code</h3>
              <p className="text-muted-foreground">
                Start a session and share the 6-digit code with your audience
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">See Live Results</h3>
              <p className="text-muted-foreground">
                Watch responses appear in real-time and download detailed analytics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Educators Section */}
      <section id="educators" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Built for Educators
                </h2>
                <p className="text-xl text-muted-foreground mb-6">
                  Make learning interactive and engaging. QuizLit helps teachers create 
                  memorable classroom experiences with instant feedback and AI-powered content.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Quick Assessment</h4>
                      <p className="text-sm text-muted-foreground">
                        Check understanding in real-time and adjust your teaching
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Student Engagement</h4>
                      <p className="text-sm text-muted-foreground">
                        Every student participates, no matter the class size
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Save Time</h4>
                      <p className="text-sm text-muted-foreground">
                        AI generates curriculum-aligned questions in seconds
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-8 rounded-2xl shadow-lg">
              <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">100% Free</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Free for Everyone</h3>
                  <p className="text-muted-foreground mb-6">
                    QuizLit is completely free for all educators and organizations
                  </p>
                  <Link to="/auth">
                    <Button className="bg-gradient-primary">
                      Get Started Free
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-hero rounded-3xl p-12 text-center shadow-lg max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to engage your audience?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Start creating interactive quizzes in minutes. No credit card required.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Get Started Free
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