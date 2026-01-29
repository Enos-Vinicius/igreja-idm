import { useState, useMemo } from "react";
import { MapPin, Clock, Calendar, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroWorship from "@/assets/hero-worship.jpg";

interface ScheduleEvent {
  id: string;
  city: string;
  state: string;
  address: string;
  dayOfWeek: string;
  dayNumber: number;
  time: string;
  timeValue: number;
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
    setActiveIndex((prev) => (prev === 0 ? sortedEvents.length - 2 : prev - 2));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev >= sortedEvents.length - 2 ? 0 : prev + 2));
  };

  const handleCreateReminder = (event: typeof sortedEvents[0]) => {
    alert(`Lembrete criado para ${event.dayOfWeek}, ${formatDate(event.nextDate)} às ${event.time} em ${event.city}!`);
  };

  // Get card position and style based on distance from center
  const getCardStyle = (index: number) => {
    // Two center cards at positions 0 and 1 relative to activeIndex
    const centerLeft = activeIndex;
    const centerRight = activeIndex + 1;
    
    // Calculate relative position (-2, -1, 0, 1, 2, 3)
    let relativePos = index - centerLeft;
    
    // Wrap around for infinite feel
    if (relativePos > sortedEvents.length / 2) relativePos -= sortedEvents.length;
    if (relativePos < -sortedEvents.length / 2) relativePos += sortedEvents.length;

    // Only show positions -2, -1, 0, 1, 2, 3
    if (relativePos < -2 || relativePos > 3) return null;

    // Center cards (positions 0 and 1)
    const isCenter = relativePos === 0 || relativePos === 1;
    
    // Calculate visual properties
    let translateX = 0;
    let scale = 1;
    let zIndex = 10;
    let opacity = 1;

    if (relativePos === 0) {
      // Left center card
      translateX = -140;
      scale = 1;
      zIndex = 20;
    } else if (relativePos === 1) {
      // Right center card
      translateX = 140;
      scale = 1;
      zIndex = 20;
    } else if (relativePos === -1) {
      // Far left (first depth level)
      translateX = -340;
      scale = 0.85;
      zIndex = 15;
      opacity = 0.85;
    } else if (relativePos === 2) {
      // Far right (first depth level)
      translateX = 340;
      scale = 0.85;
      zIndex = 15;
      opacity = 0.85;
    } else if (relativePos === -2) {
      // Extreme left (second depth level)
      translateX = -500;
      scale = 0.7;
      zIndex = 10;
      opacity = 0.7;
    } else if (relativePos === 3) {
      // Extreme right (second depth level)
      translateX = 500;
      scale = 0.7;
      zIndex = 10;
      opacity = 0.7;
    }

    return {
      transform: `translateX(${translateX}px) scale(${scale})`,
      zIndex,
      opacity,
      isCenter,
    };
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
        <div className="relative w-full mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-[70] bg-background/80 backdrop-blur-sm hover:bg-background border-border shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-[70] bg-background/80 backdrop-blur-sm hover:bg-background border-border shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Fade Gradient Overlays */}
          <div
            className="absolute left-0 top-0 bottom-0 w-64 md:w-96 z-[60] pointer-events-none"
            style={{
              background: 'linear-gradient(to right, hsl(var(--muted)) 0%, hsl(var(--muted)) 30%, transparent 100%)',
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-64 md:w-96 z-[60] pointer-events-none"
            style={{
              background: 'linear-gradient(to left, hsl(var(--muted)) 0%, hsl(var(--muted)) 30%, transparent 100%)',
            }}
          />

          {/* Cards Container */}
          <div className="flex items-center justify-center py-8 h-[400px]">
            {sortedEvents.map((event, index) => {
              const style = getCardStyle(index);
              if (!style) return null;

              return (
                <div
                  key={event.id}
                  className="absolute transition-all duration-500 ease-out"
                  style={{
                    transform: style.transform,
                    zIndex: style.zIndex,
                    opacity: style.opacity,
                  }}
                >
                  <div
                    className={`bg-background rounded-xl shadow-xl overflow-hidden transition-shadow duration-300 w-64 ${
                      style.isCenter ? 'shadow-2xl' : ''
                    }`}
                  >
                    {/* Card Header with Background Image */}
                    <div className="relative p-3 overflow-hidden">
                      {/* Background Image */}
                      <div className="absolute inset-0">
                        <img 
                          src={heroWorship} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 to-secondary/90" />
                      </div>
                      
                      {/* Header Content */}
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          {/* Date Badge */}
                          <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-md px-2 py-1">
                            <Calendar className="w-3.5 h-3.5 text-golden" />
                            <span className="text-lg font-bold text-gradient-golden">
                              {formatDate(event.nextDate)}
                            </span>
                          </div>
                          {/* Day of Week Badge */}
                          <div className="bg-golden/25 backdrop-blur-sm rounded-md px-2 py-0.5">
                            <span className="text-golden font-medium text-xs">
                              {event.dayOfWeek}
                            </span>
                          </div>
                        </div>

                        {/* City & State */}
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-golden" />
                          <div>
                            <h3 className="text-sm font-bold text-white">
                              {event.city}
                            </h3>
                            <p className="text-white/70 text-xs">{event.state}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-3 space-y-2">
                      {/* Address */}
                      <a
                        href="#localizacao"
                        className="flex items-start gap-2 group hover:text-primary transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0 group-hover:text-primary" />
                        <p className="text-muted-foreground group-hover:text-primary underline-offset-2 group-hover:underline text-xs line-clamp-2">
                          {event.address}
                        </p>
                      </a>

                      {/* Time */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-foreground font-semibold text-sm">
                          {event.time}
                        </span>
                      </div>

                      {/* Create Reminder Button */}
                      <Button
                        onClick={() => handleCreateReminder(event)}
                        size="sm"
                        className="w-full mt-2 bg-golden hover:bg-golden-light text-secondary font-semibold shadow-md hover:shadow-lg transition-all duration-300 text-xs py-1"
                      >
                        <Bell className="w-3 h-3 mr-1" />
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
          {Array.from({ length: Math.ceil(sortedEvents.length / 2) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index * 2)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                Math.floor(activeIndex / 2) === index
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
