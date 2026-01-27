import { Heart, Users, BookOpen, Calendar, MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  const features = [
    {
      icon: Heart,
      title: "Comunidade Acolhedora",
      description: "Um lugar onde você é bem-vindo e amado como família.",
    },
    {
      icon: Users,
      title: "Grupos de Vida",
      description: "Conecte-se com pessoas que compartilham sua jornada de fé.",
    },
    {
      icon: BookOpen,
      title: "Estudos Bíblicos",
      description: "Aprofunde seu conhecimento nas Escrituras Sagradas.",
    },
    {
      icon: Calendar,
      title: "Eventos Especiais",
      description: "Celebrações e encontros que fortalecem nossa comunidade.",
    },
  ];

  const schedules = [
    { day: "Domingo", time: "09:00", event: "Escola Bíblica Dominical" },
    { day: "Domingo", time: "18:00", event: "Culto de Celebração" },
    { day: "Quarta-feira", time: "19:30", event: "Culto de Oração" },
    { day: "Sexta-feira", time: "20:00", event: "Culto de Jovens" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">M</span>
            </div>
            <span className="font-semibold text-foreground">Minha Igreja</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#sobre" className="text-muted-foreground hover:text-foreground transition-colors">Sobre</a>
            <a href="#horarios" className="text-muted-foreground hover:text-foreground transition-colors">Horários</a>
            <a href="#contato" className="text-muted-foreground hover:text-foreground transition-colors">Contato</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block px-4 py-2 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-6">
              Bem-vindo à nossa comunidade
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Um lugar de fé, amor e esperança
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a nós nessa jornada de transformação espiritual. 
              Aqui você encontrará uma família que te acolhe de braços abertos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2">
                Visitar <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline">
                Conhecer mais
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="sobre" className="relative z-10 py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O que oferecemos
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubra as diversas formas de crescer espiritualmente e se conectar com nossa comunidade.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="horarios" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Horários de Culto
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Venha nos visitar! Temos programações especiais durante toda a semana.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-0">
                {schedules.map((schedule, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 ${
                      index !== schedules.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{schedule.event}</p>
                        <p className="text-sm text-muted-foreground">{schedule.day}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-primary">{schedule.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="relative z-10 py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Entre em Contato
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Estamos prontos para te receber. Entre em contato conosco!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Endereço</h3>
                <p className="text-sm text-muted-foreground">
                  Rua Exemplo, 123<br />
                  Centro - Cidade/UF
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Telefone</h3>
                <p className="text-sm text-muted-foreground">
                  (00) 0000-0000<br />
                  (00) 99999-9999
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">E-mail</h3>
                <p className="text-sm text-muted-foreground">
                  contato@igreja.com.br
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-card/80 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 Minha Igreja. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
