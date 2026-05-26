import axios from 'axios';
import { useAuthStore } from '../store/auth';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject auth token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: unwrap envelope or throw
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data as { success: boolean; error?: { message: string } };
    if (data.success === false) {
      const errMsg = data.error?.message ?? 'Erro desconhecido';
      return Promise.reject(new Error(errMsg));
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Clear auth state
      localStorage.removeItem('auth-store');
      // Redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    const message =
      axios.isAxiosError(error) && error.response?.data?.error?.message
        ? (error.response.data as { error: { message: string } }).error.message
        : error instanceof Error
          ? error.message
          : 'Erro desconhecido';
    return Promise.reject(new Error(message));
  },
);

/** Unwrap .data.data from envelope */
export function unwrap<T>(response: { data: { data: T } }): T {
  return response.data.data;
}
