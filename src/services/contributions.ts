import { api } from './api';
import {
  Contribution,
  ContributionBatchInput,
  ContributionBatchResponse,
  ContributionUpdateInput,
  ContributionFilters,
  ContributionSummary,
  ContributionSummaryFilters,
} from '../types/contribution';

function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });
  const str = search.toString();
  return str ? `?${str}` : '';
}

export const contributionsService = {
  async createBatch(input: ContributionBatchInput): Promise<ContributionBatchResponse> {
    return api.post<ContributionBatchResponse>('/contributions/batch', input);
  },

  async getAll(filters: ContributionFilters = {}): Promise<Contribution[]> {
    const query = buildQuery({
      church: filters.church,
      serviceScheduleId: filters.serviceScheduleId,
      memberId: filters.memberId,
      type: filters.type,
      startDate: filters.startDate,
      endDate: filters.endDate,
      includeDeleted: filters.includeDeleted ? 'true' : undefined,
    });
    return api.get<Contribution[]>(`/contributions${query}`);
  },

  async getById(id: number | string): Promise<Contribution> {
    return api.get<Contribution>(`/contributions/${id}`);
  },

  async update(id: number | string, input: ContributionUpdateInput): Promise<Contribution> {
    return api.put<Contribution>(`/contributions/${id}`, input);
  },

  async delete(id: number | string): Promise<void> {
    await api.delete<void>(`/contributions/${id}`);
  },

  async getSummary(filters: ContributionSummaryFilters = {}): Promise<ContributionSummary> {
    const query = buildQuery({
      church: filters.church,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
    return api.get<ContributionSummary>(`/contributions/summary${query}`);
  },
};
