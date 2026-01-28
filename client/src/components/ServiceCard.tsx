import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  short: string;
  full: string;
  icon: React.ReactNode;
  serviceKey: string;
  onRequestService: (title: string) => void;
}

export default function ServiceCard({ title, short, full, icon, serviceKey, onRequestService }: ServiceCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card 
      className="group relative overflow-visible border-2 border-border/50 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 bg-card"
      data-testid={`card-service-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-primary/60 to-transparent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-t-lg" />
      
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-500">
            {icon}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h4 className="font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
              {title}
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">{short}</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-sm text-primary font-semibold py-3 px-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
          data-testid={`button-toggle-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <span>{isOpen ? "Show less" : "Learn more"}</span>
          <ChevronDown className={cn(
            "w-5 h-5 transition-transform duration-300",
            isOpen && "rotate-180"
          )} />
        </button>
        
        <div className={cn(
          "overflow-hidden transition-all duration-500 ease-out",
          isOpen ? "max-h-80 opacity-100 mt-4 pt-4 border-t border-border" : "max-h-0 opacity-0"
        )}>
          <p className="text-sm text-foreground/80 mb-5 leading-relaxed">{full}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => onRequestService(title)}
              className="shadow-md"
              data-testid={`button-request-${title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              Request Service
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              asChild
              data-testid={`button-learn-more-${serviceKey}`}
            >
              <Link href={`/${serviceKey}/massachusetts`}>
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
