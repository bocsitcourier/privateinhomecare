import { useState, useRef } from "react";
import PageSEO from "@/components/PageSEO";
import ReCAPTCHA from "react-google-recaptcha";
import { Calendar, Heart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Link } from "wouter";

export default function ConsultationPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [website, setWebsite] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !phone.trim() || !preferredDate.trim() || !message.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (!agreedToTerms || !agreedToPolicy) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    if (!captchaToken) {
      setError("Please complete the CAPTCHA verification");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: `CONSULTATION REQUEST\n\nPreferred Date/Time: ${preferredDate || "Not specified"}\n\nMessage:\n${message}`,
          website,
          agreedToTerms: agreedToTerms ? "yes" : "no",
          agreedToPolicy: agreedToPolicy ? "yes" : "no",
          captchaToken,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit consultation request");
      }

      toast({
        title: "Consultation Request Submitted",
        description: "Thank you! We'll contact you within 24 hours to schedule your free consultation.",
      });

      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setPreferredDate("");
      setWebsite("");
      setAgreedToTerms(false);
      setAgreedToPolicy(false);
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
    } catch (err: any) {
      setError(err.message || "Failed to submit request. Please try again.");
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    setError("");
  };

  return (
    <>
      <PageSEO 
        pageSlug="consultation"
        fallbackTitle="Request Free Consultation | PrivateInHomeCareGiver"
        fallbackDescription="Request a free, no-obligation consultation to discuss your home care needs. Our team will work with you to create a personalized care plan for your loved one."
      />
      <Header />

      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Request a Free Consultation
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Let's discuss how we can provide compassionate, professional care for your loved one. 
              Our consultation is completely free with no obligation.
            </p>
          </div>
        </section>

        <section className="py-16 max-w-3xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 md:p-12">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-primary" />
                  What to Expect
                </h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>A personal phone call within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Discussion of your loved one's specific needs and preferences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Overview of our services and care options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Answers to all your questions about in-home care</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>No pressure—just honest, helpful guidance</span>
                  </li>
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    data-testid="input-name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                    data-testid="input-phone"
                  />
                </div>

                <div>
                  <Label htmlFor="preferredDate">Preferred Date/Time *</Label>
                  <Input
                    id="preferredDate"
                    type="text"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    placeholder="e.g., Next Tuesday afternoon, or weekday mornings"
                    required
                    data-testid="input-preferred-date"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Tell Us About Your Needs *</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share any specific care needs, concerns, or questions you have..."
                    rows={5}
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
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
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
                      data-testid="recaptcha-consultation"
                    />
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm" data-testid="text-error">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || !agreedToTerms || !agreedToPolicy || !captchaToken}
                  data-testid="button-submit-consultation"
                >
                  {isSubmitting ? "Submitting..." : "Request Free Consultation"}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  By submitting this form, you agree to be contacted by Private InHome CareGiver regarding your inquiry.
                </p>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-muted-foreground">
            <p className="text-sm">
              Prefer to call? Reach us at{" "}
              <a href="tel:+16176860595" className="text-primary hover:underline font-medium">
                +1 (617) 686-0595
              </a>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
