'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Menu, X, Settings, User, Bell, LogOut, Sun, Moon } from 'lucide-react';
import WebSidebar from '@/components/sidebar/WebSidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { logout } from '@/lib/store/features/authSlice';
import { clearCourseCache } from '@/lib/store/features/courseSlice';
import { logoutUserAPI, logoutLocal } from '@/lib/api/apiService';
import { getRolePath } from '@/lib/navigationConfig';

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const dispatch = useAppDispatch();
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  const user = useAppSelector((state) => state.auth.user);
  const userRole = user?.role?.roleName || (typeof user?.role === 'string' ? user.role : "");
  const profilePath = getRolePath(userRole, "profile");

  const handleLogout = async () => {
    try { await logoutUserAPI(); } catch (err) { console.error('Logout error:', err); }
    finally {
      dispatch(logout());
      dispatch(clearCourseCache());
      logoutLocal();
      window.location.href = '/signin';
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-app-bg" />;

  const iconVariants: Variants = {
    hidden: { rotate: -90, opacity: 0, scale: 0.5 },
    visible: { rotate: 0, opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { rotate: 90, opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
  };

  return (
    // bg-app-bg khud ko light/dark ke hisab se adjust karega
    <div className="flex min-h-screen w-full bg-app-bg transition-colors duration-300">

      {/* Desktop Sidebar Wrapper */}
      <div className="hidden lg:block flex-shrink-0 w-[260px] h-screen sticky top-0 border-r border-border-subtle z-50">
        <WebSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">

        {/* HEADER: Gradient using sidebar tokens for seamless look */}
        <header className="h-14 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-[40] bg-gradient-to-r from-sidebar-from to-sidebar-to transition-all">

          <div className="lg:hidden w-10"></div>

          <div className="flex items-center gap-4 ml-auto">
            
            {/* THEME TOGGLE */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-card-bg border border-border-subtle text-text-main shadow-sm hover:scale-110 active:scale-95 transition-all"
            >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-accent-blue" />}
            </button>

            <button className="p-2 text-text-muted hover:text-accent-blue transition-all relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
            </button>

            {/* PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button
                onMouseEnter={() => setIsDropdownOpen(true)}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-9 h-9 rounded-xl bg-text-main border border-border-subtle flex items-center justify-center text-card-bg hover:opacity-90 transition-all active:scale-95 shadow-inner"
              >
                <User size={18} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    onMouseLeave={() => setIsDropdownOpen(false)}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-card-bg rounded-2xl shadow-2xl border border-border-subtle p-2 z-[100] origin-top-right overflow-hidden"
                  >
                    <div className="px-4 py-3 mb-2 border-b border-border-subtle">
                      <p className="text-xs font-black text-text-main uppercase tracking-widest truncate">{user?.firstName || 'Account'}</p>
                      <p className="text-[9px] text-text-muted font-bold uppercase">{userRole || 'Member'}</p>
                    </div>

                    <Link
                      href={profilePath}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 w-full px-4 py-3 text-[13px] font-bold text-text-muted hover:bg-sidebar-to hover:text-accent-blue rounded-xl transition-all mb-1"
                    >
                      <Settings size={16} /> Profile Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-[13px] font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="lg:px-10 lg:pt-4 lg:pb-10 w-full flex-1">
          <div className="animate-in fade-in slide-in-from-top-1 duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden p-2 fixed top-2.5 left-4 z-[60] bg-card-bg border border-border-subtle rounded-lg shadow-xl"
      >
        <AnimatePresence mode="wait">
          {!isMobileMenuOpen ? (
            <motion.div key="menu" variants={iconVariants} initial="hidden" animate="visible" exit="exit">
              <Menu size={20} className="text-text-main" />
            </motion.div>
          ) : (
            <motion.div key="close" variants={iconVariants} initial="hidden" animate="visible" exit="exit">
              <X size={20} className="text-text-main" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Mobile Side Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-text-main/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              className="lg:hidden fixed top-0 left-0 h-full z-50 shadow-2xl"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <WebSidebar onLinkClick={() => setIsMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LayoutWrapper;