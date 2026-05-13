/**
 * Helper para gerar e baixar arquivos CSV diretamente no browser.
 * Inclui BOM UTF-8 para acentos exibirem corretamente no Excel.
 */

export interface CsvColumn<T> {
  /** Cabeçalho exibido na primeira linha do CSV */
  label: string;
  /** Função que extrai/formata o valor a partir do objeto */
  value: (row: T) => string | number | null | undefined;
}

function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (
    str.includes(",") ||
    str.includes("\"") ||
    str.includes("\n") ||
    str.includes("\r") ||
    str.includes(";")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCsvField(c.label)).join(",");
  const dataRows = rows.map((row) =>
    columns.map((c) => escapeCsvField(c.value(row))).join(",")
  );
  // BOM UTF-8 (﻿) para Excel reconhecer encoding corretamente
  return "﻿" + [header, ...dataRows].join("\r\n");
}

export function downloadCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]): void {
  const csv = generateCsv(rows, columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Gera um sufixo de timestamp no formato YYYY-MM-DD-HHmm para nomes de arquivo */
export function getTimestampSuffix(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

/** Formata "YYYY-MM-DD" como "DD/MM/YYYY" sem aplicar timezone */
export function formatIsoDateBR(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.slice(0, 10).split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

/** Formata número como moeda brasileira (sem símbolo R$) — útil pra CSV */
export function formatCurrencyBR(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
