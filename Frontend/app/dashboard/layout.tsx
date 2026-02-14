"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  // Show loading while hydrating
  if (!isInitialized) {
    return (
      <div className="fixed inset-0 bg-linear-to-br from-slate-50 to-stone-100 flex items-center justify-center z-400 pointer-events-auto">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Show loading while user data loads (edge case)
  if (!user) {
    return (
      <div className="fixed inset-0 bg-linear-to-br from-slate-50 to-stone-100 flex items-center justify-center z-400 pointer-events-auto">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-linear-to-br from-slate-50 to-stone-100">
      <Navbar />
      <main className="grow">
        {children}
      </main>
    </div>
  );
}