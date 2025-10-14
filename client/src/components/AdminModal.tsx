import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminModal({ open, onClose }: AdminModalProps) {
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [inquiries, setInquiries] = useState<any[]>([]);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaToken) {
      setError("Please complete the CAPTCHA verification");
      return;
    }

    if (password.trim() === "demo123") {
      setAuthenticated(true);
      setError("");
      console.log("Admin authenticated with CAPTCHA");
    } else {
      setError("Incorrect password. For demo use: demo123");
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    setError("");
    console.log("CAPTCHA verified:", token ? "Success" : "Reset");
  };

  const handleClose = () => {
    setPassword("");
    setCaptchaToken(null);
    setAuthenticated(false);
    setError("");
    recaptchaRef.current?.reset();
    onClose();
  };

  const deleteInquiry = (idx: number) => {
    setInquiries(prev => prev.filter((_, i) => i !== idx));
    console.log("Inquiry deleted:", idx);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-admin">
        <DialogHeader>
          <DialogTitle>Admin Dashboard</DialogTitle>
        </DialogHeader>

        {!authenticated ? (
          <div className="py-6">
            <p className="text-center text-muted-foreground mb-6">
              Enter the admin password to access the dashboard
            </p>
            
            <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
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

              {import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
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
                  disabled={!captchaToken}
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
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Recent Inquiries</h4>
              {inquiries.length === 0 ? (
                <p className="text-sm text-muted-foreground" data-testid="text-no-inquiries">
                  No inquiries yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inquiry, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4 flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            {inquiry.name} <span className="text-sm text-muted-foreground">{inquiry.email}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">Service: {inquiry.service}</div>
                          <div className="mt-2 text-sm">{inquiry.message}</div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteInquiry(idx)}
                          data-testid={`button-delete-inquiry-${idx}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
