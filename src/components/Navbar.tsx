import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/quizlit-logo.png";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = user
    ? [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Create Quiz", path: "/quiz/new" },
        { name: "Join Quiz", path: "/join" },
      ]
    : [
        { name: "Features", path: "/#features" },
        { name: "Join Quiz", path: "/join" },
      ];

  return (
    <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={logo} alt="QuizLit Logo" className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              QuizLit
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant="ghost"
                  className={
                    isActive(link.path)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground"
                  }
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="max-w-[150px] truncate">{user.email}</span>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-gradient-primary">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col gap-6 mt-8">
                {/* Mobile Logo */}
                <Link
                  to="/"
                  className="flex items-center gap-3"
                  onClick={() => setIsOpen(false)}
                >
                  <img src={logo} alt="QuizLit Logo" className="w-8 h-8" />
                  <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    QuizLit
                  </span>
                </Link>

                {/* Mobile Navigation Links */}
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${
                          isActive(link.path)
                            ? "bg-primary/10 text-primary font-medium"
                            : ""
                        }`}
                      >
                        {link.name}
                      </Button>
                    </Link>
                  ))}
                </div>

                {/* Mobile Auth Section */}
                <div className="border-t pt-6 flex flex-col gap-3">
                  {user ? (
                    <>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground px-3">
                        <User className="w-4 h-4" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-gradient-primary">Get Started</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;