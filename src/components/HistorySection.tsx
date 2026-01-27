import { Church, Heart, Sparkles } from "lucide-react";

const HistorySection = () => {
  return (
    <section id="historia" className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-sm uppercase tracking-widest">
            A Fundação da Igreja
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-secondary">
            Nossa História
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* O Chamado Divino */}
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-royal-700 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-secondary">O Chamado Divino</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  A conversão do fundador, Pastor Alceu da Silva, teve início em um período em que 
                  aconteciam muitas maravilhas e sinais da parte de Deus. Na década de 70, ele 
                  presenciou muitas vezes o sobrenatural. Inclusive, por três vezes teve a 
                  experiência de ouvir a voz de Jesus nas manifestações do Espírito Santo na vida de pessoas.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Em um momento de oração, recebeu uma palavra de Jesus, que disse:
                </p>
                {/* Quote Highlight */}
                <blockquote className="relative my-6 pl-6 py-4 border-l-4 border-golden bg-golden/5 rounded-r-xl">
                  <p className="text-xl md:text-2xl font-serif italic text-secondary leading-relaxed">
                    "Onde você estiver ali estarei com você, não será só flores, terá também espinhos, 
                    mas eu sei como arrancar os espinhos"
                  </p>
                </blockquote>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Através dessa experiência surgiu uma convicção de fundar o seu próprio ministério.
                </p>
              </div>
            </div>
          </div>

          {/* A Fundação */}
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-golden to-golden-light flex items-center justify-center flex-shrink-0">
                <Church className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-secondary">A Fundação</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  A Igreja do Deus de Maravilhas, fundada pelo Pastor Alceu da Silva em{" "}
                  <span className="font-semibold text-foreground">4 de junho de 2004</span>, com sede 
                  na Avenida Coronel Joaquim de Oliveira Prata, número 1817, é constituída por tempo 
                  indeterminado, uma associação religiosa de caráter evangélico.
                </p>
              </div>
            </div>
          </div>

          {/* Fidelidade de Deus */}
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-royal-700 flex items-center justify-center flex-shrink-0">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-secondary">Fidelidade de Deus</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  No decorrer desses anos, Deus vem cumprindo todas as promessas. O ministério tem 
                  sido marcado por inúmeras manifestações da graça e do poder de Deus, alcançando 
                  vidas e transformando famílias através da pregação do evangelho.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistorySection;
