import { useAuthStore } from "@/store";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";

export function useAuthSync() {
  const clearUser = useAuthStore(state => state.clearUser);
  const router = useRouter();

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' && !e.newValue) {
        clearUser();
        router.push('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [clearUser, router]);
}