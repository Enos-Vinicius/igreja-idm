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
  };
}

const USER_STORAGE_KEY = 'genesis_current_user';

// Funções para cachear dados do usuário no localStorage
function saveUserToStorage(user: CurrentUser): void {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('[Auth] Error saving user to storage:', error);
  }
}

function getUserFromStorage(): CurrentUser | null {
  try {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as CurrentUser;
    }
  } catch (error) {
    console.error('[Auth] Error reading user from storage:', error);
  }
  return null;
}

function removeUserFromStorage(): void {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('[Auth] Error removing user from storage:', error);
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
    } catch (error) {
      console.error('[Auth] Error fetching user after login:', error);
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
    return user?.role?.toLowerCase() === 'admin';
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
      } catch (error) {
        console.error('[Auth] Error fetching user after password reset:', error);
      }
    }

    return response;
  },

  // Altera a senha (primeiro acesso ou alteração voluntária)
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  },
};
