import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import ReCAPTCHA from "react-google-recaptcha";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, LayoutDashboard, Briefcase, FileText, MessageSquare, Settings, Users, UserCog, Loader2, ClipboardList, FileCheck, Gift, MapPin } from "lucide-react";
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

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Check auth status on component mount
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
    
    // Only require CAPTCHA if the site key is configured and in production
    if (import.meta.env.VITE_RECAPTCHA_SITE_KEY && !import.meta.env.DEV && !captchaToken) {
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

  // Show loading state while checking auth
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-center text-primary mb-6">
              Admin Login
            </h1>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter admin password"
                  data-testid="input-admin-password"
                />
              </div>

              {import.meta.env.VITE_RECAPTCHA_SITE_KEY && !import.meta.env.DEV && (
                <div className="flex justify-center py-2">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    onChange={handleCaptchaChange}
                    data-testid="recaptcha-admin"
                  />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm" data-testid="text-error-admin">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={import.meta.env.VITE_RECAPTCHA_SITE_KEY && !import.meta.env.DEV ? !captchaToken : false}
                  data-testid="button-admin-login"
                >
                  Login
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPassword("demo123")}
                  data-testid="button-fill-demo"
                >
                  Fill Demo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/admin/profile")}
              data-testid="button-profile"
            >
              <UserCog className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button 
              variant="outline" 
              onClick={async () => {
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
              }}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="flex flex-wrap gap-1 w-full max-w-7xl mb-8 h-auto">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="locations" data-testid="tab-locations">
              <MapPin className="w-4 h-4 mr-2" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="intake" data-testid="tab-intake">
              <ClipboardList className="w-4 h-4 mr-2" />
              Intake
            </TabsTrigger>
            <TabsTrigger value="hipaa" data-testid="tab-hipaa">
              <FileText className="w-4 h-4 mr-2" />
              HIPAA
            </TabsTrigger>
            <TabsTrigger value="caregivers" data-testid="tab-caregivers">
              <Users className="w-4 h-4 mr-2" />
              Caregivers
            </TabsTrigger>
            <TabsTrigger value="jobs" data-testid="tab-jobs">
              <Briefcase className="w-4 h-4 mr-2" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="applications" data-testid="tab-applications">
              <FileCheck className="w-4 h-4 mr-2" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="referrals" data-testid="tab-referrals">
              <Gift className="w-4 h-4 mr-2" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="articles" data-testid="tab-articles">
              <FileText className="w-4 h-4 mr-2" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="seo" data-testid="tab-seo">
              <Settings className="w-4 h-4 mr-2" />
              SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="locations">
            <LocationsManagement />
          </TabsContent>

          <TabsContent value="intake">
            <IntakeFormsManagement />
          </TabsContent>

          <TabsContent value="hipaa">
            <HipaaAcknowledgmentsManagement />
          </TabsContent>

          <TabsContent value="caregivers">
            <CaregiversManagement />
          </TabsContent>

          <TabsContent value="jobs">
            <JobsManagement />
          </TabsContent>

          <TabsContent value="applications">
            <ApplicationsManagement />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralsManagement />
          </TabsContent>

          <TabsContent value="articles">
            <ArticlesManagement />
          </TabsContent>

          <TabsContent value="messages">
            <InquiriesManagement />
          </TabsContent>

          <TabsContent value="seo">
            <PageMetaManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
