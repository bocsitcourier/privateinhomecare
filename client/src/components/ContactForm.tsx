import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

const SERVICES = [
  { key: "personal-care", title: "Personal Care" },
  { key: "companionship", title: "Companionship" },
  { key: "homemaking", title: "Homemaking & Errands" },
  { key: "dementia-care", title: "Specialized Dementia Care" },
];

interface ContactFormProps {
  preselectedService?: string;
}

export default function ContactForm({ preselectedService }: ContactFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: preselectedService || "",
    message: "",
    website: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.service || !form.message.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    
    if (!agreedToTerms || !agreedToPolicy) {
      setError("Please agree to the Terms of Service and Privacy Policy to continue");
      return;
    }
    
    if (!captchaToken) {
      setError("Please complete the CAPTCHA verification");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await apiRequest("POST", "/api/inquiries", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        service: form.service,
        message: form.message,
        website: form.website,
        agreedToTerms: agreedToTerms ? "yes" : "no",
        agreedToPolicy: agreedToPolicy ? "yes" : "no",
        captchaToken,
      });
      
      setSubmitted(true);
      setTimeout(() => {
        setForm({ name: "", email: "", phone: "", service: "", message: "", website: "" });
        setAgreedToTerms(false);
        setAgreedToPolicy(false);
        setCaptchaToken(null);
        recaptchaRef.current?.reset();
      }, 800);
    } catch (err: any) {
      setError(err.message || "Failed to submit inquiry. Please try again.");
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    setError("");
    console.log("CAPTCHA verified:", token ? "Success" : "Reset");
  };

  if (submitted) {
    return (
      <Card className="bg-chart-3/10 border-chart-3/20">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-chart-3 mx-auto mb-4" />
          <h4 className="font-semibold text-lg text-foreground mb-2" data-testid="text-success-message">
            Thank you — we received your request
          </h4>
          <p className="text-muted-foreground">
            A care coordinator will contact you within one business day.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Request Care</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Your name"
              required
              data-testid="input-name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="your@email.com"
              required
              data-testid="input-email"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="(555) 123-4567"
              required
              data-testid="input-phone"
            />
          </div>

          <div>
            <Label htmlFor="service">Type of Care *</Label>
            <Select value={form.service} onValueChange={(value) => handleChange("service", value)} required>
              <SelectTrigger data-testid="select-service">
                <SelectValue placeholder="Select type of care" />
              </SelectTrigger>
              <SelectContent>
                {SERVICES.map((s) => (
                  <SelectItem key={s.key} value={s.title}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Tell us about your loved one *</Label>
            <Textarea
              id="message"
              name="message"
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Tell us about your care needs..."
              rows={4}
              required
              data-testid="input-message"
            />
          </div>

          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              value={form.website}
              onChange={(e) => handleChange("website", e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex flex-row items-start space-x-3 space-y-0">
              <Checkbox
                data-testid="checkbox-terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => {
                  setAgreedToTerms(checked === true);
                  setError("");
                }}
                required
              />
              <label
                htmlFor="agreedToTerms"
                className="text-sm font-medium cursor-pointer leading-none"
                data-testid="label-terms"
              >
                I agree to the{" "}
                <Link href="/terms-of-service" className="text-primary hover:underline" data-testid="link-terms">
                  Terms of Service
                </Link>
              </label>
            </div>

            <div className="flex flex-row items-start space-x-3 space-y-0">
              <Checkbox
                data-testid="checkbox-policy"
                checked={agreedToPolicy}
                onCheckedChange={(checked) => {
                  setAgreedToPolicy(checked === true);
                  setError("");
                }}
                required
              />
              <label
                htmlFor="agreedToPolicy"
                className="text-sm font-medium cursor-pointer leading-none"
                data-testid="label-policy"
              >
                I agree to the{" "}
                <Link href="/privacy-policy" className="text-primary hover:underline" data-testid="link-policy">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>

          {import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
            <div className="flex justify-center py-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
                data-testid="recaptcha-contact"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm" data-testid="text-error-message">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!agreedToTerms || !agreedToPolicy || !captchaToken || isSubmitting}
            data-testid="button-submit-contact"
          >
            {isSubmitting ? "Submitting..." : "Request Help"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
