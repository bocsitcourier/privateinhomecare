import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Briefcase, ArrowLeft } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import Header from "@/components/Header";
import ResumeUpload from "@/components/ResumeUpload";
import { Link } from "wouter";

export default function ApplyPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [positionInterested, setPositionInterested] = useState("");
  const [backgroundScreeningConsent, setBackgroundScreeningConsent] = useState("");
  const [certificationType, setCertificationType] = useState("");
  const [drivingStatus, setDrivingStatus] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [specialSkills, setSpecialSkills] = useState<string[]>([]);
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [motivation, setMotivation] = useState("");
  const [adaptability, setAdaptability] = useState("");
  const [conflictHandling, setConflictHandling] = useState("");
  const [safetyAchievement, setSafetyAchievement] = useState("");
  const [experienceTypes, setExperienceTypes] = useState("");
  const [consent, setConsent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  
  const applyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', `/api/jobs/general-apply`, data);
    },
    onSuccess: () => {
      setLocation('/application-thank-you');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!agreedToTerms || !agreedToPolicy) {
      toast({
        title: "Error",
        description: "Please agree to the Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      return;
    }
    
    if (!captchaToken) {
      toast({
        title: "Error",
        description: "Please complete the CAPTCHA",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    applyMutation.mutate({
      fullName,
      email,
      phone,
      address,
      positionInterested,
      backgroundScreeningConsent,
      certificationType,
      drivingStatus,
      availability,
      startDate,
      yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
      specialSkills,
      resumeUrl: resumeUrl || undefined,
      coverLetter: coverLetter || undefined,
      motivation,
      adaptability,
      conflictHandling,
      safetyAchievement,
      experienceTypes,
      consent: consent ? "yes" : "no",
      agreedToTerms: agreedToTerms ? "yes" : "no",
      agreedToPolicy: agreedToPolicy ? "yes" : "no",
      website: formData.get('website') as string || "",
      captchaToken: captchaToken!,
    });
  };

  const toggleAvailability = (value: string) => {
    setAvailability(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const toggleSkill = (value: string) => {
    setSpecialSkills(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };


  return (
    <div className="min-h-screen bg-background">
      <PageSEO 
        pageSlug="apply"
        fallbackTitle="Job Application - PrivateInHomeCareGiver"
        fallbackDescription="Apply to join our compassionate caregiving team. Submit your application to become a Personal Care Assistant or Home Health Aide."
      />
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/careers" data-testid="link-back-careers">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 hover-elevate rounded-md px-3 py-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Careers
          </div>
        </Link>

        <div className="text-center mb-8">
          <Briefcase className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-4xl font-bold text-primary mb-4">Join Our Team</h1>
          <p className="text-lg text-muted-foreground">
            Start your journey as a compassionate caregiver. Complete the application below.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary border-b pb-2">Step 1: Personal Information</h3>
                
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    data-testid="input-fullname"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    data-testid="input-phone"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Full Address *</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    data-testid="input-address"
                  />
                </div>

                <div>
                  <Label htmlFor="positionInterested">Position Interested In *</Label>
                  <Input
                    id="positionInterested"
                    placeholder="e.g., Personal Care Assistant, Home Health Aide"
                    value={positionInterested}
                    onChange={(e) => setPositionInterested(e.target.value)}
                    required
                    data-testid="input-position"
                  />
                </div>

                <div>
                  <Label htmlFor="backgroundScreeningConsent" className="text-base font-semibold">
                    Background Screening Authorization (Required) *
                  </Label>
                  <p className="text-sm text-muted-foreground mt-2 mb-3">
                    Do you acknowledge and consent to the Agency obtaining a consumer report, including criminal history and verification of credentials, as part of the rigorous pre-employment screening process, and do you understand that formal disclosure and consent forms will be provided to you prior to initiating the check?
                  </p>
                  <Select value={backgroundScreeningConsent} onValueChange={setBackgroundScreeningConsent} required>
                    <SelectTrigger id="backgroundScreeningConsent" data-testid="select-background-screening">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Step 2: Qualifications and Schedule */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary border-b pb-2">Step 2: Qualifications and Schedule</h3>

                <div>
                  <Label htmlFor="certificationType">Certification Type *</Label>
                  <Select value={certificationType} onValueChange={setCertificationType} required>
                    <SelectTrigger id="certificationType" data-testid="select-certification">
                      <SelectValue placeholder="Select certification..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PCA">Personal Care Assistant (PCA)</SelectItem>
                      <SelectItem value="HHA">Home Health Aide (HHA)</SelectItem>
                      <SelectItem value="CNA">Certified Nursing Assistant (CNA)</SelectItem>
                      <SelectItem value="None">None - Willing to Train</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="drivingStatus">Valid Driver's License & Reliable Transportation? *</Label>
                  <Select value={drivingStatus} onValueChange={setDrivingStatus} required>
                    <SelectTrigger id="drivingStatus" data-testid="select-driving">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes - Have Both">Yes - Have Both</SelectItem>
                      <SelectItem value="License Only">License Only</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Days Available to Work *</Label>
                  <div className="space-y-2 mt-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day}`}
                          checked={availability.includes(day)}
                          onCheckedChange={() => toggleAvailability(day)}
                          data-testid={`checkbox-${day.toLowerCase()}`}
                        />
                        <Label htmlFor={`day-${day}`} className="font-normal cursor-pointer">
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="startDate">Earliest Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    data-testid="input-startdate"
                  />
                </div>
              </div>

              {/* Step 3: Experience and Uploads */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary border-b pb-2">Step 3: Experience and Uploads</h3>

                <div>
                  <Label htmlFor="yearsExperience">Years of Caregiving Experience</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    min="0"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    data-testid="input-experience"
                  />
                </div>

                <div>
                  <Label>Special Skills or Training (Optional)</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      { value: "Hoyer Lift", label: "Hoyer Lift Transfer" },
                      { value: "Memory Care", label: "Memory Care / Dementia" },
                      { value: "Hospice", label: "Hospice / End-of-Life Care" },
                      { value: "Meal Prep", label: "Complex Meal Preparation / Dietary Restrictions" }
                    ].map((item) => (
                      <div key={item.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`skill-${item.value}`}
                          checked={specialSkills.includes(item.value)}
                          onCheckedChange={() => toggleSkill(item.value)}
                          data-testid={`checkbox-skill-${item.value.toLowerCase().replace(/\s+/g, '-')}`}
                        />
                        <Label htmlFor={`skill-${item.value}`} className="font-normal cursor-pointer">
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Upload your Resume (PDF or DOCX) *</Label>
                  <ResumeUpload
                    value={resumeUrl}
                    onChange={setResumeUrl}
                    onClear={() => setResumeUrl("")}
                    label="Upload your resume"
                  />
                  {!resumeUrl && (
                    <p className="text-xs text-muted-foreground mt-1">Resume is required</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                  <Textarea
                    id="coverLetter"
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell us why you'd be a great fit for this position..."
                    data-testid="textarea-coverletter"
                  />
                </div>
              </div>

              {/* Step 4: Behavioral Screening */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary border-b pb-2">Step 4: Behavioral Screening Questions (Required)</h3>
                <p className="text-sm text-muted-foreground">These questions help us understand your emotional intelligence, problem-solving skills, and approach to providing compassionate care.</p>

                <div>
                  <Label htmlFor="motivation">1. What attracts you most to the field of non-medical home care, and what do you believe are the top three most important attributes a compassionate caregiver must possess? *</Label>
                  <Textarea
                    id="motivation"
                    rows={4}
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    required
                    data-testid="textarea-motivation"
                    placeholder="Share your motivation and the three key attributes..."
                  />
                </div>

                <div>
                  <Label htmlFor="adaptability">2. Describe a time when you had to adapt your caregiving approach (e.g., communication style, routine, or tasks) to meet a client's specific, challenging, or changing needs. *</Label>
                  <Textarea
                    id="adaptability"
                    rows={4}
                    value={adaptability}
                    onChange={(e) => setAdaptability(e.target.value)}
                    required
                    data-testid="textarea-adaptability"
                    placeholder="Provide a specific example..."
                  />
                </div>

                <div>
                  <Label htmlFor="conflictHandling">3. How would you handle a situation where a client is resistant to receiving personal care (like bathing or dressing), or exhibits challenging behavior? *</Label>
                  <Textarea
                    id="conflictHandling"
                    rows={4}
                    value={conflictHandling}
                    onChange={(e) => setConflictHandling(e.target.value)}
                    required
                    data-testid="textarea-conflict"
                    placeholder="Describe your approach..."
                  />
                </div>

                <div>
                  <Label htmlFor="safetyAchievement">4. Tell us about your proudest achievement from a past caregiving role, and what specific measures you take to ensure the physical safety of your clients, especially those with mobility issues. *</Label>
                  <Textarea
                    id="safetyAchievement"
                    rows={4}
                    value={safetyAchievement}
                    onChange={(e) => setSafetyAchievement(e.target.value)}
                    required
                    data-testid="textarea-safety"
                    placeholder="Share your achievement and safety practices..."
                  />
                </div>

                <div>
                  <Label htmlFor="experienceTypes">5. What types of diagnoses or specific support needs (e.g., dementia, mobility impairment, post-surgery recovery) do you have the most experience caring for? *</Label>
                  <Textarea
                    id="experienceTypes"
                    rows={4}
                    value={experienceTypes}
                    onChange={(e) => setExperienceTypes(e.target.value)}
                    required
                    data-testid="textarea-experience-types"
                    placeholder="List diagnoses and support areas you're experienced with..."
                  />
                </div>
              </div>

              {/* Declaration */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary border-b pb-2">Declaration</h3>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(checked as boolean)}
                    required
                    data-testid="checkbox-consent"
                  />
                  <Label htmlFor="consent" className="font-normal cursor-pointer leading-tight">
                    I confirm that the information provided is accurate and consent to a background check if offered employment. *
                  </Label>
                </div>
              </div>

              {/* Agreement Checkboxes */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreedToTerms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    required
                    data-testid="checkbox-terms"
                  />
                  <Label htmlFor="agreedToTerms" className="font-normal cursor-pointer leading-tight">
                    I agree to the{" "}
                    <Link href="/terms-of-service" className="text-primary hover:underline" data-testid="link-terms">
                      Terms of Service
                    </Link>{" "}
                    *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreedToPolicy"
                    checked={agreedToPolicy}
                    onCheckedChange={(checked) => setAgreedToPolicy(checked as boolean)}
                    required
                    data-testid="checkbox-policy"
                  />
                  <Label htmlFor="agreedToPolicy" className="font-normal cursor-pointer leading-tight">
                    I agree to the{" "}
                    <Link href="/privacy-policy" className="text-primary hover:underline" data-testid="link-policy">
                      Privacy Policy
                    </Link>{" "}
                    *
                  </Label>
                </div>
              </div>

              {/* Equal Opportunity Statement */}
              <div className="bg-muted/50 border border-border rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-base mb-2">Commitment to Fair Hiring and Equal Opportunity</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Private InHome CareGiver is an Equal Opportunity Employer and Affirmative Action employer. We are committed to fostering a diverse, inclusive, and compassionate workforce where all professionals are valued and encouraged to grow.
                </p>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  We provide equal access and employment opportunities to all persons without regard to protected characteristics, including but not limited to race, creed, color, religion, national origin, sex, sexual orientation, gender identity, age, or physical/mental disability, consistent with federal and Massachusetts law (MGL c 151B, §4.1). We strictly prohibit discrimination and retaliation in all aspects of employment, including application, hiring, and advancement.
                </p>
              </div>

              {/* Honeypot - Anti-bot field */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* CAPTCHA */}
              {import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
                <div className="flex justify-center">
                  <ReCAPTCHA
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    onChange={(token) => setCaptchaToken(token)}
                    data-testid="recaptcha"
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/careers')}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={applyMutation.isPending || !captchaToken || !resumeUrl || !consent || !agreedToTerms || !agreedToPolicy}
                  data-testid="button-submit"
                >
                  {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
