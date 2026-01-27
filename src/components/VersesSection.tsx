import { BookOpen } from "lucide-react";

const verses = [
  {
    reference: "Apocalipse 3:11",
    title: "Perseverança",
    text: "Eis que venho sem demora; guarda o que tens, para que ninguém tome a tua coroa.",
  },
  {
    reference: "Hebreus 10:38",
    title: "Fé",
    text: "Mas o meu justo viverá pela fé; e, se retroceder, nele não se compraz a minha alma.",
  },
  {
    reference: "Salmos 23:1",
    title: "Confiança",
    text: "O Senhor é o meu pastor; nada me faltará.",
  },
];

const VersesSection = () => {
  return (
    <section id="versiculos" className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Versículos que nos Guiam
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Palavras de vida que fortalecem nossa caminhada
          </p>
        </div>

        {/* Verses Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {verses.map((verse) => (
            <div
              key={verse.reference}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-sm">
                    {verse.reference}
                  </span>
                  <span className="text-accent font-medium text-sm ml-2">
                    — {verse.title}
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">
                "{verse.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VersesSection;
