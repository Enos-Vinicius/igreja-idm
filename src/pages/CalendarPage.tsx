import { useState } from "react";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, addYears, subYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/DashboardLayout";

type ViewType = "day" | "week" | "month" | "year";

// Mock events for demonstration
const mockEvents = [
  { id: 1, title: "Culto Dominical", date: new Date(2026, 0, 25), time: "09:00", color: "bg-primary" },
  { id: 2, title: "Reunião de Oração", date: new Date(2026, 0, 27), time: "19:00", color: "bg-accent" },
  { id: 3, title: "Ensaio do Louvor", date: new Date(2026, 0, 28), time: "20:00", color: "bg-destructive" },
  { id: 4, title: "Estudo Bíblico", date: new Date(2026, 0, 29), time: "19:30", color: "bg-primary" },
  { id: 5, title: "Culto de Jovens", date: new Date(2026, 0, 31), time: "19:00", color: "bg-accent" },
];

const hours = Array.from({ length: 24 }, (_, i) => i);

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");

  const navigatePrev = () => {
    switch (view) {
      case "day":
        setCurrentDate(addDays(currentDate, -1));
        break;
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case "year":
        setCurrentDate(subYears(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (view) {
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "year":
        setCurrentDate(addYears(currentDate, 1));
        break;
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(event => isSameDay(event.date, date));
  };

  const getTitle = () => {
    switch (view) {
      case "day":
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
      case "week":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, "d MMM", { locale: ptBR })} - ${format(weekEnd, "d MMM yyyy", { locale: ptBR })}`;
      case "month":
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
      case "year":
        return format(currentDate, "yyyy");
    }
  };

  // Day View Component
  const DayView = () => (
    <div className="flex flex-col h-[600px] overflow-auto">
      {hours.map((hour) => {
        const dayEvents = getEventsForDate(currentDate).filter(
          (e) => parseInt(e.time.split(":")[0]) === hour
        );
        return (
          <div key={hour} className="flex border-b border-border min-h-[60px]">
            <div className="w-20 flex-shrink-0 p-2 text-sm text-muted-foreground border-r border-border">
              {hour.toString().padStart(2, "0")}:00
            </div>
            <div className="flex-1 p-1 relative">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "px-2 py-1 rounded text-xs text-primary-foreground mb-1",
                    event.color
                  )}
                >
                  {event.time} - {event.title}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Week View Component
  const WeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="flex flex-col h-[600px] overflow-auto">
        {/* Header with day names */}
        <div className="flex border-b border-border sticky top-0 bg-background z-10">
          <div className="w-20 flex-shrink-0 p-2 border-r border-border" />
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                "flex-1 p-2 text-center border-r border-border last:border-r-0",
                isSameDay(day, new Date()) && "bg-primary/10"
              )}
            >
              <div className="text-xs text-muted-foreground">
                {format(day, "EEE", { locale: ptBR })}
              </div>
              <div className={cn(
                "text-lg font-semibold",
                isSameDay(day, new Date()) && "text-primary"
              )}>
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        {hours.map((hour) => (
          <div key={hour} className="flex border-b border-border min-h-[50px]">
            <div className="w-20 flex-shrink-0 p-2 text-xs text-muted-foreground border-r border-border">
              {hour.toString().padStart(2, "0")}:00
            </div>
            {weekDays.map((day) => {
              const dayEvents = getEventsForDate(day).filter(
                (e) => parseInt(e.time.split(":")[0]) === hour
              );
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "flex-1 p-1 border-r border-border last:border-r-0",
                    isSameDay(day, new Date()) && "bg-primary/5"
                  )}
                >
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "px-1 py-0.5 rounded text-[10px] text-primary-foreground truncate",
                        event.color
                      )}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Month View Component
  const MonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 6);
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-border">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 border-b border-border last:border-b-0">
            {week.map((day) => {
              const dayEvents = getEventsForDate(day);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[100px] p-2 border-r border-border last:border-r-0",
                    !isSameMonth(day, currentDate) && "bg-muted/30 text-muted-foreground",
                    isSameDay(day, new Date()) && "bg-primary/10"
                  )}
                >
                  <div className={cn(
                    "text-sm mb-1",
                    isSameDay(day, new Date()) && "font-bold text-primary"
                  )}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] text-primary-foreground truncate",
                          event.color
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-muted-foreground">
                        +{dayEvents.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Year View Component
  const YearView = () => {
    const months = Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i, 1));

    return (
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {months.map((month) => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
          const calendarEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 6);
          const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
          
          const weeks = [];
          for (let i = 0; i < days.length && weeks.length < 6; i += 7) {
            weeks.push(days.slice(i, i + 7));
          }

          const monthEvents = mockEvents.filter(e => 
            e.date.getMonth() === month.getMonth() && 
            e.date.getFullYear() === month.getFullYear()
          );

          return (
            <Card 
              key={month.toISOString()} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setCurrentDate(month);
                setView("month");
              }}
            >
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm capitalize">
                  {format(month, "MMMM", { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {/* Mini calendar */}
                <div className="grid grid-cols-7 gap-0.5 text-[8px]">
                  {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                    <div key={i} className="text-center text-muted-foreground font-medium">
                      {d}
                    </div>
                  ))}
                  {weeks.flat().map((day, i) => (
                    <div
                      key={i}
                      className={cn(
                        "text-center py-0.5",
                        !isSameMonth(day, month) && "text-muted-foreground/50",
                        isSameDay(day, new Date()) && "bg-primary text-primary-foreground rounded-full font-bold",
                        getEventsForDate(day).length > 0 && !isSameDay(day, new Date()) && "text-accent font-semibold"
                      )}
                    >
                      {format(day, "d")}
                    </div>
                  ))}
                </div>
                {monthEvents.length > 0 && (
                  <div className="mt-2 text-[10px] text-muted-foreground">
                    {monthEvents.length} evento{monthEvents.length > 1 ? "s" : ""}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendário</h1>
            <p className="text-muted-foreground">Gerencie eventos e programações</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Evento
          </Button>
        </div>

        {/* Calendar Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={navigatePrev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={navigateNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={goToToday}>
                  Hoje
                </Button>
                <h2 className="text-lg font-semibold capitalize ml-2">
                  {getTitle()}
                </h2>
              </div>

              {/* View Tabs */}
              <Tabs value={view} onValueChange={(v) => setView(v as ViewType)}>
                <TabsList>
                  <TabsTrigger value="day">Dia</TabsTrigger>
                  <TabsTrigger value="week">Semana</TabsTrigger>
                  <TabsTrigger value="month">Mês</TabsTrigger>
                  <TabsTrigger value="year">Ano</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {view === "day" && <DayView />}
            {view === "week" && <WeekView />}
            {view === "month" && <MonthView />}
            {view === "year" && <YearView />}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
