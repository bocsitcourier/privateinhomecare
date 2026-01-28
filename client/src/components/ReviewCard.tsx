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
    <Card 
      className="group relative bg-card/80 backdrop-blur-sm border-2 border-white/20 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
      data-testid={`card-review-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
          <Quote className="w-5 h-5 text-white" />
        </div>
      </div>
      
      <CardContent className="p-8 pt-10 text-center">
        <p className="text-foreground/90 leading-relaxed mb-6 text-base italic">
          "{text}"
        </p>
        
        <div className="flex justify-center gap-1 mb-6" aria-label={`Rating: ${rating} out of 5 stars`}>
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Avatar className="w-14 h-14 border-2 border-primary/20 shadow-md">
            <AvatarImage src={image} alt={`${name} from ${city} - Private InHome CareGiver MA client testimonial`} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <div className="font-bold text-foreground" data-testid={`text-reviewer-name-${name.toLowerCase().replace(/\s+/g, '-')}`}>
              {name}
            </div>
            <div className="text-sm text-muted-foreground">{city}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
