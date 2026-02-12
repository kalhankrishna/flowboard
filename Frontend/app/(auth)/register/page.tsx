"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { register } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Workflow } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const {setUser, setToken} = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Call register API
      const { accessToken, user } = await register({ name, email, password });

      // Save access token to localStorage
      localStorage.setItem('accessToken', accessToken);
      
      // Update Zustand store
      setUser(user);
      setToken(accessToken);
      
      // Show success toast
      toast.success('Account created successfully!');
      
      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (err: any) {
      // Show error
      const errorMessage = err.message || 'Registration failed';
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
        <h1 className='text-gray-700 text-3xl font-heading font-semibold'>Create your account</h1>
        <p className='text-sm text-gray-500 font-sans'>Get started with Flowboard</p>
      </div>
      
      <div className="p-6 w-full max-w-md">
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-600 placeholder:text-gray-400"
              placeholder="Your full name"
              disabled={isLoading}
              autoComplete="name"
            />
          </div>

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
              placeholder="Min 12 characters"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-gray-500">Must be at least 12 characters</p>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-600 placeholder:text-gray-400"
              placeholder="Re-enter password"
              disabled={isLoading}
              autoComplete="new-password"
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-500 hover:text-cyan-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}