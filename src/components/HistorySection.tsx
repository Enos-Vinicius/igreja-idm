import { Church, Users, Globe, Award } from "lucide-react";

const HistorySection = () => {
  const milestones = [
    {
      year: "2003",
      title: "O Início",
      description: "Fundação da Igreja do Deus de Maravilhas em 18 de junho.",
      icon: Church,
    },
    {
      year: "2005",
      title: "Primeiros Encontros",
      description: "Reuniões iniciais com grupo de fiéis comprometidos.",
      icon: Users,
    },
    {
      year: "2006",
      title: "Consolidação",
      description: "Fortalecimento da comunidade e crescimento espiritual.",
      icon: Award,
    },
    {
      year: "2007",
      title: "Novos Membros",
      description: "Crescimento significativo no número de participantes.",
      icon: Users,
    },
    {
      year: "2008",
      title: "Estruturação",
      description: "Organização dos ministérios e lideranças.",
      icon: Globe,
    },
    {
      year: "2009",
      title: "Preparação",
      description: "Preparativos para uma nova fase da igreja.",
      icon: Award,
    },
    {
      year: "2010",
      title: "Fundação Oficial",
      description: "A Igreja do Deus de Maravilhas nasce oficialmente em Uberaba, MG.",
      icon: Church,
    },
    {
      year: "2011",
      title: "Crescimento",
      description: "Expansão das atividades e cultos regulares.",
      icon: Users,
    },
    {
      year: "2012",
      title: "Consolidação",
      description: "Fortalecimento dos ministérios e discipulado.",
      icon: Award,
    },
    {
      year: "2013",
      title: "Novos Projetos",
      description: "Início de projetos sociais e evangelísticos.",
      icon: Globe,
    },
    {
      year: "2014",
      title: "Ampliação",
      description: "Aumento da capacidade de atendimento aos fiéis.",
      icon: Church,
    },
    {
      year: "2015",
      title: "Novo Templo",
      description: "Inauguração do novo templo com capacidade ampliada.",
      icon: Church,
    },
    {
      year: "2016",
      title: "Missões",
      description: "Início do trabalho missionário em outras regiões.",
      icon: Globe,
    },
    {
      year: "2017",
      title: "Avivamento",
      description: "Período de grande avivamento e crescimento espiritual.",
      icon: Award,
    },
    {
      year: "2018",
      title: "Comunidade",
      description: "Fortalecimento dos laços comunitários e células.",
      icon: Users,
    },
    {
      year: "2019",
      title: "Preparação",
      description: "Preparação para novos desafios e expansão.",
      icon: Award,
    },
    {
      year: "2020",
      title: "Expansão",
      description: "Abertura da filial em Conceição das Alagoas.",
      icon: Globe,
    },
    {
      year: "2021",
      title: "Resiliência",
      description: "Superação de desafios e fortalecimento da fé.",
      icon: Award,
    },
    {
      year: "2022",
      title: "Renovação",
      description: "Renovação espiritual e novos compromissos.",
      icon: Church,
    },
    {
      year: "2023",
      title: "Multiplicação",
      description: "Multiplicação de líderes e ministérios.",
      icon: Users,
    },
    {
      year: "2024",
      title: "Visão",
      description: "Ano de visão clara e direção divina.",
      icon: Globe,
    },
    {
      year: "2025",
      title: "Alinhamento",
      description: "Ano profético de alinhamento e novos projetos.",
      icon: Award,
    },
    {
      year: "2026",
      title: "Conquista",
      description: "Ano de conquistas e vitórias em Cristo.",
      icon: Church,
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
