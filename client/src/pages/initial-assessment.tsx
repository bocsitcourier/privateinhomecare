import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  User,
  Stethoscope,
  Home,
  Calendar,
  DollarSign,
  FileCheck,
  Phone,
  Loader2
} from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  
  clientFullName: z.string().min(2, "Please enter the client's full name"),
  clientDob: z.string().min(1, "Please enter date of birth"),
  serviceAddress: z.string().min(10, "Please enter the full service address"),
  
  responsiblePartyName: z.string().min(2, "Please enter the responsible party's name"),
  responsiblePartyRelationship: z.string().min(2, "Please specify relationship to client"),
  billingEmail: z.string().email("Please enter a valid billing email"),
  primaryPhone: z.string().min(10, "Please enter a valid phone number"),
  
  primaryDiagnosis: z.string().min(1, "Please select a primary diagnosis"),
  adlsRequired: z.array(z.string()).min(1, "Please select at least one ADL"),
  iadlsRequired: z.array(z.string()).min(1, "Please select at least one IADL"),
  medicalHistory: z.string().min(10, "Please provide medical history and allergies"),
  currentMedications: z.string().min(5, "Please list current medications"),
  
  homeAccessMethod: z.string().min(1, "Please select home access method"),
  keyLocation: z.string().optional(),
  petsInHome: z.string().min(1, "Please select pets option"),
  smokingPolicy: z.string().min(1, "Please select smoking policy"),
  
  serviceStartDate: z.string().min(1, "Please enter service start date"),
  serviceDays: z.array(z.string()).min(1, "Please select at least one service day"),
  shiftHours: z.string().min(3, "Please enter shift hours"),
  minimumHoursPerWeek: z.string().optional(),
  recommendedCareLevel: z.string().min(1, "Please select care level"),
  careGoal: z.string().min(1, "Please select care goal"),
  
  standardRateAccepted: z.boolean(),
  weekendRateAccepted: z.boolean().optional(),
  retainerAccepted: z.boolean(),
  additionalFees: z.array(z.string()).optional(),
  paymentMethod: z.string().min(1, "Please select payment method"),
  
  acknowledgments: z.object({
    hipaa: z.boolean(),
    privacy: z.boolean(),
    terms: z.boolean(),
    cancellation: z.boolean(),
    nonSolicitation: z.boolean(),
    nonMedical: z.boolean(),
  }),
  
  emergencyContactName: z.string().min(2, "Please enter emergency contact name"),
  emergencyContactPhone: z.string().min(10, "Please enter emergency contact phone"),
  additionalPhone: z.string().optional(),
  preferredHospital: z.string().min(2, "Please enter preferred hospital"),
  signature: z.string().min(2, "Please type your full name as signature"),
  signatureDate: z.string().min(1, "Please enter the date"),
});

type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: 1, title: "Client Info", icon: User },
  { id: 2, title: "Care Assessment", icon: Stethoscope },
  { id: 3, title: "Home & Safety", icon: Home },
  { id: 4, title: "Schedule", icon: Calendar },
  { id: 5, title: "Financial", icon: DollarSign },
  { id: 6, title: "Legal", icon: FileCheck },
  { id: 7, title: "Emergency & Signature", icon: Phone },
];

const diagnosisOptions = [
  "Dementia/Alzheimer's",
  "Post-Surgical Recovery",
  "Mobility/Fall Risk",
  "Stroke Recovery",
  "Cancer Support",
  "General Frailty",
  "Other",
];

const adlOptions = [
  "Bathing/Showering Assistance",
  "Dressing/Grooming",
  "Incontinence Care/Toileting",
  "Transferring (Pivot/Gait Belt)",
  "Transferring (Hoyer Lift)",
  "Feeding Assistance",
  "Oral Care",
];

const iadlOptions = [
  "Medication Reminders",
  "Meal Preparation (Special Diet)",
  "Light Housekeeping",
  "Laundry",
  "Transportation/Errands",
  "Safety Supervision/Companionship",
];

const homeAccessOptions = [
  "Lockbox",
  "Hidden Key",
  "Family will be present",
  "Key provided to Agency",
  "Keypad Code",
  "Other",
];

const petOptions = [
  "None",
  "Dog(s) - Friendly",
  "Dog(s) - Will be kenneled",
  "Cat(s)",
  "Other",
];

const smokingOptions = [
  "Non-smoking household",
  "Smoking permitted outdoors only",
  "Smoking permitted indoors",
];

const careLevelOptions = [
  "Hourly In-Home Care (4 Hours Minimum)",
  "Daily Care",
  "Overnight Care",
  "24-Hour / Live-In Care",
  "Other",
];

const careGoalOptions = [
  "Short-term recovery",
  "Long-term support",
  "Transitional/post-discharge",
  "Other",
];

const paymentOptions = [
  "ACH / Bank Transfer",
  "Credit/Debit Card (3% processing fee)",
  "Check",
];

const additionalFeeOptions = [
  "Additional hours (current rate)",
  "Overnight differential $2.50 per Hour",
  "Weekend/Holiday rate $2.50 per Hour",
  "Short-notice / urgent start fee $3.50 per Hour",
  "Parking fee (going rate for particular location)",
  "Late payment fee 2.5% of Invoice (charged after 7 days receipt of invoice)",
];

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function InitialAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      clientFullName: "",
      clientDob: "",
      serviceAddress: "",
      responsiblePartyName: "",
      responsiblePartyRelationship: "",
      billingEmail: "",
      primaryPhone: "",
      primaryDiagnosis: "",
      adlsRequired: [],
      iadlsRequired: [],
      medicalHistory: "",
      currentMedications: "",
      homeAccessMethod: "",
      keyLocation: "",
      petsInHome: "",
      smokingPolicy: "",
      serviceStartDate: "",
      serviceDays: [],
      shiftHours: "",
      minimumHoursPerWeek: "",
      recommendedCareLevel: "",
      careGoal: "",
      standardRateAccepted: false,
      weekendRateAccepted: false,
      retainerAccepted: false,
      additionalFees: [],
      paymentMethod: "",
      acknowledgments: {
        hipaa: false,
        privacy: false,
        terms: false,
        cancellation: false,
        nonSolicitation: false,
        nonMedical: false,
      },
      emergencyContactName: "",
      emergencyContactPhone: "",
      additionalPhone: "",
      preferredHospital: "",
      signature: "",
      signatureDate: new Date().toISOString().split('T')[0],
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/forms/initial-assessment", data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Assessment Submitted",
        description: "Your Initial Assessment & Service Agreement has been submitted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = async () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: FormData) => {
    submitMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <>
        <PageSEO
          pageSlug="initial-assessment"
          fallbackTitle="Initial Assessment & Service Agreement | Private In-Home Caregiver"
          fallbackDescription="Complete the comprehensive care assessment and service agreement for Private In-Home Caregiver services."
        />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center p-6">
            <Card className="max-w-lg w-full text-center">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Assessment Submitted Successfully</h1>
                <p className="text-muted-foreground mb-6">
                  Thank you for completing the Initial Assessment & Service Agreement. 
                  Our team will review your information and contact you shortly.
                </p>
                <Button asChild>
                  <Link href="/">Return to Home</Link>
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <PageSEO
        pageSlug="initial-assessment"
        fallbackTitle="Initial Assessment & Service Agreement | Private In-Home Caregiver"
        fallbackDescription="Complete the comprehensive care assessment and service agreement for Private In-Home Caregiver services."
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link href="/" data-testid="link-back-home">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </div>
            </Link>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Initial Assessment & Service Agreement</h1>
              <p className="text-muted-foreground">Private In-Home Caregiver</p>
            </div>

            <div className="flex justify-center mb-8 overflow-x-auto pb-2">
              <div className="flex items-center gap-1">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        currentStep >= step.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                      title={step.title}
                    >
                      <step.icon className="w-4 h-4" />
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-6 h-1 mx-0.5 transition-colors ${
                          currentStep > step.id ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                <CardDescription>Step {currentStep} of 7</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input placeholder="your@email.com" {...field} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="clientFullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Client Full Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Full legal name" {...field} data-testid="input-client-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="clientDob"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Client Date of Birth *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} data-testid="input-dob" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="serviceAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Address *</FormLabel>
                              <FormDescription>Include gate codes/parking instructions if applicable</FormDescription>
                              <FormControl>
                                <Textarea placeholder="Full address with any access instructions" {...field} data-testid="input-service-address" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4 border-t">
                          <h3 className="font-semibold mb-4">Responsible Party (Authorized Signer)</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="responsiblePartyName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Responsible party name" {...field} data-testid="input-responsible-name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="responsiblePartyRelationship"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Relationship to Client *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Daughter, Son, Spouse" {...field} data-testid="input-relationship" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="billingEmail"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Billing Email Address *</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="billing@email.com" {...field} data-testid="input-billing-email" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="primaryPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Primary Phone Number *</FormLabel>
                                  <FormControl>
                                    <Input type="tel" placeholder="(555) 123-4567" {...field} data-testid="input-phone" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="primaryDiagnosis"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary Diagnosis / Condition *</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-2">
                                  {diagnosisOptions.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                      <RadioGroupItem value={option} id={`diagnosis-${option}`} />
                                      <Label htmlFor={`diagnosis-${option}`} className="font-normal">{option}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="adlsRequired"
                          render={() => (
                            <FormItem>
                              <FormLabel>Activities of Daily Living (ADLs) Required *</FormLabel>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {adlOptions.map((option) => (
                                  <FormField
                                    key={option}
                                    control={form.control}
                                    name="adlsRequired"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(option)}
                                            onCheckedChange={(checked) => {
                                              const newValue = checked
                                                ? [...(field.value || []), option]
                                                : field.value?.filter((v) => v !== option) || [];
                                              field.onChange(newValue);
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal text-sm">{option}</FormLabel>
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
                          name="iadlsRequired"
                          render={() => (
                            <FormItem>
                              <FormLabel>Instrumental Support (IADLs) Required *</FormLabel>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {iadlOptions.map((option) => (
                                  <FormField
                                    key={option}
                                    control={form.control}
                                    name="iadlsRequired"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(option)}
                                            onCheckedChange={(checked) => {
                                              const newValue = checked
                                                ? [...(field.value || []), option]
                                                : field.value?.filter((v) => v !== option) || [];
                                              field.onChange(newValue);
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal text-sm">{option}</FormLabel>
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
                          name="medicalHistory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medical History & Allergies *</FormLabel>
                              <FormDescription>Include food, medication, and environmental allergies</FormDescription>
                              <FormControl>
                                <Textarea placeholder="List medical conditions and allergies..." {...field} data-testid="input-medical-history" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="currentMedications"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Medications *</FormLabel>
                              <FormDescription>Include dosage/frequency if known</FormDescription>
                              <FormControl>
                                <Textarea placeholder="List all current medications..." {...field} data-testid="input-medications" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="homeAccessMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Home Access Method *</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-2">
                                  {homeAccessOptions.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                      <RadioGroupItem value={option} id={`access-${option}`} />
                                      <Label htmlFor={`access-${option}`} className="font-normal">{option}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="keyLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Keypad Code / Key Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Code or location details" {...field} data-testid="input-key-location" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="petsInHome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pets in Home? *</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-2">
                                  {petOptions.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                      <RadioGroupItem value={option} id={`pets-${option}`} />
                                      <Label htmlFor={`pets-${option}`} className="font-normal">{option}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="smokingPolicy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Smoking Policy *</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                  {smokingOptions.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                      <RadioGroupItem value={option} id={`smoking-${option}`} />
                                      <Label htmlFor={`smoking-${option}`} className="font-normal">{option}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="serviceStartDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Service Start Date *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} data-testid="input-start-date" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="shiftHours"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Shift Hours *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 8:00 AM - 12:00 PM" {...field} data-testid="input-shift-hours" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="serviceDays"
                          render={() => (
                            <FormItem>
                              <FormLabel>Service Days *</FormLabel>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {daysOfWeek.map((day) => (
                                  <FormField
                                    key={day}
                                    control={form.control}
                                    name="serviceDays"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center space-x-1 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(day)}
                                            onCheckedChange={(checked) => {
                                              const newValue = checked
                                                ? [...(field.value || []), day]
                                                : field.value?.filter((v) => v !== day) || [];
                                              field.onChange(newValue);
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">{day}</FormLabel>
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
                          name="minimumHoursPerWeek"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Guaranteed Minimum Hours Per Week</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 20" {...field} data-testid="input-min-hours" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="recommendedCareLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recommended Level of Care *</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                  {careLevelOptions.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                      <RadioGroupItem value={option} id={`care-${option}`} />
                                      <Label htmlFor={`care-${option}`} className="font-normal">{option}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="careGoal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Care Goal *</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-2">
                                  {careGoalOptions.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                      <RadioGroupItem value={option} id={`goal-${option}`} />
                                      <Label htmlFor={`goal-${option}`} className="font-normal">{option}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {currentStep === 5 && (
                      <div className="space-y-6">
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <h3 className="font-semibold mb-2">Rate Information</h3>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>Standard Hourly Rate: <strong>$35.00/Hour</strong></li>
                            <li>Weekend / Holiday Rate: <strong>$37.50/Hour</strong></li>
                            <li>Initial Retainer Fee: <strong>$1,225.00</strong> (applied to final invoice)</li>
                          </ul>
                        </div>

                        <FormField
                          control={form.control}
                          name="standardRateAccepted"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-standard-rate" />
                              </FormControl>
                              <FormLabel className="font-normal">I accept the Standard Hourly Rate ($35.00/Hour) *</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="weekendRateAccepted"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-weekend-rate" />
                              </FormControl>
                              <FormLabel className="font-normal">I accept the Weekend / Holiday Rate ($37.50/Hour)</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="retainerAccepted"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-retainer" />
                              </FormControl>
                              <div>
                                <FormLabel className="font-normal">I accept the Initial Retainer Fee ($1,225.00) *</FormLabel>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Send checks to: Private InHome Caregiver, 3 Cabot Pl, 3rd Fl 10A, Stoughton MA 02072
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="additionalFees"
                          render={() => (
                            <FormItem>
                              <FormLabel>Additional Fees (select all that apply)</FormLabel>
                              <div className="space-y-2 mt-2">
                                {additionalFeeOptions.map((option) => (
                                  <FormField
                                    key={option}
                                    control={form.control}
                                    name="additionalFees"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(option)}
                                            onCheckedChange={(checked) => {
                                              const newValue = checked
                                                ? [...(field.value || []), option]
                                                : field.value?.filter((v) => v !== option) || [];
                                              field.onChange(newValue);
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal text-sm">{option}</FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Payment Method *</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                  {paymentOptions.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                      <RadioGroupItem value={option} id={`payment-${option}`} />
                                      <Label htmlFor={`payment-${option}`} className="font-normal">{option}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {currentStep === 6 && (
                      <div className="space-y-6">
                        <div className="bg-muted/50 p-4 rounded-lg mb-4">
                          <h3 className="font-semibold mb-2">Please review our policies:</h3>
                          <ul className="text-sm space-y-1">
                            <li><a href="/hipaa-acknowledgment" target="_blank" className="text-primary hover:underline">HIPAA Policy</a></li>
                            <li><a href="/privacy-policy" target="_blank" className="text-primary hover:underline">Privacy Policy</a></li>
                            <li><a href="/terms-and-conditions" target="_blank" className="text-primary hover:underline">Terms & Conditions</a></li>
                          </ul>
                        </div>

                        <FormField
                          control={form.control}
                          name="acknowledgments.hipaa"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-hipaa" />
                              </FormControl>
                              <FormLabel className="font-normal">I have read and agree to the HIPAA Acknowledgment. *</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="acknowledgments.privacy"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-privacy" />
                              </FormControl>
                              <FormLabel className="font-normal">I have read and agree to the Privacy Policy. *</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="acknowledgments.terms"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-terms" />
                              </FormControl>
                              <FormLabel className="font-normal">I have read and agree to the Terms and Conditions. *</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="acknowledgments.cancellation"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-cancellation" />
                              </FormControl>
                              <FormLabel className="font-normal">I agree to the 24-hour Cancellation Policy (Full shift charged if notice is not given). *</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="acknowledgments.nonSolicitation"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-non-solicitation" />
                              </FormControl>
                              <FormLabel className="font-normal">Non-Solicitation: I agree not to hire any caregiver privately for 12 months after service ends. *</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="acknowledgments.nonMedical"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-non-medical" />
                              </FormControl>
                              <FormLabel className="font-normal">I understand caregivers are non-medical and cannot perform invasive procedures. *</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {currentStep === 7 && (
                      <div className="space-y-6">
                        <h3 className="font-semibold">Emergency Contact Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="emergencyContactName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Emergency Contact Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Full name" {...field} data-testid="input-emergency-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="emergencyContactPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Emergency Contact Phone *</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="(555) 123-4567" {...field} data-testid="input-emergency-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="additionalPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Additional Phone (if no response)</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="(555) 123-4567" {...field} data-testid="input-additional-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="preferredHospital"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Preferred Emergency Hospital *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Hospital name" {...field} data-testid="input-hospital" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="pt-4 border-t">
                          <h3 className="font-semibold mb-4">Electronic Signature</h3>
                          <FormField
                            control={form.control}
                            name="signature"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type Your Full Legal Name *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Full legal name" 
                                    className="font-cursive text-lg"
                                    {...field} 
                                    data-testid="input-signature"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="signatureDate"
                            render={({ field }) => (
                              <FormItem className="mt-4">
                                <FormLabel>Date *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} data-testid="input-signature-date" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrev}
                        disabled={currentStep === 1}
                        data-testid="button-prev"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      
                      {currentStep < 7 ? (
                        <Button type="button" onClick={handleNext} data-testid="button-next">
                          Next
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button 
                          type="submit" 
                          disabled={submitMutation.isPending}
                          data-testid="button-submit"
                        >
                          {submitMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Submit Assessment
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
