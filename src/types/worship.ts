import { Member } from './member';

export interface Song {
  id: number;
  title: string;
  youtubeUrl: string;
  key: string;
  singer?: string;
  tags: string[];
  sheetMusicUrl?: string;
  lyrics?: string;
  ministers: Member[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SongStats {
  totalSongs: number;
  songsWithSheet: number;
  activeMinistersCount: number;
}

export interface SongMinister {
  id: string;
  name: string;
  photo?: string;
}

// Tipo para criação/atualização de música
export interface SongInput {
  title: string;
  youtubeUrl: string;
  key: string;
  singer?: string;
  tags: string[];
  lyrics?: string;
  ministerIds: string[];
}

// Mantendo compatibilidade com código existente (mock)
export interface Worship {
  id: string;
  title: string;
  youtubeLink: string;
  key: string;
  singer?: string;
  ministers: string[];
  tags?: string[];
  fileUrl?: string;
  fileName?: string;
  lyrics?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const MUSICAL_KEYS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  "Cm", "C#m", "Dm", "D#m", "Ebm", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bbm", "Bm"
] as const;

export type MusicalKey = typeof MUSICAL_KEYS[number];
