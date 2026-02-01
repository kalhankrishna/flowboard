'use client';

import { useAuthHydration, useAuthSync, useWebSockets } from '@/hooks';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthHydration();
  useAuthSync();
  useWebSockets();
  
  return <>{children}</>;
}