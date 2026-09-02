import { api } from "./api";
import {
  ServiceSchedule,
  CreateServiceScheduleDto,
  UpdateServiceScheduleDto,
  ServiceScheduleFilters
} from "@/types/serviceSchedule";

export const serviceScheduleService = {
  /**
   * Listar cultos.
   *
   * Sempre envie `month`: sem filtro a resposta traz a agenda inteira (530+
   * cultos hoje, ~1,1 s só nessa consulta) e a lista só cresce.
   */
  async getAll(filters?: ServiceScheduleFilters): Promise<ServiceSchedule[]> {
    const params = new URLSearchParams();

    if (filters?.month) {
      params.append('month', filters.month);
    }

    if (filters?.church) {
      params.append('church', filters.church);
    }

    const queryString = params.toString();
    const url = queryString ? `/service-schedule?${queryString}` : '/service-schedule';

    return await api.get<ServiceSchedule[]>(url, { skipAuth: true });
  },

  // Buscar culto específico por id
  async getById(id: string): Promise<ServiceSchedule> {
    return await api.get<ServiceSchedule>(`/service-schedule/${id}`, { skipAuth: true });
  },

  // Criar novo culto (Admin)
  async create(data: CreateServiceScheduleDto): Promise<ServiceSchedule> {
    return await api.post<ServiceSchedule>('/service-schedule', data);
  },

  // Atualizar culto (Admin)
  async update(id: string, data: UpdateServiceScheduleDto): Promise<ServiceSchedule> {
    return await api.put<ServiceSchedule>(`/service-schedule/${id}`, data);
  },

  // Deletar culto (Admin)
  async delete(id: string): Promise<void> {
    await api.delete(`/service-schedule/${id}`);
  }
};
