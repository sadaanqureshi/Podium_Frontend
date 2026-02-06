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
    dispatch(logout()); // Purana session clear karein
    setError('');
    setIsLoading(true);

    try {
      const response = await loginUser({ email, password });
      const userRole = response.user.role.roleName.toLowerCase();

      // # 1. ROLE CHECK & SESSION COOKIE SETTING (No Expiry = Logout on Browser Close)
      if (userRole === 'admin') {
        // Expiry nahi di, isliye browser close hote hi delete ho jayengi
        Cookies.set('authToken', response.access_token);
        Cookies.set('userRole', response.user.role.roleName);

        // # 2. REDUX AUTH UPDATE
        dispatch(setAuth({
          user: response.user,
          token: response.access_token,
          role: response.user.role.roleName,
          sidebar: response.sidebar
        }));

        router.replace('/admin/dashboard');
      } else {
        // Agar koi ghalat portal par login kare
        logoutLocal(); 
        dispatch(logout());
        setError('Unauthorized: Only Admins can access this portal.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        <h1 className="text-3xl font-black mb-2 text-[#0F172A] tracking-tight leading-none uppercase">Admin <span className="text-blue-600">Portal.</span></h1>
        <p className="text-slate-500 font-medium mb-8 text-sm">Enter your administrative credentials below.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
            <input
              type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@podium.com"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.25rem] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-sm"
              required disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <Link href="/forgotpassword" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">Forgot?</Link>
            </div>
            <input
              type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.25rem] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-sm"
              required disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <button
            type="submit" disabled={isLoading}
            className="w-full py-4 bg-[#0F172A] text-white font-black uppercase text-xs tracking-[0.2em] rounded-[1.25rem] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <><Loader2 className="animate-spin" size={18} /> Authenticating...</> : 'Sign in to Admin'}
          </button>
        </form>

        <p className="text-xs text-center text-slate-400 font-bold mt-8 uppercase tracking-widest">
          Need a staff account?{' '}
          <Link href="/auth/signup" className="text-blue-600 hover:underline">Contact Support</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignInPage;