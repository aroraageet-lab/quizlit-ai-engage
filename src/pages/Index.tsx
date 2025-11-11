import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Quiz Platform</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
              QuizLit
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create interactive quizzes and engage your audience in real-time. 
              Let AI generate questions instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8 py-6">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/join">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Join a Quiz
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Quiz Generator</h3>
              <p className="text-muted-foreground">
                Generate 10, 20, or 30 questions on any topic instantly using AI. 
                Choose your difficulty level and let AI do the work.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Real-Time Results</h3>
              <p className="text-muted-foreground">
                Watch responses come in live as your audience participates. 
                See results update instantly with beautiful visualizations.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Easy Participation</h3>
              <p className="text-muted-foreground">
                Audience joins with a simple 6-digit code. No login required. 
                Works perfectly on mobile devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-hero rounded-3xl p-12 text-center shadow-lg">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to engage your audience?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Start creating interactive quizzes in minutes. No credit card required.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Create Your First Quiz
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