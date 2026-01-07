import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReCAPTCHA from "react-google-recaptcha";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ChevronLeft, ChevronRight, Loader2, Phone, Mail, User, ArrowRight } from "lucide-react";
import type { QuizWithQuestions, QuizQuestion } from "@shared/schema";

interface QuizEngineProps {
  quiz: QuizWithQuestions;
  onComplete?: (result: QuizResult) => void;
  className?: string;
}

interface QuizResult {
  success: boolean;
  leadId: string;
  score: number;
  urgencyLevel: string;
  resultTitle: string | null;
  resultDescription: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
}

interface QuestionResponse {
  questionId: string;
  answerValue?: string;
  answerValues?: string[];
  answerText?: string;
}

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function QuizEngine({ quiz, onComplete, className }: QuizEngineProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const totalSteps = quiz.questions.length + 2; // questions + contact form + result
  const isContactStep = currentStep === quiz.questions.length;
  const isResultStep = currentStep === quiz.questions.length + 1;
  const currentQuestion = quiz.questions[currentStep];

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", `/api/quizzes/${quiz.slug}/submit`, {
        ...data,
        responses: Object.values(responses),
        captchaToken,
        sourcePage: window.location.href,
        referrer: document.referrer,
        utmSource: new URLSearchParams(window.location.search).get("utm_source"),
        utmMedium: new URLSearchParams(window.location.search).get("utm_medium"),
        utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign"),
      });
      return response.json();
    },
    onSuccess: (data: QuizResult) => {
      setResult(data);
      setCurrentStep(quiz.questions.length + 1);
      onComplete?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const progress = useMemo(() => {
    return ((currentStep + 1) / totalSteps) * 100;
  }, [currentStep, totalSteps]);

  const handleQuestionAnswer = useCallback((questionId: string, value: string | string[], type: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        ...(type === "multiple_choice" ? { answerValues: value as string[] } : {}),
        ...(type === "text" ? { answerText: value as string } : {}),
        ...((type === "single_choice" || type === "scale") ? { answerValue: value as string } : {}),
      }
    }));
  }, []);

  const canProceed = useCallback(() => {
    if (isContactStep) return form.formState.isValid && (siteKey ? !!captchaToken : true);
    if (isResultStep) return true;
    if (!currentQuestion) return false;
    
    const response = responses[currentQuestion.id];
    if (currentQuestion.isRequired === "no") return true;
    if (!response) return false;

    switch (currentQuestion.questionType) {
      case "single_choice":
      case "scale":
        return !!response.answerValue;
      case "multiple_choice":
        return (response.answerValues?.length || 0) > 0;
      case "text":
        return !!response.answerText?.trim();
      default:
        return true;
    }
  }, [currentStep, currentQuestion, responses, isContactStep, isResultStep, form.formState.isValid, captchaToken, siteKey]);

  const handleNext = useCallback(() => {
    if (isContactStep) {
      form.handleSubmit((data) => {
        submitMutation.mutate(data);
      })();
    } else if (currentStep < quiz.questions.length) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, isContactStep, form, submitMutation, quiz.questions.length]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const renderQuestion = (question: QuizQuestion) => {
    const response = responses[question.id];
    const options = question.options as { value: string; label: string; score?: number }[];

    switch (question.questionType) {
      case "single_choice":
      case "scale":
        return (
          <RadioGroup
            value={response?.answerValue || ""}
            onValueChange={(value) => handleQuestionAnswer(question.id, value, question.questionType)}
            className="space-y-3"
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover-elevate ${
                  response?.answerValue === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() => handleQuestionAnswer(question.id, option.value, question.questionType)}
                data-testid={`option-${question.id}-${option.value}`}
              >
                <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                <Label htmlFor={`${question.id}-${option.value}`} className="flex-1 cursor-pointer font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "multiple_choice":
        return (
          <div className="space-y-3">
            {options.map((option) => {
              const isChecked = response?.answerValues?.includes(option.value) || false;
              return (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover-elevate ${
                    isChecked ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => {
                    const current = response?.answerValues || [];
                    const newValues = isChecked
                      ? current.filter(v => v !== option.value)
                      : [...current, option.value];
                    handleQuestionAnswer(question.id, newValues, "multiple_choice");
                  }}
                  data-testid={`option-${question.id}-${option.value}`}
                >
                  <Checkbox checked={isChecked} id={`${question.id}-${option.value}`} />
                  <Label htmlFor={`${question.id}-${option.value}`} className="flex-1 cursor-pointer font-normal">
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </div>
        );

      case "text":
        return (
          <Textarea
            value={response?.answerText || ""}
            onChange={(e) => handleQuestionAnswer(question.id, e.target.value, "text")}
            placeholder="Type your answer here..."
            className="min-h-[120px]"
            data-testid={`input-${question.id}`}
          />
        );

      default:
        return null;
    }
  };

  if (isResultStep && result) {
    return (
      <Card className={`max-w-2xl mx-auto ${className || ""}`}>
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4" data-testid="text-result-title">
            {result.resultTitle || "Thank You!"}
          </h2>
          <p className="text-muted-foreground mb-6" data-testid="text-result-description">
            {result.resultDescription || "We've received your information and will be in touch shortly to discuss your care needs."}
          </p>
          {result.ctaUrl && (
            <Button asChild size="lg" data-testid="button-result-cta">
              <a href={result.ctaUrl}>
                {result.ctaText || "Learn More"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`max-w-2xl mx-auto ${className || ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm font-medium">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" data-testid="progress-quiz" />
      </CardHeader>

      <CardContent className="pt-6">
        {!isContactStep && currentQuestion && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2" data-testid={`text-question-${currentStep}`}>
                {currentQuestion.questionText}
              </h3>
              {currentQuestion.helpText && (
                <p className="text-sm text-muted-foreground">{currentQuestion.helpText}</p>
              )}
            </div>
            {renderQuestion(currentQuestion)}
          </div>
        )}

        {isContactStep && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Almost Done!</h3>
              <p className="text-muted-foreground">
                Enter your contact information to receive your personalized care assessment.
              </p>
            </div>

            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            {...field} 
                            placeholder="Your full name" 
                            className="pl-10"
                            data-testid="input-name"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            {...field} 
                            type="email" 
                            placeholder="your@email.com" 
                            className="pl-10"
                            data-testid="input-email"
                          />
                        </div>
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
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            {...field} 
                            type="tel" 
                            placeholder="(555) 123-4567" 
                            className="pl-10"
                            data-testid="input-phone"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {siteKey && (
                  <div className="flex justify-center pt-4">
                    <ReCAPTCHA
                      sitekey={siteKey}
                      onChange={(token) => setCaptchaToken(token)}
                      onExpired={() => setCaptchaToken(null)}
                    />
                  </div>
                )}
              </form>
            </Form>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || submitMutation.isPending}
          data-testid="button-back"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed() || submitMutation.isPending}
          data-testid="button-next"
        >
          {submitMutation.isPending && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          {isContactStep ? (
            <>
              Get My Results
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
