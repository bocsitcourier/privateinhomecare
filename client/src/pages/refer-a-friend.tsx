import { useState, useRef } from "react";
import PageSEO from "@/components/PageSEO";
import ReCAPTCHA from "react-google-recaptcha";
import { Heart, Gift, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Link } from "wouter";

export default function ReferAFriendPage() {
  // Referrer information
  const [referrerName, setReferrerName] = useState("");
  const [referrerEmail, setReferrerEmail] = useState("");
  const [referrerPhone, setReferrerPhone] = useState("");
  const [relationshipToReferred, setRelationshipToReferred] = useState("");
  
  // Referred person information
  const [referredName, setReferredName] = useState("");
  const [referredPhone, setReferredPhone] = useState("");
  const [referredEmail, setReferredEmail] = useState("");
  const [referredLocation, setReferredLocation] = useState("");
  const [primaryNeedForCare, setPrimaryNeedForCare] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  
  // Honeypot
  const [website, setWebsite] = useState("");
  
  // Agreements
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [consentToContact, setConsentToContact] = useState(false);
  const [acknowledgedCreditTerms, setAcknowledgedCreditTerms] = useState(false);
  const [acknowledgedComplianceTerms, setAcknowledgedComplianceTerms] = useState(false);
  
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreedToTerms || !agreedToPolicy || !consentToContact || !acknowledgedCreditTerms || !acknowledgedComplianceTerms) {
      setError("You must agree to all required terms and acknowledgments");
      return;
    }

    if (!captchaToken) {
      setError("Please complete the CAPTCHA verification");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrerName: referrerName.trim(),
          referrerEmail: referrerEmail.trim(),
          referrerPhone: referrerPhone.trim(),
          relationshipToReferred: relationshipToReferred.trim(),
          referredName: referredName.trim(),
          referredPhone: referredPhone.trim(),
          referredEmail: referredEmail.trim() || undefined,
          referredLocation: referredLocation.trim(),
          primaryNeedForCare: primaryNeedForCare.trim(),
          additionalInfo: additionalInfo.trim() || undefined,
          website,
          agreedToTerms: agreedToTerms ? "yes" : "no",
          agreedToPolicy: agreedToPolicy ? "yes" : "no",
          consentToContact: consentToContact ? "yes" : "no",
          acknowledgedCreditTerms: acknowledgedCreditTerms ? "yes" : "no",
          acknowledgedComplianceTerms: acknowledgedComplianceTerms ? "yes" : "no",
          captchaToken,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit referral");
      }

      toast({
        title: "Referral Submitted!",
        description: "Thank you for sharing the peace of mind. We'll reach out to your referral within 24 hours.",
      });

      // Reset form
      setReferrerName("");
      setReferrerEmail("");
      setReferrerPhone("");
      setRelationshipToReferred("");
      setReferredName("");
      setReferredPhone("");
      setReferredEmail("");
      setReferredLocation("");
      setPrimaryNeedForCare("");
      setAdditionalInfo("");
      setWebsite("");
      setAgreedToTerms(false);
      setAgreedToPolicy(false);
      setConsentToContact(false);
      setAcknowledgedCreditTerms(false);
      setAcknowledgedComplianceTerms(false);
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
    } catch (err: any) {
      setError(err.message || "Failed to submit referral. Please try again.");
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
        pageSlug="refer-a-friend"
        fallbackTitle="Share Peace of Mind: Refer a Family | PrivateInHomeCareGiver"
        fallbackDescription="Refer a family in need of compassionate home care and receive a $300 service credit. Help another family find the peace of mind you discovered."
      />
      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted Care Deserves to Be Shared
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Share the peace of mind you found with Private InHome CareGiver and get rewarded for your loyalty.
            </p>
          </div>
        </section>

        {/* Core Message */}
        <section className="py-12 max-w-4xl mx-auto px-4">
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-lg text-muted-foreground">
              You know better than anyone the immense emotional weight of coordinating care—the worry, the exhaustion, 
              and the profound relief that comes from finding a truly compassionate and professional partner. We are 
              deeply grateful for your trust in our team and for giving us the highest honor: caring for your loved one. 
              Now, help another family find that same peace of mind.
            </p>
          </div>

          {/* Dual Incentive */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold">For You: $300 Service Credit</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Applied to your next invoice after the referred client completes 80 paid hours of service. 
                  Can be used exclusively for non-medical Companion Care or non-essential IADL support.
                </p>
                <div className="bg-primary/5 p-4 rounded-md">
                  <p className="text-sm font-medium">Verification Trigger:</p>
                  <p className="text-sm text-muted-foreground">
                    Credit issued automatically once referred client completes 80 hours
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold">For Them: Peace of Mind Offer</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Complimentary Initial Needs Assessment & Home Safety Evaluation PLUS 1 Free Hour of Companion 
                  Care to sample our services risk-free.
                </p>
                <div className="bg-primary/5 p-4 rounded-md">
                  <p className="text-sm font-medium">Verification Trigger:</p>
                  <p className="text-sm text-muted-foreground">
                    Received upon signing the initial service agreement
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="mb-12">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
                    1
                  </div>
                  <h3 className="font-bold mb-2">Share the Trust</h3>
                  <p className="text-sm text-muted-foreground">
                    Fill out the brief referral form with the family's contact information. This creates a unique tracking code.
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
                    2
                  </div>
                  <h3 className="font-bold mb-2">We Connect</h3>
                  <p className="text-sm text-muted-foreground">
                    Our Care Manager reaches out within 24 hours to offer the complimentary assessment and free hour of care.
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
                    3
                  </div>
                  <h3 className="font-bold mb-2">You Get Rewarded</h3>
                  <p className="text-sm text-muted-foreground">
                    After 80 billable hours, your $300 credit automatically appears on your next invoice with a thank-you note.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Referral Form */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-3xl mx-auto px-4">
            <Card>
              <CardContent className="p-8 md:p-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-primary" />
                  Submit Your Referral
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Section 1: Referrer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Your Information (The Referrer)</h3>
                    <p className="text-sm text-muted-foreground">
                      This confirms your identity so we can properly apply your $300 Client Loyalty Service Credit.
                    </p>
                    
                    <div>
                      <Label htmlFor="referrerName">Your Full Name *</Label>
                      <Input
                        id="referrerName"
                        value={referrerName}
                        onChange={(e) => setReferrerName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        data-testid="input-referrer-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="referrerEmail">Your Email Address *</Label>
                      <Input
                        id="referrerEmail"
                        type="email"
                        value={referrerEmail}
                        onChange={(e) => setReferrerEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                        data-testid="input-referrer-email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="referrerPhone">Your Phone Number *</Label>
                      <Input
                        id="referrerPhone"
                        type="tel"
                        value={referrerPhone}
                        onChange={(e) => setReferrerPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        required
                        data-testid="input-referrer-phone"
                      />
                    </div>

                    <div>
                      <Label htmlFor="relationshipToReferred">Relationship to Referred Lead *</Label>
                      <Select value={relationshipToReferred} onValueChange={setRelationshipToReferred}>
                        <SelectTrigger data-testid="select-relationship">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Immediate Family">Immediate Family</SelectItem>
                          <SelectItem value="Extended Family">Extended Family</SelectItem>
                          <SelectItem value="Friend">Friend</SelectItem>
                          <SelectItem value="Neighbor">Neighbor</SelectItem>
                          <SelectItem value="Colleague">Colleague</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Section 2: Referred Person Information */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold">Referred Family's Information</h3>
                    <p className="text-sm text-muted-foreground">
                      We need this to initiate contact and offer their Complimentary Initial Needs Assessment & 1 Hour of Free Companion Care.
                    </p>

                    <div>
                      <Label htmlFor="referredName">Referred Person's Full Name *</Label>
                      <Input
                        id="referredName"
                        value={referredName}
                        onChange={(e) => setReferredName(e.target.value)}
                        placeholder="Enter referred person's name"
                        required
                        data-testid="input-referred-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="referredPhone">Referred Person's Phone Number *</Label>
                      <Input
                        id="referredPhone"
                        type="tel"
                        value={referredPhone}
                        onChange={(e) => setReferredPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        required
                        data-testid="input-referred-phone"
                      />
                    </div>

                    <div>
                      <Label htmlFor="referredEmail">Referred Person's Email (Optional)</Label>
                      <Input
                        id="referredEmail"
                        type="email"
                        value={referredEmail}
                        onChange={(e) => setReferredEmail(e.target.value)}
                        placeholder="their.email@example.com"
                        data-testid="input-referred-email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="referredLocation">Referred Person's Location (City, State) *</Label>
                      <Input
                        id="referredLocation"
                        value={referredLocation}
                        onChange={(e) => setReferredLocation(e.target.value)}
                        placeholder="e.g., Boston, MA"
                        required
                        data-testid="input-referred-location"
                      />
                    </div>

                    <div>
                      <Label htmlFor="primaryNeedForCare">Primary Need for Care *</Label>
                      <Select value={primaryNeedForCare} onValueChange={setPrimaryNeedForCare}>
                        <SelectTrigger data-testid="select-primary-need">
                          <SelectValue placeholder="Select primary need" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Companionship/Socializing">Companionship/Socializing</SelectItem>
                          <SelectItem value="ADL Assistance/Personal Care">ADL Assistance/Personal Care</SelectItem>
                          <SelectItem value="IADL Support">IADL Support (Meal Prep, Light Housekeeping)</SelectItem>
                          <SelectItem value="Respite for Family">Respite for Family Caregiver</SelectItem>
                          <SelectItem value="Dementia/Alzheimer's Support">Dementia/Alzheimer's Support</SelectItem>
                          <SelectItem value="Not sure yet">Not sure yet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                      <Textarea
                        id="additionalInfo"
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        placeholder="Share any information that would help our Care Manager approach them with sensitivity..."
                        rows={4}
                        data-testid="input-additional-info"
                      />
                    </div>
                  </div>

                  {/* Honeypot Field */}
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

                  {/* Section 3: Compliance and Consent */}
                  <div className="space-y-3 border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Compliance and Consent</h3>

                    <div className="flex flex-row items-start space-x-3 space-y-0">
                      <Checkbox
                        data-testid="checkbox-consent-contact"
                        checked={consentToContact}
                        onCheckedChange={(checked) => {
                          setConsentToContact(checked === true);
                          setError("");
                        }}
                        required
                      />
                      <label className="text-sm font-medium cursor-pointer leading-none" data-testid="label-consent-contact">
                        I consent to Private InHome CareGiver contacting the individual named above to offer them an introductory consultation and explain our services.
                      </label>
                    </div>

                    <div className="flex flex-row items-start space-x-3 space-y-0">
                      <Checkbox
                        data-testid="checkbox-credit-terms"
                        checked={acknowledgedCreditTerms}
                        onCheckedChange={(checked) => {
                          setAcknowledgedCreditTerms(checked === true);
                          setError("");
                        }}
                        required
                      />
                      <label className="text-sm font-medium cursor-pointer leading-none" data-testid="label-credit-terms">
                        I acknowledge that my $300 Service Credit will be applied to my invoice only after the referred client completes 80 paid hours of service.
                      </label>
                    </div>

                    <div className="flex flex-row items-start space-x-3 space-y-0">
                      <Checkbox
                        data-testid="checkbox-compliance-terms"
                        checked={acknowledgedComplianceTerms}
                        onCheckedChange={(checked) => {
                          setAcknowledgedComplianceTerms(checked === true);
                          setError("");
                        }}
                        required
                      />
                      <label className="text-sm font-medium cursor-pointer leading-none" data-testid="label-compliance-terms">
                        I understand that the incentive is a Service Credit for non-medical services and cannot be exchanged for cash or applied to services covered by government programs or long-term care insurance.
                      </label>
                    </div>

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
                      <label className="text-sm font-medium cursor-pointer leading-none" data-testid="label-terms">
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
                      <label className="text-sm font-medium cursor-pointer leading-none" data-testid="label-policy">
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
                        data-testid="recaptcha-referral"
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
                    disabled={isSubmitting || !agreedToTerms || !agreedToPolicy || !consentToContact || !acknowledgedCreditTerms || !acknowledgedComplianceTerms || !captchaToken}
                    data-testid="button-submit-referral"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Referral"}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center italic">
                    Thank you for being our trusted partner in compassionate care.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Transparency & Compliance */}
        <section className="py-12 max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Our Commitment to Ethical Practice</h2>
              <p className="text-sm text-muted-foreground">
                As a reputable private-pay home care provider, Private InHome CareGiver adheres strictly to all 
                state and federal anti-kickback statutes. To maintain compliance and protect your interests, the 
                financial incentive provided ($300 Service Credit) is explicitly designated for non-medical, 
                private-pay Companion Care or IADL assistance only. It is not a cash payment and cannot be applied 
                toward services covered by Medicare, Medicaid, or long-term care insurance. This ensures we uphold 
                the high ethical standards our clients deserve.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
