import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '@/store/authStore';

export function useAuthHydration() {
  const { setUser, clearUser, setToken, clearToken } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      clearUser();
      clearToken();
      return;
    }

    try {
      const decoded = jwtDecode<{userId: string; email: string; name: string; exp: number;}>(token);

      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('accessToken');
        clearUser();
        clearToken();
        return;
      }

      setUser({userId: decoded.userId, email: decoded.email, name: decoded.name});
      setToken(token);
    } catch (error) {
      console.error('Invalid token:', error);
      localStorage.removeItem('accessToken');
      clearUser();
      clearToken();
    }
  }, []);
}