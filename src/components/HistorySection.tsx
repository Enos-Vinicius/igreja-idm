import { Church, Users, Globe, Award } from "lucide-react";

const HistorySection = () => {
  const milestones = [
    {
      year: "2010",
      title: "Fundação",
      description: "A Igreja do Deus de Maravilhas nasce em Uberaba, MG.",
      icon: Church,
    },
    {
      year: "2015",
      title: "Crescimento",
      description: "Inauguração do novo templo com capacidade ampliada.",
      icon: Users,
    },
    {
      year: "2020",
      title: "Expansão",
      description: "Abertura da filial em Conceição das Alagoas.",
      icon: Globe,
    },
    {
      year: "2025",
      title: "Alinhamento",
      description: "Ano profético de alinhamento e novos projetos.",
      icon: Award,
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-sm uppercase tracking-widest">
            Nossa Jornada
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-secondary">
            Linha do Tempo
          </h2>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Center Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block" />

            {/* Milestones */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    <div
                      className={`bg-muted p-6 rounded-2xl hover-lift ${
                        index % 2 === 0 ? "md:text-right" : ""
                      }`}
                    >
                      <span className="text-golden font-bold text-lg">
                        {milestone.year}
                      </span>
                      <h3 className="text-xl font-bold text-secondary mt-2 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  {/* Icon Node */}
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-royal-700 flex items-center justify-center shadow-xl">
                      <milestone.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Spacer for alignment */}
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistorySection;
