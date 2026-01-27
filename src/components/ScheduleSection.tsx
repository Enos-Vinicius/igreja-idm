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

  // Group events in pairs for display
  const eventPairs = useMemo(() => {
    const pairs: (typeof sortedEvents)[] = [];
    for (let i = 0; i < sortedEvents.length; i += 2) {
      pairs.push(sortedEvents.slice(i, i + 2));
    }
    return pairs;
  }, [sortedEvents]);

  const handlePairPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? eventPairs.length - 1 : prev - 1));
  };

  const handlePairNext = () => {
    setActiveIndex((prev) => (prev === eventPairs.length - 1 ? 0 : prev + 1));
  };

  const handleCreateReminder = (event: typeof sortedEvents[0]) => {
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
        <div className="relative max-w-5xl mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            onClick={handlePairPrev}
            className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-[60] bg-background/80 backdrop-blur-sm hover:bg-background border-border shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handlePairNext}
            className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-[60] bg-background/80 backdrop-blur-sm hover:bg-background border-border shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Cards Grid - 2 per view */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {eventPairs.map((pair, pairIndex) => (
                <div 
                  key={pairIndex} 
                  className="w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-6 px-2"
                >
                  {pair.map((event) => (
                    <div
                      key={event.id}
                      className="bg-background rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                    >
                      {/* Card Header - Redesigned */}
                      <div className="bg-gradient-royal p-6">
                        <div className="flex items-center justify-between mb-4">
                          {/* Date Badge */}
                          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                            <Calendar className="w-5 h-5 text-golden" />
                            <span className="text-2xl font-bold text-gradient-golden">
                              {formatDate(event.nextDate)}
                            </span>
                          </div>
                          {/* Day of Week Badge */}
                          <div className="bg-golden/20 rounded-lg px-3 py-1">
                            <span className="text-golden font-medium text-sm">
                              {event.dayOfWeek}
                            </span>
                          </div>
                        </div>

                        {/* City & State */}
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-golden" />
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {event.city}
                            </h3>
                            <p className="text-white/70 text-sm">{event.state}</p>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-4">
                        {/* Address */}
                        <a
                          href="#localizacao"
                          className="flex items-start gap-3 group hover:text-primary transition-colors"
                        >
                          <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0 group-hover:text-primary" />
                          <p className="text-muted-foreground group-hover:text-primary underline-offset-2 group-hover:underline text-sm">
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

                        {/* Create Reminder Button */}
                        <Button
                          onClick={() => handleCreateReminder(event)}
                          className="w-full mt-4 bg-golden hover:bg-golden-light text-secondary font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Bell className="w-4 h-4 mr-2" />
                          Criar Lembrete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {eventPairs.map((_, index) => (
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
