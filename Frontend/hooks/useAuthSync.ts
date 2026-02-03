import { useAuthStore } from "@/store";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";

export function useAuthSync() {
  const {clearUser, setToken, clearToken} = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        if(!e.newValue){
          clearUser();
          clearToken();
          router.push('/login');
        }
        else {
          setToken(e.newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
}