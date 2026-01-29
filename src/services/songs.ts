import { api } from './api';
import { Song, SongInput, SongStats, SongMinister } from '../types/worship';

export const songsService = {
  /**
   * Listar todas as músicas
   * @param search - Termo de busca opcional
   */
  async getAll(search?: string): Promise<Song[]> {
    const endpoint = search ? `/songs?search=${encodeURIComponent(search)}` : '/songs';
    return api.get<Song[]>(endpoint);
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

    return api.post<Song>('/songs', formData);
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

    return api.put<Song>(`/songs/${id}`, formData);
  },

  /**
   * Deletar música
   */
  async delete(id: number | string): Promise<void> {
    return api.delete(`/songs/${id}`);
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
