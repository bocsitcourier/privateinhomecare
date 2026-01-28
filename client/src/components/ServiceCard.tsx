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
      className="group relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-xl"
      data-testid={`card-service-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
              {title}
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">{short}</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-sm text-primary font-medium py-2 hover:underline"
          data-testid={`button-toggle-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <span>{isOpen ? "Show less" : "Learn more"}</span>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform duration-300",
            isOpen && "rotate-180"
          )} />
        </button>
        
        <div className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-64 opacity-100 mt-4 pt-4 border-t" : "max-h-0 opacity-0"
        )}>
          <p className="text-sm text-foreground/80 mb-4 leading-relaxed">{full}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => onRequestService(title)}
              className="group/btn"
              data-testid={`button-request-${title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              Request Service
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="sm"
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
