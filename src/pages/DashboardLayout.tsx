import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

const DashboardLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <SidebarProvider>
        <div className="flex min-h-screen w-full pt-16">
          <DashboardSidebar />
          
          <main className="flex-1">
            <header className="sticky top-16 z-10 border-b bg-card/80 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-3 flex items-center">
                <SidebarTrigger className="mr-4" />
              </div>
            </header>
            
            <div className="container mx-auto px-4 py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
