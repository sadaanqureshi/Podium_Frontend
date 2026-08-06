// 'use client';

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import AuthLayout from '@/components/auth/AuthLayout';
// import { registerStudentAPI } from '@/lib/api/apiService';
// import { Loader2, Eye, EyeOff } from 'lucide-react';

// const SignUpPage = () => {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [generalError, setGeneralError] = useState('');
  
//   // Inline Errors State
//   const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
//   // Show Password States
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     contactNumber: '',
//     password: '',
//     confirmPassword: ''
//   });

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { id, value } = e.target;
//     setFormData({ ...formData, [id]: value });
    
//     // Type karte hue error clear karna
//     if (fieldErrors[id]) {
//       setFieldErrors({ ...fieldErrors, [id]: '' });
//     }
//     if (generalError) setGeneralError('');
//   };

//   const validateForm = () => {
//     const errors: Record<string, string> = {};
//     if (!formData.firstName.trim()) errors.firstName = "First name is required";
//     if(formData.firstName.trim().length < 2) errors.firstName = "First name must be at least 2 characters";
//     if(formData.firstName.trim().length > 20) errors.firstName = "First name must be less than 20 characters";
//     if (!formData.lastName.trim()) errors.lastName = "Last name is required";
//     if(formData.lastName.trim().length < 2) errors.lastName = "Last name must be at least 2 characters";
//     if(formData.lastName.trim().length > 20) errors.lastName = "Last name must be less than 20 characters";
//     if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "Valid email is required";
//     if (formData.email.trim().length > 30) errors.email = "Email must be less than 30 characters";
//     if (!formData.contactNumber.trim()) errors.contactNumber = "Contact number is required";
//     if (formData.contactNumber.trim().length !== 11) errors.contactNumber = "Contact number must be 11 digits";
//     if (!/^[0-9]+$/.test(formData.contactNumber)) errors.contactNumber = "Contact number must be numeric";
//     if (formData.password.trim().length < 6) errors.password = "Must be at least 6 characters";
//     if (formData.password.trim().length > 20) errors.password = "Password must be less than 20 characters";
//     if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
//     if (formData.confirmPassword.trim().length < 6) errors.confirmPassword = "Must be at least 6 characters";
//     if (formData.confirmPassword.trim().length > 20) errors.confirmPassword = "Password must be less than 20 characters";
//     if (!/[a-z]/.test(formData.password)) errors.password = "Password must contain at least one lowercase letter";
//     if (!/[A-Z]/.test(formData.password)) errors.password = "Password must contain at least one uppercase letter";
//     if (!/[0-9]/.test(formData.password)) errors.password = "Password must contain at least one number";
//     // if (!/[!@#$%^&*]/.test(formData.password)) errors.password = "Password must contain at least one special character";
//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setGeneralError('');
    
//     if (!validateForm()) return;

//     setIsLoading(true);

//     try {
//       await registerStudentAPI({
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//         contactNumber: formData.contactNumber,
//         password: formData.password
//       });

//       router.push('/student/signin');
//     } catch (err: any) {
//       setGeneralError(err.message || 'Registration failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <AuthLayout>
//       <div className="w-full space-y-5 animate-in fade-in duration-300">
//         {/* Header Section */}
//         <div>
//           <h1 className="text-2xl font-black mb-1 text-text-main tracking-tight">Create Account</h1>
//           <p className="text-text-muted text-xs font-medium">Enter your details to get started</p>
//         </div>

//         {/* Form par noValidate lagaya hai taake browser apna error na dikhaye */}
//         <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          
//           {/* Row 1: Names */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div className="space-y-1.5">
//               <label htmlFor="firstName" className="block text-[11px] font-bold text-text-main ml-1">First Name</label>
//               <input type="text" id="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Ahmed" className={`w-full px-4 py-3 bg-app-bg border text-sm text-text-main rounded-xl outline-none transition-all disabled:opacity-50 ${fieldErrors.firstName ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border-subtle focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30'}`} disabled={isLoading} />
//               {fieldErrors.firstName && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.firstName}</p>}
//             </div>
//             <div className="space-y-1.5">
//               <label htmlFor="lastName" className="block text-[11px] font-bold text-text-main ml-1">Last Name</label>
//               <input type="text" id="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Khan" className={`w-full px-4 py-3 bg-app-bg border text-sm text-text-main rounded-xl outline-none transition-all disabled:opacity-50 ${fieldErrors.lastName ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border-subtle focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30'}`} disabled={isLoading} />
//               {fieldErrors.lastName && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.lastName}</p>}
//             </div>
//           </div>

//           {/* Row 2: Email & Contact */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div className="space-y-1.5">
//               <label htmlFor="email" className="block text-[11px] font-bold text-text-main ml-1">Email Address</label>
//               <input type="email" id="email" value={formData.email} onChange={handleInputChange} placeholder="ahmed@example.com" className={`w-full px-4 py-3 bg-app-bg border text-sm text-text-main rounded-xl outline-none transition-all disabled:opacity-50 ${fieldErrors.email ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border-subtle focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30'}`} disabled={isLoading} />
//               {fieldErrors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.email}</p>}
//             </div>
//             <div className="space-y-1.5">
//               <label htmlFor="contactNumber" className="block text-[11px] font-bold text-text-main ml-1">Contact Number</label>
//               <input type="text" id="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="+923001234567" className={`w-full px-4 py-3 bg-app-bg border text-sm text-text-main rounded-xl outline-none transition-all disabled:opacity-50 ${fieldErrors.contactNumber ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border-subtle focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30'}`} disabled={isLoading} />
//               {fieldErrors.contactNumber && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.contactNumber}</p>}
//             </div>
//           </div>

//           {/* Row 3: Passwords */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div className="space-y-1.5">
//               <label htmlFor="password" className="block text-[11px] font-bold text-text-main ml-1">Password</label>
//               <div className="relative">
//                 <input type={showPassword ? "text" : "password"} id="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className={`w-full pl-4 pr-10 py-3 bg-app-bg border text-sm text-text-main rounded-xl outline-none transition-all disabled:opacity-50 ${fieldErrors.password ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border-subtle focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30'}`} disabled={isLoading} />
//                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors focus:outline-none">
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//               {fieldErrors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.password}</p>}
//             </div>
            
//             <div className="space-y-1.5">
//               <label htmlFor="confirmPassword" className="block text-[11px] font-bold text-text-main ml-1">Confirm Password</label>
//               <div className="relative">
//                 <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" className={`w-full pl-4 pr-10 py-3 bg-app-bg border text-sm text-text-main rounded-xl outline-none transition-all disabled:opacity-50 ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border-subtle focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30'}`} disabled={isLoading} />
//                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors focus:outline-none">
//                   {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//               {fieldErrors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.confirmPassword}</p>}
//             </div>
//           </div>

//           {/* API General Error */}
//           {generalError && (
//             <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold text-center border border-red-500/20">
//               {generalError}
//             </div>
//           )}

//           {/* Submit Action */}
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full mt-2 py-3.5 bg-accent-blue text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95 disabled:opacity-60"
//           >
//             {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Create Account'}
//           </button>
//         </form>

//         <p className="text-xs text-center text-text-muted font-medium mt-4">
//           Already have an account?{' '}
//           <Link href="/student/signin" className="font-bold text-accent-blue hover:underline transition-all">
//             Sign In
//           </Link>
//         </p>
//       </div>
//     </AuthLayout>
//   );
// };

// export default SignUpPage;

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthForm, { AuthFormField } from '@/components/auth/AuthForm'; // 👉 Generic Component
import { registerStudentAPI } from '@/lib/api/apiService';

const SignUpPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // 👉 JUST DEFINE YOUR FIELDS ONCE
  const signUpFields: AuthFormField[] = [
    { id: 'firstName', label: 'First Name', type: 'text', placeholder: 'Ahmed', required: true },
    { id: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Khan', required: true },
    { id: 'email', label: 'Email Address', type: 'email', placeholder: 'ahmed@example.com', required: true },
    { id: 'contactNumber', label: 'Contact Number', type: 'phone', required: true }, // Custom Phone handle karega
    { id: 'password', label: 'Password', type: 'password', required: true },
    { id: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true }
  ];

  const handleRegister = async (formData: Record<string, string>) => {
    setIsLoading(true);
    setGeneralError('');
    try {
      await registerStudentAPI({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        password: formData.password
      });
      router.push('/student/signin');
    } catch (err: any) {
      setGeneralError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthForm
        title="Create Account"
        subtitle="Enter your details to get started"
        fields={signUpFields}
        submitText="Create Account"
        onSubmit={handleRegister}
        isLoading={isLoading}
        generalError={generalError}
        setGeneralError={setGeneralError}
        footerText="Already have an account?"
        footerLinkText="Sign In"
        footerLinkHref="/student/signin"
      />
    </AuthLayout>
  );
};

export default SignUpPage;