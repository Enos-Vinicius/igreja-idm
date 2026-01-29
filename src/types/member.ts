export type Gender = 'male' | 'female';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'other';

export type ChurchRole = 'member' | 'worship_minister' | 'leader' | 'deacon' | 'elder' | 'pastor';

export type MembershipStatus = 'active' | 'inactive' | 'visitor' | 'congregant';

export type ChurchLocation = 'uberaba' | 'conceicao_das_alagoas';

export interface Member {
  id: string;
  photo?: string;
  
  // Informações Pessoais
  name: string;
  email: string;
  birthDate: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  occupation: string;
  
  // Contato
  primaryPhone: string;
  secondaryPhone?: string;
  emergencyContact?: string;
  
  // Endereço
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  
  // Informações Eclesiásticas
  church?: ChurchLocation;
  churchRole?: ChurchRole;
  membershipStatus?: MembershipStatus;
  baptismDate?: string;
  joinDate?: string;
  
  // Consentimentos
  imageConsentGiven?: boolean;
  emailConsentGiven?: boolean;
  whatsappConsentGiven?: boolean;
  
  // Observações
  notes?: string;
  
  // Metadados
  createdAt: string;
  updatedAt: string;
}

export const genderLabels: Record<Gender, string> = {
  male: 'Masculino',
  female: 'Feminino',
};

export const maritalStatusLabels: Record<MaritalStatus, string> = {
  single: 'Solteiro(a)',
  married: 'Casado(a)',
  divorced: 'Divorciado(a)',
  widowed: 'Viúvo(a)',
  other: 'Outro',
};

export const churchRoleLabels: Record<ChurchRole, string> = {
  member: 'Membro',
  worship_minister: 'Ministro de Louvor',
  leader: 'Líder',
  deacon: 'Diácono',
  elder: 'Presbítero',
  pastor: 'Pastor(a)',
};

export const membershipStatusLabels: Record<MembershipStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  visitor: 'Visitante',
  congregant: 'Congregado',
};

export const churchLocationLabels: Record<ChurchLocation, string> = {
  uberaba: 'Uberaba',
  conceicao_das_alagoas: 'Conceição das Alagoas',
};
