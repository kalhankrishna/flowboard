'use client';

import { useAuthHydration, useAuthSync } from '@/hooks';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthHydration();
  useAuthSync();
  
  return <>{children}</>;
}