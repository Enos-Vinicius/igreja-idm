import { api, setToken, removeToken, getToken, hasToken } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface CurrentUser {
  id: number;
  email: string;
  role: string;
  member?: {
    id: number;
    name: string;
    photoUrl?: string;
  };
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials, { skipAuth: true });
    setToken(response.token);
    return response;
  },

  async logout(): Promise<void> {
    const token = getToken();
    if (token) {
      try {
        await api.post('/auth/logout', undefined, { skipAuth: false });
      } catch {
        // Ignore errors on logout - token may already be invalid
      }
    }
    removeToken();
  },

  // Logout local only (when session already expired)
  logoutLocal(): void {
    removeToken();
  },

  async getCurrentUser(): Promise<CurrentUser> {
    return api.get<CurrentUser>('/auth/me');
  },

  getToken,
  hasToken,
  removeToken,

  isAdmin(user: CurrentUser | null): boolean {
    return user?.role?.toLowerCase() === 'admin';
  },
};
