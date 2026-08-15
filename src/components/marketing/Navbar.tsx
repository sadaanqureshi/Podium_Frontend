'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Menu, X } from 'lucide-react';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Courses', path: '/courses' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export const MarketingNavbar = () => {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;
  const logoSrc = mounted && resolvedTheme === 'dark' ? '/podiumlogo2.png' : '/podiumlogo1.png';

  return (
    <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] lg:w-[95%] max-w-6xl">
      <div className="bg-card-bg/80 backdrop-blur-xl border border-border-subtle rounded-[1.5rem] md:rounded-[2rem] px-4 md:px-8 py-2 flex justify-between items-center shadow-2xl relative">
        <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
          <div className="flex items-center justify-center w-[45px] md:w-[65px]">
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

        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-[13px] lg:text-[14px] font-bold uppercase tracking-[0.12em] relative group/link ${
                isActive(link.path) ? 'text-accent-blue' : 'text-text-muted hover:text-text-main'
              }`}
            >
              {link.label}
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-accent-blue group-hover/link:w-full ${
                  isActive(link.path) ? 'w-full' : 'w-0'
                }`}
              />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 md:p-2.5 bg-app-bg border border-border-subtle rounded-xl text-text-main hover:text-accent-blue shadow-sm hover:scale-105 active:scale-95 transition-[transform,box-shadow,color] duration-150 ease-out"
            aria-label="Toggle theme"
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun size={18} className="text-yellow-400" />
            ) : (
              <Moon size={18} className="text-accent-blue" />
            )}
          </button>

          <Link
            href="/student/signin"
            className="hidden sm:inline-flex items-center bg-accent-blue hover:bg-hover-blue text-white px-5 md:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest active:scale-95"
          >
            Sign In
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-text-main hover:text-accent-blue"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-[calc(100%+10px)] left-0 w-full bg-card-bg border border-border-subtle rounded-[1.5rem] p-6 shadow-2xl md:hidden flex flex-col gap-5 items-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`text-[14px] font-black uppercase tracking-[0.2em] ${
                  isActive(link.path) ? 'text-accent-blue' : 'text-text-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/student/signin"
              onClick={() => setIsMenuOpen(false)}
              className="w-full text-center bg-accent-blue text-white py-3 rounded-xl text-[11px] font-black uppercase tracking-widest"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
