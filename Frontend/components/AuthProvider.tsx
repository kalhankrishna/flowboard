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
    const handleTokenRefresh = (e: CustomEvent<{ accessToken: string }>) => {
      setToken(e.detail.accessToken);
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
    }

    window.addEventListener('auth:token-refreshed', handleTokenRefresh as EventListener);
    window.addEventListener('auth:session-expired', handleSessionExpired as EventListener);
    window.addEventListener('auth:unauthorized', handleUnauthorized as EventListener);
    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefresh as EventListener);
      window.removeEventListener('auth:session-expired', handleSessionExpired as EventListener);
      window.removeEventListener('auth:unauthorized', handleUnauthorized as EventListener);
    };
  }, []);
  
  return <>{children}</>;
}