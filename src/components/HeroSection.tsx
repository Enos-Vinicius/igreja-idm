import { Play } from "lucide-react";
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
            <span className="w-2 h-2 rounded-full bg-golden animate-glow-pulse" />
            <span className="text-white/90 text-sm font-medium">2025 • Ano Profético</span>
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

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            <a
              href="#"
              className="group flex items-center gap-3 px-8 py-4 glass-button rounded-full text-white font-semibold text-lg"
            >
              <span className="w-10 h-10 rounded-full bg-gradient-to-r from-golden to-golden-light flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play size={18} fill="currentColor" className="text-secondary ml-0.5" />
              </span>
              <span>Assista ao Vivo</span>
            </a>

            <a
              href="#sobre"
              className="px-8 py-4 border border-white/30 rounded-full text-white font-medium hover:bg-white/10 transition-all"
            >
              Conheça Nossa Igreja
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
