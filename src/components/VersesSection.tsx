import { Crown, Flame, Zap } from "lucide-react";

const verses = [
  {
    icon: Crown,
    reference: "Apocalipse 3:11",
    text: "Eis que venho sem demora; guarda o que tens, para que ninguém tome a tua coroa.",
  },
  {
    icon: Flame,
    reference: "Hebreus 10:38-39",
    text: "Mas o meu justo viverá da fé; e, se retroceder, nele não se compraz a minha alma. Nós, porém, não somos dos que retrocedem para a perdição; somos, entretanto, da fé, para a conservação da alma.",
  },
  {
    icon: Zap,
    reference: "Romanos 1:16",
    text: "Pois não me envergonho do evangelho, porque é o poder de Deus para a salvação de todo aquele que crê.",
  },
];

const VersesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-golden font-semibold text-sm uppercase tracking-widest">
            Versículos que nos Guiam
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-secondary">
            Versículos
          </h2>
        </div>

        {/* Verses Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {verses.map((verse) => (
            <div
              key={verse.reference}
              className="group p-6 bg-muted/50 rounded-xl border border-border hover:border-golden/30 transition-all duration-300 hover:shadow-lg"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-golden/10 flex items-center justify-center mb-5 group-hover:bg-golden/20 transition-colors">
                <verse.icon className="w-6 h-6 text-golden" />
              </div>

              {/* Reference */}
              <h3 className="text-golden font-bold text-lg mb-3">
                {verse.reference}
              </h3>

              {/* Text */}
              <p className="text-muted-foreground leading-relaxed text-sm">
                {verse.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VersesSection;
