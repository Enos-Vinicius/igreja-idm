import { api } from './api';
import { Song, SongInput, SongStats, SongMinister } from '../types/worship';

const CACHE_KEY = 'songs_cache';
const STATS_CACHE_KEY = 'songs_stats_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

interface CachedData<T> {
  data: T;
  timestamp: number;
}

export const songsService = {
  /**
   * Listar todas as músicas
   * @param search - Termo de busca opcional
   * @param useCache - Se deve usar cache (padrão: true, false quando há busca)
   */
  async getAll(search?: string, useCache = true): Promise<Song[]> {
    // Não usa cache para buscas
    if (search) {
      const endpoint = `/songs?search=${encodeURIComponent(search)}`;
      return api.get<Song[]>(endpoint);
    }

    // Tenta usar cache se habilitado
    if (useCache) {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp }: CachedData<Song[]> = JSON.parse(cached);
        const age = Date.now() - timestamp;

        if (age < CACHE_DURATION) {
          console.log('[Cache] Usando dados em cache (louvores)');
          return data;
        }
      }
    }

    // Busca dados da API
    const data = await api.get<Song[]>('/songs');

    // Salva no cache
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));

    return data;
  },

  clearCache() {
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(STATS_CACHE_KEY);
  },

  /**
   * Buscar música por ID
   */
  async getById(id: number | string): Promise<Song> {
    return api.get<Song>(`/songs/${id}`);
  },

  /**
   * Criar nova música
   * @param song - Dados da música
   * @param sheetMusic - Arquivo da cifra/partitura (opcional)
   */
  async create(song: SongInput, sheetMusic?: File): Promise<Song> {
    const formData = new FormData();

    formData.append('title', song.title);
    formData.append('youtubeUrl', song.youtubeUrl);
    formData.append('key', song.key);

    if (song.singer) {
      formData.append('singer', song.singer);
    }

    if (song.notes) {
      formData.append('notes', song.notes);
    }

    // Tags como JSON array
    formData.append('tags', JSON.stringify(song.tags));

    // IDs dos ministros como JSON array
    formData.append('ministerIds', JSON.stringify(song.ministerIds));

    // Arquivo da cifra/partitura
    if (sheetMusic) {
      formData.append('sheetMusic', sheetMusic);
    }

    const result = await api.post<Song>('/songs', formData);
    this.clearCache(); // Limpa cache após criar
    return result;
  },

  /**
   * Atualizar música existente
   * @param id - ID da música
   * @param song - Dados atualizados
   * @param sheetMusic - Novo arquivo da cifra/partitura (opcional)
   */
  async update(id: number | string, song: Partial<SongInput>, sheetMusic?: File): Promise<Song> {
    const formData = new FormData();

    if (song.title !== undefined) {
      formData.append('title', song.title);
    }

    if (song.youtubeUrl !== undefined) {
      formData.append('youtubeUrl', song.youtubeUrl);
    }

    if (song.key !== undefined) {
      formData.append('key', song.key);
    }

    if (song.singer !== undefined) {
      formData.append('singer', song.singer);
    }

    if (song.notes !== undefined) {
      formData.append('notes', song.notes);
    }

    if (song.tags !== undefined) {
      formData.append('tags', JSON.stringify(song.tags));
    }

    if (song.ministerIds !== undefined) {
      formData.append('ministerIds', JSON.stringify(song.ministerIds));
    }

    if (sheetMusic) {
      formData.append('sheetMusic', sheetMusic);
    }

    const result = await api.put<Song>(`/songs/${id}`, formData);
    this.clearCache(); // Limpa cache após atualizar
    return result;
  },

  /**
   * Deletar música
   */
  async delete(id: number | string): Promise<void> {
    await api.delete(`/songs/${id}`);
    this.clearCache(); // Limpa cache após deletar
  },

  /**
   * Obter estatísticas das músicas
   */
  async getStats(): Promise<SongStats> {
    return api.get<SongStats>('/songs/stats');
  },

  /**
   * Listar ministros de louvor ativos
   */
  async getMinisters(): Promise<SongMinister[]> {
    return api.get<SongMinister[]>('/songs/ministers');
  },

  /**
   * Deletar cifra/partitura de uma música
   */
  async deleteSheetMusic(id: number | string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/songs/${id}/sheet-music`);
  },
};
