import { api } from './api';
import { Family, FamilyInput, AddFamilyMemberInput } from '../types/family';

export const familiesService = {
  async getAll(search?: string): Promise<Family[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const query = params.toString();
    return api.get<Family[]>(`/families${query ? `?${query}` : ''}`);
  },

  async getById(id: number | string): Promise<Family> {
    return api.get<Family>(`/families/${id}`);
  },

  async create(input: FamilyInput): Promise<Family> {
    return api.post<Family>('/families', input);
  },

  async update(id: number | string, input: Partial<FamilyInput>): Promise<Family> {
    return api.put<Family>(`/families/${id}`, input);
  },

  async delete(id: number | string): Promise<void> {
    await api.delete<void>(`/families/${id}`);
  },

  async addMember(familyId: number | string, input: AddFamilyMemberInput): Promise<Family> {
    return api.post<Family>(`/families/${familyId}/members`, input);
  },

  async removeMember(familyId: number | string, memberId: number | string): Promise<void> {
    await api.delete<void>(`/families/${familyId}/members/${memberId}`);
  },
};
