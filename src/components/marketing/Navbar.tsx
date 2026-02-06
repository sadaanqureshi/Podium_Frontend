'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import Image from 'next/image';

export const MarketingNavbar = () => {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const logoSrc = resolvedTheme === 'dark' ? '/podiumlogo2.png' : '/podiumlogo1.png';

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-6xl">
      {/* Removed 'transition-all duration-300' to sync with global CSS */}
      <div className="bg-card-bg/80 backdrop-blur-xl border border-border-subtle rounded-[2rem] px-8 py-2 flex justify-between items-center shadow-2xl">
        
        {/* --- BRANDING SECTION --- */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="group-hover:scale-105 flex items-center justify-center">
            <Image
              src={logoSrc}
              alt="Podium Logo"
              width={65} 
              height={65}
              className="object-contain"
              priority
            />
          </div>
          
          <div className="flex flex-col space-y-1 justify-center">
            <span className="text-text-main font-black text-xl md:text-2xl tracking-tighter uppercase leading-none">
              PODIUM
            </span>
            <span className="text-accent-blue font-black text-[10px] md:text-[11px] tracking-[0.25em] uppercase leading-none">
              PROFESSIONAL
            </span>
          </div>
        </Link>
        
        {/* --- NAV LINKS --- */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path} 
              className={`text-[14px] font-bold uppercase tracking-[0.12em] relative group/link ${
                pathname === link.path ? 'text-accent-blue' : 'text-text-muted hover:text-text-main'
              }`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-blue transition-all duration-300 group-hover/link:w-full ${pathname === link.path ? 'w-full' : ''}`} />
            </Link>
          ))}
        </div>

        {/* --- ACTIONS --- */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 bg-app-bg border border-border-subtle rounded-xl text-text-main hover:text-accent-blue shadow-sm"
          >
            {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link href="/student/signin" className="bg-accent-blue hover:bg-hover-blue text-white px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent-blue/20 active:scale-95">
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
};