import { api } from './api';
import { Schedule, ScheduleStats, ScheduleInput } from '../types/schedule';

const CACHE_KEY = 'schedules_cache';
const STATS_CACHE_KEY = 'schedules_stats_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

interface CachedData<T> {
  data: T;
  timestamp: number;
}

export const schedulesService = {
  /**
   * Listar todas as escalas
   * @param type - Filtro por tipo (opcional)
   * @param church - Filtro por igreja (opcional)
   * @param search - Termo de busca (opcional)
   * @param useCache - Se deve usar cache (padrão: true, false quando há filtros)
   */
  async getAll(
    type?: string,
    church?: string,
    search?: string,
    useCache = true
  ): Promise<Schedule[]> {
    // Não usa cache para filtros e buscas
    if (type || church || search) {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (church) params.append('church', church);
      if (search) params.append('search', search);
      const endpoint = `/escalas?${params.toString()}`;
      return api.get<Schedule[]>(endpoint);
    }

    // Tenta usar cache se habilitado
    if (useCache) {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp }: CachedData<Schedule[]> = JSON.parse(cached);
        const age = Date.now() - timestamp;

        if (age < CACHE_DURATION) {
          return data;
        }
      }
    }

    // Busca dados da API
    const data = await api.get<Schedule[]>('/escalas');

    // Salva no cache
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));

    return data;
  },

  clearCache() {
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(STATS_CACHE_KEY);
  },

  /**
   * Buscar escala por ID
   */
  async getById(id: number | string): Promise<Schedule> {
    return api.get<Schedule>(`/escalas/${id}`);
  },

  /**
   * Criar nova escala
   */
  async create(schedule: ScheduleInput): Promise<Schedule> {
    const result = await api.post<Schedule>('/escalas', schedule);
    this.clearCache();
    return result;
  },

  /**
   * Atualizar escala existente
   */
  async update(id: number | string, schedule: Partial<ScheduleInput>): Promise<Schedule> {
    const result = await api.put<Schedule>(`/escalas/${id}`, schedule);
    this.clearCache();
    return result;
  },

  /**
   * Deletar escala
   */
  async delete(id: number | string): Promise<void> {
    await api.delete(`/escalas/${id}`);
    this.clearCache();
  },

  /**
   * Obter estatísticas das escalas
   */
  async getStats(): Promise<ScheduleStats> {
    return api.get<ScheduleStats>('/escalas/stats');
  },
};
