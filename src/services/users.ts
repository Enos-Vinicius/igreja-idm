import { api } from './api';
import { User } from '../types/user';

export interface CreateUserRequest {
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  email?: string;
  role?: string;
}

export interface ChangePasswordRequest {
  password: string;
}

export const usersService = {
  async getAll(): Promise<User[]> {
    return api.get<User[]>('/users');
  },

  async create(data: CreateUserRequest): Promise<User> {
    return api.post<User>('/auth/register', data);
  },

  async update(id: number, data: UpdateUserRequest): Promise<User> {
    return api.put<User>(`/users/${id}`, data);
  },

  async changePassword(id: number, data: ChangePasswordRequest): Promise<{ message: string; user: User }> {
    return api.put<{ message: string; user: User }>(`/users/${id}/password`, data);
  },

  async delete(id: number): Promise<void> {
    return api.delete(`/users/${id}`);
  },
};
