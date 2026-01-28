import { Heart, ClipboardCheck, Shield, Award, Star, CheckCircle2, ArrowRight, Phone } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import heroImage from "@assets/private-in-home-care-boston-medical-center_1769554180599.png";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Private in-home caregiver providing compassionate care to elderly patient"
          className="w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-20 md:py-28">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Platinum Standard Care</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="text-white/80 text-sm ml-2">5.0 Rating</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Compassionate
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
              In-Home Care
            </span>
            <span className="block">for Your Loved Ones</span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl mb-8 text-white/80 leading-relaxed max-w-2xl">
            Massachusetts' trusted provider of personalized home care services. 
            Professional PCAs delivering dignity, comfort, and peace of mind.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-10">
            <Button size="lg" className="group text-base px-8 py-6 bg-white text-gray-900 hover:bg-white/90" asChild>
              <a href="#contact" data-testid="button-find-care">
                Request Free Consultation
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 py-6 border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20" asChild>
              <a href="tel:+16176860595" data-testid="button-call-now">
                <Phone className="w-5 h-5 mr-2" />
                Call (617) 686-0595
              </a>
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-white/20">
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm font-medium">Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm font-medium">CORI Background Checked</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm font-medium">Serving All Massachusetts</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
