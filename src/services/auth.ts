import { api, setToken, removeToken, getToken, hasToken } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  mustChangePassword?: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CurrentUser {
  id: number;
  email: string;
  role: string;
  member?: {
    id: number;
    name: string;
    photoUrl?: string;
    church?: string;
  };
}

const USER_STORAGE_KEY = 'genesis_current_user';

// Funções para cachear dados do usuário no localStorage
function saveUserToStorage(user: CurrentUser): void {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Silently fail - storage might be full or unavailable
  }
}

function getUserFromStorage(): CurrentUser | null {
  try {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as CurrentUser;
    }
  } catch {
    // Silently fail - storage might be unavailable or data corrupted
  }
  return null;
}

function removeUserFromStorage(): void {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Silently fail - storage might be unavailable
  }
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials, { skipAuth: true });
    setToken(response.token);

    // Se precisa trocar senha, não busca dados do usuário ainda
    if (response.mustChangePassword) {
      return response;
    }

    // Busca e cacheia os dados do usuário após login
    try {
      const user = await api.get<CurrentUser>('/auth/me');
      saveUserToStorage(user);
    } catch {
      // Silently fail - user data will be fetched on next page load
    }

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
    removeUserFromStorage();
  },

  // Logout local only (when session already expired)
  logoutLocal(): void {
    removeToken();
    removeUserFromStorage();
  },

  // Busca usuário do cache (storage) - não faz requisição
  getCachedUser(): CurrentUser | null {
    return getUserFromStorage();
  },

  // Força busca do servidor e atualiza o cache
  async fetchAndCacheUser(): Promise<CurrentUser> {
    const user = await api.get<CurrentUser>('/auth/me');
    saveUserToStorage(user);
    return user;
  },

  getToken,
  hasToken,
  removeToken,

  isAdmin(user: CurrentUser | null): boolean {
    // Only admin and admin2 have full admin privileges
    const role = user?.role?.toLowerCase();
    return role === 'admin' || role === 'admin2';
  },

  canAccessDashboard(user: CurrentUser | null): boolean {
    // All roles except 'member' can access the dashboard
    const role = user?.role?.toLowerCase();
    return role !== 'member' && !!role;
  },

  // Solicita email de recuperação de senha
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email }, { skipAuth: true });
  },

  // Reseta a senha usando o token recebido por email e faz login automático
  async resetPassword(token: string, newPassword: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/reset-password', { token, newPassword }, { skipAuth: true });

    // Se o backend retornou um token, salva para login automático
    if (response.token) {
      setToken(response.token);

      // Busca e cacheia os dados do usuário
      try {
        const user = await api.get<CurrentUser>('/auth/me');
        saveUserToStorage(user);
      } catch {
        // Silently fail - user data will be fetched on next page load
      }
    }

    return response;
  },

  // Altera a senha (primeiro acesso ou alteração voluntária)
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  },

  // Define a senha no primeiro acesso usando o token de ativação
  async setPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/set-password', { token, newPassword }, { skipAuth: true });
  },

  // Reenvia link de ativação para usuário que não definiu senha
  async resendActivation(email: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/resend-activation', { email }, { skipAuth: true });
  },
};
