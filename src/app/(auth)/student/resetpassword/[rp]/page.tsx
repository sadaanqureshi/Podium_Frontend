'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

// Relative paths use kiye hain taaki import ka masla na ho
import AuthLayout from '../../../../components/auth/AuthLayout';
import { resetPasswordAPI } from '../../../../lib/api/apiService';

const ResetPasswordPage = () => {
  const router = useRouter();
  const params = useParams();

  // URL se token nikalna ([rp] folder ki wajah se params.rp mein hoga)
  const token = params.rp as string;

  console.log("Reset Token:", token); // Debugging ke liye

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Password Match Check
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // 2. Length Check
    if (password.length < 6) {
      setError("length of password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      // 3. API Call (Backend ko token aur password bhej rahe hain)
      await resetPasswordAPI(token, password);
      setIsSuccess(true);

      // 3 seconds baad login page par redirect
      setTimeout(() => {
        router.push('/signin');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Password update nahi ho saka. Link expired ho sakta hai.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        {isSuccess ? (
          /* --- Kamyabi ka Message --- */
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h1 className="text-3xl font-bold mb-3 text-gray-900">Congratulations</h1>
            <p className="text-gray-600 mb-8">
              Your password has been successfully updated.
            </p>
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-gray-400 italic">Redirecting to sign-in...</p>
              <Loader2 className="animate-spin text-blue-600" size={24} />
            </div>
          </div>
        ) : (
          /* --- Password Reset Form --- */
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">New Password</h1>
              <p className="text-gray-600 mt-2">Choose a new and strong password for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm animate-in slide-in-from-top-2">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-blue-400 shadow-lg shadow-blue-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Updating...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link href="/signin" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-all">
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