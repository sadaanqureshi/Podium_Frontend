'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; 
import { useAppSelector } from '@/lib/store/hooks';
import { useTheme } from 'next-themes';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isAuthenticated && role) {
      const userRole = role.toLowerCase();
      if (userRole === 'admin') router.replace('/admin/dashboard');
      else if (userRole === 'teacher') router.replace('/teacher/dashboard');
      else if (userRole === 'student') router.replace('/student/dashboard');
      else setIsChecking(false);
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, role, router]);

  if (!mounted) return null;

  const logoSrc = resolvedTheme === 'dark' ? '/podiumlogo2.png' : '/podiumlogo1.png';

  if (isChecking || isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-app-bg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-accent-blue" size={40} />
          <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em]">Verifying Terminal Access...</p>
        </div>
      </div>
    );
  }

  return (
    // Removed 'transition-colors duration-300' for global sync
    <div className="flex min-h-screen w-full bg-app-bg">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-app-bg via-sidebar-to/20 to-accent-blue/10 flex-col items-center justify-center p-12 text-center border-r border-border-subtle relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-[100px] -ml-32 -mt-32"></div>
        
        <div className="relative w-96 h-96 z-10 flex items-center justify-center">
          <Image 
            src={logoSrc} 
            alt="Podium Logo" 
            width={380} 
            height={380}
            className="object-contain" 
            priority
          />
        </div>
        
        <div className="relative z-10 mt-16 space-y-4">
          <h2 className="text-3xl font-black text-text-main uppercase tracking-tighter">Knowledge Registry</h2>
          <p className="text-text-muted max-w-sm mx-auto text-sm font-medium leading-relaxed uppercase tracking-wider">
            Regardless of who you are, mastering even just one more skill results in learning gains.
          </p>
        </div>
      </div>

      <main className="w-full lg:w-1/2 bg-app-bg flex flex-col items-center justify-center p-8 md:p-12 relative">
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col items-center lg:items-start gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black tracking-tighter uppercase text-text-main">
                PODIUM <span className="text-accent-blue">PROFESSIONAL</span>
              </span>
            </div>
            <div className="h-1 w-12 bg-accent-blue rounded-full"></div>
          </div>

          <div className="bg-card-bg border border-border-subtle rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <div className="relative z-10">
                {children}
             </div>
          </div>
          
          <p className="text-center text-[9px] font-black text-text-muted uppercase tracking-[0.3em] opacity-50">
            Secure Enrollment Registry System &copy; 2026
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;