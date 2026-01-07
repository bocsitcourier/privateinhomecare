import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Phone, Star, Award, Heart } from "lucide-react";

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

interface QuizResultsProps {
  result: QuizResult;
  className?: string;
}

function CircularProgress({ value, max = 100 }: { value: number; max?: number }) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="180" height="180" className="-rotate-90">
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
          className="text-muted"
        />
        <motion.circle
          cx="90"
          cy="90"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          style={{
            strokeDasharray: circumference,
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.7)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-4xl font-bold text-foreground"
        >
          {value}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-sm text-muted-foreground"
        >
          points
        </motion.span>
      </div>
    </div>
  );
}

function getScoreCategory(score: number, maxScore: number = 100) {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return { label: "Excellent Match", color: "text-green-500", icon: Star };
  if (percentage >= 60) return { label: "Great Fit", color: "text-primary", icon: Award };
  if (percentage >= 40) return { label: "Good Potential", color: "text-yellow-500", icon: Heart };
  return { label: "Let's Talk", color: "text-orange-500", icon: Phone };
}

function getUrgencyBadge(urgency: string) {
  const badges: Record<string, { label: string; className: string }> = {
    immediate: { label: "Immediate Care Needed", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    high: { label: "High Priority", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    medium: { label: "Planning Ahead", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    low: { label: "Exploring Options", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  };
  return badges[urgency] || badges.medium;
}

export default function QuizResults({ result, className }: QuizResultsProps) {
  const maxScore = result.maxScore || 100;
  const category = getScoreCategory(result.score, maxScore);
  const urgencyBadge = getUrgencyBadge(result.urgencyLevel);
  const CategoryIcon = category.icon;

  useEffect(() => {
    const percentage = (result.score / maxScore) * 100;
    if (percentage >= 60) {
      const duration = percentage >= 80 ? 3000 : 1500;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: percentage >= 80 ? 3 : 2,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#6366f1', '#8b5cf6', '#a855f7'],
        });
        confetti({
          particleCount: percentage >= 80 ? 3 : 2,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#6366f1', '#8b5cf6', '#a855f7'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      setTimeout(frame, 500);
    }
  }, [result.score, maxScore]);

  return (
    <Card className={`max-w-2xl mx-auto overflow-hidden ${className || ""}`}>
      <CardContent className="pt-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1 
            }}
            className="mb-6"
          >
            <CircularProgress value={result.score} max={maxScore} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-4"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 ${category.color}`}>
              <CategoryIcon className="w-5 h-5" />
              <span className="font-semibold">{category.label}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-2"
          >
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${urgencyBadge.className}`}>
              {urgencyBadge.label}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h2 className="text-2xl font-bold mb-3" data-testid="text-result-title">
              {result.resultTitle || "Thank You!"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto" data-testid="text-result-description">
              {result.resultDescription || "We've received your information and will be in touch shortly to discuss your care needs."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            {result.ctaUrl && (
              <Button asChild size="lg" data-testid="button-result-cta">
                <a href={result.ctaUrl}>
                  {result.ctaText || "Learn More"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            )}
            <Button asChild variant="outline" size="lg" data-testid="button-call">
              <a href="tel:+16176860595">
                <Phone className="w-4 h-4 mr-2" />
                Call (617) 686-0595
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-8 pt-6 border-t"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>A care specialist will contact you within 24 hours</span>
            </div>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
