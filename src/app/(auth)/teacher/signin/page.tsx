// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useAppDispatch } from '@/lib/store/hooks';
// import { logout, setAuth } from '@/lib/store/features/authSlice';
// import { loginUser, logoutLocal } from '@/lib/api/apiService';
// import AuthLayout from '@/components/auth/AuthLayout';
// import Cookies from 'js-cookie';
// import { Loader2, Eye, EyeOff } from 'lucide-react';

// const SignInPage = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
  
//   // Inline Errors
//   const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
//   const [generalError, setGeneralError] = useState('');

//   const router = useRouter();
//   const dispatch = useAppDispatch();

//   const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setEmail(e.target.value);
//     if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
//     if (generalError) setGeneralError('');
//   };

//   const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setPassword(e.target.value);
//     if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
//     if (generalError) setGeneralError('');
//   };

//   const validateForm = () => {
//     const errors: Record<string, string> = {};
//     if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errors.email = "Please enter a valid email address";
//     if (!password) errors.password = "Please enter your password";
    
//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setGeneralError('');
    
//     if (!validateForm()) return;

//     dispatch(logout());
//     setIsLoading(true);

//     try {
//       const response = await loginUser({ email, password });
//       const userRole = response.user.role.roleName.toLowerCase();

//       if (userRole === 'teacher') {
//         Cookies.set('authToken', response.access_token);
//         Cookies.set('userRole', response.user.role.roleName);

//         dispatch(setAuth({
//           user: response.user,
//           token: response.access_token,
//           role: response.user.role.roleName,
//           sidebar: response.sidebar
//         }));
        
//         localStorage.removeItem('last_active_time');
//         router.replace('/teacher/dashboard');
//       } else {
//         logoutLocal();
//         dispatch(logout());
//         setGeneralError('Unauthorized: Only Teachers can access this portal.');
//       }
//     } catch (err: any) {
//       setGeneralError(err.message || 'Incorrect email or password.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <AuthLayout>
//       <div className="w-full space-y-6 animate-in fade-in duration-300">
//         {/* Header Section */}
//         <div>
//           <h1 className="text-2xl font-black mb-1 text-text-main tracking-tight">Teacher Portal</h1>
//           <p className="text-text-muted text-xs font-medium">Please enter your details to manage your classes</p>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-5" noValidate>
//           {/* Email Field */}
//           <div className="space-y-1.5">
//             <label htmlFor="email" className="block text-[11px] font-bold text-text-main ml-1">
//               Email Address
//             </label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={handleEmailChange}
//               placeholder="e.g. teacher@podium.edu"
//               className={`w-full px-4 py-3 bg-app-bg border text-sm text-text-main rounded-xl outline-none transition-all disabled:opacity-50 ${fieldErrors.email ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border-subtle focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30'}`}
//               disabled={isLoading}
//             />
//             {fieldErrors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.email}</p>}
//           </div>

//           {/* Password Field */}
//           <div className="space-y-1.5">
//             <div className="flex items-center justify-between ml-1 pr-1">
//               <label htmlFor="password" className="block text-[11px] font-bold text-text-main">
//                 Password
//               </label>
//               <Link href="/forgotpassword" className="text-[10px] font-bold text-accent-blue hover:underline transition-all">
//                 Forgot Password?
//               </Link>
//             </div>
            
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 id="password"
//                 value={password}
//                 onChange={handlePasswordChange}
//                 placeholder="••••••••"
//                 className={`w-full pl-4 pr-10 py-3 bg-app-bg border text-sm text-text-main rounded-xl outline-none transition-all disabled:opacity-50 ${fieldErrors.password ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border-subtle focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30'}`}
//                 disabled={isLoading}
//               />
//               <button 
//                 type="button" 
//                 onClick={() => setShowPassword(!showPassword)} 
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors focus:outline-none"
//               >
//                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>
//             {fieldErrors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.password}</p>}
//           </div>

//           {/* General API Error Feed */}
//           {generalError && (
//             <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20 text-center animate-shake">
//               {generalError}
//             </div>
//           )}

//           {/* Submit Action */}
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full mt-2 py-3.5 bg-accent-blue text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95 disabled:opacity-60"
//           >
//             {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Sign In'}
//           </button>
//         </form>

//         {/* Footer Redirect */}
//         <p className="text-xs text-center text-text-muted font-medium mt-6">
//           New instructor?{' '}
//           <Link href="/auth/signup" className="font-bold text-accent-blue hover:underline transition-all">
//             Apply here
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
import { useAppDispatch } from '@/lib/store/hooks';
import { logout, setAuth } from '@/lib/store/features/authSlice';
import { loginUser, logoutLocal } from '@/lib/api/apiService';
import { getErrorMessage } from '@/lib/api/errorMessage';
import { useToast } from '@/context/ToastContext';
import { withGoogleConnectedFlag } from '@/lib/googleCalendar';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthForm, { AuthFormField } from '@/components/auth/AuthForm'; // 👉 Importing Generic AuthForm
import Cookies from 'js-cookie';

const TeacherSignInPage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');

    // 👉 DEFINE FIELDS FOR TEACHER SIGN IN
    const signInFields: AuthFormField[] = [
        { 
            id: 'email', 
            label: 'Email Address', 
            type: 'email', 
            placeholder: 'e.g. teacher@podium.edu', 
            required: true 
        },
        { 
            id: 'password', 
            label: 'Password', 
            type: 'password', 
            placeholder: '••••••••', 
            required: true 
        }
    ];

    const handleLogin = async (formData: Record<string, string>) => {
        setGeneralError('');
        dispatch(logout());
        setIsLoading(true);

        try {
            const response = await loginUser({ 
                email: formData.email, 
                password: formData.password 
            });
            const userRole = response.user.role.roleName.toLowerCase();

            if (userRole === 'teacher') {
                Cookies.set('authToken', response.access_token, { path: '/', sameSite: 'lax' });
                Cookies.set('userRole', response.user.role.roleName, { path: '/', sameSite: 'lax' });

                dispatch(setAuth({
                    user: withGoogleConnectedFlag(response.user, response),
                    token: response.access_token,
                    role: response.user.role.roleName,
                    sidebar: response.sidebar
                }));
                
                localStorage.removeItem('last_active_time');
                localStorage.removeItem('access_token');
                showToast('Signed in successfully', 'success');
                router.replace('/teacher/dashboard');
            } else {
                logoutLocal();
                dispatch(logout());
                const msg = 'Unauthorized: Only Teachers can access this portal.';
                setGeneralError(msg);
                showToast(msg, 'error');
            }
        } catch (err: any) {
            const msg = getErrorMessage(err, 'Incorrect email or password.');
            setGeneralError(msg);
            showToast(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <AuthForm
                title="Teacher Portal"
                subtitle="Please enter your details to manage your classes"
                fields={signInFields}
                submitText="Sign In"
                onSubmit={handleLogin}
                isLoading={isLoading}
                generalError={generalError}
                setGeneralError={setGeneralError}
            />
        </AuthLayout>
    );
};

export default TeacherSignInPage;