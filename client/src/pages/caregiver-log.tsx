import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { ArrowLeft, Check, Loader2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ReCAPTCHA from "react-google-recaptcha";
import PageSEO from "@/components/PageSEO";

const caregiverLogSchema = z.object({
  caregiverName: z.string().trim().min(1, "Caregiver name is required"),
  caregiverEmail: z.string().trim().email("Valid email is required"),
  caregiverPhone: z.string().trim().min(1, "Phone number is required"),
  clientName: z.string().trim().min(1, "Client name is required"),
  shiftDate: z.string().trim().min(1, "Shift date is required"),
  shiftStartTime: z.string().trim().min(1, "Start time is required"),
  shiftEndTime: z.string().trim().min(1, "End time is required"),
  
  clientMood: z.string().trim().min(1, "Client mood is required"),
  clientActivity: z.string().trim().min(1, "Activity level is required"),
  bloodPressure: z.string().trim().min(1, "Blood pressure is required"),
  temperature: z.string().trim().min(1, "Temperature is required"),
  pulse: z.string().trim().min(1, "Pulse is required"),
  respiratoryRate: z.string().trim().min(1, "Respiratory rate is required"),
  oxygenSaturation: z.string().trim().min(1, "Oxygen saturation is required"),
  
  bathing: z.boolean().default(false),
  dressing: z.boolean().default(false),
  grooming: z.boolean().default(false),
  toileting: z.boolean().default(false),
  mobility: z.boolean().default(false),
  feeding: z.boolean().default(false),
  
  medications: z.array(z.object({
    medicationName: z.string().trim().min(1, "Medication name is required"),
    dosage: z.string().trim().min(1, "Dosage is required"),
    timeGiven: z.string().trim().min(1, "Time given is required"),
    notes: z.string().trim().min(1, "Notes are required"),
  })).min(1, "At least one medication entry is required"),
  
  mealPreparation: z.boolean().default(false),
  lightHousekeeping: z.boolean().default(false),
  laundry: z.boolean().default(false),
  shopping: z.boolean().default(false),
  transportation: z.boolean().default(false),
  companionship: z.boolean().default(false),
  
  observations: z.string().trim().min(1, "General observations are required"),
  concerns: z.string().trim().min(1, "Concerns information is required"),
  followUp: z.string().trim().min(1, "Follow-up information is required"),
  
  agreedToTerms: z.enum(["yes", "no"], { required_error: "You must agree to the Terms of Service" }).refine(val => val === "yes", {
    message: "You must agree to the Terms of Service",
  }),
  agreedToPolicy: z.enum(["yes", "no"], { required_error: "You must agree to the Privacy Policy" }).refine(val => val === "yes", {
    message: "You must agree to the Privacy Policy",
  }),
  
  website: z.string().max(0),
  captchaToken: z.string().min(1, "Please complete the CAPTCHA"),
});

type CaregiverLogData = z.infer<typeof caregiverLogSchema>;

export default function CaregiverLogPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<CaregiverLogData>({
    resolver: zodResolver(caregiverLogSchema),
    defaultValues: {
      caregiverName: "",
      caregiverEmail: "",
      caregiverPhone: "",
      clientName: "",
      shiftDate: new Date().toISOString().split('T')[0],
      shiftStartTime: "",
      shiftEndTime: "",
      clientMood: "",
      clientActivity: "",
      bloodPressure: "",
      temperature: "",
      pulse: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      bathing: false,
      dressing: false,
      grooming: false,
      toileting: false,
      mobility: false,
      feeding: false,
      medications: [{ medicationName: "", dosage: "", timeGiven: "", notes: "" }],
      mealPreparation: false,
      lightHousekeeping: false,
      laundry: false,
      shopping: false,
      transportation: false,
      companionship: false,
      observations: "",
      concerns: "",
      followUp: "",
      agreedToTerms: undefined,
      agreedToPolicy: undefined,
      website: "",
      captchaToken: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications",
  });

  const onSubmit = async (data: CaregiverLogData) => {
    if (!captchaToken) {
      toast({
        title: "CAPTCHA Required",
        description: "Please complete the CAPTCHA verification",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const logData = {
        caregiverName: data.caregiverName,
        caregiverEmail: data.caregiverEmail,
        caregiverPhone: data.caregiverPhone,
        clientName: data.clientName,
        shiftDate: data.shiftDate,
        shiftStartTime: data.shiftStartTime,
        shiftEndTime: data.shiftEndTime,
        logData: {
          clientDetails: {
            mood: data.clientMood,
            activity: data.clientActivity,
          },
          vitalSigns: {
            bloodPressure: data.bloodPressure,
            temperature: data.temperature,
            pulse: data.pulse,
            respiratoryRate: data.respiratoryRate,
            oxygenSaturation: data.oxygenSaturation,
          },
          adlChecklist: {
            bathing: data.bathing,
            dressing: data.dressing,
            grooming: data.grooming,
            toileting: data.toileting,
            mobility: data.mobility,
            feeding: data.feeding,
          },
          medications: data.medications,
          iadlEngagement: {
            mealPreparation: data.mealPreparation,
            lightHousekeeping: data.lightHousekeeping,
            laundry: data.laundry,
            shopping: data.shopping,
            transportation: data.transportation,
            companionship: data.companionship,
          },
          narrativeObservations: {
            observations: data.observations,
            concerns: data.concerns,
            followUp: data.followUp,
          },
        },
        agreedToTerms: data.agreedToTerms,
        agreedToPolicy: data.agreedToPolicy,
        website: data.website,
        captchaToken: captchaToken,
      };

      await apiRequest("POST", "/api/caregiver-log", logData);

      setIsSuccess(true);
      toast({
        title: "Log Submitted",
        description: "Thank you! Your daily log has been recorded.",
      });

      form.reset();
      setCaptchaToken(null);
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-12 pb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Log Submitted Successfully!</h2>
            <p className="text-muted-foreground mb-8">
              Your daily activity log has been recorded. Thank you for your detailed documentation.
            </p>
            <Link href="/">
              <Button data-testid="button-return-home">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageSEO 
        pageSlug="caregiver-log"
        fallbackTitle="Caregiver Daily Log - PrivateInHomeCareGiver"
        fallbackDescription="Submit your daily activity log to document client care and activities. Secure and confidential."
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" data-testid="link-back-home">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 hover-elevate rounded-md px-3 py-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </div>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Caregiver Daily Log</CardTitle>
            <CardDescription>
              Document your shift activities and client care. All information is confidential and protected.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-primary border-b pb-2">Caregiver Information</h3>
                  <FormField
                    control={form.control}
                    name="caregiverName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-caregiver-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="caregiverEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Email *</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} data-testid="input-caregiver-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="caregiverPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Phone *</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} data-testid="input-caregiver-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-primary border-b pb-2">Shift Details</h3>
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-client-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="shiftDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shiftStartTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time *</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} data-testid="input-start-time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shiftEndTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} data-testid="input-end-time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-primary border-b pb-2">Client Status</h3>
                  <FormField
                    control={form.control}
                    name="clientMood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Mood</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Happy, Alert, Agitated, Withdrawn" data-testid="input-mood" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientActivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Level</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Active, Sedentary, Restless" data-testid="input-activity" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-primary border-b pb-2">Vital Signs</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bloodPressure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Blood Pressure *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 120/80" data-testid="input-blood-pressure" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 98.6°F" data-testid="input-temperature" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pulse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pulse (bpm) *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 72" data-testid="input-pulse" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="respiratoryRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Respiratory Rate (breaths/min) *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 16" data-testid="input-respiratory-rate" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="oxygenSaturation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Oxygen Saturation (%) *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 98" data-testid="input-oxygen-saturation" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-primary border-b pb-2">Activities of Daily Living (ADL) Completed</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bathing"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-bathing"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Bathing/Showering</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dressing"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-dressing"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Dressing</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="grooming"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-grooming"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Grooming (hair, nails, shaving)</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="toileting"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-toileting"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Toileting Assistance</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mobility"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-mobility"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Mobility Assistance</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="feeding"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-feeding"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Feeding Assistance</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-xl font-semibold text-primary">Medication Management</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ medicationName: "", dosage: "", timeGiven: "", notes: "" })}
                      data-testid="button-add-medication"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Medication
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">Medication {index + 1}</h4>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                data-testid={`button-remove-medication-${index}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`medications.${index}.medicationName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Medication Name *</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e.g., Lisinopril" data-testid={`input-med-name-${index}`} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`medications.${index}.dosage`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Dosage *</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e.g., 10mg" data-testid={`input-med-dosage-${index}`} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`medications.${index}.timeGiven`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Time Given *</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} data-testid={`input-med-time-${index}`} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`medications.${index}.notes`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes *</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Any observations" data-testid={`input-med-notes-${index}`} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-primary border-b pb-2">Instrumental Activities (IADL) Completed</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mealPreparation"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-meal-prep"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Meal Preparation</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lightHousekeeping"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-housekeeping"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Light Housekeeping</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="laundry"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-laundry"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Laundry</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shopping"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-shopping"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Shopping/Errands</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transportation"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-transportation"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Transportation</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companionship"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-companionship"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Companionship Activities</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-primary border-b pb-2">Narrative Summary</h3>
                  <FormField
                    control={form.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>General Observations</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Describe the client's overall condition and any notable events during the shift" rows={4} data-testid="input-observations" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="concerns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Concerns or Issues</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Any concerns about the client's health, safety, or wellbeing" rows={3} data-testid="input-concerns" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="followUp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Follow-Up Required</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Any items that need follow-up or attention" rows={2} data-testid="input-followup" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input {...field} tabIndex={-1} autoComplete="off" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Agreement Checkboxes */}
                <div className="space-y-4 p-4 border rounded-md">
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
                </div>

                <div className="flex flex-col items-center gap-4">
                  {import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
                    <ReCAPTCHA
                      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                      onChange={(token) => {
                        setCaptchaToken(token);
                        form.setValue("captchaToken", token || "");
                      }}
                      onExpired={() => {
                        setCaptchaToken(null);
                        form.setValue("captchaToken", "");
                      }}
                    />
                  )}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !captchaToken}
                    className="w-full md:w-auto"
                    data-testid="button-submit"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Daily Log"
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Your log is confidential and will be reviewed by supervisory staff.
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
