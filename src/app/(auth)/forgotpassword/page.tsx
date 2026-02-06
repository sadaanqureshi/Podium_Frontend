'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import { forgotPasswordAPI } from '@/lib/api/apiService';
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await forgotPasswordAPI(email);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        {/* Back Link - Updated with Text Muted & Accent Hover */}
        <Link
          href="/student/signin"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent-blue mb-8 transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={3} />
          Back to sign in
        </Link>

        {isSuccess ? (
          // --- SUCCESS STATE ---
          <div className="text-center animate-in fade-in zoom-in duration-500">
            {/* Icon Container with Accent Opacity */}
            <div className="w-20 h-20 bg-accent-blue/10 text-accent-blue rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-accent-blue/20">
              <MailCheck size={40} />
            </div>
            
            <h1 className="text-3xl font-black mb-4 text-text-main uppercase tracking-tighter italic">Check your email</h1>
            
            <p className="text-text-muted mb-8 font-medium">
              We have sent a password reset link to <br />
              <span className="font-black text-accent-blue uppercase tracking-tight">{email}</span>.
            </p>

            <Link
              href="/student/signin"
              className="block w-full py-4 bg-accent-blue text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-accent-blue/20 active:scale-95 text-center"
            >
              Return to sign in
            </Link>

            <button
              onClick={() => setIsSuccess(false)}
              className="mt-8 text-[10px] font-black uppercase tracking-widest text-accent-blue hover:underline decoration-2 underline-offset-4"
            >
              Didn&apos;t receive the email? Try again
            </button>
          </div>
        ) : (
          // --- FORM STATE ---
          <>
            <h1 className="text-3xl font-black mb-2 text-text-main uppercase tracking-tighter italic">Forgot password?</h1>
            <p className="text-text-muted mb-10 font-medium">
              No worries, We will send you reset instructions.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-text-muted ml-3">
                  Enter your Email
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

              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-widest border border-red-500/20 animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-accent-blue text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-accent-blue/20 active:scale-95 disabled:bg-accent-blue/50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} strokeWidth={3} />
                    Deploying Link...
                  </>
                ) : (
                  'Send Link'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;