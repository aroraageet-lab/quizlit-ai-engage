import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const SessionResults = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Session Results</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Results view coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SessionResults;
