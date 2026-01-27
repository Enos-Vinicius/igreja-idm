import { Sparkles, Clock, ChevronRight, Flame } from "lucide-react";

const ProjectsSection = () => {
  const projects = [
    {
      title: "Sala dos Milagres",
      description:
        "Um ambiente consagrado para oração e intercessão, onde testemunhamos milagres extraordinários acontecerem. Venha apresentar seu pedido diante do Senhor.",
      icon: Sparkles,
      highlight: "Oração Poderosa",
      link: "#",
    },
    {
      title: "Ciclo das 77 Horas",
      description:
        "Uma corrente de oração ininterrupta por 77 horas, baseada no princípio bíblico do perdão. Uma jornada de quebrantamento e restauração espiritual.",
      icon: Clock,
      highlight: "Intercessão Contínua",
      link: "#",
    },
  ];

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
            Nossos Projetos
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-white">
            Experiências Espirituais
          </h2>
          <p className="mt-4 text-white/70 text-lg max-w-2xl mx-auto">
            Momentos especiais de encontro com Deus que transformam vidas
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-500 hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 glow-golden pointer-events-none" />

              {/* Icon */}
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-golden to-golden-light flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-golden/30">
                  <project.icon className="w-8 h-8 text-secondary" />
                </div>

                {/* Badge */}
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-golden/20 text-golden text-xs font-semibold mb-4">
                  <Flame className="w-3 h-3" />
                  {project.highlight}
                </span>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  {project.title}
                </h3>
                <p className="text-white/70 leading-relaxed mb-6">
                  {project.description}
                </p>

                {/* Link */}
                <a
                  href={project.link}
                  className="inline-flex items-center gap-2 text-golden font-semibold group/link"
                >
                  <span>Saiba Mais</span>
                  <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl glass-card">
            <div className="text-left">
              <h4 className="text-white font-bold text-lg">
                Precisa de Oração?
              </h4>
              <p className="text-white/70 text-sm">
                Envie seu pedido e nossa equipe intercederá por você
              </p>
            </div>
            <a
              href="#contato"
              className="px-6 py-3 bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold rounded-full hover:shadow-lg hover:shadow-golden/30 transition-all whitespace-nowrap"
            >
              Enviar Pedido
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
