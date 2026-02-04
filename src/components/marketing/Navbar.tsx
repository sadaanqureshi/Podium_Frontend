'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export const MarketingNavbar = () => {
  const pathname = usePathname();
  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-5xl">
      <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] px-8 py-4 flex justify-between items-center shadow-2xl">
        <Link href="/" className="text-white font-black text-xl tracking-tighter">PODIUM<span className="text-blue-500">.</span></Link>
        
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.path} href={link.path} className={`text-xs font-bold uppercase tracking-widest transition-all ${pathname === link.path ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <Link href="/student/signin" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          Sign In
        </Link>
      </div>
    </nav>
  );
};