export interface ServiceSchedule {
  id: string;
  title: string;
  city: string;
  state: string;
  address: string;
  mapsUrl?: string;
  date: string; // ISO format: YYYY-MM-DD
  time: string; // HH:MM format
  hasKidsMinistry?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceScheduleDto {
  id: string;
  title: string;
  city: string;
  state: string;
  address: string;
  date: string;
  time: string;
  hasKidsMinistry?: boolean;
}

export interface UpdateServiceScheduleDto {
  title?: string;
  city?: string;
  state?: string;
  address?: string;
  date?: string;
  time?: string;
  hasKidsMinistry?: boolean;
}

export interface ServiceScheduleFilters {
  month?: string; // Format: YYYY-MM
  church?: string; // City name for filtering
}
