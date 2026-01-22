import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AuthState } from '@/types/auth';

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      clearUser: () => set({ 
        user: null, 
        isAuthenticated: false 
      }),
    }),
    { name: 'AuthStore' }
  )
);