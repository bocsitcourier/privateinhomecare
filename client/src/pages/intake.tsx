import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { ArrowLeft, Check, Loader2, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ReCAPTCHA from "react-google-recaptcha";
import PageSEO from "@/components/PageSEO";
import { Separator } from "@/components/ui/separator";

const mdshcFormSchema = z.object({
  // Section AA: Name and Identification
  clientLastName: z.string().trim().min(1, "Last name is required"),
  clientFirstName: z.string().trim().min(1, "First name is required"),
  clientMiddleInitial: z.string().trim().optional(),
  caseRecordNo: z.string().trim().min(1, "Case record number is required"),
  socialSecurityNo: z.string().trim().optional(),
  healthInsuranceNo: z.string().trim().optional(),
  
  // Section BB: Personal Items (Complete at Intake Only)
  gender: z.enum(["Male", "Female"], { required_error: "Gender is required" }),
  birthMonth: z.string().trim().min(1, "Birth month is required"),
  birthDay: z.string().trim().min(1, "Birth day is required"),
  birthYear: z.string().trim().min(1, "Birth year is required"),
  raceEthnicity: z.array(z.string()).min(1, "Select at least one race/ethnicity"),
  maritalStatus: z.string().trim().min(1, "Marital status is required"),
  primaryLanguage: z.string().trim().min(1, "Primary language is required"),
  education: z.string().trim().min(1, "Education level is required"),
  hasLegalGuardian: z.enum(["No", "Yes"], { required_error: "Required" }),
  hasAdvancedDirectives: z.enum(["No", "Yes"], { required_error: "Required" }),
  
  // Section CC: Referral Items (Complete at Intake Only)
  dateOpened: z.string().trim().min(1, "Date case opened is required"),
  reasonForReferral: z.string().trim().min(1, "Reason for referral is required"),
  goalsOfCare: z.array(z.string()).min(1, "Select at least one goal of care"),
  timeSinceHospital: z.string().trim().min(1, "Required"),
  whereLivedAtReferral: z.string().trim().min(1, "Required"),
  whoLivedWith: z.string().trim().min(1, "Required"),
  priorNHPlacement: z.enum(["No", "Yes"], { required_error: "Required" }),
  movedWithinTwoYears: z.enum(["No", "Yes"], { required_error: "Required" }),
  
  // Section A: Assessment Information
  assessmentDate: z.string().trim().min(1, "Assessment date is required"),
  assessmentType: z.string().trim().min(1, "Assessment type is required"),
  
  // Section B: Cognitive Patterns
  shortTermMemory: z.string().trim().min(1, "Required"),
  proceduralMemory: z.string().trim().min(1, "Required"),
  decisionMaking: z.string().trim().min(1, "Required"),
  decisionMakingWorsening: z.enum(["No", "Yes"], { required_error: "Required" }),
  deliriumOnset: z.enum(["No", "Yes"], { required_error: "Required" }),
  agitatedDisoriented: z.enum(["No", "Yes"], { required_error: "Required" }),
  
  // Section C: Communication/Hearing Patterns
  hearing: z.string().trim().min(1, "Required"),
  makingSelfUnderstood: z.string().trim().min(1, "Required"),
  abilityToUnderstand: z.string().trim().min(1, "Required"),
  communicationDecline: z.enum(["No", "Yes"], { required_error: "Required" }),
  
  // Section D: Vision Patterns
  vision: z.string().trim().min(1, "Required"),
  visualLimitations: z.enum(["No", "Yes"], { required_error: "Required" }),
  visionDecline: z.enum(["No", "Yes"], { required_error: "Required" }),
  
  // Section E: Mood and Behavior Patterns
  sadnessMood: z.string().trim().min(1, "Required"),
  persistentAnger: z.string().trim().min(1, "Required"),
  unrealisticFears: z.string().trim().min(1, "Required"),
  repetitiveHealthComplaints: z.string().trim().min(1, "Required"),
  repetitiveAnxiousComplaints: z.string().trim().min(1, "Required"),
  sadFacialExpressions: z.string().trim().min(1, "Required"),
  recurrentCrying: z.string().trim().min(1, "Required"),
  withdrawalFromActivities: z.string().trim().min(1, "Required"),
  reducedSocialInteraction: z.string().trim().min(1, "Required"),
  moodDecline: z.enum(["No", "Yes"], { required_error: "Required" }),
  wandering: z.string().trim().min(1, "Required"),
  verballyAbusive: z.string().trim().min(1, "Required"),
  physicallyAbusive: z.string().trim().min(1, "Required"),
  sociallyInappropriate: z.string().trim().min(1, "Required"),
  resistsCare: z.string().trim().min(1, "Required"),
  behavioralChange: z.enum(["No", "Yes"], { required_error: "Required" }),
  
  // Section F: Social Functioning
  atEaseInteracting: z.enum(["At ease", "Not at ease"], { required_error: "Required" }),
  expressesConflict: z.enum(["No", "Yes"], { required_error: "Required" }),
  socialActivitiesChange: z.string().trim().min(1, "Required"),
  timeAlone: z.string().trim().min(1, "Required"),
  feelsLonely: z.enum(["No", "Yes"], { required_error: "Required" }),
  
  // Section G: Informal Support Services
  primaryHelperName: z.string().trim().min(1, "Primary helper name is required"),
  primaryHelperLivesWithClient: z.enum(["Yes", "No", "No such helper"], { required_error: "Required" }),
  primaryHelperRelationship: z.string().trim().min(1, "Required"),
  primaryHelperAdviceSupport: z.enum(["Yes", "No"], { required_error: "Required" }),
  primaryHelperIADLCare: z.enum(["Yes", "No"], { required_error: "Required" }),
  primaryHelperADLCare: z.enum(["Yes", "No"], { required_error: "Required" }),
  primaryHelperWillingnessAdvice: z.string().trim().min(1, "Required"),
  primaryHelperWillingnessIADL: z.string().trim().min(1, "Required"),
  primaryHelperWillingnessADL: z.string().trim().min(1, "Required"),
  caregiverUnableToContinue: z.boolean().default(false),
  caregiverNotSatisfied: z.boolean().default(false),
  caregiverDistressed: z.boolean().default(false),
  informalHelpWeekdays: z.string().trim().min(1, "Required"),
  informalHelpWeekend: z.string().trim().min(1, "Required"),
  
  // Section H: Physical Functioning - IADL (Last 7 Days)
  iadlMealPrepPerformance: z.string().trim().min(1, "Required"),
  iadlMealPrepDifficulty: z.string().trim().min(1, "Required"),
  iadlHouseworkPerformance: z.string().trim().min(1, "Required"),
  iadlHouseworkDifficulty: z.string().trim().min(1, "Required"),
  iadlFinancesPerformance: z.string().trim().min(1, "Required"),
  iadlFinancesDifficulty: z.string().trim().min(1, "Required"),
  iadlMedicationsPerformance: z.string().trim().min(1, "Required"),
  iadlMedicationsDifficulty: z.string().trim().min(1, "Required"),
  iadlPhonePerformance: z.string().trim().min(1, "Required"),
  iadlPhoneDifficulty: z.string().trim().min(1, "Required"),
  iadlShoppingPerformance: z.string().trim().min(1, "Required"),
  iadlShoppingDifficulty: z.string().trim().min(1, "Required"),
  
  // Contact Information
  email: z.string().trim().email("Valid email is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  
  // Caregiver Signature Section
  caregiverSignature: z.string().trim().min(1, "Signature is required"),
  caregiverTitle: z.string().trim().min(1, "Title is required"),
  caregiverSignatureDate: z.string().trim().min(1, "Signature date is required"),
  
  // Agreement checkboxes
  agreedToTerms: z.enum(["yes", "no"], { required_error: "You must agree to the Terms of Service" }).refine(val => val === "yes", {
    message: "You must agree to the Terms of Service",
  }),
  agreedToPolicy: z.enum(["yes", "no"], { required_error: "You must agree to the Privacy Policy" }).refine(val => val === "yes", {
    message: "You must agree to the Privacy Policy",
  }),
  
  // Anti-spam & CAPTCHA
  website: z.string().max(0),
  captchaToken: z.string().min(1, "Please complete the CAPTCHA"),
});

type MDSHCFormData = z.infer<typeof mdshcFormSchema>;

export default function IntakePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<MDSHCFormData>({
    resolver: zodResolver(mdshcFormSchema),
    defaultValues: {
      clientLastName: "",
      clientFirstName: "",
      clientMiddleInitial: "",
      caseRecordNo: "",
      socialSecurityNo: "",
      healthInsuranceNo: "",
      gender: undefined,
      birthMonth: "",
      birthDay: "",
      birthYear: "",
      raceEthnicity: [],
      maritalStatus: "",
      primaryLanguage: "",
      education: "",
      hasLegalGuardian: undefined,
      hasAdvancedDirectives: undefined,
      dateOpened: "",
      reasonForReferral: "",
      goalsOfCare: [],
      timeSinceHospital: "",
      whereLivedAtReferral: "",
      whoLivedWith: "",
      priorNHPlacement: undefined,
      movedWithinTwoYears: undefined,
      assessmentDate: "",
      assessmentType: "",
      shortTermMemory: "",
      proceduralMemory: "",
      decisionMaking: "",
      decisionMakingWorsening: undefined,
      deliriumOnset: undefined,
      agitatedDisoriented: undefined,
      hearing: "",
      makingSelfUnderstood: "",
      abilityToUnderstand: "",
      communicationDecline: undefined,
      vision: "",
      visualLimitations: undefined,
      visionDecline: undefined,
      sadnessMood: "",
      persistentAnger: "",
      unrealisticFears: "",
      repetitiveHealthComplaints: "",
      repetitiveAnxiousComplaints: "",
      sadFacialExpressions: "",
      recurrentCrying: "",
      withdrawalFromActivities: "",
      reducedSocialInteraction: "",
      moodDecline: undefined,
      wandering: "",
      verballyAbusive: "",
      physicallyAbusive: "",
      sociallyInappropriate: "",
      resistsCare: "",
      behavioralChange: undefined,
      atEaseInteracting: undefined,
      expressesConflict: undefined,
      socialActivitiesChange: "",
      timeAlone: "",
      feelsLonely: undefined,
      primaryHelperName: "",
      primaryHelperLivesWithClient: undefined,
      primaryHelperRelationship: "",
      primaryHelperAdviceSupport: undefined,
      primaryHelperIADLCare: undefined,
      primaryHelperADLCare: undefined,
      primaryHelperWillingnessAdvice: "",
      primaryHelperWillingnessIADL: "",
      primaryHelperWillingnessADL: "",
      caregiverUnableToContinue: false,
      caregiverNotSatisfied: false,
      caregiverDistressed: false,
      informalHelpWeekdays: "",
      informalHelpWeekend: "",
      iadlMealPrepPerformance: "",
      iadlMealPrepDifficulty: "",
      iadlHouseworkPerformance: "",
      iadlHouseworkDifficulty: "",
      iadlFinancesPerformance: "",
      iadlFinancesDifficulty: "",
      iadlMedicationsPerformance: "",
      iadlMedicationsDifficulty: "",
      iadlPhonePerformance: "",
      iadlPhoneDifficulty: "",
      iadlShoppingPerformance: "",
      iadlShoppingDifficulty: "",
      email: "",
      phone: "",
      caregiverSignature: "",
      caregiverTitle: "",
      caregiverSignatureDate: "",
      agreedToTerms: undefined,
      agreedToPolicy: undefined,
      website: "",
      captchaToken: "",
    },
  });

  const onSubmit = async (data: MDSHCFormData) => {
    if (!captchaToken) {
      toast({
        variant: "destructive",
        title: "CAPTCHA Required",
        description: "Please complete the CAPTCHA verification.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        clientName: `${data.clientFirstName} ${data.clientLastName}`,
        clientEmail: data.email,
        clientPhone: data.phone,
        dateOfBirth: `${data.birthMonth}/${data.birthDay}/${data.birthYear}`,
        caseRecordNo: data.caseRecordNo,
        formData: {
          sectionAA: {
            socialSecurityNo: data.socialSecurityNo,
            healthInsuranceNo: data.healthInsuranceNo,
          },
          sectionBB: {
            gender: data.gender,
            raceEthnicity: data.raceEthnicity,
            maritalStatus: data.maritalStatus,
            primaryLanguage: data.primaryLanguage,
            education: data.education,
            hasLegalGuardian: data.hasLegalGuardian,
            hasAdvancedDirectives: data.hasAdvancedDirectives,
          },
          sectionCC: {
            dateOpened: data.dateOpened,
            reasonForReferral: data.reasonForReferral,
            goalsOfCare: data.goalsOfCare,
            timeSinceHospital: data.timeSinceHospital,
            whereLivedAtReferral: data.whereLivedAtReferral,
            whoLivedWith: data.whoLivedWith,
            priorNHPlacement: data.priorNHPlacement,
            movedWithinTwoYears: data.movedWithinTwoYears,
          },
          sectionA: {
            assessmentDate: data.assessmentDate,
            assessmentType: data.assessmentType,
          },
          sectionB: {
            shortTermMemory: data.shortTermMemory,
            proceduralMemory: data.proceduralMemory,
            decisionMaking: data.decisionMaking,
            decisionMakingWorsening: data.decisionMakingWorsening,
            deliriumOnset: data.deliriumOnset,
            agitatedDisoriented: data.agitatedDisoriented,
          },
          sectionC: {
            hearing: data.hearing,
            makingSelfUnderstood: data.makingSelfUnderstood,
            abilityToUnderstand: data.abilityToUnderstand,
            communicationDecline: data.communicationDecline,
          },
          sectionD: {
            vision: data.vision,
            visualLimitations: data.visualLimitations,
            visionDecline: data.visionDecline,
          },
          sectionE: {
            moodIndicators: {
              sadnessMood: data.sadnessMood,
              persistentAnger: data.persistentAnger,
              unrealisticFears: data.unrealisticFears,
              repetitiveHealthComplaints: data.repetitiveHealthComplaints,
              repetitiveAnxiousComplaints: data.repetitiveAnxiousComplaints,
              sadFacialExpressions: data.sadFacialExpressions,
              recurrentCrying: data.recurrentCrying,
              withdrawalFromActivities: data.withdrawalFromActivities,
              reducedSocialInteraction: data.reducedSocialInteraction,
            },
            moodDecline: data.moodDecline,
            behavioralSymptoms: {
              wandering: data.wandering,
              verballyAbusive: data.verballyAbusive,
              physicallyAbusive: data.physicallyAbusive,
              sociallyInappropriate: data.sociallyInappropriate,
              resistsCare: data.resistsCare,
            },
            behaviorialChange: data.behavioralChange,
          },
          sectionF: {
            atEaseInteracting: data.atEaseInteracting,
            expressesConflict: data.expressesConflict,
            socialActivitiesChange: data.socialActivitiesChange,
            timeAlone: data.timeAlone,
            feelsLonely: data.feelsLonely,
          },
          sectionG: {
            primaryHelper: {
              name: data.primaryHelperName,
              livesWithClient: data.primaryHelperLivesWithClient,
              relationship: data.primaryHelperRelationship,
              adviceSupport: data.primaryHelperAdviceSupport,
              iadlCare: data.primaryHelperIADLCare,
              adlCare: data.primaryHelperADLCare,
              willingnessAdvice: data.primaryHelperWillingnessAdvice,
              willingnessIADL: data.primaryHelperWillingnessIADL,
              willingnessADL: data.primaryHelperWillingnessADL,
            },
            caregiverStatus: [
              data.caregiverUnableToContinue ? "unable" : "",
              data.caregiverNotSatisfied ? "notSatisfied" : "",
              data.caregiverDistressed ? "distressed" : "",
            ].filter(Boolean),
            informalHelpHours: {
              weekdays: parseInt(data.informalHelpWeekdays) || 0,
              weekend: parseInt(data.informalHelpWeekend) || 0,
            },
          },
          sectionH: {
            iadl: {
              mealPrep: { performance: data.iadlMealPrepPerformance, difficulty: data.iadlMealPrepDifficulty },
              housework: { performance: data.iadlHouseworkPerformance, difficulty: data.iadlHouseworkDifficulty },
              finances: { performance: data.iadlFinancesPerformance, difficulty: data.iadlFinancesDifficulty },
              medications: { performance: data.iadlMedicationsPerformance, difficulty: data.iadlMedicationsDifficulty },
              phone: { performance: data.iadlPhonePerformance, difficulty: data.iadlPhoneDifficulty },
              shopping: { performance: data.iadlShoppingPerformance, difficulty: data.iadlShoppingDifficulty },
            },
          },
          caregiverSignature: {
            signature: data.caregiverSignature,
            title: data.caregiverTitle,
            date: data.caregiverSignatureDate,
          },
        },
        agreedToTerms: data.agreedToTerms,
        agreedToPolicy: data.agreedToPolicy,
        captchaToken,
      };

      await apiRequest("/api/intake", "POST", payload);

      setIsSuccess(true);
      toast({
        title: "Form Submitted Successfully",
        description: "We have received your intake assessment. Our team will review it shortly.",
      });
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "There was an error submitting the form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 py-12 px-4">
        <PageSEO pageSlug="intake" />
        <div className="container max-w-2xl mx-auto">
          <Card className="border-2 border-green-500 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-400">
                Intake Form Submitted!
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Thank you for completing the intake assessment. Our care team will review your information and contact you shortly.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You should receive a confirmation email at <strong>{form.getValues("email")}</strong>
              </p>
              <div className="pt-4">
                <Link href="/" data-testid="link-home">
                  <Button variant="default" className="gap-2" data-testid="button-return-home">
                    <ArrowLeft className="w-4 h-4" />
                    Return to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 py-12 px-4">
      <PageSEO pageSlug="intake" />
      <div className="container max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" data-testid="link-back">
            <Button variant="ghost" className="gap-2 mb-4" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Private InHome CareGiver Intake Assessment
              </h1>
              <p className="text-muted-foreground">Complete health assessment for in-home care services</p>
            </div>
          </div>

          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Confidential Assessment:</strong> This comprehensive health assessment helps us provide personalized in-home care services. All information is kept confidential and used only for care planning purposes.
              </p>
            </CardContent>
          </Card>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Anti-spam honeypot */}
            <input
              type="text"
              style={{ position: "absolute", left: "-9999px" }}
              tabIndex={-1}
              autoComplete="off"
              {...form.register("website")}
            />

            {/* Section AA: Name and Identification Numbers */}
            <Card data-testid="card-section-aa">
              <CardHeader>
                <CardTitle>Section AA: Name and Identification Numbers</CardTitle>
                <CardDescription>Basic identification information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="clientLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientMiddleInitial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Initial</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={1} data-testid="input-middle-initial" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="caseRecordNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Record Number</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-case-record" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="socialSecurityNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Security Number (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" data-testid="input-ssn" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="healthInsuranceNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Health Insurance Number (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-insurance" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section BB: Personal Items (Complete at Intake Only) */}
            <Card data-testid="card-section-bb">
              <CardHeader>
                <CardTitle>Section BB: Personal Items</CardTitle>
                <CardDescription>Complete at intake only</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                          data-testid="radio-gender"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Male" id="male" />
                            <Label htmlFor="male">Male</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Female" id="female" />
                            <Label htmlFor="female">Female</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label className="mb-2 block">Date of Birth</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="birthMonth"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="MM" {...field} data-testid="input-birth-month" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="birthDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="DD" {...field} data-testid="input-birth-day" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="birthYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="YYYY" {...field} data-testid="input-birth-year" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="raceEthnicity"
                  render={() => (
                    <FormItem>
                      <FormLabel>Race/Ethnicity (Check all that apply)</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { value: "White", label: "White" },
                          { value: "Black or African American", label: "Black or African American" },
                          { value: "Asian", label: "Asian" },
                          { value: "Native Hawaiian or other Pacific Islander", label: "Native Hawaiian or other Pacific Islander" },
                          { value: "American Indian/Alaskan Native", label: "American Indian/Alaskan Native" },
                          { value: "Hispanic or Latino", label: "Hispanic or Latino" },
                        ].map((item) => (
                          <FormField
                            key={item.value}
                            control={form.control}
                            name="raceEthnicity"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.value])
                                        : field.onChange(field.value?.filter((value) => value !== item.value));
                                    }}
                                    data-testid={`checkbox-race-${item.value.toLowerCase().replace(/\s+/g, "-")}`}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{item.label}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marital Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-marital-status">
                            <SelectValue placeholder="Select marital status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Never married</SelectItem>
                          <SelectItem value="2">Married</SelectItem>
                          <SelectItem value="3">Widowed</SelectItem>
                          <SelectItem value="4">Separated</SelectItem>
                          <SelectItem value="5">Divorced</SelectItem>
                          <SelectItem value="6">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primaryLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Language</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-language">
                            <SelectValue placeholder="Select primary language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">English</SelectItem>
                          <SelectItem value="1">Spanish</SelectItem>
                          <SelectItem value="2">French</SelectItem>
                          <SelectItem value="3">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Highest Level of Education Completed</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-education">
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">No schooling</SelectItem>
                          <SelectItem value="2">8th grade or less</SelectItem>
                          <SelectItem value="3">9-11 grades</SelectItem>
                          <SelectItem value="4">High school</SelectItem>
                          <SelectItem value="5">Technical or trade school</SelectItem>
                          <SelectItem value="6">Some college</SelectItem>
                          <SelectItem value="7">Bachelor's degree</SelectItem>
                          <SelectItem value="8">Graduate degree</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hasLegalGuardian"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client has a legal guardian?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-4"
                            data-testid="radio-guardian"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id="guardian-no" />
                              <Label htmlFor="guardian-no">No</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="guardian-yes" />
                              <Label htmlFor="guardian-yes">Yes</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hasAdvancedDirectives"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client has advanced medical directives?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-4"
                            data-testid="radio-directives"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id="directives-no" />
                              <Label htmlFor="directives-no">No</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="directives-yes" />
                              <Label htmlFor="directives-yes">Yes</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section CC: Referral Items */}
            <Card data-testid="card-section-cc">
              <CardHeader>
                <CardTitle>Section CC: Referral Items</CardTitle>
                <CardDescription>Complete at intake only</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="dateOpened"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Case Opened/Reopened</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-date-opened" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reasonForReferral"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Referral</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-reason-referral">
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Post hospital care</SelectItem>
                          <SelectItem value="2">Community chronic care</SelectItem>
                          <SelectItem value="3">Home placement screen</SelectItem>
                          <SelectItem value="4">Eligibility for home care</SelectItem>
                          <SelectItem value="5">Day care</SelectItem>
                          <SelectItem value="6">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goalsOfCare"
                  render={() => (
                    <FormItem>
                      <FormLabel>Goals of Care (Check all that apply)</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { value: "Skilled nursing treatments", label: "Skilled nursing treatments" },
                          { value: "Monitoring to avoid clinical complications", label: "Monitoring to avoid complications" },
                          { value: "Rehabilitation", label: "Rehabilitation" },
                          { value: "Client/family education", label: "Client/family education" },
                          { value: "Family respite", label: "Family respite" },
                          { value: "Palliative care", label: "Palliative care" },
                        ].map((item) => (
                          <FormField
                            key={item.value}
                            control={form.control}
                            name="goalsOfCare"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.value])
                                        : field.onChange(field.value?.filter((value) => value !== item.value));
                                    }}
                                    data-testid={`checkbox-goal-${item.value.toLowerCase().replace(/\s+/g, "-")}`}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{item.label}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeSinceHospital"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Since Last Hospital Stay (Last 180 Days)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-hospital-time">
                            <SelectValue placeholder="Select time frame" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">No hospitalization within 180 days</SelectItem>
                          <SelectItem value="1">Within last week</SelectItem>
                          <SelectItem value="2">Within 8 to 14 days</SelectItem>
                          <SelectItem value="3">Within 15 to 30 days</SelectItem>
                          <SelectItem value="4">More than 30 days ago</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whereLivedAtReferral"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Where Lived at Time of Referral</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-where-lived">
                            <SelectValue placeholder="Select living situation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Private home/apt. with no home care services</SelectItem>
                          <SelectItem value="2">Private home/apt. with home care services</SelectItem>
                          <SelectItem value="3">Board and care/assisted living/group home</SelectItem>
                          <SelectItem value="4">Nursing home</SelectItem>
                          <SelectItem value="5">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whoLivedWith"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Who Lived With at Referral</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-who-lived-with">
                            <SelectValue placeholder="Select living arrangement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Lived alone</SelectItem>
                          <SelectItem value="2">Lived with spouse only</SelectItem>
                          <SelectItem value="3">Lived with spouse and other(s)</SelectItem>
                          <SelectItem value="4">Lived with child (not spouse)</SelectItem>
                          <SelectItem value="5">Lived with other(s) (not spouse or children)</SelectItem>
                          <SelectItem value="6">Lived in group setting with non-relative(s)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priorNHPlacement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resided in nursing home in prior 5 years?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-4"
                            data-testid="radio-nh-placement"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id="nh-no" />
                              <Label htmlFor="nh-no">No</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="nh-yes" />
                              <Label htmlFor="nh-yes">Yes</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="movedWithinTwoYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moved to current residence within last 2 years?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-4"
                            data-testid="radio-moved"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id="moved-no" />
                              <Label htmlFor="moved-no">No</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="moved-yes" />
                              <Label htmlFor="moved-yes">Yes</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section A: Assessment Information */}
            <Card data-testid="card-section-a">
              <CardHeader>
                <CardTitle>Section A: Assessment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="assessmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Assessment</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-assessment-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assessmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of Assessment</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-assessment-type">
                            <SelectValue placeholder="Select assessment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Initial assessment</SelectItem>
                          <SelectItem value="2">Follow-up assessment</SelectItem>
                          <SelectItem value="3">Routine assessment at fixed intervals</SelectItem>
                          <SelectItem value="4">Review within 30-day period prior to discharge</SelectItem>
                          <SelectItem value="5">Review at return from hospital</SelectItem>
                          <SelectItem value="6">Change in status</SelectItem>
                          <SelectItem value="7">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Section B: Cognitive Patterns */}
            <Card data-testid="card-section-b">
              <CardHeader>
                <CardTitle>Section B: Cognitive Patterns</CardTitle>
                <CardDescription>Memory and decision-making abilities (Last 3 Days)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="shortTermMemory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short-term memory OK (recalls after 5 minutes)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-short-memory">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Memory OK</SelectItem>
                          <SelectItem value="1">Memory problem</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proceduralMemory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Procedural memory OK (performs multi-task sequences without cues)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-procedural-memory">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Memory OK</SelectItem>
                          <SelectItem value="1">Memory problem</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="decisionMaking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cognitive Skills for Daily Decision-Making</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-decision-making">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">INDEPENDENT - Decisions consistent/reasonable/safe</SelectItem>
                          <SelectItem value="1">MODIFIED INDEPENDENCE - Some difficulty in new situations only</SelectItem>
                          <SelectItem value="2">MINIMALLY IMPAIRED - Cues/supervision needed at times</SelectItem>
                          <SelectItem value="3">MODERATELY IMPAIRED - Cues/supervision required at all times</SelectItem>
                          <SelectItem value="4">SEVERELY IMPAIRED - Never/rarely made decisions</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="decisionMakingWorsening"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decision making worsened (compared to 90 days ago)</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                          data-testid="radio-decision-worsening"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="decision-worse-no" />
                            <Label htmlFor="decision-worse-no">No</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="decision-worse-yes" />
                            <Label htmlFor="decision-worse-yes">Yes</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliriumOnset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sudden/new onset change in mental function (Last 7 Days)</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                          data-testid="radio-delirium"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="delirium-no" />
                            <Label htmlFor="delirium-no">No</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="delirium-yes" />
                            <Label htmlFor="delirium-yes">Yes</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agitatedDisoriented"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client agitated/disoriented (safety endangered, Last 90 Days)</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                          data-testid="radio-agitated"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="agitated-no" />
                            <Label htmlFor="agitated-no">No</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="agitated-yes" />
                            <Label htmlFor="agitated-yes">Yes</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Section C: Communication/Hearing Patterns */}
            <Card data-testid="card-section-c">
              <CardHeader>
                <CardTitle>Section C: Communication/Hearing Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="hearing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hearing (with hearing appliance if used)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-hearing">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">HEARS ADEQUATELY - Normal talk, TV, phone</SelectItem>
                          <SelectItem value="1">MINIMAL DIFFICULTY - When not in quiet setting</SelectItem>
                          <SelectItem value="2">HEARS IN SPECIAL SITUATIONS ONLY - Speaker adjusts tone</SelectItem>
                          <SelectItem value="3">HIGHLY IMPAIRED - Absence of useful hearing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="makingSelfUnderstood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Making Self Understood (Expression)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-self-understood">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">UNDERSTOOD - Expresses ideas without difficulty</SelectItem>
                          <SelectItem value="1">USUALLY UNDERSTOOD - Difficulty finding words, little prompting</SelectItem>
                          <SelectItem value="2">OFTEN UNDERSTOOD - Prompting usually required</SelectItem>
                          <SelectItem value="3">SOMETIMES UNDERSTOOD - Limited to concrete requests</SelectItem>
                          <SelectItem value="4">RARELY/NEVER UNDERSTOOD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="abilityToUnderstand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ability to Understand Others (Comprehension)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-understand-others">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">UNDERSTANDS - Clear comprehension</SelectItem>
                          <SelectItem value="1">USUALLY UNDERSTANDS - Misses some parts</SelectItem>
                          <SelectItem value="2">OFTEN UNDERSTANDS - With prompting</SelectItem>
                          <SelectItem value="3">SOMETIMES UNDERSTANDS - Simple, direct communication only</SelectItem>
                          <SelectItem value="4">RARELY/NEVER UNDERSTANDS</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="communicationDecline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Communication worsened (compared to 90 days ago)</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                          data-testid="radio-comm-decline"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="comm-decline-no" />
                            <Label htmlFor="comm-decline-no">No</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="comm-decline-yes" />
                            <Label htmlFor="comm-decline-yes">Yes</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Section D: Vision Patterns */}
            <Card data-testid="card-section-d">
              <CardHeader>
                <CardTitle>Section D: Vision Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="vision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vision (with glasses if used)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-vision">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">ADEQUATE - Sees fine detail, regular print</SelectItem>
                          <SelectItem value="1">IMPAIRED - Sees large print, not regular print</SelectItem>
                          <SelectItem value="2">MODERATELY IMPAIRED - Limited vision, identifies objects</SelectItem>
                          <SelectItem value="3">HIGHLY IMPAIRED - Object identification in question</SelectItem>
                          <SelectItem value="4">SEVERELY IMPAIRED - No vision or light/colors only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visualLimitations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visual limitations (halos, curtains, flashes)</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                          data-testid="radio-visual-limits"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="visual-limit-no" />
                            <Label htmlFor="visual-limit-no">No</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="visual-limit-yes" />
                            <Label htmlFor="visual-limit-yes">Yes</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visionDecline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vision worsened (compared to 90 days ago)</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                          data-testid="radio-vision-decline"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="vision-decline-no" />
                            <Label htmlFor="vision-decline-no">No</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="vision-decline-yes" />
                            <Label htmlFor="vision-decline-yes">Yes</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Section E: Mood and Behavior Patterns */}
            <Card data-testid="card-section-e">
              <CardHeader>
                <CardTitle>Section E: Mood and Behavior Patterns</CardTitle>
                <CardDescription>Last 3 Days - Code: 0=Not exhibited, 1=Exhibited 1-2 days, 2=Exhibited all 3 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Depression/Anxiety Indicators</h3>
                  
                  {[
                    { name: "sadnessMood" as const, label: "Feeling of sadness or being depressed", testId: "select-sadness" },
                    { name: "persistentAnger" as const, label: "Persistent anger with self or others", testId: "select-anger" },
                    { name: "unrealisticFears" as const, label: "Expressions of unrealistic fears", testId: "select-fears" },
                    { name: "repetitiveHealthComplaints" as const, label: "Repetitive health complaints", testId: "select-health-complaints" },
                    { name: "repetitiveAnxiousComplaints" as const, label: "Repetitive anxious complaints/concerns", testId: "select-anxious-complaints" },
                    { name: "sadFacialExpressions" as const, label: "Sad, pained, worried facial expressions", testId: "select-sad-face" },
                    { name: "recurrentCrying" as const, label: "Recurrent crying, tearfulness", testId: "select-crying" },
                    { name: "withdrawalFromActivities" as const, label: "Withdrawal from activities of interest", testId: "select-withdrawal" },
                    { name: "reducedSocialInteraction" as const, label: "Reduced social interaction", testId: "select-reduced-social" },
                  ].map((fieldItem) => (
                    <FormField
                      key={fieldItem.name}
                      control={form.control}
                      name={fieldItem.name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">{fieldItem.label}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid={fieldItem.testId}>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">Not exhibited in last 3 days</SelectItem>
                              <SelectItem value="1">Exhibited 1-2 of last 3 days</SelectItem>
                              <SelectItem value="2">Exhibited on each of last 3 days</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  <FormField
                    control={form.control}
                    name="moodDecline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mood indicators worsened (compared to 90 days ago)</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-4"
                            data-testid="radio-mood-decline"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id="mood-decline-no" />
                              <Label htmlFor="mood-decline-no">No</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="mood-decline-yes" />
                              <Label htmlFor="mood-decline-yes">Yes</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Behavioral Symptoms (Code: 0=Did not occur, 1=Occurred/easily altered, 2=Occurred/not easily altered)</h3>
                  
                  {[
                    { name: "wandering" as const, label: "Wandering (moved with no rational purpose)", testId: "select-wandering" },
                    { name: "verballyAbusive" as const, label: "Verbally abusive (threatened, screamed, cursed)", testId: "select-verbal-abuse" },
                    { name: "physicallyAbusive" as const, label: "Physically abusive (hit, shoved, scratched)", testId: "select-physical-abuse" },
                    { name: "sociallyInappropriate" as const, label: "Socially inappropriate/disruptive behavior", testId: "select-inappropriate" },
                    { name: "resistsCare" as const, label: "Resists care (medications, ADL assistance)", testId: "select-resists-care" },
                  ].map((fieldItem) => (
                    <FormField
                      key={fieldItem.name}
                      control={form.control}
                      name={fieldItem.name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">{fieldItem.label}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid={fieldItem.testId}>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">Did not occur in last 3 days</SelectItem>
                              <SelectItem value="1">Occurred, easily altered</SelectItem>
                              <SelectItem value="2">Occurred, not easily altered</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  <FormField
                    control={form.control}
                    name="behavioralChange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Behavioral symptoms worsened (compared to 90 days ago)</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-4"
                            data-testid="radio-behavioral-change"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id="behavioral-change-no" />
                              <Label htmlFor="behavioral-change-no">No</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="behavioral-change-yes" />
                              <Label htmlFor="behavioral-change-yes">Yes</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section F: Social Functioning */}
            <Card data-testid="card-section-f">
              <CardHeader>
                <CardTitle>Section F: Social Functioning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="atEaseInteracting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>At ease interacting with others</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                          data-testid="radio-at-ease"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="At ease" id="at-ease" />
                            <Label htmlFor="at-ease">At ease</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Not at ease" id="not-at-ease" />
                            <Label htmlFor="not-at-ease">Not at ease</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expressesConflict"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Openly expresses conflict or anger with family/friends</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                          data-testid="radio-conflict"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="conflict-no" />
                            <Label htmlFor="conflict-no">No</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="conflict-yes" />
                            <Label htmlFor="conflict-yes">Yes</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialActivitiesChange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Change in social activities (compared to 90 days ago)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-social-change">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">No decline</SelectItem>
                          <SelectItem value="1">Decline, not distressed</SelectItem>
                          <SelectItem value="2">Decline, distressed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeAlone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Length of time client is alone during the day</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-time-alone">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Never or hardly ever</SelectItem>
                          <SelectItem value="1">About one hour</SelectItem>
                          <SelectItem value="2">Long periods of time</SelectItem>
                          <SelectItem value="3">All of the time</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="feelsLonely"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client says or indicates feeling lonely</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                          data-testid="radio-lonely"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="lonely-no" />
                            <Label htmlFor="lonely-no">No</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="lonely-yes" />
                            <Label htmlFor="lonely-yes">Yes</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Section G: Informal Support Services */}
            <Card data-testid="card-section-g">
              <CardHeader>
                <CardTitle>Section G: Informal Support Services</CardTitle>
                <CardDescription>Primary helper information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="primaryHelperName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name of Primary Helper</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-helper-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primaryHelperLivesWithClient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lives with client?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          data-testid="radio-helper-lives-with"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="helper-lives-yes" />
                            <Label htmlFor="helper-lives-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="helper-lives-no" />
                            <Label htmlFor="helper-lives-no">No</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No such helper" id="no-helper" />
                            <Label htmlFor="no-helper">No such helper</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primaryHelperRelationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship to Client</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-helper-relationship">
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Spouse</SelectItem>
                          <SelectItem value="2">Child or child-in-law</SelectItem>
                          <SelectItem value="3">Other Relative</SelectItem>
                          <SelectItem value="4">Friend/neighbor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <Label>Areas of Help Currently Provided</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryHelperAdviceSupport"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Advice/emotional support</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex gap-2"
                              data-testid="radio-helper-advice"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Yes" id="advice-yes" />
                                <Label htmlFor="advice-yes">Yes</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="No" id="advice-no" />
                                <Label htmlFor="advice-no">No</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryHelperIADLCare"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">IADL care</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex gap-2"
                              data-testid="radio-helper-iadl"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Yes" id="iadl-yes" />
                                <Label htmlFor="iadl-yes">Yes</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="No" id="iadl-no" />
                                <Label htmlFor="iadl-no">No</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryHelperADLCare"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">ADL care</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex gap-2"
                              data-testid="radio-helper-adl"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Yes" id="adl-yes" />
                                <Label htmlFor="adl-yes">Yes</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="No" id="adl-no" />
                                <Label htmlFor="adl-no">No</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Willingness to Increase Help (hours per day)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryHelperWillingnessAdvice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Advice/emotional support</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-willing-advice">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">More than 2 hours</SelectItem>
                              <SelectItem value="1">1-2 hours per day</SelectItem>
                              <SelectItem value="2">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryHelperWillingnessIADL"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">IADL care</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-willing-iadl">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">More than 2 hours</SelectItem>
                              <SelectItem value="1">1-2 hours per day</SelectItem>
                              <SelectItem value="2">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryHelperWillingnessADL"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">ADL care</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-willing-adl">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">More than 2 hours</SelectItem>
                              <SelectItem value="1">1-2 hours per day</SelectItem>
                              <SelectItem value="2">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Caregiver Status (Check all that apply)</Label>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="caregiverUnableToContinue"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-caregiver-unable"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Caregiver unable to continue in caring activities
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="caregiverNotSatisfied"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-caregiver-not-satisfied"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Primary caregiver not satisfied with support from family/friends
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="caregiverDistressed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-caregiver-distressed"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Primary caregiver expresses feelings of distress, anger or depression
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="informalHelpWeekdays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Informal help hours (5 weekdays total)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} data-testid="input-help-weekdays" />
                        </FormControl>
                        <FormDescription>Total hours across Monday-Friday</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="informalHelpWeekend"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Informal help hours (weekend total)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} data-testid="input-help-weekend" />
                        </FormControl>
                        <FormDescription>Total hours across Saturday-Sunday</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section H: Physical Functioning - IADL (Last 7 Days) */}
            <Card data-testid="card-section-h">
              <CardHeader>
                <CardTitle>Section H: Physical Functioning - IADL Performance</CardTitle>
                <CardDescription>Instrumental Activities of Daily Living (Last 7 Days)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md text-sm mb-4">
                  <p className="font-semibold mb-1">Performance Codes:</p>
                  <p>0=INDEPENDENT (did on own) | 1=SOME HELP | 2=FULL HELP | 3=BY OTHERS | 8=ACTIVITY DID NOT OCCUR</p>
                  <p className="font-semibold mb-1 mt-2">Difficulty Codes:</p>
                  <p>0=NO DIFFICULTY | 1=SOME DIFFICULTY | 2=GREAT DIFFICULTY</p>
                </div>

                {[
                  { perfName: "iadlMealPrepPerformance" as const, diffName: "iadlMealPrepDifficulty" as const, label: "Meal Preparation", testIdPerf: "select-meal-prep-perf", testIdDiff: "select-meal-prep-diff" },
                  { perfName: "iadlHouseworkPerformance" as const, diffName: "iadlHouseworkDifficulty" as const, label: "Ordinary Housework", testIdPerf: "select-housework-perf", testIdDiff: "select-housework-diff" },
                  { perfName: "iadlFinancesPerformance" as const, diffName: "iadlFinancesDifficulty" as const, label: "Managing Finances", testIdPerf: "select-finances-perf", testIdDiff: "select-finances-diff" },
                  { perfName: "iadlMedicationsPerformance" as const, diffName: "iadlMedicationsDifficulty" as const, label: "Managing Medications", testIdPerf: "select-meds-perf", testIdDiff: "select-meds-diff" },
                  { perfName: "iadlPhonePerformance" as const, diffName: "iadlPhoneDifficulty" as const, label: "Using Telephone", testIdPerf: "select-phone-perf", testIdDiff: "select-phone-diff" },
                  { perfName: "iadlShoppingPerformance" as const, diffName: "iadlShoppingDifficulty" as const, label: "Shopping", testIdPerf: "select-shopping-perf", testIdDiff: "select-shopping-diff" },
                ].map((iadl) => (
                  <div key={iadl.perfName} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <FormField
                      control={form.control}
                      name={iadl.perfName}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{iadl.label} - Performance</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid={iadl.testIdPerf}>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">0 - INDEPENDENT</SelectItem>
                              <SelectItem value="1">1 - SOME HELP</SelectItem>
                              <SelectItem value="2">2 - FULL HELP</SelectItem>
                              <SelectItem value="3">3 - BY OTHERS</SelectItem>
                              <SelectItem value="8">8 - DID NOT OCCUR</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={iadl.diffName}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{iadl.label} - Difficulty</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid={iadl.testIdDiff}>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">0 - NO DIFFICULTY</SelectItem>
                              <SelectItem value="1">1 - SOME DIFFICULTY</SelectItem>
                              <SelectItem value="2">2 - GREAT DIFFICULTY</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Caregiver Signature */}
            <Card>
              <CardHeader>
                <CardTitle>Caregiver Signature</CardTitle>
                <CardDescription>
                  The person completing this assessment must sign below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="caregiverSignature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name (Signature) *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Type your full name as signature" 
                          data-testid="input-caregiver-signature"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="caregiverTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title/Position *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., RN, Social Worker, Case Manager" 
                          data-testid="input-caregiver-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="caregiverSignatureDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date" 
                          data-testid="input-caregiver-signature-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> By signing this form, I certify that the information provided is accurate to the best of my knowledge and based on my professional assessment of the client.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Agreement Checkboxes */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="agreedToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          data-testid="checkbox-terms"
                          checked={field.value === "yes"}
                          onCheckedChange={(checked) => field.onChange(checked ? "yes" : "no")}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal cursor-pointer">
                          I agree to the{" "}
                          <Link href="/terms-of-service" className="text-primary hover:underline" data-testid="link-terms">
                            Terms of Service
                          </Link>{" "}
                          *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agreedToPolicy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          data-testid="checkbox-policy"
                          checked={field.value === "yes"}
                          onCheckedChange={(checked) => field.onChange(checked ? "yes" : "no")}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal cursor-pointer">
                          I agree to the{" "}
                          <Link href="/privacy-policy" className="text-primary hover:underline" data-testid="link-policy">
                            Privacy Policy
                          </Link>{" "}
                          *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* CAPTCHA */}
            {import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-center">
                    <ReCAPTCHA
                      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                      onChange={(token) => {
                        setCaptchaToken(token);
                        form.setValue("captchaToken", token || "");
                      }}
                      data-testid="recaptcha"
                    />
                  </div>
                  {form.formState.errors.captchaToken && (
                    <p className="text-sm text-destructive text-center">{form.formState.errors.captchaToken.message}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Link href="/" data-testid="link-cancel">
                <Button type="button" variant="outline" data-testid="button-cancel">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="gap-2" data-testid="button-submit-intake">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Assessment"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
