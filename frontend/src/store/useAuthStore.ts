import { create } from 'zustand';
import { User } from '@/types';
import { authApi } from '@/services/api';
import { socketService } from '@/services/socket';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; full_name?: string; role?: string }) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login(username, password);
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
      const user = await authApi.getMe();
      socketService.connect(user.id);
      set({ user, token: data.access_token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Authentication failed. Please check credentials.';
      set({ error: msg, isLoading: false, isAuthenticated: false });
      throw err;
    }
  },

  register: async (registerData) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.register(registerData);
      await useAuthStore.getState().login(registerData.username, registerData.password);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed.';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    socketService.disconnect();
    set({ user: null, token: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  fetchUser: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    set({ isLoading: true });
    try {
      const user = await authApi.getMe();
      socketService.connect(user.id);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
