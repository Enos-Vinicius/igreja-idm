export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface RegistrationRequest {
  id: number;
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
  photoUrl?: string;
  imageConsentGiven: boolean;
  emailConsentGiven: boolean;
  whatsappConsentGiven: boolean;
  status: RegistrationStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const statusLabels: Record<RegistrationStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

export const statusColors: Record<RegistrationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};
