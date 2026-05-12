import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/config/env';
import { endpoints } from './endpoints';
import { tokenStorage } from '@/storage/tokenStorage';

type AuthFailureHandler = () => void;
let onAuthFailure: AuthFailureHandler | null = null;

export function setAuthFailureHandler(handler: AuthFailureHandler | null) {
  onAuthFailure = handler;
}

export const axiosClient = axios.create({
  baseURL: `${ENV.API_BASE_URL}${ENV.API_PREFIX}`,
  timeout: ENV.REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

axiosClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const access = await tokenStorage.getAccess();
  if (access) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${access}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const refresh = await tokenStorage.getRefresh();
      if (!refresh) return null;
      const res = await axios.post(
        `${ENV.API_BASE_URL}${ENV.API_PREFIX}${endpoints.auth.refresh}`,
        { refresh },
        { timeout: ENV.REQUEST_TIMEOUT_MS },
      );
      const newAccess: string | undefined = res.data?.access;
      if (!newAccess) return null;
      await tokenStorage.setAccess(newAccess);
      return newAccess;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

axiosClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true;
      const access = await refreshAccessToken();
      if (access) {
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${access}` };
        return axiosClient.request(original);
      }
      await tokenStorage.clear();
      onAuthFailure?.();
    }
    return Promise.reject(error);
  },
);
