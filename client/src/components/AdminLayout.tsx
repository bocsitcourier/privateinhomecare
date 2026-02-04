import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Home,
  MessageSquare,
  Briefcase,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  UserCircle,
  Gift,
  Building2,
  Video,
  Headphones,
} from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SessionTimeoutWarning } from "@/components/SessionTimeoutWarning";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout", []),
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      navigate("/admin");
    },
  });

  const navItems = [
    { path: "/admin", icon: Home, label: "Dashboard" },
    { path: "/admin/inquiries", icon: MessageSquare, label: "Inquiries" },
    { path: "/admin/applications", icon: Briefcase, label: "Applications" },
    { path: "/admin/referrals", icon: Gift, label: "Referrals" },
    { path: "/admin/jobs", icon: Users, label: "Jobs" },
    { path: "/admin/articles", icon: FileText, label: "Articles" },
    { path: "/admin/videos", icon: Video, label: "Videos" },
    { path: "/admin/podcasts", icon: Headphones, label: "Podcasts" },
    { path: "/admin/facilities", icon: Building2, label: "Facilities" },
    { path: "/admin/profile", icon: Settings, label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location === "/admin";
    }
    return location.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-card border-r
          transform transition-transform duration-200 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-primary">Admin Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Private InHome CareGiver
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 text-sm">
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">admin</span>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 lg:p-8 max-w-7xl">
          {children}
        </div>
      </main>

      {/* HIPAA Session Timeout Warning */}
      <SessionTimeoutWarning
        warningThresholdMs={2 * 60 * 1000}
        sessionTimeoutMs={15 * 60 * 1000}
        onTimeout={() => {
          logoutMutation.mutate();
        }}
      />
    </div>
  );
}
