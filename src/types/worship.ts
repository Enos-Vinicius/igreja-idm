export interface Worship {
  id: string;
  title: string;
  youtubeLink: string;
  key: string; // Tonalidade
  singer?: string; // Cantor de referência
  ministers: string[]; // Pode ter múltiplos ministros
  fileUrl?: string;
  fileName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const MUSICAL_KEYS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  "Cm", "C#m", "Dm", "D#m", "Ebm", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bbm", "Bm"
] as const;
