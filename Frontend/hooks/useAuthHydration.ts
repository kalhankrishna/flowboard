import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '@/store/authStore';

export function useAuthHydration() {
  const setUser = useAuthStore(state => state.setUser);
  const clearUser = useAuthStore(state => state.clearUser);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
        clearUser();
        return;
    }

    try {
      const decoded = jwtDecode<{userId: string; email: string; name: string; exp: number;}>(token);

      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('accessToken');
        return;
      }

      setUser({id: decoded.userId, email: decoded.email, name: decoded.name});
    } catch (error) {
      console.error('Invalid token:', error);
      localStorage.removeItem('accessToken');
      clearUser();
    }
  }, [setUser, clearUser]);
}