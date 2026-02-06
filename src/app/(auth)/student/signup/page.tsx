'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // <-- 1. useRouter import karein
// import Cookies from 'js-cookie'; // <-- Abhi iski zaroorat nahi
import AuthLayout from '@/components/auth/AuthLayout';
import { FcGoogle } from 'react-icons/fc';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reEnterPassword, setReEnterPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter(); // <-- Router ko initialize karein

  // FIX: 'handleSubmit' function ko update kiya gaya hai
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 1. Password check (Yeh abhi bhi kaam karega)
    if (password !== reEnterPassword) {
      setError("Passwords don't match!");
      return;
    }

    // 2. Backend call ko "Bypass" kar diya (Comment out kar diya)
    /*
    try {
      // YEH CODE ABHI NAHI CHALEGA
      const response = await fetch('http://localhost:3001/auth/signup', { // Aapka NestJS URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sign up failed');
      }

      const data = await response.json();
      
      if (data.accessToken) {
        Cookies.set('authToken', data.accessToken, { expires: 7 });
      }

    } catch (err: any) {
      setError(err.message);
    }
    */

    // 3. Client ko demo dikhane ke liye seedha redirect karein
    console.log('Demo: Backend ko bypass kiya. Onboarding par redirect kar rahe hain...');
    router.push('/auth/onboarding');
  };

  return (
    <AuthLayout>
      <div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Sign up</h1>
        <p className="text-gray-600 mb-6">Create an account</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... (Email input) ... */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>
          
          {/* ... (Password input) ... */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* ... (Re-enter Password input) ... */}
          <div>
            <label htmlFor="re-password" className="block text-sm font-medium text-gray-700 mb-1">Re-Enter Password</label>
            <input
              type="password"
              id="re-password"
              value={reEnterPassword}
              onChange={(e) => setReEnterPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>
          
          {/* Error message */}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign up
          </button>
        </form>

        {/* ... (Baaki saara HTML) ... */}
        <p className="text-xs text-gray-500 text-center mt-4">
          By clicking continue, you agree to our{' '}
          <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
        <p className="text-sm text-center text-gray-600 mt-6">
          Have an account?{' '}
          <Link href="/auth/signin" className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-sm text-gray-500">OR CONTINUE WITH</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <button className="w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
          <FcGoogle size={22} />
          <span className="font-medium text-gray-700">Google</span>
        </button>
      </div>
    </AuthLayout>
  );
};

export default SignUpPage;