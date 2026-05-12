import { create } from 'zustand';
import { authApi } from '@/api/authApi';
import { tokenStorage } from '@/storage/tokenStorage';
import { ENV } from '@/config/env';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUnauthenticated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  error: null,

  bootstrap: async () => {
    const access = await tokenStorage.getAccess();
    set({ status: access ? 'authenticated' : 'unauthenticated' });
  },

  login: async (username, password) => {
    set({ error: null });
    try {
      const res = await authApi.login({ username, password });
      if (!res.access || !res.refresh) throw new Error('Invalid server response');
      await tokenStorage.setTokens(res.access, res.refresh);
      set({ status: 'authenticated' });
    } catch (e) {
      const err = e as { response?: { status?: number; data?: { detail?: string } }; message?: string };
      const isNetworkError = !err.response;
      if (ENV.USE_MOCK_FALLBACK && isNetworkError) {
        await tokenStorage.setTokens('mock-access-token', 'mock-refresh-token');
        set({ status: 'authenticated' });
        return;
      }
      const msg = err.response?.data?.detail || err.message || 'Login failed';
      set({ error: msg });
      throw e;
    }
  },

  logout: async () => {
    const refresh = await tokenStorage.getRefresh();
    await authApi.logout(refresh);
    await tokenStorage.clear();
    set({ status: 'unauthenticated' });
  },

  setUnauthenticated: () => set({ status: 'unauthenticated' }),
}));
