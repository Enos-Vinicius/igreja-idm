import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MonthPickerProps {
  value?: string; // Format: YYYY-MM
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const MONTHS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

export function MonthPicker({
  value,
  onChange,
  className,
  placeholder = "Selecione o mês",
}: MonthPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const [selectedYear, selectedMonth] = value ? value.split("-") : [String(currentYear), "01"];

  const handleMonthChange = (month: string) => {
    if (onChange) {
      onChange(`${selectedYear}-${month}`);
    }
    setIsOpen(false);
  };

  const handleYearChange = (year: string) => {
    if (onChange) {
      onChange(`${year}-${selectedMonth}`);
    }
  };

  const displayValue = value
    ? format(new Date(value + "-01"), "MMMM 'de' yyyy", { locale: ptBR })
    : placeholder;

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
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((month) => (
              <Button
                key={month.value}
                variant={selectedMonth === month.value ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-9",
                  selectedMonth === month.value && "bg-primary text-primary-foreground"
                )}
                onClick={() => handleMonthChange(month.value)}
              >
                {month.label.slice(0, 3)}
              </Button>
            ))}
          </div>

          <div className="flex justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (onChange) {
                  const now = new Date();
                  const month = String(now.getMonth() + 1).padStart(2, "0");
                  onChange(`${now.getFullYear()}-${month}`);
                }
                setIsOpen(false);
              }}
            >
              Este mês
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
