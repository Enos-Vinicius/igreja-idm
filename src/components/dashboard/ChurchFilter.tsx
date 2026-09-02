import { Church } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DASHBOARD_CHURCHES } from "@/types/dashboard";
import { ALL_CHURCHES } from "./churchScope";

interface ChurchFilterProps {
  /** ALL_CHURCHES ou o nome exato da igreja. */
  value: string;
  onChange: (value: string) => void;
  /** Vem de membros.porIgreja do /dashboard/overview sem filtro, com os totais. */
  options?: Array<{ church: string; total: number }>;
  disabled?: boolean;
}

/**
 * Seletor de igreja aplicado aos quatro cards.
 *
 * Lista fixa de propósito: os valores têm acento e cedilha e são os únicos que
 * existem nas tabelas. Um "Conceicao" digitado à mão devolve 200 com tudo
 * zerado, o que na tela é indistinguível de "igreja sem dados" — por isso nunca
 * um campo de texto livre.
 */
export function ChurchFilter({ value, onChange, options, disabled }: ChurchFilterProps) {
  const churches =
    options && options.length > 0
      ? options
      : DASHBOARD_CHURCHES.map((church) => ({ church, total: 0 }));

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="church-filter" className="hidden shrink-0 text-sm text-muted-foreground sm:block">
        Igreja
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="church-filter" className="w-[240px]">
          <Church className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_CHURCHES}>Todas as igrejas</SelectItem>
          {churches.map((option) => (
            <SelectItem key={option.church} value={option.church}>
              {option.church}
              {option.total > 0 && (
                <span className="ml-1 text-muted-foreground">({option.total})</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
