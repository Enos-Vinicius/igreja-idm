const timelineEvents = [
  {
    year: "2004",
    title: "O Início da Jornada",
    description:
      "A Comunidade da Redenção nasceu de um pequeno grupo de oração reunido em uma casa, com apenas 12 membros cheios de fé e esperança.",
  },
  {
    year: "2008",
    title: "Primeiro Templo",
    description:
      "Com o crescimento da congregação, inauguramos nosso primeiro templo, um espaço modesto mas cheio do Espírito Santo.",
  },
  {
    year: "2014",
    title: "Expansão dos Ministérios",
    description:
      "Criamos diversos ministérios: Louvor, Jovens, Mulheres, Homens e Crianças, alcançando todas as idades e necessidades.",
  },
  {
    year: "2019",
    title: "Novo Templo",
    description:
      "Inauguração do nosso atual templo com capacidade para mais de 500 pessoas, equipado com moderna estrutura de som e vídeo.",
  },
  {
    year: "Presente",
    title: "Transformando Vidas",
    description:
      "Hoje somos uma comunidade vibrante com milhares de membros, impactando nossa cidade através do amor de Cristo.",
  },
];

const HistorySection = () => {
  return (
    <section id="historia" className="section-padding bg-card">
      <div className="container-main">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Nossa História
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Uma jornada de fé, crescimento e transformação desde 2004
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-3xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2" />

          {/* Timeline Events */}
          <div className="space-y-8 md:space-y-12">
            {timelineEvents.map((event, index) => (
              <div
                key={event.year}
                className={`relative flex items-start gap-6 md:gap-0 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 z-10">
                  <div className="timeline-dot" />
                </div>

                {/* Content */}
                <div
                  className={`ml-12 md:ml-0 md:w-1/2 ${
                    index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                  }`}
                >
                  <div className="bg-section-light rounded-xl p-6 shadow-sm border border-border/30 hover:shadow-md transition-shadow duration-300">
                    <span className="inline-block bg-primary text-primary-foreground text-sm font-bold px-4 py-1 rounded-full mb-3">
                      {event.year}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistorySection;
