import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface DateInputProps {
  value?: Date | string | null;
  onChange?: (date: Date | undefined) => void;
  onChangeString?: (dateString: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  fromYear?: number;
  toYear?: number;
  id?: string;
  name?: string;
}

// Format date to DD/MM/YYYY string
function formatDateToDisplay(date: Date | string | null | undefined): string {
  if (!date) return "";

  let dateObj: Date;
  if (typeof date === "string") {
    // Try parsing as ISO date (YYYY-MM-DD)
    if (date.includes("-")) {
      dateObj = new Date(date + "T00:00:00");
    } else {
      // Already in DD/MM/YYYY format
      return date;
    }
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) return "";
  return format(dateObj, "dd/MM/yyyy");
}

// Parse DD/MM/YYYY string to Date
function parseDisplayDate(dateString: string): Date | undefined {
  if (!dateString || dateString.length < 10) return undefined;

  const parsed = parse(dateString, "dd/MM/yyyy", new Date());
  if (!isValid(parsed)) return undefined;

  return parsed;
}

// Format date to ISO string (YYYY-MM-DD)
function formatDateToISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

// Apply DD/MM/YYYY mask to input
function applyDateMask(value: string): string {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, "");

  // Apply mask
  if (numbers.length <= 2) {
    return numbers;
  }
  if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  }
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      value,
      onChange,
      onChangeString,
      placeholder = "DD/MM/AAAA",
      disabled = false,
      className,
      minDate,
      maxDate,
      fromYear = 1900,
      toYear = new Date().getFullYear(),
      id,
      name,
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState(() => formatDateToDisplay(value));
    const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Sync input value with external value changes
    React.useEffect(() => {
      const formatted = formatDateToDisplay(value);
      setInputValue(formatted);
    }, [value]);

    // Handle text input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const masked = applyDateMask(e.target.value);
      setInputValue(masked);

      // If complete date (10 chars = DD/MM/YYYY), validate and emit
      if (masked.length === 10) {
        const parsed = parseDisplayDate(masked);
        if (parsed) {
          // Check if within bounds
          const isInBounds =
            (!minDate || parsed >= minDate) &&
            (!maxDate || parsed <= maxDate);

          if (isInBounds) {
            if (onChange) {
              onChange(parsed);
            }
            if (onChangeString) {
              onChangeString(formatDateToISO(parsed));
            }
          }
        }
      } else if (masked.length === 0) {
        // Clear the value
        if (onChange) {
          onChange(undefined);
        }
        if (onChangeString) {
          onChangeString("");
        }
      }
    };

    // Handle calendar selection
    const handleCalendarSelect = (date: Date | undefined) => {
      if (date) {
        setInputValue(formatDateToDisplay(date));
        if (onChange) {
          onChange(date);
        }
        if (onChangeString) {
          onChangeString(formatDateToISO(date));
        }
      }
      setIsCalendarOpen(false);
    };

    // Get the Date value for the calendar
    const calendarValue = React.useMemo(() => {
      if (!value) return undefined;

      if (typeof value === "string") {
        if (value.includes("-")) {
          // ISO format
          const date = new Date(value + "T00:00:00");
          return isValid(date) ? date : undefined;
        } else if (value.length === 10) {
          // DD/MM/YYYY format
          return parseDisplayDate(value);
        }
        return undefined;
      }

      return isValid(value) ? value : undefined;
    }, [value]);

    return (
      <div className={cn("relative flex", className)} data-field={name}>
        <Input
          ref={(node) => {
            // Handle both refs
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
          }}
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          className="pr-10"
          maxLength={10}
        />
        <Popover modal={false} open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setIsCalendarOpen(true)}
            >
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50" align="start" sideOffset={5}>
            <Calendar
              mode="single"
              selected={calendarValue}
              onSelect={handleCalendarSelect}
              disabled={(date) => {
                // Only disable if constraints are provided
                const isTooLate = maxDate ? date > maxDate : false;
                const isTooEarly = minDate ? date < minDate : false;
                return isTooLate || isTooEarly;
              }}
              initialFocus
              locale={ptBR}
              captionLayout="dropdown-buttons"
              fromYear={fromYear}
              toYear={toYear}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

DateInput.displayName = "DateInput";

export { DateInput };
