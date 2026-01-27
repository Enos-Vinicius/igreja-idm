const VersesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            {/* Decorative Quotes */}
            <span className="absolute -top-8 -left-4 text-8xl text-golden/20 font-serif">
              "
            </span>
            <span className="absolute -bottom-16 -right-4 text-8xl text-golden/20 font-serif">
              "
            </span>

            <blockquote className="text-2xl md:text-3xl lg:text-4xl text-secondary font-light leading-relaxed italic">
              Eis que farei uma coisa nova, agora sairá à luz; porventura não a 
              percebereis? Eis que porei um caminho no deserto, e rios no ermo.
            </blockquote>
            
            <cite className="block mt-8 text-golden font-bold text-lg not-italic">
              Isaías 43:19
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VersesSection;
