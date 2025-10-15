import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

interface ReviewCardProps {
  name: string;
  city: string;
  rating: number;
  text: string;
  image?: string;
}

export default function ReviewCard({ name, city, rating, text, image }: ReviewCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('');

  return (
    <Card className="relative pt-16" data-testid={`card-review-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6 text-center">
        <Avatar className="w-32 h-32 mx-auto -mt-24 mb-4 border-4 border-background">
          <AvatarImage src={image} alt={`${name} from ${city} - Private InHome CareGiver MA client testimonial`} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="font-semibold text-lg text-foreground mb-1" data-testid={`text-reviewer-name-${name.toLowerCase().replace(/\s+/g, '-')}`}>
          {name}
        </div>
        <div className="text-sm text-muted-foreground mb-4">{city}</div>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <Quote className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        
        <p className="text-sm text-foreground/80 leading-relaxed mb-4">{text}</p>
        
        <div className="flex justify-center gap-1" aria-label={`Rating: ${rating} out of 5 stars`}>
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-chart-4 text-chart-4" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
