import { Heart, ClipboardCheck } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/private-in-home-care-boston-medical-center_1769554180599.png";

export default function Hero() {
  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl shadow-xl">
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="Private in-home caregiver providing compassionate care to elderly patient"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
          </div>
          
          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <Heart className="w-8 h-8" />
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Compassionate care at home, when you need it
              </h2>
              
              <p className="text-lg md:text-xl mb-8 text-white/90">
                We connect families across Massachusetts with experienced Personal Care Assistants (PCAs) for reliable, personalized support.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a 
                  href="#contact" 
                  data-testid="button-find-care"
                  className="px-6 py-3 bg-white text-primary font-semibold rounded-lg hover-elevate active-elevate-2 transition-all"
                >
                  Find Care
                </a>
                <Link 
                  href="/quiz/personal-care-assessment" 
                  data-testid="button-take-assessment"
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/30 hover-elevate active-elevate-2 transition-all inline-flex items-center gap-2"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Take Care Assessment
                </Link>
              </div>
              
              <p className="mt-6 text-sm text-white/70">
                Not sure what care you need?{" "}
                <Link href="/quiz/personal-care-assessment" className="underline hover:text-white" data-testid="link-assessment-help">
                  Our free assessment can help
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
