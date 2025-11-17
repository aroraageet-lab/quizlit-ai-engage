import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const QuizBuilder = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Quiz Builder</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Quiz builder coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizBuilder;
