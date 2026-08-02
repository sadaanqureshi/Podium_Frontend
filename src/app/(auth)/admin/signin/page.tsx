// 'use client';
// import Cookies from 'js-cookie';
// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useAppDispatch } from '@/lib/store/hooks';
// import { logout, setAuth } from '@/lib/store/features/authSlice';
// import { loginUser, logoutLocal } from '@/lib/api/apiService'; 
// import AuthLayout from '@/components/auth/AuthLayout';
// import { Loader2 } from 'lucide-react';

// const SignInPage = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   const router = useRouter();
//   const dispatch = useAppDispatch();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     dispatch(logout()); // Purana session clear karein
//     setError('');
//     setIsLoading(true);

//     try {
//       const response = await loginUser({ email, password });
//       const userRole = response.user.role.roleName.toLowerCase();

//       // # 1. ROLE CHECK & SESSION COOKIE SETTING (No Expiry = Logout on Browser Close)
//       if (userRole === 'admin') {
//         Cookies.set('authToken', response.access_token);
//         Cookies.set('userRole', response.user.role.roleName);

//         // # 2. REDUX AUTH UPDATE
//         dispatch(setAuth({
//           user: response.user,
//           token: response.access_token,
//           role: response.user.role.roleName,
//           sidebar: response.sidebar
//         }));

//         router.replace('/admin/dashboard');
//       } else {
//         logoutLocal(); 
//         dispatch(logout());
//         setError('Unauthorized: Only Admins can access this portal.');
//       }
//     } catch (err: any) {
//       setError(err.message || 'Login failed.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <AuthLayout>
//       <div className="w-full space-y-8 animate-in fade-in duration-300">
//         {/* Header Section Updated with Theme Tokens */}
//         <div>
//           <h1 className="text-3xl font-black mb-2 text-text-main uppercase tracking-tighter italic leading-none">
//             Admin <span className="text-accent-blue">Portal.</span>
//           </h1>
//           <p className="text-text-muted font-medium text-sm">Enter your credentials below.</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Email Address Node */}
//           <div className="space-y-2">
//             <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-text-muted ml-3">
//               Email Address
//             </label>
//             <input
//               type="email" 
//               id="email" 
//               value={email} 
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="admin@podium.com"
//               className="w-full px-6 py-4 bg-app-bg border border-border-subtle rounded-2xl focus:border-accent-blue outline-none transition-all font-bold text-sm text-text-main shadow-inner"
//               required 
//               disabled={isLoading}
//             />
//           </div>

//           {/* Password Node */}
//           <div className="space-y-2">
//             <div className="flex items-center justify-between px-3">
//               <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-text-muted">
//                 Password
//               </label>
//               <Link href="/forgotpassword" 
//                 className="text-[10px] font-black uppercase tracking-widest text-accent-blue hover:opacity-80 transition-opacity">
//                 Forgot?
//               </Link>
//             </div>
//             <input
//               type="password" 
//               id="password" 
//               value={password} 
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••"
//               className="w-full px-6 py-4 bg-app-bg border border-border-subtle rounded-2xl focus:border-accent-blue outline-none transition-all font-bold text-sm text-text-main shadow-inner"
//               required 
//               disabled={isLoading}
//             />
//           </div>

//           {/* Error Message Feed */}
//           {error && (
//             <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-widest border border-red-500/20 animate-shake">
//               {error}
//             </div>
//           )}

//           {/* Submit Action Button */}
//           <button
//             type="submit" 
//             disabled={isLoading}
//             className="w-full py-4 bg-text-main text-card-bg font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="animate-spin" size={18} strokeWidth={3} /> 
//                 Loading...
//               </>
//             ) : (
//               'Sign in to Admin'
//             )}
//           </button>
//         </form>

//         {/* Footer Redirect */}
//         <p className="text-[10px] text-center text-text-muted font-black uppercase tracking-widest mt-8">
//           Need a staff account?{' '}
//           <Link href="/auth/signup" className="text-accent-blue hover:underline decoration-2 underline-offset-4">
//             Contact Support
//           </Link>
//         </p>
//       </div>
//     </AuthLayout>
//   );
// };

// export default SignInPage;

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch } from '@/lib/store/hooks';
import { logout, setAuth } from '@/lib/store/features/authSlice';
import { loginUser, logoutLocal } from '@/lib/api/apiService';
import AuthLayout from '@/components/auth/AuthLayout';
import Cookies from 'js-cookie';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Inline Errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
    if (generalError) setGeneralError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
    if (generalError) setGeneralError('');
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errors.email = "Please enter a valid email address";
    if (!password) errors.password = "Please enter your password";
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateForm()) return;

    dispatch(logout()); // Purana session clear karein
    setIsLoading(true);

    try {
      const response = await loginUser({ email, password });
      const userRole = response.user.role.roleName.toLowerCase();

      // # 1. ROLE CHECK & SESSION COOKIE SETTING
      if (userRole === 'admin') {
        Cookies.set('authToken', response.access_token);
        Cookies.set('userRole', response.user.role.roleName);

        // # 2. REDUX AUTH UPDATE
        dispatch(setAuth({
          user: response.user,
          token: response.access_token,
          role: response.user.role.roleName,
          sidebar: response.sidebar
        }));
        
        localStorage.removeItem('last_active_time');
        router.replace('/admin/dashboard');
      } else {
        logoutLocal();
        dispatch(logout());
        setGeneralError('Unauthorized: Only Admins can access this portal.');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Incorrect email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full space-y-6 animate-in fade-in duration-300">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-black mb-1 text-text-main tracking-tight">Admin Portal</h1>
          <p className="text-text-muted text-xs font-medium">Please enter your credentials to sign in</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[11px] font-bold text-text-main ml-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="e.g. admin@podium.com"
              className={`w-full px-4 py-3 bg-app-bg border text-sm text-text-main rounded-xl outline-none transition-all disabled:opacity-50 ${fieldErrors.email ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border-subtle focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30'}`}
              disabled={isLoading}
            />
            {fieldErrors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.email}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1 pr-1">
              <label htmlFor="password" className="block text-[11px] font-bold text-text-main">
                Password
              </label>
              <Link href="/forgotpassword" className="text-[10px] font-bold text-accent-blue hover:underline transition-all">
                Forgot Password?
              </Link>
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className={`w-full pl-4 pr-10 py-3 bg-app-bg border text-sm text-text-main rounded-xl outline-none transition-all disabled:opacity-50 ${fieldErrors.password ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border-subtle focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30'}`}
                disabled={isLoading}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.password}</p>}
          </div>

          {/* General API Error Feed */}
          {generalError && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20 text-center animate-shake">
              {generalError}
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 bg-accent-blue text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95 disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Sign In'}
          </button>
        </form>

        {/* Footer Redirect */}
        <p className="text-xs text-center text-text-muted font-medium mt-6">
          Need a staff account?{' '}
          <Link href="/auth/signup" className="font-bold text-accent-blue hover:underline transition-all">
            Contact Support
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignInPage;