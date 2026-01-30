export type ScheduleType = "Louvor" | "Pregação";

export type ScheduleCategory =
  | "Culto de Domingo"
  | "Culto de Quarta"
  | "Culto de Quinta"
  | "Culto de Mulheres"
  | "Culto de Homens"
  | "Culto de Jovens"
  | "Culto de Crianças"
  | "Culto da Virada";

export type Church = "Uberaba" | "Conceição das Alagoas";

export const SCHEDULE_CATEGORIES: ScheduleCategory[] = [
  "Culto de Domingo",
  "Culto de Quarta",
  "Culto de Quinta",
  "Culto de Mulheres",
  "Culto de Homens",
  "Culto de Jovens",
  "Culto de Crianças",
  "Culto da Virada",
];

export const CHURCHES: Church[] = ["Uberaba", "Conceição das Alagoas"];

export interface ScheduleMember {
  id: number;
  name: string;
}

export interface ScheduleSong {
  id: number;
  title: string;
  key: string;
}

export interface WorshipSchedule {
  id: number;
  type: "Louvor";
  date: string;
  church: Church;
  category: ScheduleCategory;
  minister: ScheduleMember;
  songs: ScheduleSong[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreachingSchedule {
  id: number;
  type: "Pregação";
  date: string;
  church: Church;
  category: ScheduleCategory;
  preacher: ScheduleMember;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type Schedule = WorshipSchedule | PreachingSchedule;

export interface ScheduleStats {
  totalEscalas: number;
  escalasLouvor: number;
  escalasPregacao: number;
}

export interface ScheduleInput {
  type: ScheduleType;
  date: string;
  church: Church;
  category: ScheduleCategory;
  ministerId?: number;
  songIds?: number[];
  preacherId?: number;
  notes?: string;
}
