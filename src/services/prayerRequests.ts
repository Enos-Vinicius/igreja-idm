import { api } from './api';

export interface CreatePrayerRequestData {
  name: string;
  phone?: string;
  content: string;
  recaptchaToken: string;
}

export interface PrayerRequest {
  id: number;
  name: string;
  phone?: string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerRequestsListResponse {
  data: PrayerRequest[];
  total: number;
  unreadCount: number;
}

export interface PrayerRequestsListParams {
  read?: boolean;
  limit?: number;
  offset?: number;
}

export const prayerRequestsService = {
  // Public endpoint
  async create(data: CreatePrayerRequestData): Promise<void> {
    await api.post('/prayer-requests', data, { skipAuth: true });
  },

  // Admin endpoints
  async getAll(params?: PrayerRequestsListParams): Promise<PrayerRequestsListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.read !== undefined) {
      queryParams.append('read', String(params.read));
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', String(params.limit));
    }
    if (params?.offset !== undefined) {
      queryParams.append('offset', String(params.offset));
    }
    const queryString = queryParams.toString();
    const endpoint = `/prayer-requests${queryString ? `?${queryString}` : ''}`;
    return api.get<PrayerRequestsListResponse>(endpoint);
  },

  async getById(id: number): Promise<PrayerRequest> {
    return api.get<PrayerRequest>(`/prayer-requests/${id}`);
  },

  async markAsRead(id: number): Promise<void> {
    await api.patch(`/prayer-requests/${id}/read`);
  },

  async markAsUnread(id: number): Promise<void> {
    await api.patch(`/prayer-requests/${id}/unread`);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/prayer-requests/${id}`);
  },
};
