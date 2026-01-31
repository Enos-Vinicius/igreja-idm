import { Quote, Church, Heart, Sparkles } from "lucide-react";

const FoundationSection = () => {
  return (
    <section id="fundacao" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-sm uppercase tracking-widest">
            Nossa História
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-secondary">
            A Fundação da Igreja
          </h2>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-16">
          {/* 1. O Chamado Divino */}
          <div className="relative">
            <div className="flex items-start gap-6">
              <div className="hidden md:flex w-16 h-16 rounded-full bg-gradient-to-br from-golden to-golden-light flex-shrink-0 items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-secondary mb-6 flex items-center gap-3">
                  <span className="md:hidden w-10 h-10 rounded-full bg-gradient-to-br from-golden to-golden-light flex-shrink-0 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </span>
                  O Chamado Divino
                </h3>
                <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                  <p>
                    A conversão do fundador, <strong className="text-secondary">Pastor Alceu da Silva</strong>, 
                    teve início em um período em que aconteciam muitas maravilhas e sinais da parte de Deus. 
                    Na década de 70, ele presenciou muitas vezes o sobrenatural.
                  </p>
                  <p>
                    Inclusive, por três vezes teve a experiência de ouvir a voz de Jesus nas manifestações 
                    do Espírito Santo na vida de pessoas.
                  </p>
                  <p>
                    Em um momento de oração, recebeu uma palavra de Jesus:
                  </p>
                </div>

                {/* Quote Highlight */}
                <div className="my-8 relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-golden to-golden-light rounded-full" />
                  <blockquote className="bg-background border border-border/50 rounded-2xl p-8 shadow-lg">
                    <Quote className="w-10 h-10 text-golden/30 mb-4" />
                    <p className="text-xl md:text-2xl font-medium text-secondary italic leading-relaxed">
                      "Onde você estiver ali estarei com você, não será só flores, terá também espinhos, 
                      mas eu sei como arrancar os espinhos"
                    </p>
                    <footer className="mt-4 text-golden font-semibold">
                      — Palavra de Jesus ao Pastor Alceu
                    </footer>
                  </blockquote>
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed">
                  Através dessa experiência surgiu uma convicção de fundar o seu próprio ministério.
                </p>
              </div>
            </div>
          </div>

          {/* 2. A Fundação */}
          <div className="relative">
            <div className="flex items-start gap-6">
              <div className="hidden md:flex w-16 h-16 rounded-full bg-gradient-to-br from-primary to-royal-700 flex-shrink-0 items-center justify-center shadow-lg">
                <Church className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-secondary mb-6 flex items-center gap-3">
                  <span className="md:hidden w-10 h-10 rounded-full bg-gradient-to-br from-primary to-royal-700 flex-shrink-0 flex items-center justify-center">
                    <Church className="w-5 h-5 text-white" />
                  </span>
                  A Fundação
                </h3>
                
                <div className="bg-background border border-border/50 rounded-2xl p-8 shadow-lg">
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                    Desde <strong className="text-golden">2004</strong>, a <strong className="text-secondary">Igreja do Deus de Maravilhas</strong> escreve
                    uma história de fé sob a liderança do <strong className="text-secondary">Pastor Alceu da Silva</strong>. Somos
                    uma comunidade evangélica presente em duas cidades: em <strong>Uberaba</strong> (nossa sede na Av. Coronel
                    Joaquim de Oliveira Prata) e em nossa <strong className="text-secondary">sede própria no centro de Conceição das Alagoas</strong>.
                    Venha fazer parte desta história que não para de crescer!
                  </p>
                  
                  {/* Foundation Details */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-border/50">
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <span className="text-3xl font-bold text-gradient-golden">4 de Junho</span>
                      <p className="text-muted-foreground text-sm mt-1">Data de Fundação</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <span className="text-3xl font-bold text-gradient-golden">2004</span>
                      <p className="text-muted-foreground text-sm mt-1">Ano de Fundação</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Fidelidade de Deus */}
          <div className="relative">
            <div className="flex items-start gap-6">
              <div className="hidden md:flex w-16 h-16 rounded-full bg-gradient-to-br from-golden to-golden-light flex-shrink-0 items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-secondary mb-6 flex items-center gap-3">
                  <span className="md:hidden w-10 h-10 rounded-full bg-gradient-to-br from-golden to-golden-light flex-shrink-0 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </span>
                  Fidelidade de Deus
                </h3>
                
                <div className="bg-gradient-to-br from-primary/5 to-royal-700/5 border border-primary/20 rounded-2xl p-8">
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    No decorrer desses anos, Deus vem cumprindo todas as promessas. O ministério tem sido 
                    marcado por <strong className="text-secondary">inúmeras manifestações da graça e do poder de Deus</strong>, 
                    alcançando vidas e transformando famílias através da pregação do evangelho.
                  </p>
                  
                  {/* Years Counter */}
                  <div className="mt-8 text-center">
                    <span className="text-5xl md:text-6xl font-bold text-gradient-golden">
                      {new Date().getFullYear() - 2004}+
                    </span>
                    <p className="text-muted-foreground mt-2">Anos de Fidelidade e Milagres</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoundationSection;
