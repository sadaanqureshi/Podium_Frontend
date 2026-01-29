'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BookOpen, Loader2 } from 'lucide-react'; 
import { useAppSelector } from '@/lib/store/hooks';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Agar authenticated hai to role-based redirection karein
    if (isAuthenticated && role) {
      const userRole = role.toLowerCase();
      
      if (userRole === 'admin') {
        router.replace('/admin/dashboard');
      } else if (userRole === 'teacher') {
        router.replace('/teacher/dashboard');
      } else if (userRole === 'student') {
        router.replace('/dashboard');
      } else {
        // Agar role unknown hai tabhi check band karein
        setIsChecking(false);
      }
    } else {
      // Agar user login nahi hai to signin form dikhayen
      setIsChecking(false);
    }
  }, [isAuthenticated, role, router]);

  // Jab tak check ho raha hai ya user authenticated hai, loader dikhayen
  if (isChecking || isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-sm text-gray-500 font-medium">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side (Graphic) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-white via-blue-50 to-blue-100 flex-col items-center justify-center p-12 text-center">
        <div className="relative w-96 h-96">
          <div className="absolute inset-0 bg-yellow-300 rounded-full" />
          <Image
            src="https://picsum.photos/seed/student/400/400" 
            alt="Student studying"
            width={400}
            height={400}
            priority 
            className="absolute inset-0 w-full h-full object-cover rounded-full p-4" 
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-4">Did you know?</h2>
        <p className="text-gray-600 max-w-sm">
          Regardless of who you are, mastering even just one more skill results in learning gains.
        </p>
      </div>

      {/* Right Side (Form) */}
      <main className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <BookOpen size={28} className="text-black" />
            <span className="text-xl font-bold">Podium Professional</span>
          </div>
          {children} 
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;