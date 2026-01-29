import { api } from './api';
import { Member } from '../types/member';

export const membersService = {
  async getAll(): Promise<Member[]> {
    return api.get<Member[]>('/members');
  },

  async getById(id: number | string): Promise<Member> {
    return api.get<Member>(`/members/${id}`);
  },

  async create(member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member> {
    return api.post<Member>('/members', member);
  },

  async update(id: number | string, member: Partial<Member>): Promise<Member> {
    return api.put<Member>(`/members/${id}`, member);
  },

  async delete(id: number | string): Promise<void> {
    return api.delete(`/members/${id}`);
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
