import heroImage from "@/assets/hero-worship.jpg";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Congregação em adoração"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-hero-overlay/70 via-hero-overlay/50 to-hero-overlay/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 md:px-8 max-w-4xl mx-auto">
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-white mb-6 leading-tight animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          Bem-vindo à{" "}
          <span className="text-primary-foreground">Comunidade da Redenção</span>
        </h1>
        
        <p 
          className="text-lg md:text-xl lg:text-2xl text-white/90 mb-10 font-light animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          Transformando vidas através do amor de Cristo
        </p>

        <div 
          className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <a
            href="#oracao"
            className="bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Pedido de Oração
          </a>
          <a
            href="#historia"
            className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-lg font-semibold transition-all duration-300"
          >
            Conheça Nossa História
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/70 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
