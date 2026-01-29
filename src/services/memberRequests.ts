import { api } from './api';
import { RegistrationRequest } from '../types/registrationRequest';

export interface MemberRequestCreate {
  name: string;
  email: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  occupation: string;
  primaryPhone: string;
  secondaryPhone?: string;
  emergencyContact?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  photo?: File;
  imageConsentGiven?: boolean;
  emailConsentGiven?: boolean;
  whatsappConsentGiven?: boolean;
  recaptchaToken: string;
}

export interface MemberRequestResponse {
  message: string;
  id: number;
}

export const memberRequestsService = {
  // Público - Auto-cadastro
  async create(data: MemberRequestCreate): Promise<MemberRequestResponse> {
    const formData = new FormData();

    // Campos obrigatórios
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('birthDate', data.birthDate);
    formData.append('gender', data.gender);
    formData.append('maritalStatus', data.maritalStatus);
    formData.append('occupation', data.occupation);
    formData.append('primaryPhone', data.primaryPhone);
    formData.append('recaptchaToken', data.recaptchaToken);

    // Campos opcionais
    if (data.secondaryPhone) formData.append('secondaryPhone', data.secondaryPhone);
    if (data.emergencyContact) formData.append('emergencyContact', data.emergencyContact);
    if (data.zipCode) formData.append('zipCode', data.zipCode);
    if (data.street) formData.append('street', data.street);
    if (data.number) formData.append('number', data.number);
    if (data.complement) formData.append('complement', data.complement);
    if (data.neighborhood) formData.append('neighborhood', data.neighborhood);
    if (data.city) formData.append('city', data.city);
    if (data.state) formData.append('state', data.state);
    if (data.photo) formData.append('photo', data.photo);
    if (data.imageConsentGiven !== undefined) formData.append('imageConsentGiven', String(data.imageConsentGiven));
    if (data.emailConsentGiven !== undefined) formData.append('emailConsentGiven', String(data.emailConsentGiven));
    if (data.whatsappConsentGiven !== undefined) formData.append('whatsappConsentGiven', String(data.whatsappConsentGiven));

    return api.post<MemberRequestResponse>('/member-requests', formData, { skipAuth: true });
  },

  // Admin - Listar solicitações
  async getAll(status?: string): Promise<RegistrationRequest[]> {
    const endpoint = status ? `/member-requests?status=${status}` : '/member-requests';
    return api.get<RegistrationRequest[]>(endpoint);
  },

  // Admin - Obter detalhes
  async getById(id: number): Promise<RegistrationRequest> {
    return api.get<RegistrationRequest>(`/member-requests/${id}`);
  },

  // Admin - Aprovar solicitação
  async approve(id: number): Promise<{ message: string; memberId: number }> {
    return api.put<{ message: string; memberId: number }>(`/member-requests/${id}/approve`, {});
  },

  // Admin - Rejeitar solicitação
  async reject(id: number, reason: string): Promise<{ message: string }> {
    return api.put<{ message: string }>(`/member-requests/${id}/reject`, { reason });
  },

  // Admin - Editar solicitação
  async update(id: number, data: Partial<RegistrationRequest>): Promise<RegistrationRequest> {
    return api.put<RegistrationRequest>(`/member-requests/${id}`, data);
  },

  // Admin - Deletar solicitação
  async delete(id: number): Promise<void> {
    return api.delete(`/member-requests/${id}`);
  },

  // Admin - Contar pendentes
  async getPendingCount(): Promise<{ count: number }> {
    return api.get<{ count: number }>('/member-requests/pending/count');
  },
};
