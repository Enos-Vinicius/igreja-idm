
import { Pointer } from "lucide-react";
import heroImage from "@/assets/hero-road.jpg";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Estrada iluminada simbolizando alinhamento"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-white/90 text-sm font-medium">2026</span>
          </div>

          {/* Main Title */}
          <h1 
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            O Ano do{" "}
            <span className="text-gradient-golden">Alinhamento</span>
          </h1>

          {/* Scripture */}
          <p 
            className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-4 font-light animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            "Eu o despertei em justiça e todos os seus caminhos endireitarei"
          </p>
          
          <p 
            className="text-golden font-semibold mb-12 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            Isaías 45:13
          </p>

        </div>
      </div>

      {/* Scroll Indicator - Desktop (mouse) */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float" style={{ marginLeft: '-20px' }}>
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>

      {/* Scroll Indicator - Mobile (swipe up) */}
      <div className="flex md:hidden absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float" style={{ marginLeft: '-15px' }}>
        <Pointer className="w-7 h-7 text-white/60 animate-bounce" />
      </div>
    </section>
  );
};

export default HeroSection;
