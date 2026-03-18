import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuthStore, getAuthHeaders } from "@/lib/auth";
import { useGetMe } from "@workspace/api-client-react";
import { 
  LayoutDashboard, BookOpen, Wallet, Users, Bell, 
  Settings, LogOut, Menu, X, ShieldCheck
} from "lucide-react";

export function DashboardLayout({ children, isAdmin = false }: { children: ReactNode, isAdmin?: boolean }) {
  const [location] = useLocation();
  const { logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: user } = useGetMe({
    request: { headers: getAuthHeaders() }
  });

  const studentLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Courses", href: "/dashboard/courses", icon: BookOpen },
    { name: "Wallet & Earnings", href: "/dashboard/wallet", icon: Wallet },
    { name: "Referrals", href: "/dashboard/referrals", icon: Users },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  ];

  const adminLinks = [
    { name: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Manage Users", href: "/admin/users", icon: Users },
    { name: "Manage Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Withdrawals", href: "/admin/withdrawals", icon: Wallet },
    { name: "Referrals", href: "/admin/referrals", icon: Users },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card z-50">
        <Link href="/" className="font-display font-bold text-xl text-white">Dreamshelix</Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white">
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-card border-r border-border flex-col transition-transform duration-300 z-40
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-6 hidden md:flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-xl text-white">Dreamshelix</span>
        </div>

        <div className="p-6 border-b border-border/50 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden">
              {user?.avatar ? <img src={user.avatar} /> : <div className="w-full h-full bg-primary/20" />}
            </div>
            <div>
              <p className="text-sm font-bold text-white truncate max-w-[120px]">{user?.name || 'Loading...'}</p>
              <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                {isAdmin && <ShieldCheck className="w-3 h-3 text-accent" />}
                {user?.role || '...'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto py-6 px-4 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Menu</div>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col min-h-screen relative overflow-x-hidden">
        {/* Decorative background glow for dashboards */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10" />
        
        <main className="flex-grow p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
