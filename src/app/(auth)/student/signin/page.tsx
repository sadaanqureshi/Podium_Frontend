'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch } from '@/lib/store/hooks';
import { logout, setAuth } from '@/lib/store/features/authSlice';
import { loginUser, logoutLocal } from '@/lib/api/apiService';
import AuthLayout from '@/components/auth/AuthLayout';
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

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

      if (userRole === 'student') {
        Cookies.set('authToken', response.access_token);
        Cookies.set('userRole', response.user.role.roleName);

        dispatch(setAuth({
          user: response.user,
          token: response.access_token,
          role: response.user.role.roleName,
          sidebar: response.sidebar
        }));
        router.replace('/student/dashboard');
      } else {
        logoutLocal();
        dispatch(logout());
        setError('Unauthorized: Admins/Teachers must use their respective portals.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full space-y-8 animate-in fade-in duration-300">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-black mb-2 text-text-main uppercase tracking-tighter italic">Student Sign in</h1>
          <p className="text-text-muted font-medium">Please enter your details to access your portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Node */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-text-muted ml-3">
              Email Node
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-6 py-4 bg-app-bg border border-border-subtle text-text-main rounded-2xl outline-none focus:border-accent-blue shadow-inner font-bold transition-all disabled:opacity-50"
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
              <Link
                href="/forgotpassword"
                className="text-[10px] font-black uppercase tracking-widest text-accent-blue hover:opacity-80 transition-opacity"
              >
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-app-bg border border-border-subtle text-text-main rounded-2xl outline-none focus:border-accent-blue shadow-inner font-bold transition-all disabled:opacity-50"
              required
              disabled={isLoading}
            />
          </div>

          {/* Error Feed */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-widest border border-red-500/20 animate-shake">
              {error}
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-accent-blue text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-accent-blue/20 active:scale-95 disabled:bg-accent-blue/50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} strokeWidth={3} />
                Authorizing...
              </>
            ) : (
              'Access Portal'
            )}
          </button>
        </form>

        {/* Signup Redirect */}
        <p className="text-sm text-center text-text-muted font-medium">
          Don&apos;t have an account?{' '}
          <Link href="/student/signup" className="font-black text-accent-blue hover:underline decoration-2 underline-offset-4 uppercase text-[10px] tracking-widest">
            Signup
          </Link>
        </p>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-grow border-t border-border-subtle"></div>
          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-50">Social Node</span>
          <div className="flex-grow border-t border-border-subtle"></div>
        </div>

        {/* Google Social Action */}
        <button
          type="button"
          disabled={isLoading}
          className="w-full py-4 bg-card-bg border border-border-subtle rounded-2xl flex items-center justify-center gap-3 hover:bg-app-bg transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <FcGoogle size={20} />
          <span className="font-black text-text-main text-[10px] uppercase tracking-widest">Connect with Google</span>
        </button>
      </div>
    </AuthLayout>
  );
};

export default SignInPage;