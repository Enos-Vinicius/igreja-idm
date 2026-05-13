import { ChurchLocation } from './member';

export type ContributionType = 'Dízimo' | 'Oferta' | 'Primícias' | 'Outros';

export type PaymentMethod = 'Dinheiro' | 'PIX' | 'Cartão' | 'Cheque' | 'Outros';

export const CONTRIBUTION_TYPES: ContributionType[] = ['Dízimo', 'Oferta', 'Primícias', 'Outros'];

export const PAYMENT_METHODS: PaymentMethod[] = ['Dinheiro', 'PIX', 'Cartão', 'Cheque', 'Outros'];

export interface ContributionMemberSummary {
  id: number;
  name: string;
  photoUrl?: string;
}

export interface ContributionServiceScheduleSummary {
  id: string;
  date: string;
  title?: string;
  church?: ChurchLocation;
}

export interface ContributionUserSummary {
  id: number;
  email: string;
  name?: string;
}

export interface Contribution {
  id: number;
  serviceScheduleId: string;
  serviceSchedule?: ContributionServiceScheduleSummary;
  memberId?: number | null;
  member?: ContributionMemberSummary | null;
  nonMemberName?: string | null;
  type: ContributionType;
  amount: number;
  paymentMethod?: PaymentMethod | null;
  notes?: string | null;
  church: ChurchLocation;
  registeredById: number;
  registeredBy?: ContributionUserSummary;
  lastEditedById?: number | null;
  lastEditedBy?: ContributionUserSummary | null;
  lastEditedAt?: string | null;
  deletedAt?: string | null;
  deletedById?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContributionItemInput {
  memberId?: number | null;
  nonMemberName?: string | null;
  type: ContributionType;
  amount: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface ContributionBatchInput {
  serviceScheduleId: string;
  contributions: ContributionItemInput[];
}

export interface ContributionUpdateInput {
  type?: ContributionType;
  amount?: number;
  paymentMethod?: PaymentMethod | null;
  notes?: string | null;
  memberId?: number | null;
  nonMemberName?: string | null;
}

export interface ContributionBatchResponse {
  message: string;
  contributions: Contribution[];
}

export interface ContributionFilters {
  church?: ChurchLocation;
  serviceScheduleId?: string;
  memberId?: number;
  type?: ContributionType;
  startDate?: string;
  endDate?: string;
  includeDeleted?: boolean;
}

export interface ContributionSummaryByType {
  type: ContributionType;
  total: number;
  count: number;
}

export interface ContributionSummary {
  total: number;
  count: number;
  byType: ContributionSummaryByType[];
}

export interface ContributionSummaryFilters {
  church?: ChurchLocation;
  startDate?: string;
  endDate?: string;
}
