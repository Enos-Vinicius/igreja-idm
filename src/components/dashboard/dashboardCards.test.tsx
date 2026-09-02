import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/**
 * Em jsdom o ResponsiveContainer mede 0x0 e não renderiza filho nenhum, então o
 * interior dos gráficos ficaria sem cobertura. Aqui ele passa a ter tamanho
 * fixo, o que faz eixos, rótulos diretos e marcadores rodarem de verdade.
 */
vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) =>
      isValidElement(children)
        ? cloneElement(children as ReactElement, { width: 600, height: 300 })
        : null,
  };
});

import {
  DashboardAttendance,
  DashboardDemographics,
  DashboardFamilies,
  DashboardOverview,
} from "@/types/dashboard";

const getOverview = vi.fn();
const getAttendance = vi.fn();
const getDemographics = vi.fn();
const getFamilies = vi.fn();

vi.mock("@/services/dashboard", () => ({
  dashboardService: {
    getOverview: (...args: unknown[]) => getOverview(...args),
    getAttendance: (...args: unknown[]) => getAttendance(...args),
    getDemographics: (...args: unknown[]) => getDemographics(...args),
    getFamilies: (...args: unknown[]) => getFamilies(...args),
  },
}));

import { OverviewCard } from "./OverviewCard";
import { AttendanceCard } from "./AttendanceCard";
import { DemographicsCard } from "./DemographicsCard";
import { FamiliesCard } from "./FamiliesCard";

/* Payloads espelhando as respostas reais documentadas no handoff da API. */

const overview: DashboardOverview = {
  referencia: {
    hoje: "2026-09-02",
    janelaAtual: { de: "2026-08-04", ate: "2026-09-02" },
    janelaAnterior: { de: "2026-07-05", ate: "2026-08-03" },
    church: null,
  },
  membros: {
    total: 104,
    ativos: 99,
    inativos: 1,
    semStatus: 0,
    porIgreja: [
      { church: "Uberaba", total: 53 },
      { church: "Conceição das Alagoas", total: 51 },
    ],
    porTipo: [
      { tipo: "Adulto", total: 100 },
      { tipo: "Criança", total: 4 },
    ],
    porGenero: [
      { genero: "Feminino", total: 59 },
      { genero: "Masculino", total: 45 },
    ],
  },
  cultos: {
    proximo: {
      id: "2026-09-03-conceicao-quinta",
      title: "Culto Celebração",
      city: "Conceição das Alagoas",
      date: "2026-09-03",
      time: "19:30",
      endTime: null,
      hasKidsMinistry: true,
    },
    noMesCorrente: 32,
  },
  presenca: {
    ultimos30Dias: {
      cultosNoPeriodo: 32,
      cultosComPresencaLancada: 7,
      totalPresencas: 192,
      membros: 187,
      visitantes: 5,
      mediaPorCulto: 27.4,
    },
    anteriores30Dias: {
      cultosNoPeriodo: 30,
      cultosComPresencaLancada: 6,
      totalPresencas: 178,
      membros: 175,
      visitantes: 3,
      mediaPorCulto: 29.6,
    },
    variacao: { mediaPorCulto: -2.2, percentual: -7 },
    taxaMediaSobreAtivos: 28,
  },
  pendencias: {
    solicitacoesDeCadastro: 0,
    pedidosDeOracaoNaoLidos: 0,
    cultosSemPresencaLancada: 25,
    pedidosDeOracaoEhGlobal: true,
  },
};

const attendance: DashboardAttendance = {
  periodo: { de: "2026-04-01", ate: "2026-09-02", church: null, padraoAplicado: "ultimos6Meses" },
  totais: {
    cultosNoPeriodo: 147,
    cultosRealizados: 147,
    cultosComPresencaLancada: 59,
    cultosSemPresencaLancada: 88,
    totalPresencas: 1585,
    membros: 1509,
    visitantes: 76,
    mediaPorCulto: 26.9,
    membrosAtivos: 99,
  },
  mensal: [
    {
      mes: "2026-04",
      cultos: 28,
      cultosComPresencaLancada: 18,
      totalPresencas: 493,
      membros: 450,
      visitantes: 43,
      mediaPorCulto: 27.4,
    },
    {
      mes: "2026-05",
      cultos: 30,
      cultosComPresencaLancada: 14,
      totalPresencas: 402,
      membros: 390,
      visitantes: 12,
      mediaPorCulto: 28.7,
    },
  ],
  porIgreja: [
    {
      church: "Uberaba",
      cultos: 70,
      cultosComPresencaLancada: 12,
      totalPresencas: 395,
      mediaPorCulto: 32.9,
      membrosAtivos: 48,
      taxaSobreAtivos: 62,
    },
    {
      church: "Conceição das Alagoas",
      cultos: 77,
      cultosComPresencaLancada: 47,
      totalPresencas: 1190,
      mediaPorCulto: 25.3,
      membrosAtivos: 51,
      taxaSobreAtivos: 49,
    },
  ],
  porDiaDaSemana: [
    { diaDaSemana: 0, label: "Domingo", cultos: 44, cultosComPresencaLancada: 30, mediaPorCulto: 26.5 },
    { diaDaSemana: 2, label: "Terça", cultos: 40, cultosComPresencaLancada: 10, mediaPorCulto: 10.3 },
    { diaDaSemana: 4, label: "Quinta", cultos: 41, cultosComPresencaLancada: 15, mediaPorCulto: 35.9 },
  ],
  maisAssiduos: [
    {
      memberId: 31,
      memberCode: "MBR001",
      name: "Maria de Fátima",
      church: "Uberaba",
      presencas: 12,
      cultosElegiveis: 12,
      taxa: 100,
      presencasEmOutraIgreja: 0,
      ultimaPresenca: "2026-08-23",
    },
  ],
  ausentes: [
    {
      memberId: 44,
      memberCode: "MBR044",
      name: "João Batista ",
      church: "Uberaba",
      presencas: 1,
      cultosElegiveis: 12,
      taxa: 8,
      presencasEmOutraIgreja: 10,
      ultimaPresenca: "2026-05-10",
    },
  ],
};

const demographics: DashboardDemographics = {
  referencia: { hoje: "2026-09-02", church: null },
  total: 104,
  porFaixaDeIdade: [
    { faixa: "45 a 59", total: 33 },
    { faixa: "0 a 11", total: 4 },
    { faixa: "60+", total: 36 },
    { faixa: "12 a 17", total: 2 },
  ],
  idade: { media: 51.6, minima: 4, maxima: 89 },
  porGenero: [
    { genero: "Feminino", total: 59 },
    { genero: "Masculino", total: 45 },
  ],
  porEstadoCivil: [
    { estadoCivil: "Casado(a)", total: 76 },
    { estadoCivil: "Solteiro(a)", total: 18 },
    { estadoCivil: "Viúvo(a)", total: 6 },
  ],
  porCargo: [
    { cargo: "Membro", total: 86 },
    { cargo: "Líder", total: 10 },
  ],
  porTipo: [{ tipo: "Adulto", total: 100 }],
  porStatus: [{ status: "Ativo", total: 99 }],
  porBairro: Array.from({ length: 11 }, (_, index) => ({
    neighborhood: `Bairro ${index + 1}`,
    city: "Uberaba",
    total: 20 - index,
  })),
  qualidadeDosDados: {
    birthDate: { preenchidos: 104, total: 104, percentual: 100 },
    maritalStatus: { preenchidos: 100, total: 104, percentual: 96 },
    neighborhood: { preenchidos: 84, total: 104, percentual: 81 },
  },
};

const families: DashboardFamilies = {
  referencia: { church: null },
  totais: {
    familias: 5,
    vinculos: 6,
    membrosVinculados: 5,
    membrosSemFamilia: 99,
    totalMembros: 104,
    coberturaPercentual: 5,
    mediaMembrosPorFamilia: 1.2,
  },
  porIgreja: [{ church: "Uberaba", total: 5 }],
  porPapel: [
    { role: "Filho", total: 3 },
    { role: "Cônjuge", total: 3 },
  ],
  maiores: [
    {
      id: 1,
      name: "Maycon e Quézia",
      church: "Uberaba",
      notes: null,
      totalMembros: 2,
      adultos: 0,
      criancas: 2,
      papeis: ["Filha", "Filho"],
      membros: [
        {
          memberId: 133,
          name: "Davi Miguel ",
          role: "Filho",
          memberType: "Criança",
          membershipStatus: "Congregado",
        },
      ],
    },
  ],
  familias: [
    {
      id: 1,
      name: "Maycon e Quézia",
      church: "Uberaba",
      notes: null,
      totalMembros: 2,
      adultos: 0,
      criancas: 2,
      papeis: ["Filha", "Filho"],
      membros: [
        {
          memberId: 133,
          name: "Davi Miguel ",
          role: "Filho",
          memberType: "Criança",
          membershipStatus: "Congregado",
        },
      ],
    },
  ],
};

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  getOverview.mockResolvedValue(overview);
  getAttendance.mockResolvedValue(attendance);
  getDemographics.mockResolvedValue(demographics);
  getFamilies.mockResolvedValue(families);
});

describe("OverviewCard", () => {
  it("mostra a presença média com a variação contra a janela anterior", async () => {
    renderWithRouter(<OverviewCard />);

    expect(await screen.findByText("27,4")).toBeInTheDocument();
    expect(screen.getByText("-7%")).toBeInTheDocument();
    expect(screen.getByText("vs. 30 dias anteriores")).toBeInTheDocument();
  });

  it("mostra o próximo culto na data civil enviada, sem deslocar o dia", async () => {
    renderWithRouter(<OverviewCard />);

    expect(await screen.findByText("Culto Celebração")).toBeInTheDocument();
    expect(screen.getByText(/Quinta-feira, 03 de setembro às 19:30/)).toBeInTheDocument();
  });

  it("diz 'sem base de comparação' quando a janela anterior não teve presença", async () => {
    getOverview.mockResolvedValue({
      ...overview,
      presenca: {
        ...overview.presenca,
        variacao: { mediaPorCulto: null, percentual: null },
      },
    });

    renderWithRouter(<OverviewCard />);

    expect(await screen.findByText("Sem base de comparação")).toBeInTheDocument();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });

  it("alimenta o seletor de igreja apenas com a resposta sem filtro", async () => {
    const onLoaded = vi.fn();
    renderWithRouter(<OverviewCard church="Uberaba" onLoaded={onLoaded} />);

    await waitFor(() => expect(onLoaded).toHaveBeenCalled());
    expect(getOverview).toHaveBeenCalledWith({ church: "Uberaba" });
  });
});

describe("AttendanceCard", () => {
  it("rotula o período pelo padrão aplicado pela API", async () => {
    renderWithRouter(<AttendanceCard />);

    expect(await screen.findByText(/Últimos 6 meses/)).toBeInTheDocument();
  });

  it("exibe cultos lançados ao lado de qualquer taxa por igreja", async () => {
    renderWithRouter(<AttendanceCard />);

    expect(await screen.findByText("12/70")).toBeInTheDocument();
    expect(screen.getByText("47/77")).toBeInTheDocument();
    expect(screen.getByText("62%")).toBeInTheDocument();
  });

  it("avisa para não comparar as igrejas quando nenhuma está filtrada", async () => {
    renderWithRouter(<AttendanceCard />);

    expect(
      await screen.findByText(/Ainda não compare a frequência das duas igrejas/)
    ).toBeInTheDocument();
  });

  it("preserva presenças na outra igreja no ranking de ausentes", async () => {
    renderWithRouter(<AttendanceCard />);

    expect(await screen.findByText("João Batista")).toBeInTheDocument();
    expect(screen.getByText(/10 na outra igreja/)).toBeInTheDocument();
    expect(screen.getByText(/última em 10\/05\/2026/)).toBeInTheDocument();
  });

  it("pede o ranking com limite e repassa o filtro de igreja", async () => {
    renderWithRouter(<AttendanceCard church="Uberaba" />);

    await waitFor(() =>
      expect(getAttendance).toHaveBeenCalledWith({ church: "Uberaba", limit: 8 })
    );
  });
});

describe("gráficos", () => {
  it("rotula o último ponto da série mensal e os dias da semana com culto", async () => {
    renderWithRouter(<AttendanceCard />);

    // rótulo direto apenas no ponto final da série (28,7 é o mês mais recente)
    expect(await screen.findByText("28,7")).toBeInTheDocument();

    // porDiaDaSemana só traz os dias que têm culto — três, não sete
    expect(screen.getByText("Domingo")).toBeInTheDocument();
    expect(screen.getByText("Terça")).toBeInTheDocument();
    expect(screen.getByText("Quinta")).toBeInTheDocument();
    expect(screen.queryByText("Sábado")).not.toBeInTheDocument();

    // legenda presente porque há duas séries (membros e visitantes)
    expect(screen.getByText("Membros")).toBeInTheDocument();
    expect(screen.getByText("Visitantes")).toBeInTheDocument();
  });

  it("ordena as faixas de idade pela faixa, não pelo total", async () => {
    renderWithRouter(<DemographicsCard />);

    await waitFor(() => expect(screen.getByText("0 a 11")).toBeInTheDocument());

    const ticks = screen
      .getAllByText(/^(0 a 11|12 a 17|45 a 59|60\+)$/)
      .map((node) => node.textContent);

    expect(ticks).toEqual(["60+", "45 a 59", "12 a 17", "0 a 11"]);
  });
});

describe("DemographicsCard", () => {
  it("sinaliza preenchimento baixo em vez de deixar o gráfico parecer defeito", async () => {
    renderWithRouter(<DemographicsCard />);

    expect(await screen.findByText(/81% dos cadastros têm bairro informado/)).toBeInTheDocument();
  });

  it("agrupa a cauda longa de bairros", async () => {
    renderWithRouter(<DemographicsCard />);

    await waitFor(() => expect(getDemographics).toHaveBeenCalled());
    expect(await screen.findByText(/Top 8 por número de membros/)).toBeInTheDocument();
  });

  it("lista cargos com contagem, sem gráfico de fatia única", async () => {
    renderWithRouter(<DemographicsCard />);

    expect(await screen.findByText("Membro")).toBeInTheDocument();
    expect(screen.getByText("(83%)")).toBeInTheDocument();
  });
});

describe("FamiliesCard", () => {
  it("abre pela lacuna de cobertura, não pelo total de famílias", async () => {
    renderWithRouter(<FamiliesCard />);

    expect(await screen.findByText("5%")).toBeInTheDocument();
    expect(
      screen.getByText(/99 ainda sem família cadastrada/)
    ).toBeInTheDocument();
  });

  it("aplica trim nos nomes que vêm com espaço nas pontas", async () => {
    renderWithRouter(<FamiliesCard />);

    expect(await screen.findByText("Davi Miguel")).toBeInTheDocument();
  });

  it("não repete as famílias de 'maiores' como seção irmã da lista", async () => {
    renderWithRouter(<FamiliesCard />);

    const cards = await screen.findAllByText("Maycon e Quézia");
    expect(cards).toHaveLength(1);
  });
});
