'use client';

import { useAuthHydration, useAuthSync } from '@/hooks';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthHydration();
  useAuthSync();

  const {setToken, clearToken, clearUser} = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleTokenRefresh = (e: Event) => {
      const customEvent = e as CustomEvent<{ accessToken: string }>;
      setToken(customEvent.detail.accessToken);
    };

    const handleSessionExpired = () => {
      clearUser();
      clearToken();
      localStorage.removeItem('accessToken');
      router.push('/login');
    };

    const handleUnauthorized = () => {
      clearUser();
      clearToken();
      localStorage.removeItem('accessToken');
      router.push('/login');
    };

    window.addEventListener('auth:token-refreshed', handleTokenRefresh);
    window.addEventListener('auth:session-expired', handleSessionExpired);
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefresh);
      window.removeEventListener('auth:session-expired', handleSessionExpired);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);
  
  return <>{children}</>;
}