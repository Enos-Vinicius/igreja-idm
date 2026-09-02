import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * A API grava toda data de culto à meia-noite UTC e devolve como data civil
 * (YYYY-MM-DD, sem hora). `new Date("2026-08-02")` é interpretado como UTC e,
 * em UTC−3, cai em 01/08 21:00 local — foi essa classe de erro que fazia o dia
 * 1º de cada mês aparecer no mês anterior.
 *
 * Use sempre estes helpers para transformar data civil em Date antes de formatar.
 */

const CIVIL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
/**
 * Mesma data civil, já serializada com a meia-noite UTC explícita — é assim que
 * parte dos registros volta do banco ("2026-08-02T00:00:00.000Z"). Continua
 * sendo data civil: o instante zero não significa "começou à meia-noite".
 */
const CIVIL_DATE_UTC_MIDNIGHT =
  /^(\d{4})-(\d{2})-(\d{2})T00:00(?::00(?:\.0+)?)?(?:Z|\+00:?00)?$/;

/**
 * Converte uma data civil (YYYY-MM-DD) em Date à meia-noite LOCAL, para que a
 * formatação no fuso do usuário exiba exatamente o dia que a API enviou.
 * Strings ISO completas (com hora) representam um instante real e são
 * repassadas ao construtor normal. Retorna null para valor ausente ou inválido.
 */
export function parseCivilDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const match = CIVIL_DATE.exec(value) ?? CIVIL_DATE_UTC_MIDNIGHT.exec(value);
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // Data civil com hora anexada (YYYY-MM-DDTHH:MM) ou ISO completo
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Combina data civil + hora (HH:MM) em um Date local — o instante em que o
 * culto começa no fuso de quem está olhando a tela.
 */
export function parseCivilDateTime(
  date: string | null | undefined,
  time?: string | null
): Date | null {
  const base = parseCivilDate(date);
  if (!base) return null;
  if (!time) return base;

  const [hours, minutes] = time.split(":");
  base.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  return base;
}

/** Formata uma data civil com date-fns em pt-BR. Retorna fallback se a data não for válida. */
export function formatCivilDate(
  value: string | Date | null | undefined,
  pattern = "dd/MM/yyyy",
  fallback = ""
): string {
  const date = parseCivilDate(value);
  if (!date) return fallback;
  return format(date, pattern, { locale: ptBR });
}

/** Data de hoje como data civil (YYYY-MM-DD) no fuso local. */
export function todayCivil(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/**
 * Chave numérica para ordenar datas civis. Fora do intervalo válido devolve o
 * maior valor possível, para que registro sem data caia no fim da lista.
 */
export function civilDateOrder(value: string | null | undefined): number {
  const date = parseCivilDate(value);
  return date ? date.getTime() : Number.MAX_SAFE_INTEGER;
}

/** Chave de mês (YYYY-MM) para o filtro ?month= da agenda. */
export function monthKey(date: Date = new Date()): string {
  return format(date, "yyyy-MM");
}

/** Chave de mês deslocada em N meses a partir de uma referência. */
export function monthKeyOffset(offset: number, from: Date = new Date()): string {
  return monthKey(new Date(from.getFullYear(), from.getMonth() + offset, 1));
}

/** Rótulo curto de uma chave de mês: "2026-04" -> "abr/26". */
export function formatMonthKey(key: string, pattern = "MMM/yy"): string {
  const date = parseCivilDate(`${key}-01`);
  if (!date) return key;
  return format(date, pattern, { locale: ptBR });
}

/** Rótulo longo de uma chave de mês: "2026-04" -> "Abril de 2026". */
export function formatMonthKeyLong(key: string): string {
  const label = formatMonthKey(key, "MMMM 'de' yyyy");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Dia da semana capitalizado a partir de uma data civil. */
export function formatCivilWeekday(value: string | null | undefined): string {
  const label = formatCivilDate(value, "EEEE");
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : "";
}
