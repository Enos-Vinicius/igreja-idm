import { api } from "./api";
import {
  DashboardAttendance,
  DashboardAttendanceFilters,
  DashboardDemographics,
  DashboardFamilies,
  DashboardFilters,
  DashboardOverview,
} from "@/types/dashboard";

/**
 * Endpoints de dashboard. Cada um é um bloco independente de propósito: uma
 * resposta única faria a tela inteira esperar o dado mais lento, e a instância
 * free do Render hiberna. Cada card busca o seu próprio recorte — inclusive o
 * filtro de igreja, porque média de médias não é a média do todo.
 *
 * Todos exigem autenticação e qualquer papel diferente de `member`.
 */

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.append(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const dashboardService = {
  /** Panorama geral. É o endpoint mais lento (~5,6 s medidos) — carregue à parte. */
  async getOverview(filters?: DashboardFilters): Promise<DashboardOverview> {
    return api.get<DashboardOverview>(`/dashboard/overview${buildQuery({ church: filters?.church })}`);
  },

  /** Frequência: série mensal, por igreja, por dia da semana e rankings. */
  async getAttendance(filters?: DashboardAttendanceFilters): Promise<DashboardAttendance> {
    return api.get<DashboardAttendance>(
      `/dashboard/attendance${buildQuery({
        church: filters?.church,
        from: filters?.from,
        to: filters?.to,
        limit: filters?.limit,
      })}`
    );
  },

  /** Perfil da comunidade, com qualidadeDosDados para sinalizar cadastro incompleto. */
  async getDemographics(filters?: DashboardFilters): Promise<DashboardDemographics> {
    return api.get<DashboardDemographics>(
      `/dashboard/demographics${buildQuery({ church: filters?.church })}`
    );
  },

  /** Famílias e, principalmente, a lacuna de cobertura do cadastro. */
  async getFamilies(filters?: DashboardFilters): Promise<DashboardFamilies> {
    return api.get<DashboardFamilies>(`/dashboard/families${buildQuery({ church: filters?.church })}`);
  },
};
