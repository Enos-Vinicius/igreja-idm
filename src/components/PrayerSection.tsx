import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrayerSection = () => {
  return (
    <section className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="text-golden font-semibold text-sm uppercase tracking-widest">
              Estamos Aqui por Você
            </span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-secondary">
              Pedido de Oração
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Compartilhe seu pedido de oração conosco. Nossa equipe está pronta 
              para interceder por você.
            </p>
          </div>

          {/* Prayer Form */}
          <form className="bg-background rounded-2xl shadow-xl p-8">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium text-secondary mb-2"
                >
                  Seu Nome
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Digite seu nome"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-secondary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label 
                  htmlFor="phone" 
                  className="block text-sm font-medium text-secondary mb-2"
                >
                  Telefone (opcional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-secondary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label 
                htmlFor="prayer" 
                className="block text-sm font-medium text-secondary mb-2"
              >
                Seu Pedido de Oração
              </label>
              <textarea
                id="prayer"
                rows={5}
                placeholder="Compartilhe seu pedido de oração..."
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-secondary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-golden to-golden-light hover:from-golden-light hover:to-golden text-secondary font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Send className="w-5 h-5 mr-2" />
              Enviar Pedido de Oração
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default PrayerSection;
