import { environment } from '../config/environment';

const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasToken(): boolean {
  return !!getToken();
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Erro de requisição que preserva o status HTTP. Permite decidir se vale
 * repetir a chamada (5xx, instância hibernando) ou não (401, 403, 4xx em geral).
 * A mensagem continua sendo a do servidor, para quem já trata error.message.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...restOptions } = options;

  const headers: HeadersInit = {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Remove Content-Type for FormData (browser sets it automatically with boundary)
  if (restOptions.body instanceof FormData) {
    delete (headers as Record<string, string>)['Content-Type'];
  }

  // Add Authorization header if token exists and skipAuth is false
  if (!skipAuth) {
    const token = getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${environment.apiUrl}${endpoint}`, {
    ...restOptions,
    headers,
  });

  // Handle 401 Unauthorized - dispatch event for session expiry
  if (response.status === 401) {
    removeToken();
    window.dispatchEvent(new CustomEvent('auth:session-expired'));
    throw new ApiError('Sessão expirada. Por favor, faça login novamente.', 401);
  }

  // Handle non-OK responses
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `Erro na requisição: ${response.status}`,
      response.status,
      errorData
    );
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
};
