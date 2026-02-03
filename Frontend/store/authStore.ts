import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AuthState } from '@/types/auth';

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,
      accessToken: null,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isInitialized: true 
      }),
      
      clearUser: () => set({ 
        user: null, 
        isAuthenticated: false,
        isInitialized: true
      }),

      setToken: (accessToken) => set({ accessToken }),

      clearToken: () => set({ accessToken: null }),
    }),
    { name: 'AuthStore' }
  )
);