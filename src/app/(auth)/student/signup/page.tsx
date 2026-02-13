'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { registerStudentAPI } from '@/lib/api/apiService';
import { Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

const SignUpPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Security Check: Passwords match hone chahiye
    if (formData.password !== formData.confirmPassword) {
      setError("Security Keys do not match! Please verify.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. Deployment to API
      await registerStudentAPI({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        password: formData.password
      });

      // 3. Success: Redirect to Terminal Access
      router.push('/student/signin');
    } catch (err: any) {
      setError(err.message || 'Registry creation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full space-y-8 animate-in fade-in duration-300 pb-10">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-black mb-2 text-text-main uppercase tracking-tighter italic">Create Account</h1>
          <p className="text-text-muted font-medium">Enter your details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identity Nodes (Row) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-[10px] font-black uppercase tracking-widest text-text-muted ml-3">First Name</label>
              <input type="text" id="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Ahmed" className="w-full px-6 py-4 bg-app-bg border border-border-subtle text-text-main rounded-2xl outline-none focus:border-accent-blue shadow-inner font-bold transition-all disabled:opacity-50" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-[10px] font-black uppercase tracking-widest text-text-muted ml-3">Last Name</label>
              <input type="text" id="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Khan" className="w-full px-6 py-4 bg-app-bg border border-border-subtle text-text-main rounded-2xl outline-none focus:border-accent-blue shadow-inner font-bold transition-all disabled:opacity-50" required disabled={isLoading} />
            </div>
          </div>

          {/* Email Node */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-text-muted ml-3">Email</label>
            <input type="email" id="email" value={formData.email} onChange={handleInputChange} placeholder="ahmed.khan@example.com" className="w-full px-6 py-4 bg-app-bg border border-border-subtle text-text-main rounded-2xl outline-none focus:border-accent-blue shadow-inner font-bold transition-all disabled:opacity-50" required disabled={isLoading} />
          </div>

          {/* Contact Node */}
          <div className="space-y-2">
            <label htmlFor="contactNumber" className="block text-[10px] font-black uppercase tracking-widest text-text-muted ml-3">Contact Number</label>
            <input type="text" id="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="+923001234567" className="w-full px-6 py-4 bg-app-bg border border-border-subtle text-text-main rounded-2xl outline-none focus:border-accent-blue shadow-inner font-bold transition-all disabled:opacity-50" required disabled={isLoading} />
          </div>

          {/* Security Node 1 */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-text-muted ml-3">Password</label>
            <input type="password" id="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="w-full px-6 py-4 bg-app-bg border border-border-subtle text-text-main rounded-2xl outline-none focus:border-accent-blue shadow-inner font-bold transition-all disabled:opacity-50" required disabled={isLoading} />
          </div>

          {/* Security Node 2 */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-[10px] font-black uppercase tracking-widest text-text-muted ml-3">Password</label>
            <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" className="w-full px-6 py-4 bg-app-bg border border-border-subtle text-text-main rounded-2xl outline-none focus:border-accent-blue shadow-inner font-bold transition-all disabled:opacity-50" required disabled={isLoading} />
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-widest border border-red-500/20 animate-shake">
              {error}
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-accent-blue text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-accent-blue/20 active:scale-95 disabled:bg-accent-blue/50"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} strokeWidth={3} />
                wait a sec
              </>
            ) : (
              'Signup'
            )}
          </button>
        </form>

        {/* Auth Switch */}
        <p className="text-sm text-center text-text-muted font-medium mt-8">
          Already have an account?{' '}
          <Link href="/student/signin" className="font-black text-accent-blue hover:underline decoration-2 underline-offset-4 uppercase text-[10px] tracking-widest">
            Sign in
          </Link>
        </p>

        {/* Social Node */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-grow border-t border-border-subtle"></div>
          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-50">Social Node</span>
          <div className="flex-grow border-t border-border-subtle"></div>
        </div>

        <button disabled={isLoading} className="w-full py-4 bg-card-bg border border-border-subtle rounded-2xl flex items-center justify-center gap-3 hover:bg-app-bg transition-all shadow-sm active:scale-95 disabled:opacity-50">
          <FcGoogle size={20} />
          <span className="font-black text-text-main text-[10px] uppercase tracking-widest">Register via Google</span>
        </button>
      </div>
    </AuthLayout>
  );
};

export default SignUpPage;