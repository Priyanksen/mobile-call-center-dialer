import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  return { status, error, login, logout };
}
