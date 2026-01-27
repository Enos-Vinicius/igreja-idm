export type ScheduleType = "worship" | "preaching";

export type WorshipCategory = 
  | "Culto de Domingo"
  | "Culto de Quarta"
  | "Culto de Quinta"
  | "Culto de Mulheres"
  | "Culto de Homens"
  | "Culto de Jovens"
  | "Culto de Crianças"
  | "Culto da Virada";

export type Church = "Uberaba" | "Conceição das Alagoas";

export const WORSHIP_CATEGORIES: WorshipCategory[] = [
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

export interface WorshipSchedule {
  id: string;
  type: "worship";
  date: Date;
  minister: string;
  selectedWorships: string[]; // IDs dos louvores selecionados
  category: WorshipCategory;
  church: Church;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PreachingSchedule {
  id: string;
  type: "preaching";
  date: Date;
  preacher: string;
  theme: string;
  keyVerse: string;
  outline: string; // Esboço da pregação (HTML/Rich text)
  category: WorshipCategory;
  church: Church;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Schedule = WorshipSchedule | PreachingSchedule;
