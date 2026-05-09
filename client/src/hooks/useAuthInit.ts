import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';

export function useAuthInit() {
  const { setAuth, setLoading, logout } = useAuthStore();

  useEffect(() => {
    async function init() {
      const storedToken = localStorage.getItem('auth-storage');
      let token: string | null = null;

      if (storedToken) {
        try {
          const parsed = JSON.parse(storedToken);
          token = parsed.state?.token || null;
        } catch {
          token = null;
        }
      }

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await authApi.fetchMe();
        setAuth(data.user, token);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [setAuth, setLoading, logout]);
}
