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
        {/* Back Link */}
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to sign in
        </Link>

        {isSuccess ? (
          // --- SUCCESS STATE ---
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <MailCheck size={32} />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Check your email</h1>
            <p className="text-gray-600 mb-8">
              We have sent a password reset link to <span className="font-semibold text-gray-900">{email}</span>.
            </p>
            <Link
              href="/signin"
              className="block w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to sign in
            </Link>
            <button
              onClick={() => setIsSuccess(false)}
              className="mt-6 text-sm font-medium text-blue-600 hover:underline"
            >
              Didn&apos;t receive the email? Try again
            </button>
          </div>
        ) : (
          // --- FORM STATE ---
          <>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Forgot password?</h1>
            <p className="text-gray-600 mb-8">
              No worries, We will send you reset instructions.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Sending link...
                  </>
                ) : (
                  'Reset password'
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