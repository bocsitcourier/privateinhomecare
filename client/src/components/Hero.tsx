import { Heart, Shield, Award, Star, CheckCircle2, ArrowRight, Phone, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import heroImage from "@assets/private-in-home-care-boston-medical-center_1769694632455.png";

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-slate-800">
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Private in-home caregiver providing compassionate care to elderly patient"
          className="w-full h-full object-cover object-center opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-slate-900/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl animate-fade-in-up">
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/30 to-primary/10 backdrop-blur-md rounded-full border border-primary/30">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-white">Platinum Standard Care</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-white/70 text-sm ml-2 font-medium">5.0 Rated</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
            Compassionate
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              In-Home Care
            </span>
            <span className="block">for Your Family</span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl mb-10 text-white/70 leading-relaxed max-w-2xl font-light">
            Massachusetts' most trusted provider of personalized home care. 
            Professional caregivers delivering dignity, comfort, and peace of mind.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-12">
            <Button size="lg" className="text-base px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" asChild>
              <a href="#contact" data-testid="button-find-care">
                Get Free Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 py-6 border-white/20 text-white bg-white/5 backdrop-blur-sm" asChild>
              <a href="tel:+16176860595" data-testid="button-call-now">
                <Phone className="w-5 h-5 mr-2" />
                (617) 686-0595
              </a>
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-6 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center backdrop-blur-sm">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <span className="text-white font-medium block text-sm">Licensed & Insured</span>
                <span className="text-white/50 text-xs">Full coverage protection</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="text-white font-medium block text-sm">Background Checked</span>
                <span className="text-white/50 text-xs">CORI verified caregivers</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center backdrop-blur-sm">
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <span className="text-white font-medium block text-sm">Award Winning</span>
                <span className="text-white/50 text-xs">Top rated in MA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
