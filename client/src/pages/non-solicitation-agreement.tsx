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
} from "@/components/ui/form";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  DollarSign, 
  FileCheck,
  AlertTriangle,
  Loader2
} from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  clientFullName: z.string().min(2, "Please enter the client's full name"),
  responsibleParty: z.string().min(2, "Please enter the responsible party's name"),
  billingAddress: z.string().min(10, "Please enter the full billing address"),
  acknowledgments: z.object({
    noPrivateEmployment: z.boolean(),
    noReferrals: z.boolean(),
    noUnderTablePayments: z.boolean(),
  }).refine(data => data.noPrivateEmployment && data.noReferrals && data.noUnderTablePayments, {
    message: "You must agree to all terms",
  }),
  placementOption: z.enum(["option_a", "option_b", "no_hire"], {
    required_error: "Please select a placement option",
  }),
  penalties: z.object({
    agreedToLiquidatedDamages: z.boolean(),
    agreedToLegalFees: z.boolean(),
  }).refine(data => data.agreedToLiquidatedDamages && data.agreedToLegalFees, {
    message: "You must acknowledge the penalty terms",
  }),
  signature: z.string().min(2, "Please type your full name as signature"),
  signatureDate: z.string().min(1, "Please enter the date"),
});

type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: 1, title: "Client Info", icon: FileCheck },
  { id: 2, title: "Non-Solicitation", icon: Shield },
  { id: 3, title: "Placement Option", icon: DollarSign },
  { id: 4, title: "Penalties", icon: AlertTriangle },
  { id: 5, title: "Signature", icon: CheckCircle },
];

export default function NonSolicitationAgreementPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      clientFullName: "",
      responsibleParty: "",
      billingAddress: "",
      acknowledgments: {
        noPrivateEmployment: false,
        noReferrals: false,
        noUnderTablePayments: false,
      },
      placementOption: undefined,
      penalties: {
        agreedToLiquidatedDamages: false,
        agreedToLegalFees: false,
      },
      signature: "",
      signatureDate: new Date().toISOString().split('T')[0],
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/forms/non-solicitation", data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Agreement Submitted",
        description: "Your Non-Solicitation Agreement has been submitted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your agreement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = ["email", "clientFullName", "responsibleParty", "billingAddress"];
        break;
      case 2:
        fieldsToValidate = ["acknowledgments"];
        break;
      case 3:
        fieldsToValidate = ["placementOption"];
        break;
      case 4:
        fieldsToValidate = ["penalties"];
        break;
      case 5:
        fieldsToValidate = ["signature", "signatureDate"];
        break;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 5) {
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
          pageSlug="non-solicitation-agreement"
          fallbackTitle="Non-Solicitation Agreement | Private In-Home Caregiver"
          fallbackDescription="Complete and sign the Non-Solicitation & Placement Agreement for Private In-Home Caregiver services."
        />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center p-6">
            <Card className="max-w-lg w-full text-center">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Agreement Submitted Successfully</h1>
                <p className="text-muted-foreground mb-6">
                  Thank you for completing the Non-Solicitation & Placement Agreement. 
                  A confirmation has been sent to your email address.
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
        pageSlug="non-solicitation-agreement"
        fallbackTitle="Non-Solicitation Agreement | Private In-Home Caregiver"
        fallbackDescription="Complete and sign the Non-Solicitation & Placement Agreement for Private In-Home Caregiver services."
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <Link href="/" data-testid="link-back-home">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </div>
            </Link>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Non-Solicitation & Placement Agreement</h1>
              <p className="text-muted-foreground">Private In-Home Caregiver</p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        currentStep >= step.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-8 h-1 mx-1 transition-colors ${
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
                <CardDescription>Step {currentStep} of 5</CardDescription>
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
                        <FormField
                          control={form.control}
                          name="clientFullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client Full Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Full legal name of client receiving care" {...field} data-testid="input-client-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="responsibleParty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Responsible Party / Signer *</FormLabel>
                              <FormControl>
                                <Input placeholder="Person signing this agreement" {...field} data-testid="input-responsible-party" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="billingAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Billing Address *</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Full billing address" {...field} data-testid="input-billing-address" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="bg-muted/50 p-4 rounded-lg mb-4">
                          <h3 className="font-semibold mb-2">Protection of Agency Investment</h3>
                          <p className="text-sm text-muted-foreground">
                            The Client acknowledges that the Agency incurs substantial expenses in recruiting and training
                            caregivers. The Client agrees that for 12 months following service, they shall not hire any caregiver
                            introduced by the Agency without written consent and payment of a conversion fee.
                          </p>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="acknowledgments.noPrivateEmployment"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-no-private-employment"
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                I will not offer private employment to Agency caregivers.
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="acknowledgments.noReferrals"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-no-referrals"
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                I will not refer Agency caregivers to other families for private hire.
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="acknowledgments.noUnderTablePayments"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-no-under-table"
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                I understand that "under-the-table" payments are a breach of contract.
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <h3 className="font-semibold">Permanent Placement & Conversion (Buyout)</h3>
                        <FormField
                          control={form.control}
                          name="placementOption"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="space-y-4"
                                >
                                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover-elevate">
                                    <RadioGroupItem value="option_a" id="option_a" data-testid="radio-option-a" />
                                    <div>
                                      <Label htmlFor="option_a" className="font-semibold text-green-600">
                                        Option A: Immediate Buyout Fee ($3,500.00)
                                      </Label>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        Pay the buyout fee immediately to hire the caregiver directly.
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover-elevate">
                                    <RadioGroupItem value="option_b" id="option_b" data-testid="radio-option-b" />
                                    <div>
                                      <Label htmlFor="option_b" className="font-semibold text-blue-600">
                                        Option B: Transition after 300 Agency-billed hours + $1,500.00 Fee
                                      </Label>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        Complete 300 hours of agency-billed service, then pay reduced fee.
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover-elevate">
                                    <RadioGroupItem value="no_hire" id="no_hire" data-testid="radio-no-hire" />
                                    <div>
                                      <Label htmlFor="no_hire" className="font-semibold text-yellow-600">
                                        I do not intend to hire directly
                                      </Label>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        I agree to the 12-month non-solicitation period.
                                      </p>
                                    </div>
                                  </div>
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
                        <div className="bg-destructive/10 p-4 rounded-lg mb-4">
                          <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Liquidated Damages for Breach
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Please review and acknowledge the penalty terms for breach of this agreement.
                          </p>
                        </div>

                        <FormField
                          control={form.control}
                          name="penalties.agreedToLiquidatedDamages"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-liquidated-damages"
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                I agree that a breach of this agreement will result in a $5,000 Liquidated Damages penalty.
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="penalties.agreedToLegalFees"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-legal-fees"
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                I agree to pay all legal and collection fees incurred by the Agency to enforce this agreement.
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {currentStep === 5 && (
                      <div className="space-y-6">
                        <div className="bg-muted/50 p-4 rounded-lg mb-4">
                          <h3 className="font-semibold mb-2">Final Authorization</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            By typing your name below, you acknowledge that you have read and agree to:
                          </p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            <li><a href="/privacy-policy" target="_blank" className="text-primary hover:underline">Privacy Policy</a></li>
                            <li><a href="/terms-and-conditions" target="_blank" className="text-primary hover:underline">Terms & Conditions</a></li>
                          </ul>
                        </div>

                        <FormField
                          control={form.control}
                          name="signature"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Electronic Signature (Type Full Name) *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Type your full legal name" 
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
                            <FormItem>
                              <FormLabel>Date of Agreement *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} data-testid="input-date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                      
                      {currentStep < 5 ? (
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
                              Submit Agreement
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
