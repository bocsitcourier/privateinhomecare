import { Heart } from "lucide-react";

export default function Hero() {
  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-chart-1 to-chart-2 p-8 md:p-12 lg:p-16 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Heart className="w-8 h-8" />
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Compassionate care at home, when you need it
            </h2>
            
            <p className="text-lg md:text-xl mb-8 text-white/90">
              We connect families across Massachusetts with experienced Personal Care Assistants (PCAs) for reliable, personalized support.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="#contact" 
                data-testid="button-find-care"
                className="px-6 py-3 bg-white text-primary font-semibold rounded-lg hover-elevate active-elevate-2 transition-all"
              >
                Find Care
              </a>
              <a 
                href="#caregivers" 
                data-testid="button-join-team"
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/30 hover-elevate active-elevate-2 transition-all"
              >
                Join Our Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
