'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Menu, X } from 'lucide-react'; // Menu aur X icons add kiye
import Image from 'next/image';

export const MarketingNavbar = () => {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile menu state

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const logoSrc = resolvedTheme === 'dark' ? '/podiumlogo2.png' : '/podiumlogo1.png';

  return (
    <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] lg:w-[95%] max-w-6xl">
      {/* Main Navbar Card */}
      <div className="bg-card-bg/80 backdrop-blur-xl border border-border-subtle rounded-[1.5rem] md:rounded-[2rem] px-4 md:px-8 py-2 flex justify-between items-center shadow-2xl relative">
        
        {/* --- BRANDING SECTION --- */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
          <div className="transition-transform group-hover:scale-105 flex items-center justify-center w-[45px] md:w-[65px]">
            <Image
              src={logoSrc}
              alt="Podium Logo"
              width={65} 
              height={65}
              className="object-contain w-full h-auto"
              priority
            />
          </div>
          
          <div className="flex flex-col space-y-1 md:-space-y-1 justify-center">
            <span className="text-text-main font-black text-lg md:text-2xl tracking-tighter uppercase">
              PODIUM
            </span>
            <span className="text-accent-blue font-black text-[8px] md:text-[11px] tracking-[0.2em] md:tracking-[0.25em] uppercase">
              PROFESSIONAL
            </span>
          </div>
        </Link>
        
        {/* --- DESKTOP NAV LINKS --- */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path} 
              className={`text-[13px] lg:text-[14px] font-bold uppercase tracking-[0.12em] relative group/link ${
                pathname === link.path ? 'text-accent-blue' : 'text-text-muted hover:text-text-main'
              }`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-accent-blue transition-all duration-300 group-hover/link:w-full ${pathname === link.path ? 'w-full' : 'w-0'}`} />
            </Link>
          ))}
        </div>

        {/* --- ACTIONS & MOBILE TOGGLE --- */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle Button */}
          <button 
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 md:p-2.5 bg-app-bg border border-border-subtle rounded-xl text-text-main hover:text-accent-blue shadow-sm transition-colors"
          >
            {resolvedTheme === 'dark' ? <Sun size={16} className="md:w-[18px]" /> : <Moon size={16} className="md:w-[18px]" />}
          </button>

          {/* Desktop Sign In */}
          <Link href="/student/signin" className="hidden sm:block bg-accent-blue hover:bg-hover-blue text-white px-5 md:px-8 py-2 md:py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent-blue/20 active:scale-95 transition-all">
            Sign In
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-text-main hover:text-accent-blue transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* --- MOBILE DROPDOWN MENU --- */}
        {isMenuOpen && (
          <div className="absolute top-[calc(100%+10px)] left-0 w-full bg-card-bg border border-border-subtle rounded-[1.5rem] p-6 shadow-2xl animate-in slide-in-from-top-2 duration-300 md:hidden flex flex-col gap-6 items-center">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path} 
                onClick={() => setIsMenuOpen(false)}
                className={`text-[14px] font-black uppercase tracking-[0.2em] ${
                  pathname === link.path ? 'text-accent-blue' : 'text-text-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link 
              href="/student/signin" 
              onClick={() => setIsMenuOpen(false)}
              className="w-full text-center bg-accent-blue text-white py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};