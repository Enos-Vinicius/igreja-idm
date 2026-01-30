import { api } from './api';
import {
  Attendance,
  AttendanceInput,
  AttendanceListResponse,
  AttendanceStats,
  AttendanceToggleResponse,
} from '../types/attendance';
import { Church, ScheduleCategory } from '../types/schedule';

export const attendanceService = {
  /**
   * Toggle presença (marcar/desmarcar)
   * Se presença não existe -> cria
   * Se presença já existe -> remove
   */
  async toggle(input: AttendanceInput): Promise<AttendanceToggleResponse> {
    return api.post<AttendanceToggleResponse>('/attendance', input);
  },

  /**
   * Listar presenças de um culto específico
   */
  async list(params: {
    serviceDate: string;
    church: Church;
    serviceType?: ScheduleCategory;
    serviceTime?: string;
  }): Promise<AttendanceListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('serviceDate', params.serviceDate);
    queryParams.append('church', params.church);
    if (params.serviceType) {
      queryParams.append('serviceType', params.serviceType);
    }
    if (params.serviceTime) {
      queryParams.append('serviceTime', params.serviceTime);
    }

    return api.get<AttendanceListResponse>(`/attendance?${queryParams.toString()}`);
  },

  /**
   * Obter estatísticas de um culto específico
   */
  async getStats(params: {
    serviceDate: string;
    serviceTime: string;
    serviceType: ScheduleCategory;
    church: Church;
  }): Promise<AttendanceStats> {
    const queryParams = new URLSearchParams();
    queryParams.append('serviceDate', params.serviceDate);
    queryParams.append('serviceTime', params.serviceTime);
    queryParams.append('serviceType', params.serviceType);
    queryParams.append('church', params.church);

    return api.get<AttendanceStats>(`/attendance/stats?${queryParams.toString()}`);
  },

  /**
   * Buscar presença por ID
   */
  async getById(id: number): Promise<Attendance> {
    return api.get<Attendance>(`/attendance/${id}`);
  },

  /**
   * Editar presença (apenas admin)
   */
  async update(id: number, input: Partial<AttendanceInput>): Promise<Attendance> {
    return api.put<Attendance>(`/attendance/${id}`, input);
  },

  /**
   * Deletar presença (apenas admin)
   */
  async delete(id: number): Promise<void> {
    return api.delete(`/attendance/${id}`);
  },
};
