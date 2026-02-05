import { api } from './api';
import { Member } from '../types/member';

const CACHE_KEY = 'members_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

interface CachedData {
  data: Member[];
  timestamp: number;
}

export const membersService = {
  async getAll(useCache = true): Promise<Member[]> {
    // Tenta usar cache se habilitado
    if (useCache) {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp }: CachedData = JSON.parse(cached);
        const age = Date.now() - timestamp;

        // Se o cache é recente, usa ele
        if (age < CACHE_DURATION) {
          return data;
        }
      }
    }

    // Busca dados da API
    const data = await api.get<Member[]>('/members');

    // Salva no cache
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));

    return data;
  },

  clearCache() {
    sessionStorage.removeItem(CACHE_KEY);
  },

  async getById(id: number | string): Promise<Member> {
    return api.get<Member>(`/members/${id}`);
  },

  async create(member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member> {
    const result = await api.post<Member>('/members', member);
    this.clearCache(); // Limpa cache após criar
    return result;
  },

  async update(id: number | string, member: Partial<Member>): Promise<Member> {
    const result = await api.put<Member>(`/members/${id}`, member);
    this.clearCache(); // Limpa cache após atualizar
    return result;
  },

  async updateMe(member: Partial<Member>): Promise<Member> {
    const result = await api.put<Member>('/members/me', member);
    this.clearCache(); // Limpa cache após atualizar
    return result;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/members/${id}`);
    this.clearCache(); // Limpa cache após deletar
  },

  async uploadPhoto(memberId: number | string, file: File): Promise<{ message: string; photoUrl: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post<{ message: string; photoUrl: string }>(`/members/${memberId}/photo`, formData);
  },

  async deletePhoto(memberId: number | string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/members/${memberId}/photo`);
  },
};
