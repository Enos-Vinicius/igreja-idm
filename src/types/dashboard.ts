/**
 * Tipos dos quatro endpoints de dashboard da API.
 *
 * Os nomes dos campos são os da API (português, sem acento) — não renomeie aqui,
 * para que a resposta possa ser conferida contra a documentação sem tradução.
 */

/** Valores aceitos em ?church=. São os únicos existentes na base — nunca texto livre. */
export const DASHBOARD_CHURCHES = ["Uberaba", "Conceição das Alagoas"] as const;
export type DashboardChurch = (typeof DASHBOARD_CHURCHES)[number];

export interface DashboardFilters {
  church?: string;
}

export interface PeriodoJanela {
  de: string;
  ate: string;
}

/* ------------------------------------------------------------------ overview */

export interface OverviewMembros {
  total: number;
  ativos: number;
  inativos: number;
  semStatus: number;
  porIgreja: Array<{ church: string; total: number }>;
  porTipo: Array<{ tipo: string; total: number }>;
  porGenero: Array<{ genero: string; total: number }>;
}

export interface OverviewProximoCulto {
  id: string;
  title: string;
  city: string;
  date: string;
  time: string;
  endTime: string | null;
  hasKidsMinistry?: boolean;
}

export interface OverviewPresencaJanela {
  cultosNoPeriodo: number;
  cultosComPresencaLancada: number;
  totalPresencas: number;
  membros: number;
  visitantes: number;
  mediaPorCulto: number;
}

export interface DashboardOverview {
  referencia: {
    hoje: string;
    janelaAtual: PeriodoJanela;
    janelaAnterior: PeriodoJanela;
    church: string | null;
  };
  membros: OverviewMembros;
  cultos: {
    proximo: OverviewProximoCulto | null;
    noMesCorrente: number;
  };
  presenca: {
    ultimos30Dias: OverviewPresencaJanela;
    anteriores30Dias: OverviewPresencaJanela;
    /** `percentual` vem null quando a janela anterior não teve presença lançada. */
    variacao: { mediaPorCulto: number | null; percentual: number | null };
    taxaMediaSobreAtivos: number;
  };
  pendencias: {
    solicitacoesDeCadastro: number;
    pedidosDeOracaoNaoLidos: number;
    /** Só considera cultos já realizados na janela de 30 dias. */
    cultosSemPresencaLancada: number;
    /** true: o número de pedidos de oração ignora o filtro de igreja. */
    pedidosDeOracaoEhGlobal: boolean;
  };
}

/* ---------------------------------------------------------------- attendance */

export interface AttendanceMensal {
  mes: string;
  cultos: number;
  cultosComPresencaLancada: number;
  totalPresencas: number;
  membros: number;
  visitantes: number;
  mediaPorCulto: number;
}

export interface AttendancePorIgreja {
  church: string;
  cultos: number;
  cultosComPresencaLancada: number;
  totalPresencas: number;
  mediaPorCulto: number;
  membrosAtivos: number;
  taxaSobreAtivos: number;
}

export interface AttendancePorDiaDaSemana {
  diaDaSemana: number;
  label: string;
  cultos: number;
  cultosComPresencaLancada: number;
  mediaPorCulto: number;
}

export interface AttendanceRankingMember {
  memberId: number;
  memberCode: string;
  name: string;
  church: string;
  presencas: number;
  cultosElegiveis: number;
  taxa: number;
  /** Presenças em culto da outra igreja — preservadas, não descartadas. */
  presencasEmOutraIgreja: number;
  ultimaPresenca: string | null;
}

export interface DashboardAttendance {
  periodo: {
    de: string;
    ate: string;
    church: string | null;
    /** "ultimos6Meses" quando o front não enviou from/to; null quando enviou. */
    padraoAplicado: string | null;
  };
  totais: {
    cultosNoPeriodo: number;
    cultosRealizados: number;
    cultosComPresencaLancada: number;
    cultosSemPresencaLancada: number;
    totalPresencas: number;
    membros: number;
    visitantes: number;
    mediaPorCulto: number;
    membrosAtivos: number;
  };
  mensal: AttendanceMensal[];
  porIgreja: AttendancePorIgreja[];
  /** Só traz os dias que têm culto no período — não espere sete entradas. */
  porDiaDaSemana: AttendancePorDiaDaSemana[];
  maisAssiduos: AttendanceRankingMember[];
  ausentes: AttendanceRankingMember[];
}

export interface DashboardAttendanceFilters extends DashboardFilters {
  from?: string;
  to?: string;
  /** Tamanho de maisAssiduos e ausentes. A API limita entre 1 e 50 (padrão 10). */
  limit?: number;
}

/* -------------------------------------------------------------- demographics */

export interface QualidadeCampo {
  preenchidos: number;
  total: number;
  percentual: number;
}

export interface DashboardDemographics {
  referencia: { hoje: string; church: string | null };
  total: number;
  porFaixaDeIdade: Array<{ faixa: string; total: number }>;
  idade: { media: number; minima: number; maxima: number };
  porGenero: Array<{ genero: string; total: number }>;
  porEstadoCivil: Array<{ estadoCivil: string; total: number }>;
  porCargo: Array<{ cargo: string; total: number }>;
  porTipo: Array<{ tipo: string; total: number }>;
  porStatus: Array<{ status: string; total: number }>;
  porBairro: Array<{ neighborhood: string; city: string; total: number }>;
  /** Distingue "poucos casos" de "cadastro incompleto". */
  qualidadeDosDados: Record<string, QualidadeCampo>;
}

/* ------------------------------------------------------------------ families */

export interface FamilyMemberEntry {
  memberId: number;
  name: string;
  role: string;
  memberType: string;
  membershipStatus: string;
}

export interface FamilyEntry {
  id: number;
  name: string;
  church: string;
  notes: string | null;
  totalMembros: number;
  adultos: number;
  criancas: number;
  papeis: string[];
  membros: FamilyMemberEntry[];
}

export interface DashboardFamilies {
  referencia: { church: string | null };
  totais: {
    familias: number;
    /** Maior que membrosVinculados: um membro pode estar em mais de uma família. */
    vinculos: number;
    membrosVinculados: number;
    membrosSemFamilia: number;
    totalMembros: number;
    coberturaPercentual: number;
    mediaMembrosPorFamilia: number;
  };
  porIgreja: Array<{ church: string; total: number }>;
  porPapel: Array<{ role: string; total: number }>;
  /** SUBCONJUNTO de `familias` — nunca renderize as duas como seções irmãs. */
  maiores: FamilyEntry[];
  familias: FamilyEntry[];
}
