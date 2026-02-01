import { api } from './api';

export interface CreatePrayerRequestData {
  name: string;
  phone?: string;
  content: string;
  recaptchaToken: string;
}

export const prayerRequestsService = {
  async create(data: CreatePrayerRequestData): Promise<void> {
    await api.post('/prayer-requests', data, { skipAuth: true });
  },
};
