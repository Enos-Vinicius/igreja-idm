import { describe, expect, it } from "vitest";
import {
  civilDateOrder,
  formatCivilDate,
  formatCivilWeekday,
  formatMonthKey,
  parseCivilDate,
  parseCivilDateTime,
} from "./date";

describe("parseCivilDate", () => {
  it("mantém o dia enviado pela API, sem deslocar para o mês anterior", () => {
    const date = parseCivilDate("2026-09-01");

    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(2026);
    expect(date!.getMonth()).toBe(8); // setembro
    expect(date!.getDate()).toBe(1);
  });

  it("trata meia-noite UTC explícita como a mesma data civil", () => {
    const withMarker = parseCivilDate("2026-09-01T00:00:00.000Z");

    expect(withMarker).not.toBeNull();
    expect(withMarker!.getMonth()).toBe(8);
    expect(withMarker!.getDate()).toBe(1);
  });

  it("preserva instantes reais (data com hora de verdade)", () => {
    const instant = parseCivilDate("2026-09-01T19:30:00.000Z");

    expect(instant).not.toBeNull();
    expect(instant!.getTime()).toBe(new Date("2026-09-01T19:30:00.000Z").getTime());
  });

  it("devolve null para valor ausente ou inválido", () => {
    expect(parseCivilDate(null)).toBeNull();
    expect(parseCivilDate("")).toBeNull();
    expect(parseCivilDate("não é data")).toBeNull();
  });
});

describe("formatCivilDate", () => {
  it("formata o mesmo dia que a API enviou, em qualquer fuso", () => {
    expect(formatCivilDate("2026-09-01")).toBe("01/09/2026");
    expect(formatCivilDate("2026-02-01")).toBe("01/02/2026");
    expect(formatCivilDate("2026-12-31")).toBe("31/12/2026");
  });

  it("usa o fallback quando não há data", () => {
    expect(formatCivilDate(undefined, "dd/MM/yyyy", "—")).toBe("—");
  });

  it("capitaliza o dia da semana", () => {
    expect(formatCivilWeekday("2026-09-03")).toBe("Quinta-feira");
  });
});

describe("parseCivilDateTime", () => {
  it("combina data civil com o horário do culto", () => {
    const start = parseCivilDateTime("2026-09-03", "19:30");

    expect(start!.getDate()).toBe(3);
    expect(start!.getHours()).toBe(19);
    expect(start!.getMinutes()).toBe(30);
  });
});

describe("formatMonthKey", () => {
  it("gera rótulo curto de mês", () => {
    expect(formatMonthKey("2026-04")).toMatch(/abr/i);
  });
});

describe("civilDateOrder", () => {
  it("ordena datas civis e joga registro sem data para o fim", () => {
    const ordered = ["2026-09-01", null, "2026-08-31"].sort(
      (a, b) => civilDateOrder(a) - civilDateOrder(b)
    );

    expect(ordered).toEqual(["2026-08-31", "2026-09-01", null]);
  });
});
