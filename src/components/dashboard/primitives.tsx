import { ReactNode } from "react";
import { Info, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  VIZ_SERIES,
  VIZ_STATUS,
  VIZ_TRACK,
  VIZ_PRIMARY,
  formatNumber,
  formatSignedPercent,
} from "./vizTokens";

/**
 * Peças de figura (não-gráficos) dos cards: número com variação, barra 100%,
 * medidor e linha de proporção. Todas em HTML puro — um valor único não é um
 * gráfico de uma barra, e uma pizza de duas fatias não informa nada.
 */

/** Tinta usada sobre cada slot categórico, escolhida pela luminância do preenchimento. */
const ON_SERIES = ["#ffffff", "#11161d", "#11161d", "#11161d"];

/* ------------------------------------------------------------------ StatTile */

interface StatTileProps {
  label: string;
  value: ReactNode;
  /** Variação assinada em pontos percentuais ou valor absoluto. */
  delta?: {
    value: number | null;
    percent?: number | null;
    /** Rótulo do período comparado — a variação nunca aparece sem dizer contra o quê. */
    versus: string;
    /** false quando subir é ruim (ex.: pendências). */
    upIsGood?: boolean;
  };
  hint?: string;
  className?: string;
}

/**
 * Número com rótulo e, opcionalmente, variação. A cor da variação vem da
 * direção cruzada com "subir é bom?", e vem sempre acompanhada de ícone —
 * status nunca é comunicado por cor sozinha.
 */
export function StatTile({ label, value, delta, hint, className }: StatTileProps) {
  const hasComparison = delta && delta.value !== null && delta.value !== undefined;
  const direction = hasComparison ? Math.sign(delta!.value as number) : 0;
  const upIsGood = delta?.upIsGood ?? true;

  const DeltaIcon = direction === 0 ? Minus : direction > 0 ? TrendingUp : TrendingDown;
  const isPositiveOutcome = direction === 0 ? null : direction > 0 === upIsGood;
  const deltaColor =
    isPositiveOutcome === null
      ? "hsl(var(--muted-foreground))"
      : isPositiveOutcome
        ? VIZ_STATUS.good
        : VIZ_STATUS.warning;

  return (
    <div className={cn("rounded-lg bg-muted/40 p-4", className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>

      {delta && (
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          {hasComparison ? (
            <>
              <DeltaIcon className="h-3.5 w-3.5 shrink-0" style={{ color: deltaColor }} />
              <span className="font-medium text-foreground">
                {delta.percent !== null && delta.percent !== undefined
                  ? formatSignedPercent(delta.percent)
                  : `${(delta.value as number) > 0 ? "+" : ""}${formatNumber(delta.value)}`}
              </span>
              <span className="text-muted-foreground">{delta.versus}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Sem base de comparação</span>
          )}
        </div>
      )}

      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ ShareBar */

export interface ShareSegment {
  label: string;
  value: number;
}

interface ShareBarProps {
  title?: string;
  segments: ShareSegment[];
  /** Sufixo do valor na legenda ("membros", "cultos"...). */
  unit?: string;
  className?: string;
}

/**
 * Barra 100% horizontal para parte-do-todo. Legenda sempre presente a partir de
 * duas séries; o valor entra dentro do segmento apenas quando cabe, senão fica
 * só na legenda — rótulo cortado é pior do que rótulo ausente.
 *
 * Além do quarto slot a cauda é agrupada em "Outros": um 5º matiz gerado é
 * indistinguível dos existentes sob daltonismo.
 */
export function ShareBar({ title, segments, unit, className }: ShareBarProps) {
  const ranked = [...segments].filter((s) => s.value > 0).sort((a, b) => b.value - a.value);
  const head = ranked.slice(0, VIZ_SERIES.length);
  const tail = ranked.slice(VIZ_SERIES.length);
  const shown: ShareSegment[] = tail.length
    ? [...head, { label: `Outros (${tail.length})`, value: tail.reduce((sum, s) => sum + s.value, 0) }]
    : head;

  const total = shown.reduce((sum, s) => sum + s.value, 0);
  if (!total) {
    return (
      <div className={className}>
        {title && <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>}
        <p className="text-sm text-muted-foreground">Sem dados para o recorte atual.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>}

      <div className="flex h-7 w-full gap-[2px] overflow-hidden rounded-md">
        {shown.map((segment, index) => {
          const share = (segment.value / total) * 100;
          const color = index < VIZ_SERIES.length ? VIZ_SERIES[index] : "hsl(var(--muted-foreground))";
          const onColor = index < ON_SERIES.length ? ON_SERIES[index] : "#ffffff";
          return (
            <div
              key={segment.label}
              className="flex items-center justify-center first:rounded-l-md last:rounded-r-md"
              style={{ width: `${share}%`, backgroundColor: color }}
              title={`${segment.label}: ${segment.value} (${Math.round(share)}%)`}
            >
              {share >= 12 && (
                <span className="px-1 text-[11px] font-medium tabular-nums" style={{ color: onColor }}>
                  {segment.value}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {shown.map((segment, index) => (
          <li key={segment.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  index < VIZ_SERIES.length ? VIZ_SERIES[index] : "hsl(var(--muted-foreground))",
              }}
            />
            <span className="text-foreground">{segment.label}</span>
            <span>
              {segment.value}
              {unit ? ` ${unit}` : ""} · {Math.round((segment.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------------------------------------------- Meter */

interface MeterProps {
  value: number;
  label: string;
  /** Texto à direita do rótulo (ex.: "5 de 104 membros"). */
  detail?: string;
  className?: string;
}

/**
 * Medidor de razão contra um limite. O preenchimento carrega a severidade e a
 * trilha é um passo claro do mesmo azul, para o estado ler na barra inteira.
 */
export function Meter({ value, label, detail, className }: MeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const fill = clamped >= 60 ? VIZ_PRIMARY : clamped >= 25 ? VIZ_STATUS.warning : VIZ_STATUS.critical;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-3xl font-semibold text-foreground">{clamped}%</p>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: VIZ_TRACK }}>
        <div className="h-full rounded-full" style={{ width: `${clamped}%`, backgroundColor: fill }} />
      </div>
      {detail && <p className="mt-2 text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

/* ----------------------------------------------------------- ProportionRow */

interface ProportionRowProps {
  name: string;
  /** Proporção preenchida, 0 a 100. */
  percent: number;
  primary: string;
  secondary?: string;
  color?: string;
  onClick?: () => void;
}

/** Linha de lista com barra de proporção — usada nos rankings de assíduos e ausentes. */
export function ProportionRow({
  name,
  percent,
  primary,
  secondary,
  color = VIZ_PRIMARY,
  onClick,
}: ProportionRowProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          "w-full rounded-md px-2 py-1.5 text-left transition-colors",
          onClick ? "hover:bg-muted/60" : "cursor-default"
        )}
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-sm text-foreground">{name}</span>
          <span className="shrink-0 text-xs font-medium tabular-nums text-foreground">{primary}</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full" style={{ width: `${clamped}%`, backgroundColor: color }} />
        </div>
        {secondary && <p className="mt-1 text-xs text-muted-foreground">{secondary}</p>}
      </button>
    </li>
  );
}

/* ------------------------------------------------------------- DataNote */

/** Nota discreta — distingue "poucos casos" de "cadastro incompleto". */
export function DataNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
