import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, BookOpen, User, LogOut, LayoutDashboard } from "lucide-react";
import { useGetMe } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";

export function Navbar() {
  const [location] = useLocation();
  const { isAuthenticated, logout, role, token } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Use the generated hook to fetch user info if authenticated
  const { data: user } = useGetMe({
    request: { headers: getAuthHeaders() },
    query: { enabled: !!token }
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileMenuOpen(false), [location]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: "About", href: "/about" },
    { name: "Refer & Earn", href: "/refer" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-white/10 py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-white">
            Dreams<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">helix</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-white" : "text-muted-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated() ? (
            <div className="flex items-center gap-4">
              <Link href={role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <div className="h-8 w-px bg-white/10" />
              <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              <div className="w-10 h-10 rounded-full bg-secondary border border-white/10 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-white hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-background hover:bg-white/90 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="text-lg font-medium p-2 text-white/80 hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px w-full bg-white/10 my-2" />
              {isAuthenticated() ? (
                <>
                  <Link href={role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 text-lg font-medium p-2 text-primary">
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <button onClick={logout} className="flex items-center gap-2 text-lg font-medium p-2 text-destructive text-left">
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-2">
                  <Link href="/login" className="w-full py-3 text-center rounded-xl border border-white/10 font-medium">
                    Sign In
                  </Link>
                  <Link href="/register" className="w-full py-3 text-center rounded-xl bg-primary text-white font-medium">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
