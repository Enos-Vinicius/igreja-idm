import { Flame, Clock, Sparkles, Heart } from "lucide-react";
import heroWorship from "@/assets/hero-worship.jpg";

const ProjectsSection = () => {
  const projects = [
    {
      title: "Sala dos Milagres",
      description:
        "Um lugar de encontro com Deus onde milagres, curas e libertações acontecem através do poder do Espírito Santo.",
      icon: Sparkles,
      highlight: "Todos os Domingos",
    },
    {
      title: "Ciclo das 77 Horas",
      description:
        "77 horas de oração ininterrupta, clamando pela nação, famílias e por um avivamento espiritual.",
      icon: Clock,
      highlight: "Evento Especial",
    },
    {
      title: "Encontro de Casais",
      description:
        "Fortalecendo matrimônios através da Palavra de Deus e comunhão entre casais da igreja.",
      icon: Heart,
      highlight: "Mensalmente",
    },
    {
      title: "Culto de Fogo",
      description:
        "Noite de adoração intensa e busca pela presença do Espírito Santo com unção e poder.",
      icon: Flame,
      highlight: "Sextas-feiras",
    },
  ];

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
            Nossos Ministérios
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-white">
            Projetos & Eventos
          </h2>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto">
            Conheça nossos projetos especiais que transformam vidas e fortalecem a fé
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className="group relative p-8 rounded-2xl overflow-hidden hover-lift cursor-default"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Glass Background */}
              <div className="absolute inset-0 glass-card" />
              
              {/* Glow Effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-golden/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-golden to-golden-light flex items-center justify-center mb-6 glow-golden group-hover:scale-110 transition-transform">
                  <project.icon className="w-7 h-7 text-secondary" />
                </div>

                {/* Badge */}
                <span className="inline-block px-3 py-1 bg-golden/20 text-golden text-xs font-semibold rounded-full mb-4">
                  {project.highlight}
                </span>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-3">
                  {project.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
