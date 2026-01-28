import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumServiceCardProps {
  title: string;
  description: string;
  features: string[];
  image: string;
  icon: React.ReactNode;
  quizSlug?: string;
  serviceKey: string;
  reverse?: boolean;
}

export default function PremiumServiceCard({
  title,
  description,
  features,
  image,
  icon,
  quizSlug,
  serviceKey,
  reverse = false
}: PremiumServiceCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row items-center gap-8 lg:gap-12 py-12 lg:py-16",
        reverse && "lg:flex-row-reverse"
      )}
      data-testid={`service-card-${serviceKey}`}
    >
      <div className="w-full lg:w-1/2">
        <div className="relative group overflow-hidden rounded-2xl shadow-xl">
          <img
            src={image}
            alt={title}
            className="w-full h-64 lg:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-4 left-4 p-3 bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-lg backdrop-blur-sm">
            {icon}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 space-y-6">
        <div>
          <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-3" data-testid={`service-title-${serviceKey}`}>
            {title}
          </h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {description}
          </p>
        </div>

        <ul className="space-y-3">
          {features.slice(0, 6).map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/consultation">
            <Button size="lg" className="group" data-testid={`service-cta-${serviceKey}`}>
              Request Free Consultation
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          {quizSlug && (
            <Link href={`/quiz/${quizSlug}`}>
              <Button variant="outline" size="lg" data-testid={`service-quiz-${serviceKey}`}>
                Take Assessment Quiz
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
