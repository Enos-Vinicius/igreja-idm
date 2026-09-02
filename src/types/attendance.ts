import { Church, ScheduleCategory } from './schedule';

export interface AttendanceMember {
  id: number;
  name: string;
  church: Church;
  photoUrl?: string;
}

export interface AttendanceRecordedBy {
  id: number;
  name: string;
  email: string;
}

export interface Attendance {
  id: number;
  memberId: number | null;
  member: AttendanceMember | null;
  visitorName: string | null;
  visitorPhone: string | null;
  serviceScheduleId?: string;
  serviceDate: string;
  serviceTime: string;
  serviceType: ScheduleCategory;
  church: Church;
  recordedBy: number;
  recordedByUser?: AttendanceRecordedBy;
  createdAt: string;
}

export interface AttendanceInput {
  memberId?: number;
  visitorName?: string;
  visitorPhone?: string;
  serviceScheduleId: string;
}

export interface AttendanceListResponse {
  serviceDate: string;
  church: Church;
  serviceType: ScheduleCategory;
  serviceTime: string;
  totalPresent: number;
  attendances: Attendance[];
}

export interface AttendanceStats {
  /** Membros Ativo da igreja onde o culto aconteceu — denominador da taxa. */
  totalMembers: number;
  /**
   * Membros na sala, de qualquer igreja e qualquer status (não inclui visitantes).
   * Preservado de propósito para não mudar o número que a tela já mostrava — mas
   * ele e a taxa contam coisas diferentes, então a tela precisa explicar a diferença
   * com os campos abaixo.
   */
  presentMembers: number;
  /** Numerador da taxa: presentes que são Ativo E da igreja do culto. */
  activeMembersPresent?: number;
  absentMembers: number;
  /** Nunca passa de 100: activeMembersPresent / totalMembers. */
  attendanceRate: number;
  visitors?: number;
  /** Presentes que são membros da outra igreja — na lista, fora da conta. */
  otherChurchMembers?: number;
  /** Presentes que não são Ativo (congregado, inativo) — na lista, fora da conta. */
  nonActiveMembers?: number;
}

export interface AttendanceToggleResponse {
  message?: string;
  deleted?: boolean;
  action?: 'created' | 'removed';
  id?: number;
  memberId?: number | null;
  member?: AttendanceMember | null;
  visitorName?: string | null;
  visitorPhone?: string | null;
  serviceDate?: string;
  serviceTime?: string;
  serviceType?: ScheduleCategory;
  church?: Church;
  recordedBy?: number;
  createdAt?: string;
}

export const SERVICE_TIMES = [
  '08:00',
  '09:00',
  '10:00',
  '18:00',
  '19:00',
  '19:30',
  '20:00',
];
