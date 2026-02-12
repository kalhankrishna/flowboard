"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { login } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Workflow } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const {setUser, setToken} = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Call login API
      const { accessToken, user } = await login({ email, password });

      // Save access token to localStorage
      localStorage.setItem('accessToken', accessToken);
      
      // Update Zustand store
      setUser(user);
      setToken(accessToken);
      
      
      // Show success toast
      toast.success('Login successful!');
      
      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (err: any) {
      // Show error
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col space-y-4 items-center justify-center bg-linear-to-br from-slate-50 to-stone-100">
      
      <Link href="/" className='flex items-center space-x-2'>
        <span className='inline-block'><Workflow className="text-cyan-600 size-7" /></span>
        <span className='text-3xl font-bold font-heading text-gray-700'>Flowboard</span>
      </Link>

      <div className='flex flex-col items-center justify-center space-y-2'>
        <h1 className='text-gray-700 text-3xl font-heading font-semibold'>Welcome Back</h1>
        <p className='text-sm text-gray-500 font-sans'>Sign in to your Flowboard account</p>
      </div>

      <div className="p-6 w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-600 placeholder:text-gray-400"
              placeholder="you@example.com"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-600 placeholder:text-gray-400"
              placeholder="Enter your password"
              disabled={isLoading}
              required
              autoComplete="current-password"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-500 text-white py-2 px-4 rounded-md cursor-pointer hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-cyan-500 hover:text-cyan-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}