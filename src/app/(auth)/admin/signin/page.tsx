'use client';
import Cookies from 'js-cookie';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch } from '@/lib/store/hooks';
import { logout, setAuth } from '@/lib/store/features/authSlice';
import { loginUser, logoutLocal } from '@/lib/api/apiService'; // Centralized API service
import AuthLayout from '@/components/auth/AuthLayout';
import { Loader2 } from 'lucide-react';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const dispatch = useAppDispatch();

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   dispatch(logout());
  //   setError('');
  //   setIsLoading(true);

  //   try {
  //     // 1. Centralized API call (NestJS backend)
  //     const response = await loginUser({ email, password });

  //     // 2. Redux state update (Response structure ke mutabiq)
  //     dispatch(setAuth({
  //       user: response.user,
  //       token: response.access_token, // Backend se access_token mil raha hai
  //       role: response.user.role.roleName // Role extract kiya
  //       ,
  //       sidebar: response.sidebar
  //     }));

  //     // 3. Role-based Redirection
  //     const role = response.user.role.roleName;

  //     // if (role === 'admin') {
  //     //   router.push('/admin/dashboard');
  //     // } else if (role === 'teacher') {
  //     //   router.push('/teacher/dashboard');
  //     // } else {
  //     //   router.push('/dashboard'); // Default student dashboard
  //     // }

  //     if (role === 'admin') {
  //       router.replace('/admin/dashboard');
  //     } else {
  //       setError('Unauthorized access for admin login.');
  //     }

  //   } catch (err: any) {
  //     // Backend se jo error message ayega wahi dikhayenge
  //     setError(err.message || 'Login failed. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Admin SignIn Page

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(logout());
    setError('');
    setIsLoading(true);

    try {
      const response = await loginUser({ email, password });
      const userRole = response.user.role.roleName.toLowerCase();

      if (userRole === 'admin') {
        // 1. Agar Role sahi hai, TAB cookies set karein
        Cookies.set('authToken', response.access_token, { expires: 7 });
        Cookies.set('userRole', response.user.role.roleName, { expires: 7 });
      }
      if (userRole === 'admin') {
        dispatch(setAuth({
          user: response.user,
          token: response.access_token,
          role: response.user.role.roleName,
          sidebar: response.sidebar
        }));
        router.replace('/admin/dashboard');
      } else {
        logoutLocal(); // Cookies delete karein
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
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Admin Sign in</h1>
        <p className="text-gray-600 mb-6">Please enter your details to access your portal</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
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

          <div>
            {/* FIX: Label aur Forgot Password link ko ek hi line mein adjust kiya */}
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link
                href="/forgotpassword"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              required
              disabled={isLoading}
            />
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-medium text-blue-600 hover:underline">
            Signup
          </Link>
        </p>

        {/* <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-sm text-gray-500 uppercase tracking-tighter">Or continue with</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button 
          type="button"
          disabled={isLoading}
          className="w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <FcGoogle size={22} />
          <span className="font-medium text-gray-700">Google</span>
        </button> */}
      </div>
    </AuthLayout>
  );
};

export default SignInPage;