import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Check, Loader2, FileCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ReCAPTCHA from "react-google-recaptcha";
import PageSEO from "@/components/PageSEO";
import { Separator } from "@/components/ui/separator";

const hipaaFormSchema = z.object({
  clientFullName: z.string().trim().min(1, "Client full name is required"),
  clientDateOfBirth: z.string().trim().min(1, "Date of birth is required"),
  acknowledgedReceipt: z.enum(["yes", "no"], { required_error: "Acknowledgment is required" }),
  consentedToTPO: z.enum(["yes", "no"], { required_error: "Consent is required" }),
  signature: z.string().trim().min(1, "Signature is required"),
  signatureDate: z.string().trim().min(1, "Signature date is required"),
  printedName: z.string().trim().min(1, "Printed name is required"),
  relationshipToClient: z.string().trim().optional(),
  agreedToTerms: z.enum(["yes", "no"], { required_error: "You must agree to the Terms of Service" }).refine(val => val === "yes", {
    message: "You must agree to the Terms of Service",
  }),
  agreedToPolicy: z.enum(["yes", "no"], { required_error: "You must agree to the Privacy Policy" }).refine(val => val === "yes", {
    message: "You must agree to the Privacy Policy",
  }),
  captchaToken: z.string().min(1, "Please complete the CAPTCHA"),
  website: z.string().optional(),
});

type HipaaFormData = z.infer<typeof hipaaFormSchema>;

export default function HipaaAcknowledgment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const form = useForm<HipaaFormData>({
    resolver: zodResolver(hipaaFormSchema),
    defaultValues: {
      clientFullName: "",
      clientDateOfBirth: "",
      acknowledgedReceipt: "no",
      consentedToTPO: "no",
      signature: "",
      signatureDate: "",
      printedName: "",
      relationshipToClient: "",
      agreedToTerms: undefined,
      agreedToPolicy: undefined,
      captchaToken: "",
      website: "",
    },
  });

  const onSubmit = async (data: HipaaFormData) => {
    try {
      if (!captchaValue && siteKey) {
        toast({
          variant: "destructive",
          title: "CAPTCHA Required",
          description: "Please complete the CAPTCHA verification.",
        });
        return;
      }

      const submitData = {
        ...data,
        agreedToTerms: data.agreedToTerms,
        agreedToPolicy: data.agreedToPolicy,
        captchaToken: captchaValue || "no-captcha-configured",
      };

      await apiRequest("POST", "/api/hipaa-acknowledgment", submitData);

      setSubmitted(true);
      toast({
        title: "Form Submitted",
        description: "Your HIPAA Privacy Acknowledgment has been submitted successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Please try again later.",
      });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 py-12 px-4">
        <PageSEO
          pageSlug="hipaa-acknowledgment"
          fallbackTitle="HIPAA Privacy Acknowledgment Submitted | PrivateInHomeCareGiver"
          fallbackDescription="Your HIPAA Privacy Information Acknowledgment has been successfully submitted."
        />
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-400">
                Form Submitted Successfully!
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Thank you for completing the HIPAA Privacy Acknowledgment. Your information has been received and will be processed according to HIPAA regulations.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                A copy of our Notice of Privacy Practices has been made available to you. If you have any questions about your privacy rights, please contact our Privacy Officer.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setLocation("/")} variant="default" data-testid="button-home">
                  Return Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 py-12 px-4">
      <PageSEO
        pageSlug="hipaa-acknowledgment"
        fallbackTitle="HIPAA Privacy Information Acknowledgment | PrivateInHomeCareGiver"
        fallbackDescription="Complete your HIPAA Privacy Information Acknowledgment of Receipt form for PrivateInHomeCareGiver."
      />
      
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
            <FileCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              HIPAA Privacy Information: Acknowledgment of Receipt Form
            </h1>
            <p className="text-muted-foreground">Private InHome CareGiver</p>
          </div>
        </div>

        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 mb-8">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Purpose:</strong> The Health Insurance Portability and Accountability Act (HIPAA) requires that we provide you with a detailed Notice of Privacy Practices (NPP) that outlines your rights regarding your Protected Health Information (PHI) and how we may use and disclose that information for treatment, payment, and routine healthcare operations.
            </p>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Honeypot field - hidden from users */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                  <Input {...field} tabIndex={-1} autoComplete="off" />
                </div>
              )}
            />

            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>Please provide the client's basic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientFullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client's Full Legal Name *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-client-full-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientDateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-date-of-birth" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>I. Acknowledgment of Receipt</CardTitle>
                <CardDescription>
                  By checking below, you confirm that you have been offered or received a copy of the Notice of Privacy Practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="acknowledgedReceipt"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="yes" data-testid="radio-acknowledged-yes" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              I acknowledge that I have received, or have been offered, a copy of the Notice of Privacy Practices for Private InHome CareGiver
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="no" data-testid="radio-acknowledged-no" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              No
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>II. Consent to Use PHI for Core Services (TPO)</CardTitle>
                <CardDescription>
                  I understand that my health information will be used and disclosed by Private InHome CareGiver for the following necessary core purposes:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <p className="text-sm"><strong>Treatment:</strong> To coordinate, manage, and provide my in-home health services (e.g., sharing information with nurses, therapists, or other involved healthcare providers).</p>
                  <p className="text-sm"><strong>Payment:</strong> To bill for services, determine eligibility, and submit claims to my health plan or insurer.</p>
                  <p className="text-sm"><strong>Health Care Operations:</strong> To carry out essential administrative activities, such as quality review, staff training, legal services, and working with necessary business associates (e.g., billing services).</p>
                </div>

                <FormField
                  control={form.control}
                  name="consentedToTPO"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="yes" data-testid="radio-consented-yes" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              I consent to the use and disclosure of my personal health information for Treatment, Payment, and Health Care Operations as outlined in the Notice of Privacy Practices
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="no" data-testid="radio-consented-no" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              No
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Signature of Client or Personal Representative</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="signature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signature (Type Full Name) *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Type your full name as signature" data-testid="input-signature" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="signatureDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-signature-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="printedName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Printed Name *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-printed-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="relationshipToClient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship to Client (if not client)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Spouse, Parent, Legal Guardian" data-testid="input-relationship" />
                      </FormControl>
                      <FormDescription>Leave blank if you are the client</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

            {siteKey && (
              <div className="flex justify-center">
                <ReCAPTCHA
                  sitekey={siteKey}
                  onChange={(value) => setCaptchaValue(value)}
                  data-testid="recaptcha"
                />
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                size="lg"
                className="flex-1"
                data-testid="button-submit"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Acknowledgment"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
