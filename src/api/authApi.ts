import { axiosClient } from './axiosClient';
import { endpoints } from './endpoints';
import { LoginRequest, LoginResponse } from '@/types/auth';

export const authApi = {
  async login(body: LoginRequest): Promise<LoginResponse> {
    const { data } = await axiosClient.post<LoginResponse>(endpoints.auth.login, body);
    return data;
  },

  async logout(refresh: string | null): Promise<void> {
    if (!refresh) return;
    try {
      await axiosClient.post(endpoints.auth.logout, { refresh });
    } catch {
      // ignore — token may already be invalid
    }
  },
};
