'use client'; 

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Menu, X, Settings, User, Bell, LogOut } from 'lucide-react'; 
import WebSidebar from '@/components/sidebar/WebSidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Redux aur API Imports
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { logout } from '@/lib/store/features/authSlice';
import { clearCourseCache } from '@/lib/store/features/courseSlice';
import { logoutUserAPI, logoutLocal } from '@/lib/api/apiService';
import { getRolePath } from '@/lib/navigationConfig';

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  // Role aur Path Detection
  const user = useAppSelector((state) => state.auth.user);
  const userRole = user?.role?.roleName || (typeof user?.role === 'string' ? user.role : "");
  const profilePath = getRolePath(userRole, "profile");

  // --- 1. LOGOUT LOGIC ---
  const handleLogout = async () => {
    try { await logoutUserAPI(); } catch (err) { console.error('Logout error:', err); }
    finally {
      dispatch(logout());
      dispatch(clearCourseCache()); // Clear course cache on logout
      logoutLocal();
      window.location.href = '/signin';
    }
  };

  // --- 2. SESSION EXPIRY LOGIC (1 Hour Check) ---
  useEffect(() => {
    const checkSession = () => {
      const lastActivity = localStorage.getItem('lastTabClosedAt');
      if (lastActivity) {
        const diffInMs = Date.now() - parseInt(lastActivity);
        const diffInHours = diffInMs / (1000 * 60 * 60);
        
        // Agar 1 ghante se zyada gap ho toh logout
        if (diffInHours >= 1) {
          handleLogout();
        }
        localStorage.removeItem('lastTabClosedAt');
      }
    };

    checkSession();

    // Browser/Tab band karte waqt waqt save karna
    const handleUnload = () => {
      localStorage.setItem('lastTabClosedAt', Date.now().toString());
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // Dropdown ko bahar click karne par band karna
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sidebarVariants: Variants = {
    hidden: { x: '-100%' }, 
    show: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { x: '-100%', transition: { duration: 0.2, ease: 'easeOut' } },
  };

  const iconVariants: Variants = {
    hidden: { rotate: -90, opacity: 0, scale: 0.5 },
    visible: { rotate: 0, opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { rotate: 90, opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC]">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0 w-[260px] h-screen sticky top-0 border-r border-gray-200 bg-white z-50">
        <WebSidebar /> 
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER: Dark Blue & Slim */}
        <header className="h-14 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-[40] bg-gradient-to-r from-white to-blue-100 ">
          
          <div className="lg:hidden w-10"></div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 text-slate-400 hover:text-white transition-all relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            </button>

            {/* PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onMouseEnter={() => setIsDropdownOpen(true)}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-700 transition-all active:scale-95 shadow-inner"
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
                    className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-[100] origin-top-right overflow-hidden"
                  >
                    <div className="px-4 py-3 mb-2 border-b border-gray-50">
                      <p className="text-xs font-black text-[#0F172A] uppercase tracking-widest truncate">{user?.firstName || 'Account'}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">{userRole || 'Member'}</p>
                    </div>

                    <Link 
                      href={profilePath} 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 w-full px-4 py-3 text-[13px] font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all mb-1"
                    >
                      <Settings size={16} /> Profile Settings
                    </Link>

                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-[13px] font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* CONTENT AREA: Minimized padding */}
        <main className="lg:px-10 lg:pt-4 lg:pb-10 w-full flex-1">
          <div className="animate-in fade-in slide-in-from-top-1 duration-500">
            {children} 
          </div>
        </main>
      </div>

      {/* Mobile Hamburger Logic (Same as your code) */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden p-2 fixed top-2.5 left-4 z-[60] bg-white border border-slate-200 rounded-lg shadow-xl" 
      >
        <AnimatePresence mode="wait">
          {!isMobileMenuOpen ? (
            <motion.div key="menu" variants={iconVariants} initial="hidden" animate="visible" exit="exit">
              <Menu size={20} className="text-[#0F172A]" />
            </motion.div>
          ) : (
            <motion.div key="close" variants={iconVariants} initial="hidden" animate="visible" exit="exit">
              <X size={20} className="text-[#0F172A]" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Mobile Menu Drawer (Same as your code) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            <motion.aside
              className="lg:hidden fixed top-0 left-0 h-full z-50 shadow-2xl bg-white"
              variants={sidebarVariants} initial="hidden" animate="show" exit="exit"
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