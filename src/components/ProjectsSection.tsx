import { Sparkles, Clock, Music, Heart, Star, ChevronRight } from "lucide-react";

const ProjectsSection = () => {
  return (
    <section id="projetos" className="py-24 bg-gradient-royal relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-golden/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-sm uppercase tracking-widest">
            Projetos Inspirados por Deus
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-white">
            Nossos Projetos Especiais
          </h2>
          <p className="mt-4 text-white/70 text-lg max-w-2xl mx-auto">
            Ministérios criados por inspiração divina para alcançar vidas e glorificar a Deus
          </p>
        </div>

        {/* Sala dos Milagres - Featured Card */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-10 hover:bg-white/10 transition-all duration-500">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 glow-golden pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-golden to-golden-light flex items-center justify-center flex-shrink-0 shadow-lg shadow-golden/30">
                <Sparkles className="w-10 h-10 text-secondary" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Projeto Sala dos Milagres
                </h3>
                <p className="text-white/70 text-lg leading-relaxed mb-6">
                  Uma maneira de ministrar na vida das pessoas de forma particular, iniciando com incentivo à auto-análise e reflexão, olhando para dentro de si. Depois é feita uma oração com unção e imposição das mãos em um ambiente reservado.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 rounded-full bg-golden/20 text-golden text-sm font-semibold">
                    Auto-análise
                  </span>
                  <span className="px-4 py-2 rounded-full bg-golden/20 text-golden text-sm font-semibold">
                    Ministração Pessoal
                  </span>
                  <span className="px-4 py-2 rounded-full bg-golden/20 text-golden text-sm font-semibold">
                    Oração com Unção
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ciclo das 77 Horas - Highlight */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-golden/20 text-golden text-sm font-semibold mb-4">
              <Star className="w-4 h-4" />
              Destaque Especial
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
              O Ciclo das 77 Horas
            </h3>
            <p className="text-white/70 text-lg">
              Um período especial de culto contínuo a Deus, realizado 3 vezes ao ano
            </p>
          </div>

          {/* Timeline Cards */}
          <div className="grid gap-6">
            {/* 72 Horas de Oração */}
            <div className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/10 transition-all duration-500">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex items-center gap-4 lg:w-64 flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-royal-700 flex items-center justify-center shadow-lg">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <span className="text-golden text-xs font-semibold uppercase tracking-wider">Etapa 1</span>
                    <h4 className="text-xl font-bold text-white">72 Horas de Oração</h4>
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="text-white/70 leading-relaxed mb-4">
                    Período feito pré-Manhã da Redenção, organizado um rodízio de irmãos na igreja onde cada um fica responsável por orar continuamente durante no mínimo 1 hora. Esse rodízio é feito durante 3 dias/noites seguidos. Inicia às 06:00h do 1º dia e ininterruptamente termina no 3º dia às 06:00h.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary-foreground/90 text-xs font-medium border border-primary/30">
                      Início: 06:00h (Dia 1)
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary-foreground/90 text-xs font-medium border border-primary/30">
                      Oração Contínua
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary-foreground/90 text-xs font-medium border border-primary/30">
                      Fim: 06:00h (Dia 3)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center">
              <ChevronRight className="w-6 h-6 text-golden rotate-90" />
            </div>

            {/* Reverência a Cristo */}
            <div className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/10 transition-all duration-500">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex items-center gap-4 lg:w-64 flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-golden to-golden-light flex items-center justify-center shadow-lg shadow-golden/30">
                    <Music className="w-7 h-7 text-secondary" />
                  </div>
                  <div>
                    <span className="text-golden text-xs font-semibold uppercase tracking-wider">Etapa 2</span>
                    <h4 className="text-xl font-bold text-white">Reverência a Cristo</h4>
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="text-white/70 leading-relaxed mb-4">
                    Após as 72 horas de oração são realizados 120 minutos de louvor, com bandas diversas, porém de frente para o altar (onde é o local que os membros acreditam que manifesta-se o poder de Deus). Nesse momento é entronizado Jesus para o bairro, setor e cidade.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-golden/20 text-golden text-xs font-medium border border-golden/30">
                      Louvor Intenso
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-golden/20 text-golden text-xs font-medium border border-golden/30">
                      Altar Centralizado
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-golden/20 text-golden text-xs font-medium border border-golden/30">
                      Entronização de Cristo
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center">
              <ChevronRight className="w-6 h-6 text-golden rotate-90" />
            </div>

            {/* Manhã da Redenção */}
            <div className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/10 transition-all duration-500">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex items-center gap-4 lg:w-64 flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-royal-700 flex items-center justify-center shadow-lg">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <span className="text-golden text-xs font-semibold uppercase tracking-wider">Etapa 3</span>
                    <h4 className="text-xl font-bold text-white">Manhã da Redenção</h4>
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="text-white/70 leading-relaxed mb-4">
                    Reunião feita em média 3 vezes ao ano, com intuito de render graças exclusivamente a Deus, reconhecendo tudo aquilo que Ele nos dá. Após o término da Reverência a Cristo é iniciada a Manhã da Redenção, completando assim o ciclo de 77 horas de culto a Deus.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary-foreground/90 text-xs font-medium border border-primary/30">
                      Gratidão
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary-foreground/90 text-xs font-medium border border-primary/30">
                      Culto Coletivo
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary-foreground/90 text-xs font-medium border border-primary/30">
                      Reconhecimento
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Summary - 77 Horas */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-r from-golden/20 to-golden-light/20 backdrop-blur-lg border border-golden/30 rounded-2xl p-8 md:p-10 text-center">
            <div className="absolute inset-0 rounded-2xl glow-golden opacity-50 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-golden to-golden-light flex items-center justify-center mx-auto mb-6 shadow-lg shadow-golden/40">
                <Star className="w-8 h-8 text-secondary" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                77 Horas de Culto Completo
              </h3>
              
              <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto">
                72 horas de oração + 2 horas de louvor + Manhã da Redenção = Um ciclo completo de adoração e gratidão a Deus
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <div className="px-6 py-3 rounded-xl bg-white/10 border border-white/20">
                  <span className="text-golden font-bold text-2xl">72h</span>
                  <p className="text-white/60 text-sm">Oração</p>
                </div>
                <div className="flex items-center text-golden text-2xl font-bold">+</div>
                <div className="px-6 py-3 rounded-xl bg-white/10 border border-white/20">
                  <span className="text-golden font-bold text-2xl">2h</span>
                  <p className="text-white/60 text-sm">Louvor</p>
                </div>
                <div className="flex items-center text-golden text-2xl font-bold">+</div>
                <div className="px-6 py-3 rounded-xl bg-white/10 border border-white/20">
                  <span className="text-golden font-bold text-2xl">3h</span>
                  <p className="text-white/60 text-sm">Redenção</p>
                </div>
                <div className="flex items-center text-golden text-2xl font-bold">=</div>
                <div className="px-6 py-3 rounded-xl bg-golden/20 border border-golden/40">
                  <span className="text-golden font-bold text-2xl">77h</span>
                  <p className="text-white/60 text-sm">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
