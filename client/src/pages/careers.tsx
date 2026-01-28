import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import type { Job } from "@shared/schema";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Briefcase, MapPin, DollarSign, Clock, ArrowRight } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import Header from "@/components/Header";
import ResumeUpload from "@/components/ResumeUpload";

export default function CareersPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [backgroundScreeningConsent, setBackgroundScreeningConsent] = useState("");
  const [certificationType, setCertificationType] = useState("");
  const [drivingStatus, setDrivingStatus] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [specialSkills, setSpecialSkills] = useState<string[]>([]);
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [consent, setConsent] = useState(false);
  const [preferredContact, setPreferredContact] = useState("");
  const [positionApplying, setPositionApplying] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [motivation, setMotivation] = useState("");
  const [adaptability, setAdaptability] = useState("");
  const [conflictHandling, setConflictHandling] = useState("");
  const [safetyAchievement, setSafetyAchievement] = useState("");
  const [experienceTypes, setExperienceTypes] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  const applyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', `/api/jobs/${data.jobId}/apply`, data);
    },
    onSuccess: () => {
      resetForm();
      setShowApplicationForm(false);
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

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setShowApplicationForm(true);
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setBackgroundScreeningConsent("");
    setCertificationType("");
    setDrivingStatus("");
    setAvailability([]);
    setStartDate("");
    setYearsExperience("");
    setSpecialSkills([]);
    setResumeUrl("");
    setCoverLetter("");
    setConsent(false);
    setPreferredContact("");
    setPositionApplying("");
    setHoursPerWeek("");
    setMotivation("");
    setAdaptability("");
    setConflictHandling("");
    setSafetyAchievement("");
    setExperienceTypes("");
    setAgreedToTerms(false);
    setAgreedToPolicy(false);
    setCaptchaToken(null);
    setSelectedJob(null);
  };

  const handleSubmitApplication = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!agreedToTerms || !agreedToPolicy) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      return;
    }
    
    if (!captchaToken) {
      toast({
        title: "CAPTCHA Required",
        description: "Please complete the CAPTCHA verification",
        variant: "destructive",
      });
      return;
    }

    if (!consent) {
      toast({
        title: "Consent Required",
        description: "Please confirm that the information provided is accurate",
        variant: "destructive",
      });
      return;
    }

    if (!selectedJob) return;

    const formData = new FormData(e.currentTarget);
    applyMutation.mutate({
      jobId: selectedJob.id,
      fullName,
      email,
      phone,
      address,
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
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const toggleSkill = (value: string) => {
    setSpecialSkills(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };


  return (
    <div className="min-h-screen bg-background">
      <PageSEO 
        pageSlug="careers"
        fallbackTitle="Caregiver Jobs in Massachusetts | PCA & Home Health Aide Positions"
        fallbackDescription="Join Massachusetts' leading private pay senior care team. Competitive pay, flexible schedules, and rewarding work helping seniors age in place. Apply today."
        canonicalPath="/careers"
        includeMaGeoTargeting={true}
        pageType="website"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Caregiver Careers", url: "/careers" }
        ]}
      />
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-page-title">
            Join Our Team: Caregivers Who Bring Compassion Home
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
            A Career Where Excellence Meets Empathy
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            At <strong>Private InHome CareGiver</strong>, we believe that caring for others is one of the highest honors, and our caregivers are the heart of our premium, private-pay service. We are not just hiring hands; we are seeking professional, compassionate individuals who are motivated by a deep desire to make a meaningful difference in the lives of seniors and their families.
          </p>
          <div className="mt-8 flex justify-center">
            <Button 
              size="lg" 
              onClick={() => setLocation("/apply")}
              data-testid="button-apply-hero"
            >
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Private InHome CareGiver?</h2>
        <p className="text-lg text-muted-foreground mb-8 text-center max-w-3xl mx-auto">
          We understand that to provide the highest quality of care, we must first provide the highest level of support and recognition for our professionals. We foster a culture where compassionate professionals thrive and feel valued.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Professional Recognition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We view our caregivers as trusted experts and compensate them accordingly for their skill and dedication to excellence.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investment in You</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We offer continuous, specialized training and learning opportunities—including free certifications and courses—to help you grow professionally and deepen your expertise in areas like dementia support and mobility assistance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team and Culture</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We are committed to a patient-focused culture where employees are acknowledged and commended for making a difference. You will be matched with clients based on your qualifications and temperament to ensure lasting, successful relationships.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work/Life Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We work collaboratively with you to honor scheduling requirements and preferences, offering flexible hours to help you feel more fulfilled in your job.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-center mt-8">
          <Button 
            size="lg" 
            onClick={() => setLocation("/apply")}
            data-testid="button-apply-benefits"
          >
            Start Your Application
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Your Role: Personal Care Attendant (PCA) / Home Health Aide (HHA)</h2>
          <p className="text-lg text-muted-foreground mb-8 text-center max-w-3xl mx-auto">
            We are hiring for positions that focus on providing essential, non-medical support that enables our clients to live independently and with dignity.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-4 text-left font-semibold">Role</th>
                  <th className="p-4 text-left font-semibold">Primary Focus</th>
                  <th className="p-4 text-left font-semibold">Key Responsibilities</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-semibold">Personal Care Attendant (PCA)</td>
                  <td className="p-4">Assistance with essential daily living activities (ADLs) and household support (IADLs)</td>
                  <td className="p-4">Bathing, dressing, grooming, toileting, ambulation, safe transfers, light housekeeping, shopping, and meal preparation.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold">Home Health Aide (HHA)</td>
                  <td className="p-4">Comprehensive non-medical care, often with a higher level of training/experience, focused on client well-being and stability</td>
                  <td className="p-4">All PCA duties, plus medication reminders, assistance with physician-prescribed exercises, and diligent monitoring/reporting of health status changes.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Minimum Requirements & Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">To ensure our premium standards are met, candidates must possess the following:</p>
              <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                <li>Be legally authorized to work in the United States</li>
                <li>Demonstrate the ability to understand and carry out instructions effectively</li>
                <li>Possess a current, valid driver's license and reliable transportation</li>
                <li><strong>Training Verification:</strong> Certification or documented completion of training hours relevant to the role (e.g., state-mandated training, such as the 60 hours often required for Personal Care Workers or the 75+ hours for Home Health Aides)</li>
              </ol>
            </CardContent>
          </Card>
          
          <div className="flex justify-center mt-8">
            <Button 
              size="lg" 
              onClick={() => setLocation("/apply")}
              data-testid="button-apply-requirements"
            >
              Apply to Join Our Team
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Available Positions Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-center">Available Positions</h2>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="gap-2">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Card key={job.id} data-testid={`card-job-${job.id}`} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {job.type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {job.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                  )}
                  {job.payRange && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      {job.payRange}
                    </div>
                  )}
                  <p className="text-sm line-clamp-3">{job.description}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleApply(job)}
                    className="w-full"
                    data-testid={`button-apply-${job.id}`}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Apply Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Open Positions</h3>
              <p className="text-muted-foreground">
                We don't have any open positions at the moment. Please check back later!
              </p>
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-center mt-12">
          <Button 
            size="lg" 
            onClick={() => setLocation("/apply")}
            data-testid="button-apply-general"
          >
            Submit General Application
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmitApplication}>
            <DialogHeader>
              <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
              <DialogDescription>
                Complete all required fields to submit your application.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Step 1: Personal Information</h3>
                
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

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Step 2: Qualifications & Schedule</h3>

                <div>
                  <Label htmlFor="certificationType">Do you hold a certification? *</Label>
                  <Select value={certificationType} onValueChange={setCertificationType} required>
                    <SelectTrigger id="certificationType" data-testid="select-certification">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HHA">HHA (Home Health Aide)</SelectItem>
                      <SelectItem value="CNA">CNA (Certified Nurse Assistant)</SelectItem>
                      <SelectItem value="PCA">PCA (Personal Care Assistant)</SelectItem>
                      <SelectItem value="None">None/Other (Explain in resume)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="drivingStatus">Driver's License & Vehicle Status *</Label>
                  <Select value={drivingStatus} onValueChange={setDrivingStatus} required>
                    <SelectTrigger id="drivingStatus" data-testid="select-driving">
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Licensed_Insured">I have a valid license and reliable, insured vehicle</SelectItem>
                      <SelectItem value="Licensed_NoVehicle">I have a valid license but no reliable vehicle</SelectItem>
                      <SelectItem value="NoLicense">I do not have a valid license</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Preferred Weekly Availability *</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      { value: "Days", label: "Days (7am-3pm)" },
                      { value: "Evenings", label: "Evenings (3pm-11pm)" },
                      { value: "Overnights", label: "Overnights (11pm-7am)" },
                      { value: "Weekends", label: "Weekends (Sat/Sun)" }
                    ].map((item) => (
                      <div key={item.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`avail-${item.value}`}
                          checked={availability.includes(item.value)}
                          onCheckedChange={() => toggleAvailability(item.value)}
                          data-testid={`checkbox-availability-${item.value.toLowerCase()}`}
                        />
                        <Label htmlFor={`avail-${item.value}`} className="font-normal cursor-pointer">
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="startDate">When can you start working? *</Label>
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

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Step 3: Experience and Uploads</h3>

                <div>
                  <Label htmlFor="yearsExperience">Years of professional caregiving experience *</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    min="0"
                    max="50"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    required
                    data-testid="input-experience"
                  />
                </div>

                <div>
                  <Label>Do you have experience with any of the following?</Label>
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

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Step 4: Behavioral Screening Questions (Required)</h3>
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

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Declaration</h3>
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

              {import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
                <div className="flex justify-center">
                  <ReCAPTCHA
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    onChange={(token) => setCaptchaToken(token)}
                    data-testid="recaptcha"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowApplicationForm(false);
                  resetForm();
                }}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={applyMutation.isPending || !captchaToken || !agreedToTerms || !agreedToPolicy}
                data-testid="button-submit"
              >
                {applyMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
