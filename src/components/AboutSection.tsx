import { Heart, Users, BookOpen } from "lucide-react";
import pastoralCouple from "@/assets/pastoral-couple.jpg";

const AboutSection = () => {
  const values = [
    {
      icon: Heart,
      title: "Amor",
      description: "Amar a Deus sobre todas as coisas e ao próximo como a si mesmo.",
    },
    {
      icon: Users,
      title: "Comunidade",
      description: "Juntos somos mais fortes, edificando uns aos outros na fé.",
    },
    {
      icon: BookOpen,
      title: "Palavra",
      description: "Fundamentados na Palavra de Deus como nossa única regra de fé.",
    },
  ];

  return (
    <section id="sobre" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-sm uppercase tracking-widest">
            Nossa História
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-secondary">
            Sobre a Igreja
          </h2>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Image Side */}
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={pastoralCouple}
                alt="Casal Pastoral"
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Decorative Frame */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border-4 border-golden/30 rounded-2xl z-0" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-golden to-golden-light rounded-2xl opacity-20" />
          </div>

          {/* Text Side */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-secondary">
              Bem-vindos à Igreja do Deus de Maravilhas
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Somos uma igreja pentecostal comprometida com a proclamação do Evangelho 
              de Jesus Cristo. Nossa missão é alcançar vidas, transformar famílias e 
              impactar nossa geração com o poder do Espírito Santo.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Fundada com a visão de ver milagres, sinais e maravilhas acontecerem, 
              cremos que Deus ainda opera poderosamente nos dias de hoje. Venha fazer 
              parte desta família e experimente o sobrenatural de Deus.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-6">
              <div>
                <span className="text-4xl font-bold text-gradient-golden">15+</span>
                <p className="text-muted-foreground text-sm mt-1">Anos de Ministério</p>
              </div>
              <div>
                <span className="text-4xl font-bold text-gradient-golden">2</span>
                <p className="text-muted-foreground text-sm mt-1">Unidades</p>
              </div>
              <div>
                <span className="text-4xl font-bold text-gradient-golden">500+</span>
                <p className="text-muted-foreground text-sm mt-1">Membros</p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="group p-8 bg-muted rounded-2xl hover-lift cursor-default"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-royal-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <value.icon className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-xl font-bold text-secondary mb-3">{value.title}</h4>
              <p className="text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
