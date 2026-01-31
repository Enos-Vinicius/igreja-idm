import { Users, Crown, Music, Hand } from "lucide-react";
import pastoresImage from "@/assets/pastores.jpg";

const AboutSection = () => {
  const values = [
    {
      icon: Users,
      title: "Comunhão",
      description: "Unidos em amor, compartilhando a vida em Cristo.",
    },
    {
      icon: Crown,
      title: "Reverência",
      description: "Honrando a Deus com temor e adoração.",
    },
    {
      icon: Music,
      title: "Adoração",
      description: "Exaltando ao Senhor com cânticos de louvor.",
    },
    {
      icon: Hand,
      title: "Oração",
      description: "Buscando a presença de Deus através da oração.",
    },
  ];

  return (
    <section id="sobre" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-sm uppercase tracking-widest">
            Conheça-nos
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
                src={pastoresImage}
                alt="Pastor Alceu Silva e Pastora Maria Silva"
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Decorative Frame */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border-4 border-golden/30 rounded-2xl z-0" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-golden to-golden-light rounded-2xl opacity-20" />
          </div>

          {/* Text Side */}
          <div className="space-y-6">
            <span className="text-golden font-semibold text-sm uppercase tracking-widest">
              Sobre Nós
            </span>
            <h3 className="text-3xl font-bold text-secondary">
              Igreja do Deus de Maravilhas
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Somos uma comunidade de fé comprometida com a <strong>redenção</strong> e{" "}
              <strong>transformação de vidas</strong> através do evangelho de Jesus Cristo.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Sob a liderança do <strong>Pastor Alceu Silva</strong> e <strong>Pastora Maria Silva</strong>,
              nossa missão é alcançar pessoas, edificar famílias e formar discípulos que impactem a sociedade
              com os valores do Reino de Deus.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Cremos que cada pessoa foi criada para um propósito divino, e nosso objetivo
              é ajudá-la a descobrir e cumprir esse chamado através do <strong>alinhamento
              com a Palavra de Deus</strong>.
            </p>

            {/* Call to Action */}
            <div className="pt-4 pb-2">
              <p className="text-xl font-bold text-secondary bg-gradient-to-r from-golden to-golden-light bg-clip-text text-transparent">
                Venha nos fazer uma visita e ser impactado com a presença de Deus.
              </p>
            </div>

            {/* Assinatura do Pastor */}
            <div className="pt-4 border-t border-border">
              <div className="flex flex-row justify-evenly sm:justify-start gap-4 sm:gap-8">
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-bold text-secondary">Pr. Alceu Silva</span>
                  <span className="text-sm text-muted-foreground">Presidente</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-bold text-secondary">Pra. Maria Silva</span>
                  <span className="text-sm text-muted-foreground">Vice Presidente</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="group p-4 lg:p-8 bg-muted rounded-2xl hover-lift cursor-default flex flex-col items-center text-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-royal-700 flex items-center justify-center mb-4 lg:mb-6 group-hover:scale-110 transition-transform">
                <value.icon className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-lg lg:text-xl font-bold text-secondary mb-2 lg:mb-3">{value.title}</h4>
              <p className="text-sm lg:text-base text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
