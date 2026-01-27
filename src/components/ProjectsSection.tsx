import { Sparkles, Clock, Music, Sun, Heart } from "lucide-react";
import heroWorship from "@/assets/hero-worship.jpg";

const ProjectsSection = () => {
  return (
    <section id="projetos" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroWorship}
          alt="Culto de adoração"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-secondary/95" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-sm uppercase tracking-widest">
            Projetos Inspirados por Deus
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-white">
            Nossos Projetos Especiais
          </h2>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto">
            Ministérios criados por inspiração divina para alcançar vidas e glorificar a Deus
          </p>
        </div>

        {/* Projeto Sala dos Milagres */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="relative p-8 md:p-10 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 glass-card" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-golden/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-golden to-golden-light flex items-center justify-center glow-golden">
                  <Sparkles className="w-7 h-7 text-secondary" />
                </div>
                <div>
                  <span className="inline-block px-3 py-1 bg-golden/20 text-golden text-xs font-semibold rounded-full mb-1">
                    Ministério de Cura
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    Projeto Sala dos Milagres
                  </h3>
                </div>
              </div>
              
              <p className="text-white/80 leading-relaxed mb-6 text-lg">
                Uma maneira de ministrar na vida das pessoas de forma particular, iniciando com incentivo à auto-análise e reflexão, olhando para dentro de si. Depois é feita uma oração com unção e imposição das mãos em um ambiente reservado.
              </p>
              
              <div className="flex flex-wrap gap-3">
                {["Auto-análise", "Ministração Pessoal", "Oração com Unção"].map((point) => (
                  <span key={point} className="px-4 py-2 bg-white/10 text-white/90 text-sm font-medium rounded-full border border-white/10">
                    {point}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ciclo das 77 Horas - Destaque */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="text-center mb-10 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-golden/30 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-golden/20 rounded-full mb-4">
                <Clock className="w-5 h-5 text-golden" />
                <span className="text-golden font-semibold text-sm uppercase tracking-wider">
                  Evento Especial • 3x ao Ano
                </span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white">
                O Ciclo das 77 Horas
              </h3>
              <p className="mt-3 text-white/60 max-w-xl mx-auto">
                Um período especial de culto contínuo a Deus, realizado 3 vezes ao ano
              </p>
            </div>
          </div>
        </div>

        {/* Etapas do Ciclo */}
        <div className="max-w-5xl mx-auto grid gap-6 mb-10">
          {/* 72 Horas de Oração */}
          <div className="relative p-6 md:p-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 glass-card" />
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-golden to-golden-light rounded-l-2xl" />
            
            <div className="relative z-10 pl-4">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full bg-golden/20 flex items-center justify-center text-golden font-bold text-sm">1</span>
                    <h4 className="text-xl md:text-2xl font-bold text-white">72 Horas de Oração</h4>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    Período feito pré-Manhã da Redenção, organizado um rodízio de irmãos na igreja onde cada um fica responsável por orar continuamente durante no mínimo 1 hora. Esse rodízio é feito durante 3 dias/noites seguidos. Inicia às 06:00h do 1º dia e ininterruptamente termina no 3º dia às 06:00h.
                  </p>
                </div>
                <div className="flex flex-wrap md:flex-col gap-2 md:gap-3 md:min-w-[180px]">
                  {["Início: 06:00h (Dia 1)", "Oração Contínua", "Fim: 06:00h (Dia 3)"].map((point) => (
                    <span key={point} className="px-3 py-1.5 bg-golden/10 text-golden text-xs font-medium rounded-full border border-golden/20">
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reverência a Cristo */}
          <div className="relative p-6 md:p-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 glass-card" />
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-golden to-golden-light rounded-l-2xl" />
            
            <div className="relative z-10 pl-4">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full bg-golden/20 flex items-center justify-center text-golden font-bold text-sm">2</span>
                    <div className="flex items-center gap-2">
                      <Music className="w-5 h-5 text-golden" />
                      <h4 className="text-xl md:text-2xl font-bold text-white">Reverência a Cristo</h4>
                    </div>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    Após as 72 horas de oração são realizados 120 minutos de louvor, com bandas diversas, porém de frente para o altar (onde é o local que os membros acreditam que manifesta-se o poder de Deus). Nesse momento é entronizado Jesus para o bairro, setor e cidade.
                  </p>
                </div>
                <div className="flex flex-wrap md:flex-col gap-2 md:gap-3 md:min-w-[180px]">
                  {["Louvor Intenso", "Altar Centralizado", "Entronização de Cristo"].map((point) => (
                    <span key={point} className="px-3 py-1.5 bg-golden/10 text-golden text-xs font-medium rounded-full border border-golden/20">
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Manhã da Redenção */}
          <div className="relative p-6 md:p-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 glass-card" />
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-golden to-golden-light rounded-l-2xl" />
            
            <div className="relative z-10 pl-4">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full bg-golden/20 flex items-center justify-center text-golden font-bold text-sm">3</span>
                    <div className="flex items-center gap-2">
                      <Sun className="w-5 h-5 text-golden" />
                      <h4 className="text-xl md:text-2xl font-bold text-white">Manhã da Redenção</h4>
                    </div>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    Reunião feita em média 3 vezes ao ano, com intuito de render graças exclusivamente a Deus, reconhecendo tudo aquilo que Ele nos dá. Após o término da Reverência a Cristo é iniciada a Manhã da Redenção, completando assim o ciclo de 77 horas de culto a Deus.
                  </p>
                </div>
                <div className="flex flex-wrap md:flex-col gap-2 md:gap-3 md:min-w-[180px]">
                  {["Gratidão", "Culto Coletivo", "Reconhecimento"].map((point) => (
                    <span key={point} className="px-3 py-1.5 bg-golden/10 text-golden text-xs font-medium rounded-full border border-golden/20">
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Destaque Final - Resumo */}
        <div className="max-w-3xl mx-auto">
          <div className="relative p-8 md:p-10 rounded-2xl overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-golden/20 to-golden-light/10 backdrop-blur-sm border border-golden/30 rounded-2xl" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-60 h-60 bg-golden/30 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-golden to-golden-light mb-6 glow-golden">
                <Heart className="w-8 h-8 text-secondary" />
              </div>
              
              <h4 className="text-2xl md:text-3xl font-bold text-white mb-4">
                77 Horas de Culto Completo
              </h4>
              
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 text-white/80 mb-4">
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium">72h de Oração</span>
                <span className="text-golden text-xl">+</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium">2h de Louvor</span>
                <span className="text-golden text-xl">+</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium">Manhã da Redenção</span>
              </div>
              
              <p className="text-white/70 text-lg">
                Um ciclo completo de adoração e gratidão a Deus
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
