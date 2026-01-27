import { MapPin, Clock, Calendar } from "lucide-react";

const ScheduleSection = () => {
  const locations = [
    {
      city: "Uberaba",
      state: "MG",
      address: "Rua Principal, 123 - Centro",
      schedule: [
        { day: "Domingo", time: "09:00 e 19:00" },
        { day: "Quarta-feira", time: "19:30" },
        { day: "Sexta-feira", time: "19:30" },
      ],
    },
    {
      city: "Conceição das Alagoas",
      state: "MG",
      address: "Av. Central, 456 - Centro",
      schedule: [
        { day: "Domingo", time: "19:00" },
        { day: "Quinta-feira", time: "19:30" },
      ],
    },
  ];

  return (
    <section id="horarios" className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-sm uppercase tracking-widest">
            Venha nos Visitar
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-secondary">
            Horários & Locais
          </h2>
        </div>

        {/* Location Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {locations.map((location) => (
            <div
              key={location.city}
              className="bg-background rounded-2xl shadow-xl overflow-hidden hover-lift group"
            >
              {/* Card Header */}
              <div className="bg-gradient-royal p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-golden" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{location.city}</h3>
                    <p className="text-white/70">{location.state}</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Address */}
                <div className="flex items-start gap-3 mb-6 pb-6 border-b border-border">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{location.address}</p>
                </div>

                {/* Schedule */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-secondary font-semibold">
                    <Calendar className="w-5 h-5" />
                    <span>Programação Semanal</span>
                  </div>
                  {location.schedule.map((item) => (
                    <div
                      key={item.day}
                      className="flex items-center justify-between py-3 px-4 bg-muted rounded-lg"
                    >
                      <span className="font-medium text-secondary">{item.day}</span>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
