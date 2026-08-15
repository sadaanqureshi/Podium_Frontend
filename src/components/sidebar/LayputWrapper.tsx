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
import { getPortalRoleFromPath, getRolePath, normalizeRole, roleFromRoleId } from '@/lib/navigationConfig';

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const dispatch = useAppDispatch();
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  const user = useAppSelector((state) => state.auth.user);
  const authRole = useAppSelector((state) => state.auth.role);
  const roleId = useAppSelector((state) => state.auth.roleId);
  const profileSynced = useAppSelector((state) => state.auth.profileSynced);
  const portalRole = getPortalRoleFromPath(pathname);
  const apiRole = roleFromRoleId(roleId) || normalizeRole(user?.role) || normalizeRole(authRole);
  const userRole = (profileSynced && apiRole ? apiRole : portalRole || apiRole) as string;
  const profilePath = getRolePath(userRole, "profile");

  const handleLogout = async () => {
    try { await logoutUserAPI(); } catch (err) { console.error('Logout error:', err); }
    finally {
      dispatch(logout());
      dispatch(clearCourseCache());
      logoutLocal();
      window.location.href = '/';
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
    <div className="flex h-screen h-dvh w-full overflow-hidden bg-app-bg">

      {/* Desktop sidebar — stays put; only the main column scrolls */}
      <div className="hidden lg:flex flex-col flex-shrink-0 w-[260px] h-full border-r border-border-subtle z-50">
        <WebSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        <header className="h-14 shrink-0 flex items-center justify-between pl-16 pr-4 md:px-6 lg:px-8 z-[40] bg-gradient-to-r from-sidebar-from to-sidebar-to border-b border-border-subtle lg:pl-8">

          <div className="flex items-center gap-4 ml-auto">
            
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-card-bg border border-border-subtle text-text-main shadow-sm hover:scale-105 active:scale-95 transition-[transform,box-shadow] duration-150 ease-out"
            >
              {resolvedTheme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-accent-blue" />}
            </button>

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
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 mt-3 w-56 bg-card-bg rounded-2xl shadow-2xl border border-border-subtle p-2 z-[100] origin-top-right overflow-hidden"
                  >
                    <div className="px-4 py-3 mb-2 border-b border-border-subtle">
                      <p className="text-xs font-black text-text-main uppercase tracking-widest truncate">{user?.firstName || 'Account'}</p>
                      <p className="text-[9px] text-text-muted font-bold uppercase">{userRole || 'Member'}</p>
                    </div>

                    <Link
                      href={profilePath}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 w-full px-4 py-3 text-[13px] font-bold text-text-muted hover:bg-sidebar-to hover:text-accent-blue rounded-xl transition-[background-color,color,transform] duration-150 mb-1"
                    >
                      <Settings size={16} /> Profile Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-[13px] font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-[background-color,transform] duration-150"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
          {children}
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
              className="lg:hidden fixed top-0 left-0 h-full w-[260px] z-50 shadow-2xl"
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