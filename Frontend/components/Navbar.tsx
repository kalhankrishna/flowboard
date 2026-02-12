"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { logout as logoutAPI } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { Workflow, LogOut } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const {clearUser, clearToken} = useAuthStore();
  const queryClient = useQueryClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Call logout API (clears cookie)
      await logoutAPI();

      //Clear LocalStorage
      localStorage.removeItem('accessToken');
      
      // Clear Zustand state
      clearUser();
      clearToken();
      
      // Show success toast
      toast.success('Logged out successfully');

      // Clear React Query cache
      queryClient.clear();
      
      // Redirect to login
      router.push('/login');
      
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    } finally {
      setIsLoggingOut(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-500 bg-linear-to-br from-slate-50 to-stone-100 border-b-2 flex justify-between px-4 py-4 shadow-xs">
      <Link href="/" className='flex items-center space-x-2 pl-4'>
        <span className='inline-block'><Workflow className="text-cyan-600 size-7" /></span>
        <span className='text-3xl font-bold font-heading text-gray-700'>Flowboard</span>
      </Link>

      {user && (
        <div className="relative pr-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 font-sans font-semibold border text-cyan-500 hover:text-white hover:bg-cyan-500 hover:cursor-pointer px-4 py-2 rounded-lg transition"
          >
            <span>{user.name}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 z-500 mt-2 px-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 w-full text-left my-1 px-4 py-2 text-sm text-gray-700 rounded-lg hover:text-white hover:bg-cyan-500 hover:cursor-pointer disabled:opacity-50 transition"
              >
                <span className='inline-block'><LogOut/></span>
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
}