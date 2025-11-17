import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, BookOpen } from "lucide-react";

const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to QuizLit</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Practice Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Use AI to generate practice quizzes on any topic
            </p>
            <Link to="/practice">
              <Button className="w-full">
                Start Practicing
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Build custom quizzes for your audience
            </p>
            <Link to="/quiz/new">
              <Button variant="outline" className="w-full">
                Create New Quiz
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
