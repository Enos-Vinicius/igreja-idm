import { useState, useEffect, useMemo } from "react";
import { MapPin, Clock, Calendar, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScheduleEvent {
  id: string;
  city: string;
  state: string;
  address: string;
  dayOfWeek: string;
  dayNumber: number; // 0 = Sunday, 1 = Monday, etc.
  time: string;
  timeValue: number; // time in minutes for sorting (e.g., 19:30 = 1170)
}

const scheduleEvents: ScheduleEvent[] = [
  {
    id: "uberaba-domingo-09",
    city: "Uberaba",
    state: "MG",
    address: "Rua Principal, 123 - Centro",
    dayOfWeek: "Domingo",
    dayNumber: 0,
    time: "09:00",
    timeValue: 540,
  },
  {
    id: "uberaba-domingo-19",
    city: "Uberaba",
    state: "MG",
    address: "Rua Principal, 123 - Centro",
    dayOfWeek: "Domingo",
    dayNumber: 0,
    time: "19:00",
    timeValue: 1140,
  },
  {
    id: "uberaba-quarta",
    city: "Uberaba",
    state: "MG",
    address: "Rua Principal, 123 - Centro",
    dayOfWeek: "Quarta-feira",
    dayNumber: 3,
    time: "19:30",
    timeValue: 1170,
  },
  {
    id: "uberaba-sexta",
    city: "Uberaba",
    state: "MG",
    address: "Rua Principal, 123 - Centro",
    dayOfWeek: "Sexta-feira",
    dayNumber: 5,
    time: "19:30",
    timeValue: 1170,
  },
  {
    id: "conceicao-domingo",
    city: "Conceição das Alagoas",
    state: "MG",
    address: "Av. Central, 456 - Centro",
    dayOfWeek: "Domingo",
    dayNumber: 0,
    time: "19:00",
    timeValue: 1140,
  },
  {
    id: "conceicao-quinta",
    city: "Conceição das Alagoas",
    state: "MG",
    address: "Av. Central, 456 - Centro",
    dayOfWeek: "Quinta-feira",
    dayNumber: 4,
    time: "19:30",
    timeValue: 1170,
  },
];

const getNextEventDate = (event: ScheduleEvent, now: Date): Date => {
  const currentDay = now.getDay();
  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

  let daysUntilEvent = event.dayNumber - currentDay;

  // If it's the same day but the event time has passed, go to next week
  if (daysUntilEvent === 0 && currentTimeInMinutes >= event.timeValue) {
    daysUntilEvent = 7;
  } else if (daysUntilEvent < 0) {
    daysUntilEvent += 7;
  }

  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + daysUntilEvent);
  nextDate.setHours(Math.floor(event.timeValue / 60), event.timeValue % 60, 0, 0);

  return nextDate;
};

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
};

const ScheduleSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const sortedEvents = useMemo(() => {
    const now = new Date();
    return [...scheduleEvents]
      .map((event) => ({
        ...event,
        nextDate: getNextEventDate(event, now),
      }))
      .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? sortedEvents.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === sortedEvents.length - 1 ? 0 : prev + 1));
  };

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const totalItems = sortedEvents.length;
    
    // Handle wrapping for circular carousel
    let normalizedDiff = diff;
    if (diff > totalItems / 2) normalizedDiff = diff - totalItems;
    if (diff < -totalItems / 2) normalizedDiff = diff + totalItems;

    const absDistance = Math.abs(normalizedDiff);

    if (absDistance === 0) {
      return {
        transform: "translateX(-50%) scale(1)",
        zIndex: 50,
        opacity: 1,
        left: "50%",
      };
    } else if (absDistance === 1) {
      const direction = normalizedDiff > 0 ? 1 : -1;
      return {
        transform: `translateX(${direction * 60 - 50}%) scale(0.85)`,
        zIndex: 40,
        opacity: 0.9,
        left: "50%",
      };
    } else if (absDistance === 2) {
      const direction = normalizedDiff > 0 ? 1 : -1;
      return {
        transform: `translateX(${direction * 110 - 50}%) scale(0.7)`,
        zIndex: 30,
        opacity: 0.5,
        left: "50%",
      };
    } else {
      return {
        transform: "translateX(-50%) scale(0.5)",
        zIndex: 10,
        opacity: 0,
        left: "50%",
        pointerEvents: "none" as const,
      };
    }
  };

  const handleCreateReminder = (event: typeof sortedEvents[0]) => {
    // For now, just show an alert - can be integrated with calendar API later
    alert(`Lembrete criado para ${event.dayOfWeek}, ${formatDate(event.nextDate)} às ${event.time} em ${event.city}!`);
  };

  return (
    <section id="horarios" className="py-24 bg-muted overflow-hidden">
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

        {/* Carousel Container */}
        <div className="relative h-[480px] max-w-6xl mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-[60] bg-background/80 backdrop-blur-sm hover:bg-background border-border shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-[60] bg-background/80 backdrop-blur-sm hover:bg-background border-border shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Cards */}
          <div className="relative w-full h-full">
            {sortedEvents.map((event, index) => {
              const style = getCardStyle(index);
              const isActive = index === activeIndex;

              return (
                <div
                  key={event.id}
                  className="absolute top-0 w-[320px] md:w-[380px] transition-all duration-500 ease-out cursor-pointer"
                  style={style}
                  onClick={() => setActiveIndex(index)}
                >
                  <div
                    className={`bg-background rounded-2xl shadow-2xl overflow-hidden h-full transition-shadow duration-300 ${
                      isActive ? "shadow-golden/20" : ""
                    }`}
                  >
                    {/* Card Header - Date, City, State */}
                    <div className="bg-gradient-royal p-6 relative overflow-hidden">
                      {/* Decorative circles */}
                      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-golden/10" />
                      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5" />

                      <div className="relative z-10">
                        {/* Date */}
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-5 h-5 text-golden" />
                          <span className="text-4xl font-bold text-gradient-golden">
                            {formatDate(event.nextDate)}
                          </span>
                        </div>

                        {/* City & State */}
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-golden" />
                          <div>
                            <h3 className="text-2xl font-bold text-white">
                              {event.city}
                            </h3>
                            <p className="text-white/70 text-sm">{event.state}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      {/* Address */}
                      <a
                        href="#localizacao"
                        className="flex items-start gap-3 group hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0 group-hover:text-primary" />
                        <p className="text-muted-foreground group-hover:text-primary underline-offset-2 group-hover:underline">
                          {event.address}
                        </p>
                      </a>

                      {/* Time */}
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <span className="text-foreground font-semibold text-lg">
                          {event.time}
                        </span>
                      </div>

                      {/* Day of Week */}
                      <div className="inline-block px-4 py-2 bg-muted rounded-full">
                        <span className="text-secondary font-medium">
                          {event.dayOfWeek}
                        </span>
                      </div>

                      {/* Create Reminder Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateReminder(event);
                        }}
                        className="w-full mt-4 bg-golden hover:bg-golden-light text-secondary font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Criar Lembrete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {sortedEvents.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "bg-golden w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
