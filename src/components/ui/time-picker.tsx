import * as React from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimePickerProps {
  value?: string; // Format: HH:MM
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

export function TimePicker({
  value,
  onChange,
  className,
  placeholder = "Selecione o horário",
}: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const [selectedHour, selectedMinute] = value ? value.split(":") : ["19", "00"];

  const handleHourChange = (hour: string) => {
    if (onChange) {
      onChange(`${hour}:${selectedMinute}`);
    }
  };

  const handleMinuteChange = (minute: string) => {
    if (onChange) {
      onChange(`${selectedHour}:${minute}`);
    }
    setIsOpen(false);
  };

  const displayValue = value || placeholder;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Hours */}
          <div className="border-r w-20">
            <div className="px-2 py-2 text-xs font-medium border-b bg-muted/50 text-center">
              Hora
            </div>
            <div className="h-[200px] overflow-y-auto p-1.5 space-y-0.5">
              {HOURS.map((hour) => (
                <Button
                  key={hour}
                  variant={selectedHour === hour ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-center h-8 text-xs px-2",
                    selectedHour === hour && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => handleHourChange(hour)}
                >
                  {hour}
                </Button>
              ))}
            </div>
          </div>

          {/* Minutes */}
          <div className="w-20">
            <div className="px-2 py-2 text-xs font-medium border-b bg-muted/50 text-center">
              Minuto
            </div>
            <div className="h-[200px] overflow-y-auto p-1.5 space-y-0.5">
              {MINUTES.map((minute) => (
                <Button
                  key={minute}
                  variant={selectedMinute === minute ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-center h-8 text-xs px-2",
                    selectedMinute === minute && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => handleMinuteChange(minute)}
                >
                  {minute}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
