import { Member } from './member';

export type UserRole = 'admin' | 'admin2' | 'secretary' | 'treasurer' | 'receptionist' | 'leader' | 'member';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  createdAt: Date;
  member?: Member;
}
