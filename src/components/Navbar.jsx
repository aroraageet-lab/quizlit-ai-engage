import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/quizlit-logo.png";

const Navbar = () => {
  const [user, setUser] = useState(null);
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
    setIsOpen(false);
  };

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleNavClick = (e, path) => {
    if (path.startsWith("/#")) {
      e.preventDefault();
      const id = path.substring(2);
      const element = document.getElementById(id);
      if (location.pathname === "/") {
        element?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
      setIsOpen(false);
    }
  };

  const publicNavLinks = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/#features" },
    { name: "How It Works", path: "/#how-it-works" },
    { name: "For Educators", path: "/#educators" },
    { name: "Practice", path: "/practice" },
  ];

  const userNavLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Practice", path: "/practice" },
    { name: "Create Quiz", path: "/quiz/new" },
    { name: "Join Quiz", path: "/join" },
  ];

  const navLinks = user ? userNavLinks : publicNavLinks;

  return (
    <nav className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <img src={logo} alt="QuizLit" className="w-8 h-8" />
            <span className="text-xl font-semibold text-foreground">QuizLit</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <Link key={`${link.path}-${index}`} to={link.path} onClick={(e) => handleNavClick(e, link.path)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-sm font-normal ${
                    isActive(link.path)
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-sm"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="text-sm px-5">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link, index) => (
                  <Link
                    key={`${link.path}-mobile-${index}`}
                    to={link.path}
                    onClick={(e) => {
                      handleNavClick(e, link.path);
                      setIsOpen(false);
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="lg"
                      className={`w-full justify-start text-base ${
                        isActive(link.path)
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {link.name}
                    </Button>
                  </Link>
                ))}

                <div className="border-t pt-4 mt-4">
                  {user ? (
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" size="lg" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button size="lg" className="w-full">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
