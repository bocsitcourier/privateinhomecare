import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ServiceCardProps {
  title: string;
  short: string;
  full: string;
  icon: React.ReactNode;
  onRequestService: (title: string) => void;
}

export default function ServiceCard({ title, short, full, icon, onRequestService }: ServiceCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card data-testid={`card-service-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 text-2xl">{icon}</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-lg text-primary mb-2">{title}</h4>
            <p className="text-muted-foreground text-sm mb-3">{short}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            data-testid={`button-toggle-${title.toLowerCase().replace(/\s+/g, '-')}`}
            className="flex-shrink-0"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        
        {isOpen && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-foreground mb-4">{full}</p>
            <Button
              variant="default"
              size="sm"
              onClick={() => onRequestService(title)}
              data-testid={`button-request-${title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              Request This Service
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
