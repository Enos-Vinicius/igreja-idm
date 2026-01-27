import { MapPin, Clock, ChevronRight } from "lucide-react";

const ScheduleSection = () => {
  const locations = [
    {
      city: "Uberaba",
      address: "Rua Exemplo, 123 - Centro",
      state: "MG",
      schedules: [
        { day: "Domingo", time: "9h e 18h", service: "Culto de Celebração" },
        { day: "Quarta-feira", time: "19h30", service: "Culto de Ensino" },
        { day: "Sexta-feira", time: "19h30", service: "Culto de Oração" },
      ],
      mapLink: "#",
    },
    {
      city: "Conceição das Alagoas",
      address: "Av. Principal, 456 - Centro",
      state: "MG",
      schedules: [
        { day: "Domingo", time: "18h", service: "Culto de Celebração" },
        { day: "Quinta-feira", time: "19h30", service: "Culto de Ensino" },
      ],
      mapLink: "#",
    },
  ];

  return (
    <section id="horarios" className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-sm uppercase tracking-widest">
            Nossos Cultos
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-secondary">
            Horários e Localizações
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Encontre-nos em uma de nossas unidades. Será uma alegria recebê-lo!
          </p>
        </div>

        {/* Location Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {locations.map((location, index) => (
            <div
              key={location.city}
              className="bg-card rounded-2xl shadow-lg overflow-hidden hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Header */}
              <div className="bg-gradient-royal p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{location.city}</h3>
                    <p className="text-white/70 text-sm mt-1">{location.state}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-white/80 text-sm mt-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {location.address}
                </p>
              </div>

              {/* Schedule List */}
              <div className="p-6">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Programação Semanal
                </h4>
                <div className="space-y-4">
                  {location.schedules.map((schedule, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-secondary text-sm">
                          {schedule.day}
                        </p>
                        <p className="text-muted-foreground text-sm truncate">
                          {schedule.service}
                        </p>
                      </div>
                      <span className="text-golden font-bold text-sm">
                        {schedule.time}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Map Link */}
                <a
                  href={location.mapLink}
                  className="mt-6 flex items-center justify-center gap-2 w-full py-3 border-2 border-primary rounded-xl text-primary font-semibold hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <span>Ver no Mapa</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
