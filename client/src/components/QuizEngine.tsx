import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReCAPTCHA from "react-google-recaptcha";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Loader2, Phone, Mail, User, ArrowRight } from "lucide-react";
import QuizProgressBar from "@/components/quiz/QuizProgressBar";
import QuizResults from "@/components/quiz/QuizResults";
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
  maxScore?: number;
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
  const [direction, setDirection] = useState(1);

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const currentScore = useMemo(() => {
    let score = 0;
    Object.values(responses).forEach(response => {
      const question = quiz.questions.find(q => q.id === response.questionId);
      if (!question) return;
      const options = question.options as { value: string; label: string; score?: number }[];
      
      if (response.answerValue) {
        const option = options.find(o => o.value === response.answerValue);
        if (option?.score) score += option.score;
      } else if (response.answerValues) {
        response.answerValues.forEach(val => {
          const option = options.find(o => o.value === val);
          if (option?.score) score += option.score;
        });
      }
    });
    return score;
  }, [responses, quiz.questions]);
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
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, isContactStep, form, submitMutation, quiz.questions.length]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
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
        const handleMultiSelect = (optionValue: string, shouldSelect: boolean) => {
          setResponses(prev => {
            const currentResponse = prev[question.id];
            const currentValues = currentResponse?.answerValues || [];
            const newValues = shouldSelect
              ? [...currentValues.filter(v => v !== optionValue), optionValue]
              : currentValues.filter(v => v !== optionValue);
            return {
              ...prev,
              [question.id]: {
                questionId: question.id,
                answerValues: newValues,
              }
            };
          });
        };
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
                  onClick={(e) => {
                    e.preventDefault();
                    handleMultiSelect(option.value, !isChecked);
                  }}
                  data-testid={`option-${question.id}-${option.value}`}
                >
                  <Checkbox 
                    checked={isChecked} 
                    id={`${question.id}-${option.value}`}
                    onCheckedChange={(checked) => {
                      handleMultiSelect(option.value, checked === true);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Label 
                    htmlFor={`${question.id}-${option.value}`} 
                    className="flex-1 cursor-pointer font-normal"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMultiSelect(option.value, !isChecked);
                    }}
                  >
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
    return <QuizResults result={result} className={className} />;
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
  };

  return (
    <Card className={`max-w-2xl mx-auto overflow-hidden ${className || ""}`}>
      <div className="p-6 pb-2">
        <QuizProgressBar 
          current={currentStep} 
          total={quiz.questions.length}
          score={currentScore}
          showScore={Object.keys(responses).length > 0}
          stepLabel={isContactStep ? "Final Step" : `Question ${currentStep + 1} of ${quiz.questions.length}`}
        />
      </div>

      <CardContent className="pt-4">
        <AnimatePresence mode="wait" custom={direction}>
          {!isContactStep && currentQuestion && (
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-semibold mb-2" data-testid={`text-question-${currentStep}`}>
                  {currentQuestion.questionText}
                </h3>
                {currentQuestion.helpText && (
                  <p className="text-sm text-muted-foreground">{currentQuestion.helpText}</p>
                )}
              </div>
              {renderQuestion(currentQuestion)}
            </motion.div>
          )}

          {isContactStep && (
            <motion.div
              key="contact-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
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
