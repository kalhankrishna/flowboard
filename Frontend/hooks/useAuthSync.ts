import { useAuthStore } from "@/store";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";

export function useAuthSync() {
  const {clearUser, clearToken} = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' && !e.newValue) {
        clearUser();
        clearToken();
        router.push('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
}