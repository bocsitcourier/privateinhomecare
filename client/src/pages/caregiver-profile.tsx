import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import ReCAPTCHA from "react-google-recaptcha";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, MapPin, DollarSign, Calendar, Award, Star, CheckCircle, Send, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import type { Caregiver } from "@shared/schema";

export default function CaregiverProfilePage() {
  const [, params] = useRoute("/caregivers/:id");
  const caregiverId = params?.id;
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { toast } = useToast();

  const { data: caregiver, isLoading } = useQuery<Caregiver>({
    queryKey: ["/api/caregivers", caregiverId],
    queryFn: () => fetch(`/api/caregivers/${caregiverId}`).then(res => res.json()),
    enabled: !!caregiverId,
  });

  const requestMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/inquiries", data),
    onSuccess: () => {
      setRequestDialogOpen(false);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
      toast({ 
        title: "Request Submitted Successfully",
        description: "We'll connect you with this caregiver within 24 hours.",
      });
    },
    onError: () => {
      setFormError("Failed to submit request. Please try again.");
    }
  });

  const handleRequestSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!captchaToken) {
      setFormError("Please complete the CAPTCHA verification");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      message: `Request for ${caregiver?.name}:\n\n${formData.get("message") as string}`,
    };

    requestMutation.mutate(data);
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    setFormError("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading caregiver profile...</p>
      </div>
    );
  }

  if (!caregiver) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Caregiver profile not found</p>
            <Link href="/caregivers">
              <Button>Browse All Caregivers</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <div className="flex gap-6">
                  {caregiver.photoUrl ? (
                    <img 
                      src={caregiver.photoUrl} 
                      alt={caregiver.name}
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-5xl text-muted-foreground">{caregiver.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{caregiver.name}</CardTitle>
                    <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {caregiver.location}
                      </div>
                      <div className="flex items-center gap-1 text-primary font-semibold">
                        <DollarSign className="w-4 h-4" />
                        ${caregiver.hourlyRate}/hour
                      </div>
                    </div>
                    <Button 
                      size="lg"
                      onClick={() => setRequestDialogOpen(true)}
                      data-testid="button-request-caregiver"
                    >
                      Request This Caregiver
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 leading-relaxed">{caregiver.bio}</p>
              </CardContent>
            </Card>

            {caregiver.specialties && caregiver.specialties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {caregiver.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-sm">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Experience & Qualifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-chart-1 mt-0.5" />
                  <div>
                    <div className="font-medium">Years of Experience</div>
                    <div className="text-muted-foreground">{caregiver.yearsExperience} years</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-chart-2 mt-0.5" />
                  <div>
                    <div className="font-medium">Availability</div>
                    <div className="text-muted-foreground">{caregiver.availability}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {caregiver.certifications && caregiver.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-chart-3" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {caregiver.certifications.map((cert) => (
                      <div key={cert} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-chart-3"></div>
                        <span className="text-sm">{cert}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Background Verified</h3>
                <p className="text-sm text-muted-foreground">
                  All caregivers undergo comprehensive background checks and reference verification.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request {caregiver.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Fill out this form and we'll connect you with {caregiver.name} within 24 hours.
            </p>
            
            <div>
              <Label htmlFor="request-name">Your Name *</Label>
              <Input 
                id="request-name" 
                name="name" 
                required 
                data-testid="input-request-name"
              />
            </div>

            <div>
              <Label htmlFor="request-email">Email *</Label>
              <Input 
                id="request-email" 
                name="email" 
                type="email"
                required 
                data-testid="input-request-email"
              />
            </div>

            <div>
              <Label htmlFor="request-phone">Phone *</Label>
              <Input 
                id="request-phone" 
                name="phone" 
                type="tel"
                required 
                data-testid="input-request-phone"
              />
            </div>

            <div>
              <Label htmlFor="request-message">Tell us about your care needs *</Label>
              <Textarea 
                id="request-message" 
                name="message"
                rows={4}
                placeholder="What type of care are you looking for? When do you need care to start?"
                required 
                data-testid="textarea-request-message"
              />
            </div>

            {import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
              <div className="flex justify-center py-2">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={handleCaptchaChange}
                  data-testid="recaptcha-request"
                />
              </div>
            )}

            {formError && (
              <div className="flex items-center gap-2 text-destructive text-sm" data-testid="text-error-request">
                <AlertCircle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={!captchaToken || requestMutation.isPending}
                data-testid="button-submit-request"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Request
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setRequestDialogOpen(false);
                  recaptchaRef.current?.reset();
                  setCaptchaToken(null);
                  setFormError("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
