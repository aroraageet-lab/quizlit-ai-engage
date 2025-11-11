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
    <>
      <Navbar />
      
      <SidebarProvider>
        <div className="flex w-full">
          <DashboardSidebar />
          
          <main className="flex-1 min-h-screen pt-16 bg-gradient-subtle">
            <header className="border-b bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center">
              <SidebarTrigger />
            </header>
            
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
};

export default DashboardLayout;
