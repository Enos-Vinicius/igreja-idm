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
  serviceDate: string;
  serviceTime: string;
  serviceType: ScheduleCategory;
  church: Church;
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
  totalMembers: number;
  presentMembers: number;
  absentMembers: number;
  attendanceRate: number;
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
