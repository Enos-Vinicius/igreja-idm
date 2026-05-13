export type Gender = 'Masculino' | 'Feminino';

export type MaritalStatus = 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)' | 'Outro';

export type ChurchRole =
  | 'Membro'
  | 'Ministro de Louvor'
  | 'Músico'
  | 'Mídia Digital'
  | 'Líder'
  | 'Diácono'
  | 'Presbítero'
  | 'Pastor(a)'
  | 'Secretária'
  | 'Tesoureiro'
  | 'Recepcionista';

export type MembershipStatus = 'Ativo' | 'Inativo' | 'Visitante' | 'Congregado' | 'Transferido';

export type ChurchLocation = 'Uberaba' | 'Conceição das Alagoas';

export type MemberType = 'Adulto' | 'Criança';

export type ParentescoRole =
  | 'Pai'
  | 'Mãe'
  | 'Filho'
  | 'Filha'
  | 'Irmão'
  | 'Irmã'
  | 'Avô'
  | 'Avó'
  | 'Neto'
  | 'Neta'
  | 'Tio'
  | 'Tia'
  | 'Sobrinho'
  | 'Sobrinha'
  | 'Primo'
  | 'Prima'
  | 'Cônjuge'
  | 'Responsável'
  | 'Outro';

export interface FamilyMembershipInput {
  familyId?: number;
  familyName?: string;
  role: ParentescoRole;
}

export interface FamilyMembership {
  familyId: number;
  familyName: string;
  role: ParentescoRole;
}

export interface Member {
  id: number;
  userId?: number;
  memberCode?: string;
  photoUrl?: string;

  // Informações Pessoais
  name: string;
  email: string;
  birthDate: string | null;
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
  address?: string; // Campo legado

  // Informações Eclesiásticas
  church?: ChurchLocation | null;
  churchRole?: ChurchRole;
  membershipStatus?: MembershipStatus;
  baptismDate?: string | null;
  joinDate?: string | null;
  ministry?: string; // Campo usado em algumas telas
  isLeader?: boolean;
  isAdmin?: boolean;

  // Consentimentos
  imageConsentGiven?: boolean;
  emailConsentGiven?: boolean;
  whatsappConsentGiven?: boolean;

  // Observações
  notes?: string;

  // Tipo de membro (adulto/criança)
  memberType?: MemberType;

  // Vínculos familiares
  familyMemberships?: FamilyMembership[];

  // Metadados
  createdAt: string;
  updatedAt: string;
}

export const GENDERS: Gender[] = ['Masculino', 'Feminino'];

export const MARITAL_STATUSES: MaritalStatus[] = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'Outro',
];

export const CHURCH_ROLES: ChurchRole[] = [
  'Membro',
  'Ministro de Louvor',
  'Músico',
  'Mídia Digital',
  'Líder',
  'Diácono',
  'Presbítero',
  'Pastor(a)',
  'Secretária',
  'Tesoureiro',
  'Recepcionista',
];

export const MEMBERSHIP_STATUSES: MembershipStatus[] = [
  'Ativo',
  'Inativo',
  'Visitante',
  'Congregado',
  'Transferido',
];

export const CHURCH_LOCATIONS: ChurchLocation[] = [
  'Uberaba',
  'Conceição das Alagoas',
];

export const MEMBER_TYPES: MemberType[] = ['Adulto', 'Criança'];

export const PARENTESCO_ROLES: ParentescoRole[] = [
  'Pai',
  'Mãe',
  'Filho',
  'Filha',
  'Irmão',
  'Irmã',
  'Avô',
  'Avó',
  'Neto',
  'Neta',
  'Tio',
  'Tia',
  'Sobrinho',
  'Sobrinha',
  'Primo',
  'Prima',
  'Cônjuge',
  'Responsável',
  'Outro',
];

export interface AttendanceStats {
  year: number;
  church: string;
  totalAttendances: number;
  totalServices: number;
  attendanceRate: number;
  currentMonth: {
    attendances: number;
    totalServices: number;
  };
  previousMonth: {
    attendances: number;
    totalServices: number;
  };
  lastAttendance: {
    date: string;
    service: string;
    time: string;
  } | null;
}
