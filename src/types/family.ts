import { ParentescoRole } from './member';

export interface FamilyMemberSummary {
  memberId: number;
  memberName: string;
  role: ParentescoRole;
  photoUrl?: string;
}

export interface Family {
  id: number;
  name: string;
  members?: FamilyMemberSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface FamilyInput {
  name: string;
}

export interface AddFamilyMemberInput {
  memberId: number;
  role: ParentescoRole;
}
