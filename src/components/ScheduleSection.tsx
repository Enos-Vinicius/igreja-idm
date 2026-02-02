import { useState, useMemo, useEffect } from "react";
import { MapPin, Clock, Calendar, ChevronLeft, ChevronRight, Bell, Baby, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroWorship from "@/assets/hero-worship.jpg";

interface ScheduleEvent {
  id: string;
  title: string;
  city: string;
  state: string;
  address: string;
  mapsUrl: string;
  date: string; // Format: YYYY-MM-DD
  dayOfWeek: string;
  time: string;
  timeValue: number;
}

const scheduleEvents: ScheduleEvent[] = [
  // JANEIRO 2026 - Domingos
  { id: "2026-01-05-uberaba", title: "Culto de Celebração", city: "Uberaba", state: "MG", address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG", date: "2026-01-05", dayOfWeek: "Domingo", time: "19:00", timeValue: 1140 },
  { id: "2026-01-05-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-01-05", dayOfWeek: "Domingo", time: "19:00", timeValue: 1140 },
  { id: "2026-01-12-uberaba", title: "Culto de Celebração", city: "Uberaba", state: "MG", address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG", date: "2026-01-12", dayOfWeek: "Domingo", time: "19:00", timeValue: 1140 },
  { id: "2026-01-12-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-01-12", dayOfWeek: "Domingo", time: "19:00", timeValue: 1140 },
  { id: "2026-01-19-uberaba", title: "Culto de Celebração", city: "Uberaba", state: "MG", address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG", date: "2026-01-19", dayOfWeek: "Domingo", time: "19:00", timeValue: 1140 },
  { id: "2026-01-19-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-01-19", dayOfWeek: "Domingo", time: "19:00", timeValue: 1140 },
  { id: "2026-01-26-uberaba", title: "Culto de Celebração", city: "Uberaba", state: "MG", address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG", date: "2026-01-26", dayOfWeek: "Domingo", time: "19:00", timeValue: 1140 },
  { id: "2026-01-26-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-01-26", dayOfWeek: "Domingo", time: "19:00", timeValue: 1140 },

  // JANEIRO 2026 - Terças (Culto de Oração - Uberaba)
  { id: "2026-01-07-uberaba", title: "Culto de Oração", city: "Uberaba", state: "MG", address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG", date: "2026-01-07", dayOfWeek: "Terça-feira", time: "06:00 - 18:00", timeValue: 360 },
  { id: "2026-01-14-uberaba", title: "Culto de Oração", city: "Uberaba", state: "MG", address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG", date: "2026-01-14", dayOfWeek: "Terça-feira", time: "06:00 - 18:00", timeValue: 360 },
  { id: "2026-01-21-uberaba", title: "Culto de Oração", city: "Uberaba", state: "MG", address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG", date: "2026-01-21", dayOfWeek: "Terça-feira", time: "06:00 - 18:00", timeValue: 360 },
  { id: "2026-01-28-uberaba", title: "Culto de Oração", city: "Uberaba", state: "MG", address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG", date: "2026-01-28", dayOfWeek: "Terça-feira", time: "06:00 - 18:00", timeValue: 360 },

  // JANEIRO 2026 - Terças (Culto de Mulheres - Conceição das Alagoas)
  { id: "2026-01-07-conceicao-mulheres", title: "Culto de Mulheres", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-01-07", dayOfWeek: "Terça-feira", time: "19:30", timeValue: 1170 },
  { id: "2026-01-14-conceicao-mulheres", title: "Culto de Mulheres", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-01-14", dayOfWeek: "Terça-feira", time: "19:30", timeValue: 1170 },
  { id: "2026-01-21-conceicao-mulheres", title: "Culto de Mulheres", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-01-21", dayOfWeek: "Terça-feira", time: "19:30", timeValue: 1170 },
  { id: "2026-01-28-conceicao-mulheres", title: "Culto de Mulheres", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-01-28", dayOfWeek: "Terça-feira", time: "19:30", timeValue: 1170 },

  // JANEIRO 2026 - Quintas
  { id: "2026-01-01-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-01-01", dayOfWeek: "Quinta-feira", time: "19:30", timeValue: 1170 },
  { id: "2026-01-08-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-01-08", dayOfWeek: "Quinta-feira", time: "19:30", timeValue: 1170 },
  { id: "2026-01-15-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-01-15", dayOfWeek: "Quinta-feira", time: "19:30", timeValue: 1170 },
  { id: "2026-01-22-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-01-22", dayOfWeek: "Quinta-feira", time: "19:30", timeValue: 1170 },
  { id: "2026-01-29-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-01-29", dayOfWeek: "Quinta-feira", time: "19:30", timeValue: 1170 },

  // FEVEREIRO 2026 - Domingos
  { id: "2026-02-01-uberaba", title: "Culto de Celebração", city: "Uberaba", state: "MG", address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG", date: "2026-02-01", dayOfWeek: "Domingo", time: "19:00", timeValue: 1140 },
  { id: "2026-02-01-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-02-01", dayOfWeek: "Domingo", time: "19:00", timeValue: 1140 },
  { id: "2026-02-08-uberaba", title: "Culto de Celebração", city: "Uberaba", state: "MG", address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG", date: "2026-02-08", dayOfWeek: "Domingo", time: "19:00", timeValue: 1140 },
  { id: "2026-02-08-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-02-08", dayOfWeek: "Domingo", time: "19:00", timeValue: 1140 },
  { id: "2026-02-15-uberaba", title: "Culto de Celebração", city: "Uberaba", state: "MG", address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG", date: "2026-02-15", dayOfWeek: "Domingo", time: "19:00", timeValue: 1140 },
  { id: "2026-02-15-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-02-15", dayOfWeek: "Domingo", time: "19:00", timeValue: 1140 },
  { id: "2026-02-22-uberaba", title: "Culto de Celebração", city: "Uberaba", state: "MG", address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG", date: "2026-02-22", dayOfWeek: "Domingo", time: "19:00", timeValue: 1140 },
  { id: "2026-02-22-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-02-22", dayOfWeek: "Domingo", time: "19:00", timeValue: 1140 },

  // FEVEREIRO 2026 - Terças (Culto de Oração - Uberaba)
  { id: "2026-02-03-uberaba", title: "Culto de Oração", city: "Uberaba", state: "MG", address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG", date: "2026-02-03", dayOfWeek: "Terça-feira", time: "06:00 - 18:00", timeValue: 360 },
  { id: "2026-02-10-uberaba", title: "Culto de Oração", city: "Uberaba", state: "MG", address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG", date: "2026-02-10", dayOfWeek: "Terça-feira", time: "06:00 - 18:00", timeValue: 360 },
  { id: "2026-02-17-uberaba", title: "Culto de Oração", city: "Uberaba", state: "MG", address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG", date: "2026-02-17", dayOfWeek: "Terça-feira", time: "06:00 - 18:00", timeValue: 360 },
  { id: "2026-02-24-uberaba", title: "Culto de Oração", city: "Uberaba", state: "MG", address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG", date: "2026-02-24", dayOfWeek: "Terça-feira", time: "06:00 - 18:00", timeValue: 360 },

  // FEVEREIRO 2026 - Terças (Culto de Mulheres - Conceição das Alagoas)
  { id: "2026-02-03-conceicao-mulheres", title: "Culto de Mulheres", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-02-03", dayOfWeek: "Terça-feira", time: "19:30", timeValue: 1170 },
  { id: "2026-02-10-conceicao-mulheres", title: "Culto de Mulheres", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-02-10", dayOfWeek: "Terça-feira", time: "19:30", timeValue: 1170 },
  { id: "2026-02-17-conceicao-mulheres", title: "Culto de Mulheres", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-02-17", dayOfWeek: "Terça-feira", time: "19:30", timeValue: 1170 },
  { id: "2026-02-24-conceicao-mulheres", title: "Culto de Mulheres", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-02-24", dayOfWeek: "Terça-feira", time: "19:30", timeValue: 1170 },

  // FEVEREIRO 2026 - Quintas
  { id: "2026-02-05-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-02-05", dayOfWeek: "Quinta-feira", time: "19:30", timeValue: 1170 },
  { id: "2026-02-12-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-02-12", dayOfWeek: "Quinta-feira", time: "19:30", timeValue: 1170 },
  { id: "2026-02-19-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-02-19", dayOfWeek: "Quinta-feira", time: "19:30", timeValue: 1170 },
  { id: "2026-02-26-conceicao", title: "Culto de Celebração", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-02-26", dayOfWeek: "Quinta-feira", time: "19:30", timeValue: 1170 },

  // FEVEREIRO 2026 - Sextas (Culto de Homens - Quinzenal)
  { id: "2026-02-13-conceicao", title: "Culto de Homens", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-02-13", dayOfWeek: "Sexta-feira", time: "19:30", timeValue: 1170 },
  { id: "2026-02-27-conceicao", title: "Culto de Homens", city: "Conceição das Alagoas", state: "MG", address: "R. Santa Rita, 149 - Centro", mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Conceição+das+Alagoas+-+MG", date: "2026-02-27", dayOfWeek: "Sexta-feira", time: "19:30", timeValue: 1170 },
];

const getEventDate = (event: ScheduleEvent): Date => {
  return new Date(event.date + 'T' + event.time.split(' - ')[0] + ':00');
};

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
};

const ScheduleSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);

  const sortedEvents = useMemo(() => {
    const now = new Date();
    return [...scheduleEvents]
      .map((event) => ({
        ...event,
        eventDate: getEventDate(event),
      }))
      .filter((event) => event.eventDate >= now) // Only show future/current events
      .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  }, []);

  // Get all events on the same day as current event
  const sameDayEvents = useMemo(() => {
    if (sortedEvents.length === 0 || activeIndex >= sortedEvents.length) return [];

    const currentEvent = sortedEvents[activeIndex];
    return sortedEvents
      .map((event, index) => ({ event, index }))
      .filter(({ event }) => event.date === currentEvent.date);
  }, [sortedEvents, activeIndex]);

  // Check if there are multiple events on the same day
  const hasMultipleEventsOnSameDay = sameDayEvents.length > 1;

  // Auto-play effect - cycles through same-day events
  useEffect(() => {
    if (!autoPlayEnabled || !hasMultipleEventsOnSameDay) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        // Find current position in same-day events
        const currentPositionInSameDay = sameDayEvents.findIndex(({ index }) => index === prev);

        if (currentPositionInSameDay === -1) return prev;

        // Move to next same-day event (cycle back to first if at end)
        const nextPositionInSameDay = (currentPositionInSameDay + 1) % sameDayEvents.length;
        return sameDayEvents[nextPositionInSameDay].index;
      });
    }, 3000); // Auto-advance every 3 seconds

    return () => clearInterval(interval);
  }, [autoPlayEnabled, hasMultipleEventsOnSameDay, sameDayEvents]);

  const handleUserInteraction = () => {
    setAutoPlayEnabled(false);
  };

  const handlePrev = () => {
    handleUserInteraction();
    setActiveIndex((prev) => (prev === 0 ? sortedEvents.length - 1 : prev - 1));
  };

  const handleNext = () => {
    handleUserInteraction();
    setActiveIndex((prev) => (prev >= sortedEvents.length - 1 ? 0 : prev + 1));
  };

  const handleCreateReminder = (event: typeof sortedEvents[0]) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Format date for calendar (YYYYMMDD)
    const dateStr = event.date.replace(/-/g, '');

    // Format time for calendar (remove range, use start time)
    const timeStart = event.time.split(' - ')[0].replace(':', '');
    const timeEnd = event.time.includes(' - ')
      ? event.time.split(' - ')[1].replace(':', '')
      : timeStart;

    const title = encodeURIComponent(`${event.title} - ${event.city}`);
    const location = encodeURIComponent(event.address + ', ' + event.city + ' - ' + event.state);

    if (isMobile) {
      // Mobile: Create and download .ics file for better compatibility
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Igreja do Deus de Maravilhas//Eventos//PT
BEGIN:VEVENT
UID:${event.id}@igrejadodeusdemaravilhas.com
DTSTART:${dateStr}T${timeStart}00
DTEND:${dateStr}T${timeEnd}00
SUMMARY:${event.title} - ${event.city}
LOCATION:${event.address}, ${event.city} - ${event.state}
DESCRIPTION:${event.title} na ${event.city}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT1H
DESCRIPTION:Lembrete: ${event.title} em 1 hora
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

      // Create blob and download
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${event.title.replace(/\s+/g, '_')}_${event.date}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } else {
      // Desktop: Open Google Calendar
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}T${timeStart}00/${dateStr}T${timeEnd}00&location=${location}&sf=true&output=xml`;
      window.open(googleCalendarUrl, '_blank');
    }
  };

  // Get card position and style based on distance from center
  const getCardStyle = (index: number) => {
    // Calculate relative position from active index
    let relativePos = index - activeIndex;

    // Wrap around for circular carousel
    if (relativePos > sortedEvents.length / 2) relativePos -= sortedEvents.length;
    if (relativePos < -sortedEvents.length / 2) relativePos += sortedEvents.length;

    // Only show positions -2, -1, 0, 1, 2
    if (relativePos < -2 || relativePos > 2) return null;

    // Center card (position 0)
    const isCenter = relativePos === 0;

    // Calculate visual properties based on distance from center
    let translateX = 0;
    let scale = 1;
    let zIndex = 10;
    let opacity = 1;

    if (relativePos === 0) {
      // Center card - largest
      translateX = 0;
      scale = 1;
      zIndex = 30;
      opacity = 1;
    } else if (relativePos === -1) {
      // First left (first depth level)
      translateX = -280;
      scale = 0.75;
      zIndex = 20;
      opacity = 0.7;
    } else if (relativePos === 1) {
      // First right (first depth level)
      translateX = 280;
      scale = 0.75;
      zIndex = 20;
      opacity = 0.7;
    } else if (relativePos === -2) {
      // Second left (second depth level)
      translateX = -480;
      scale = 0.55;
      zIndex = 10;
      opacity = 0.4;
    } else if (relativePos === 2) {
      // Second right (second depth level)
      translateX = 480;
      scale = 0.55;
      zIndex = 10;
      opacity = 0.4;
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
        <div className="relative w-full mx-auto overflow-hidden">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-[40] bg-background/80 backdrop-blur-sm hover:bg-background border-border shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-[40] bg-background/80 backdrop-blur-sm hover:bg-background border-border shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Fade Gradient Overlays - Desktop Only */}
          <div
            className="hidden md:block absolute left-0 top-0 bottom-0 w-[600px] z-[35] pointer-events-none"
            style={{
              background: 'linear-gradient(to right, hsl(var(--muted)) 0%, hsl(var(--muted)) 15%, transparent 100%)',
            }}
          />
          <div
            className="hidden md:block absolute right-0 top-0 bottom-0 w-[600px] z-[35] pointer-events-none"
            style={{
              background: 'linear-gradient(to left, hsl(var(--muted)) 0%, hsl(var(--muted)) 15%, transparent 100%)',
            }}
          />

          {/* Cards Container */}
          <div className="flex items-center justify-center py-8 h-[500px] md:h-[550px]">
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
                    className={`bg-background rounded-xl shadow-xl overflow-hidden transition-shadow duration-300 flex flex-col ${
                      style.isCenter
                        ? 'w-72 md:w-80 h-[440px] shadow-2xl'
                        : 'w-72 md:w-80 h-[440px]'
                    }`}
                  >
                    {/* Card Header with Background Image */}
                    <div className="relative p-4 md:p-5 overflow-hidden flex-shrink-0">
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
                        <div className="flex items-center justify-between mb-3">
                          {/* Date Badge */}
                          <div className={`flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg ${
                            style.isCenter ? 'px-3 py-2' : 'px-2.5 py-1.5'
                          }`}>
                            <Calendar className={style.isCenter ? 'w-5 h-5 text-golden' : 'w-4 h-4 text-golden'} />
                            <span className={`font-bold text-gradient-golden ${
                              style.isCenter ? 'text-2xl' : 'text-xl'
                            }`}>
                              {formatDate(event.eventDate)}
                            </span>
                          </div>
                          {/* Day of Week Badge */}
                          <div className={`bg-golden/25 backdrop-blur-sm rounded-lg ${
                            style.isCenter ? 'px-3 py-1.5' : 'px-2.5 py-1'
                          }`}>
                            <span className={`text-golden font-medium ${
                              style.isCenter ? 'text-sm' : 'text-xs'
                            }`}>
                              {event.dayOfWeek}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <div className="mb-2">
                          <h3 className={`font-bold text-white ${
                            style.isCenter ? 'text-2xl' : 'text-lg'
                          }`}>
                            {event.title}
                          </h3>
                        </div>

                        {/* City & State */}
                        <div className="flex items-center gap-2">
                          <MapPin className={style.isCenter ? 'w-5 h-5 text-golden' : 'w-4 h-4 text-golden'} />
                          <div>
                            <p className={`font-semibold text-white ${
                              style.isCenter ? 'text-base' : 'text-sm'
                            }`}>
                              {event.city}
                            </p>
                            <p className={`text-white/70 ${
                              style.isCenter ? 'text-xs' : 'text-[10px]'
                            }`}>{event.state}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className={`flex-1 flex flex-col justify-between ${
                      style.isCenter ? 'p-5 space-y-4' : 'p-4 space-y-3'
                    }`}>
                      <div className="space-y-3">
                        {/* Address */}
                        <a
                          href={event.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2.5 group hover:text-primary transition-colors"
                        >
                          <MapPin className={`text-muted-foreground mt-0.5 flex-shrink-0 group-hover:text-primary ${
                            style.isCenter ? 'w-5 h-5' : 'w-4 h-4'
                          }`} />
                          <p className={`text-muted-foreground group-hover:text-primary underline-offset-2 group-hover:underline ${
                            style.isCenter ? 'text-sm line-clamp-3' : 'text-xs line-clamp-2'
                          }`}>
                            {event.address}
                          </p>
                        </a>

                        {/* Time with Kids Icons */}
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5">
                            <Clock className={`text-muted-foreground ${
                              style.isCenter ? 'w-5 h-5' : 'w-4 h-4'
                            }`} />
                            <span className={`text-foreground font-semibold ${
                              style.isCenter ? 'text-lg' : 'text-base'
                            }`}>
                              {event.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div title="Escolinha de crianças" className="cursor-help">
                              <Users
                                className={`text-golden ${
                                  style.isCenter ? 'w-6 h-6' : 'w-5 h-5'
                                }`}
                              />
                            </div>
                            <div title="Ambiente para trocar fralda" className="cursor-help">
                              <Baby
                                className={`text-golden ${
                                  style.isCenter ? 'w-6 h-6' : 'w-5 h-5'
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Welcome Message */}
                        <p className={`text-muted-foreground/70 italic text-center ${
                          style.isCenter ? 'text-xs' : 'text-[10px]'
                        }`}>
                          {index % 3 === 0 && "Esperamos por você e sua família!"}
                          {index % 3 === 1 && "Um lugar de novos recomeços."}
                          {index % 3 === 2 && "Entrada gratuita / Aberto ao público."}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {/* How to Get There Button */}
                        <Button
                          onClick={() => window.open(event.mapsUrl, '_blank')}
                          variant="outline"
                          className={`w-full border-primary text-primary hover:bg-primary/10 font-semibold transition-all duration-300 ${
                            style.isCenter ? 'text-sm py-5' : 'text-xs py-3'
                          }`}
                        >
                          <MapPin className={style.isCenter ? 'w-4 h-4 mr-2' : 'w-3.5 h-3.5 mr-1.5'} />
                          Como Chegar
                        </Button>

                        {/* Create Reminder Button */}
                        <Button
                          onClick={() => handleCreateReminder(event)}
                          className={`w-full bg-golden hover:bg-golden-light text-secondary font-semibold shadow-md hover:shadow-lg transition-all duration-300 ${
                            style.isCenter ? 'text-sm py-5' : 'text-xs py-3'
                          }`}
                        >
                          <Bell
                            className={style.isCenter ? 'w-4 h-4 mr-2' : 'w-3.5 h-3.5 mr-1.5'}
                            style={{
                              animation: style.isCenter ? 'bell-ring 2s ease-in-out infinite' : 'none',
                            }}
                          />
                          <style>{`
                            @keyframes bell-ring {
                              0%, 100% { transform: rotate(0deg); }
                              10% { transform: rotate(15deg); }
                              20% { transform: rotate(-15deg); }
                              30% { transform: rotate(10deg); }
                              40% { transform: rotate(-10deg); }
                              50% { transform: rotate(0deg); }
                            }
                          `}</style>
                          Criar Lembrete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {sortedEvents.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                handleUserInteraction();
                setActiveIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? "bg-golden w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
    </section>
  );
};

export default ScheduleSection;
