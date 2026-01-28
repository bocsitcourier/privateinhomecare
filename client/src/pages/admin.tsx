import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import ReCAPTCHA from "react-google-recaptcha";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertCircle, 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Settings, 
  Users, 
  UserCog, 
  Loader2, 
  ClipboardList, 
  FileCheck, 
  Gift, 
  MapPin, 
  Video, 
  Mic, 
  Building2, 
  HelpCircle,
  ChevronRight,
  Menu,
  X,
  Home,
  FileEdit,
  Megaphone,
  Database
} from "lucide-react";
import JobsManagement from "@/components/admin/JobsManagement";
import ArticlesManagement from "@/components/admin/ArticlesManagement";
import InquiriesManagement from "@/components/admin/InquiriesManagement";
import PageMetaManagement from "@/components/admin/PageMetaManagement";
import CaregiversManagement from "@/components/admin/CaregiversManagement";
import IntakeFormsManagement from "@/components/admin/IntakeFormsManagement";
import HipaaAcknowledgmentsManagement from "@/components/admin/HipaaAcknowledgmentsManagement";
import AdminDashboard from "@/components/admin/AdminDashboard";
import ApplicationsManagement from "@/components/admin/ApplicationsManagement";
import ReferralsManagement from "@/components/admin/ReferralsManagement";
import LocationsManagement from "@/components/admin/LocationsManagement";
import ClientIntakesManagement from "@/components/admin/ClientIntakesManagement";
import NonSolicitationManagement from "@/components/admin/NonSolicitationManagement";
import InitialAssessmentsManagement from "@/components/admin/InitialAssessmentsManagement";
import { VideosManagementContent } from "@/pages/admin/videos";
import { PodcastsManagementContent } from "@/pages/admin/podcasts";
import { FacilitiesManagementContent } from "@/pages/admin/facilities";
import { QuizLeadsManagementContent } from "@/pages/admin/quiz-leads";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    icon: <Home className="w-4 h-4" />,
    items: [
      { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    ]
  },
  {
    title: "Lead Management",
    icon: <Megaphone className="w-4 h-4" />,
    items: [
      { id: "messages", label: "Messages", icon: <MessageSquare className="w-4 h-4" /> },
      { id: "quizzes", label: "Quiz Leads", icon: <HelpCircle className="w-4 h-4" /> },
      { id: "intake", label: "Intake Forms", icon: <ClipboardList className="w-4 h-4" /> },
      { id: "referrals", label: "Referrals", icon: <Gift className="w-4 h-4" /> },
    ]
  },
  {
    title: "Client Management",
    icon: <FileCheck className="w-4 h-4" />,
    items: [
      { id: "client-intakes", label: "Client Intakes", icon: <ClipboardList className="w-4 h-4" /> },
      { id: "initial-assessments", label: "Assessments", icon: <FileText className="w-4 h-4" /> },
      { id: "non-solicitation", label: "Agreements", icon: <FileCheck className="w-4 h-4" /> },
    ]
  },
  {
    title: "Team",
    icon: <Users className="w-4 h-4" />,
    items: [
      { id: "caregivers", label: "Caregivers", icon: <Users className="w-4 h-4" /> },
      { id: "jobs", label: "Job Listings", icon: <Briefcase className="w-4 h-4" /> },
      { id: "applications", label: "Applications", icon: <FileCheck className="w-4 h-4" /> },
    ]
  },
  {
    title: "Content",
    icon: <FileEdit className="w-4 h-4" />,
    items: [
      { id: "articles", label: "Articles", icon: <FileText className="w-4 h-4" /> },
      { id: "videos", label: "Videos", icon: <Video className="w-4 h-4" /> },
      { id: "podcasts", label: "Podcasts", icon: <Mic className="w-4 h-4" /> },
    ]
  },
  {
    title: "Directory",
    icon: <Database className="w-4 h-4" />,
    items: [
      { id: "facilities", label: "Facilities", icon: <Building2 className="w-4 h-4" /> },
      { id: "locations", label: "Locations", icon: <MapPin className="w-4 h-4" /> },
    ]
  },
  {
    title: "Settings",
    icon: <Settings className="w-4 h-4" />,
    items: [
      { id: "seo", label: "SEO & Meta", icon: <Settings className="w-4 h-4" /> },
      { id: "hipaa", label: "HIPAA Logs", icon: <FileText className="w-4 h-4" /> },
    ]
  },
];

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/check");
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password?.trim()) {
      setError("Please enter a password");
      return;
    }
    
    const recaptchaDisabled = import.meta.env.VITE_DISABLE_RECAPTCHA === 'true';
    if (import.meta.env.VITE_RECAPTCHA_SITE_KEY && !recaptchaDisabled && !captchaToken) {
      setError("Please complete the CAPTCHA verification");
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: "admin",
          password: password.trim(),
          captchaToken: captchaToken || undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAuthenticated(true);
          setError("");
        } else {
          setError("Login failed. Please try again.");
          recaptchaRef.current?.reset();
          setCaptchaToken(null);
        }
      } else {
        const data = await response.json().catch(() => ({ error: "Login failed" }));
        setError(data.error || "Login failed. For demo use: demo123");
        recaptchaRef.current?.reset();
        setCaptchaToken(null);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Connection error. Please refresh the page and try again.");
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    setError("");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }
    setLocation("/");
    setTimeout(() => {
      setAuthenticated(false);
      setPassword("");
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
    }, 100);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard": return <AdminDashboard />;
      case "locations": return <LocationsManagement />;
      case "intake": return <IntakeFormsManagement />;
      case "hipaa": return <HipaaAcknowledgmentsManagement />;
      case "caregivers": return <CaregiversManagement />;
      case "jobs": return <JobsManagement />;
      case "applications": return <ApplicationsManagement />;
      case "referrals": return <ReferralsManagement />;
      case "articles": return <ArticlesManagement />;
      case "messages": return <InquiriesManagement />;
      case "seo": return <PageMetaManagement />;
      case "videos": return <VideosManagementContent />;
      case "podcasts": return <PodcastsManagementContent />;
      case "facilities": return <FacilitiesManagementContent />;
      case "quizzes": return <QuizLeadsManagementContent />;
      case "client-intakes": return <ClientIntakesManagement />;
      case "initial-assessments": return <InitialAssessmentsManagement />;
      case "non-solicitation": return <NonSolicitationManagement />;
      default: return <AdminDashboard />;
    }
  };

  const getActiveLabel = () => {
    for (const group of NAV_GROUPS) {
      const item = group.items.find(i => i.id === activeSection);
      if (item) return item.label;
    }
    return "Dashboard";
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <LayoutDashboard className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-primary">Admin Portal</h1>
              <p className="text-muted-foreground mt-2">Sign in to manage your site</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="h-11"
                  data-testid="input-admin-password"
                />
              </div>

              {import.meta.env.VITE_RECAPTCHA_SITE_KEY && import.meta.env.VITE_DISABLE_RECAPTCHA !== 'true' && (
                <div className="flex justify-center">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    onChange={handleCaptchaChange}
                    data-testid="recaptcha-admin"
                  />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg" data-testid="text-error-admin">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 h-11"
                  disabled={import.meta.env.VITE_RECAPTCHA_SITE_KEY && import.meta.env.VITE_DISABLE_RECAPTCHA !== 'true' ? !captchaToken : false}
                  data-testid="button-admin-login"
                >
                  Sign In
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => setPassword("demo123")}
                  data-testid="button-fill-demo"
                >
                  Demo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${sidebarOpen ? 'w-64' : 'w-16'} 
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-card border-r transition-all duration-300 flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="h-16 border-b flex items-center justify-between px-4">
          {sidebarOpen && (
            <h1 className="font-bold text-primary text-lg">Admin</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex"
            data-testid="button-toggle-sidebar"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-6 px-3">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                {sidebarOpen && (
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <span className="text-muted-foreground">{group.icon}</span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.title}
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${activeSection === item.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }
                        ${!sidebarOpen ? 'justify-center' : ''}
                      `}
                      data-testid={`nav-${item.id}`}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      {item.icon}
                      {sidebarOpen && <span>{item.label}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="border-t p-3">
          <Button
            variant="ghost"
            className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
            onClick={() => setLocation("/admin/profile")}
            data-testid="button-profile"
          >
            <UserCog className="w-4 h-4" />
            {sidebarOpen && <span className="ml-2">Profile</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden"
              data-testid="button-mobile-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold" data-testid="text-active-section">{getActiveLabel()}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation("/")}
              data-testid="button-view-site"
            >
              <Home className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">View Site</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
