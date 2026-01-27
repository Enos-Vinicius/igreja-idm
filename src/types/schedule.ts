export type ScheduleType = "worship" | "preaching";

export interface WorshipSchedule {
  id: string;
  type: "worship";
  date: Date;
  minister: string;
  selectedWorships: string[]; // IDs dos louvores selecionados
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
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Schedule = WorshipSchedule | PreachingSchedule;
