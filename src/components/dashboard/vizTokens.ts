/**
 * Tokens de data-viz usados pelos cards do dashboard.
 *
 * Os hexadecimais estão em `src/index.css` (--viz-*), com um passo próprio para
 * o tema escuro. A paleta categórica foi validada (banda de luminosidade, piso
 * de croma, separação sob daltonismo e contraste sobre a superfície do card):
 * a ordem dos slots é o mecanismo de segurança, então **atribua na ordem e
 * nunca cicle** — uma 5ª série vira "Outros", não um matiz novo.
 *
 * Em modo claro, aqua e amarelo ficam abaixo de 3:1 sobre o card, o que obriga
 * rótulo visível no gráfico (é o que os LabelList fazem) em vez de depender só
 * da cor.
 */

/** Slots categóricos, na ordem fixa de atribuição. */
export const VIZ_SERIES = [
  "var(--viz-1)",
  "var(--viz-2)",
  "var(--viz-3)",
  "var(--viz-4)",
] as const;

/** Série única / hue sequencial padrão. */
export const VIZ_PRIMARY = "var(--viz-1)";

/** Trilha de medidor: passo claro do mesmo azul, para o estado ler em toda a barra. */
export const VIZ_TRACK = "var(--viz-track)";

/** Status — nunca reaproveitados como cor de série, e sempre com ícone + rótulo. */
export const VIZ_STATUS = {
  good: "var(--viz-good)",
  warning: "var(--viz-warning)",
  critical: "var(--viz-critical)",
} as const;

/** Superfície do card: é o que forma o vão de 2px entre marcas encostadas. */
export const VIZ_SURFACE = "hsl(var(--card))";

/** Cromo do gráfico: fio de cabelo, sempre sólido e recessivo. */
export const VIZ_GRID = "hsl(var(--border))";
export const VIZ_INK_MUTED = "hsl(var(--muted-foreground))";
export const VIZ_INK = "hsl(var(--foreground))";

export const AXIS_TICK = { fontSize: 11, fill: VIZ_INK_MUTED } as const;

export const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  boxShadow: "0 4px 16px -8px rgba(0,0,0,.25)",
} as const;

export const TOOLTIP_LABEL_STYLE = { color: VIZ_INK, fontWeight: 600 } as const;

/** Rótulo direto sobre a marca — texto em token de tinta, nunca na cor da série. */
export const LABEL_STYLE = { fontSize: 11, fill: VIZ_INK_MUTED } as const;

/** Espessura máxima de barra: nunca preencher a faixa inteira; a sobra é ar. */
export const MAX_BAR_SIZE = 24;

/** Vão de 2px na cor da superfície entre segmentos de uma pilha. */
export const STACK_GAP = { stroke: VIZ_SURFACE, strokeWidth: 2 } as const;

/** Formata número com no máximo uma casa, sem zero à direita ("27.4" -> "27,4"). */
export function formatNumber(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toLocaleString("pt-BR", { maximumFractionDigits: digits });
}

/** Percentual assinado, para variações. */
export function formatSignedPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)}%`;
}
