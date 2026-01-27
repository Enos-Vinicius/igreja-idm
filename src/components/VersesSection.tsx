import { BookOpen } from "lucide-react";

const verses = [
  {
    reference: "Apocalipse 3:11",
    text: "Eis que venho sem demora; guarda o que tens, para que ninguém tome a tua coroa.",
  },
  {
    reference: "Hebreus 10:38",
    text: "Mas o meu justo viverá pela fé; e, se retroceder, nele não se compraz a minha alma.",
  },
  {
    reference: "Salmos 23:1",
    text: "O Senhor é o meu pastor; nada me faltará.",
  },
];

const VersesSection = () => {
  return (
    <section id="versiculos" className="section-padding bg-section-light">
      <div className="container-main">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Palavras de Vida
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Versículos que nos guiam e fortalecem em nossa caminhada com Cristo
          </p>
        </div>

        {/* Verses Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {verses.map((verse, index) => (
            <div
              key={verse.reference}
              className="card-verse group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                  <BookOpen className="w-6 h-6 text-accent-foreground group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <span className="font-serif font-semibold text-primary text-lg">
                  {verse.reference}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed italic">
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
