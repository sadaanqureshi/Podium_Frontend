'use client';
import Cookies from 'js-cookie';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch } from '@/lib/store/hooks';
import { logout, setAuth } from '@/lib/store/features/authSlice';
import { loginUser, logoutLocal } from '@/lib/api/apiService'; 
import AuthLayout from '@/components/auth/AuthLayout';
import { Loader2 } from 'lucide-react';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(logout());
    setError('');
    setIsLoading(true);

    try {
      const response = await loginUser({ email, password });
      const userRole = response.user.role.roleName.toLowerCase();

      if (userRole === 'teacher') {
        Cookies.set('authToken', response.access_token);
        Cookies.set('userRole', response.user.role.roleName);

        dispatch(setAuth({
          user: response.user,
          token: response.access_token,
          role: response.user.role.roleName,
          sidebar: response.sidebar
        }));

        router.replace('/teacher/dashboard');
      } else {
        logoutLocal(); 
        dispatch(logout());
        setError('Unauthorized: Only Teachers can access this portal.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full space-y-8 animate-in fade-in duration-500">
        {/* Header Section Updated with Theme Tokens */}
        <div>
          <h1 className="text-3xl font-black mb-2 text-text-main uppercase tracking-tighter italic leading-none">
            Teacher <span className="text-accent-blue">Portal.</span>
          </h1>
          <p className="text-text-muted font-medium text-sm">Enter your details to manage your classes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Work Email Node */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-text-muted ml-3">
              Work Email Node
            </label>
            <input
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@podium.edu"
              className="w-full px-6 py-4 bg-app-bg border border-border-subtle rounded-2xl focus:border-accent-blue outline-none transition-all font-bold text-sm text-text-main shadow-inner"
              required 
              disabled={isLoading}
            />
          </div>

          {/* Password Node */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-text-muted">
                Security Key
              </label>
              <Link href="/forgotpassword" className="text-[10px] font-black uppercase tracking-widest text-accent-blue hover:opacity-80 transition-opacity">
                Forgot?
              </Link>
            </div>
            <input
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-app-bg border border-border-subtle rounded-2xl focus:border-accent-blue outline-none transition-all font-bold text-sm text-text-main shadow-inner"
              required 
              disabled={isLoading}
            />
          </div>

          {/* Error Message Feed */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-widest border border-red-500/20 animate-shake">
              {error}
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-accent-blue text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent-blue/20 active:scale-95 disabled:bg-accent-blue/50"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} strokeWidth={3} /> 
                Verifying Terminal...
              </>
            ) : (
              'Sign in to Dashboard'
            )}
          </button>
        </form>

        {/* Footer Redirect */}
        <p className="text-[10px] text-center text-text-muted font-black uppercase tracking-widest mt-8">
          New instructor?{' '}
          <Link href="/auth/signup" className="text-accent-blue hover:underline decoration-2 underline-offset-4">
            Apply here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignInPage;