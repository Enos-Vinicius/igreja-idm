import { useState } from "react";
import { Heart, Send, CheckCircle } from "lucide-react";

const PrayerSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    request: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to a backend
    setIsSubmitted(true);
    setFormData({ name: "", email: "", request: "" });
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <section id="oracao" className="section-padding bg-section-light">
      <div className="container-main">
        <div className="max-w-2xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
              Pedido de Oração
            </h2>
            <p className="text-muted-foreground text-lg">
              Compartilhe seu pedido conosco. Nossa equipe de intercessores orará por você.
            </p>
          </div>

          {/* Form */}
          {isSubmitted ? (
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                Pedido Enviado!
              </h3>
              <p className="text-muted-foreground">
                Recebemos seu pedido de oração. Nossa equipe estará orando por você.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border/50"
            >
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Digite seu nome"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    E-mail (opcional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="request"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Seu Pedido de Oração
                  </label>
                  <textarea
                    id="request"
                    name="request"
                    value={formData.request}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="textarea-field"
                    placeholder="Compartilhe seu pedido de oração..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Enviar Pedido
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default PrayerSection;
