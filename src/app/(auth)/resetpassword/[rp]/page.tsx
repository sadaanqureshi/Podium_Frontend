'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

// Relative paths preserved
import AuthLayout from '../../../../components/auth/AuthLayout';
import { resetPasswordAPI } from '../../../../lib/api/apiService';

const ResetPasswordPage = () => {
  const router = useRouter();
  const params = useParams();

  // URL se token nikalna
  const token = params.rp as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Length of password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordAPI(token, password);
      setIsSuccess(true);

      setTimeout(() => {
        router.push('/student/signin'); // Path updated to student login
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Password update failed. Link might be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full space-y-8 animate-in fade-in duration-500">
        {isSuccess ? (
          /* --- SUCCESS STATE (Theme Aware) --- */
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <CheckCircle size={40} />
            </div>
            <h1 className="text-3xl font-black mb-3 text-text-main uppercase tracking-tighter italic">Congratulations</h1>
            <p className="text-text-muted mb-8 font-medium">
              Your security protocol has been updated. <br />
              Password successfully reset.
            </p>
            <div className="flex flex-col items-center gap-3">
              <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em]">Redirecting to Terminal...</p>
              <Loader2 className="animate-spin text-accent-blue" size={24} strokeWidth={3} />
            </div>
          </div>
        ) : (
          /* --- PASSWORD RESET FORM (Theme Aware) --- */
          <>
            <div>
              <h1 className="text-3xl font-black text-text-main uppercase tracking-tighter italic leading-none">New Password</h1>
              <p className="text-text-muted mt-3 font-medium text-sm">Choose a new and strong security key for your registry.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Node */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted ml-3">Security Key</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-50">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-app-bg border border-border-subtle text-text-main rounded-2xl outline-none focus:border-accent-blue shadow-inner font-bold transition-all disabled:opacity-50"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent-blue transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Node */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted ml-3">Verify Security Key</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-50">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-app-bg border border-border-subtle text-text-main rounded-2xl outline-none focus:border-accent-blue shadow-inner font-bold transition-all disabled:opacity-50"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-widest border border-red-500/20 animate-shake flex items-start gap-3">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
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
                    Processing Registry...
                  </>
                ) : (
                  'Reset Security Protocol'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link href="/student/signin" className="text-[10px] font-black uppercase tracking-widest text-accent-blue hover:underline decoration-2 underline-offset-4 transition-all">
                Go back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;