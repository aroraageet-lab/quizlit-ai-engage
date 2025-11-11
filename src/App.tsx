import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import DashboardQuizzes from "./pages/DashboardQuizzes";
import DashboardHistory from "./pages/DashboardHistory";
import DashboardReports from "./pages/DashboardReports";
import QuizBuilder from "./pages/QuizBuilder";
import Join from "./pages/Join";
import Practice from "./pages/Practice";
import SessionStart from "./pages/SessionStart";
import SessionPresent from "./pages/SessionPresent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="quizzes" element={<DashboardQuizzes />} />
            <Route path="history" element={<DashboardHistory />} />
            <Route path="reports" element={<DashboardReports />} />
          </Route>
          <Route path="/practice" element={<Practice />} />
          <Route path="/quiz/new" element={<QuizBuilder />} />
          <Route path="/quiz/:id/edit" element={<QuizBuilder />} />
          <Route path="/join" element={<Join />} />
          <Route path="/session/new/:quizId" element={<SessionStart />} />
          <Route path="/session/:sessionId/present" element={<SessionPresent />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
