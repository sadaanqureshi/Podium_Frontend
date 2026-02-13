'use client';
import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/store/hooks';
import { logout } from '@/lib/store/features/authSlice'; 
import { logoutLocal } from '@/lib/api/apiService'; 
import Cookies from 'js-cookie';

export const SessionManager = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkSession = () => {
      const token = Cookies.get('authToken');
      const lastActive = localStorage.getItem('last_active_time');

      if (token && lastActive) {
        const now = Date.now();
        const diff = now - parseInt(lastActive);
        
        // 2 Minutes logic (2 * 60 * 1000)
        const twoMinutes = 1 * 60 * 1000;

        if (diff > twoMinutes) {
          handleLogout();
        } else {
          // Agar user 2 min ke andar wapas aa gaya, toh timestamp clear kar dein
          localStorage.removeItem('last_active_time');
        }
      }
    };

    const handleLogout = () => {
      logoutLocal(); // Cookies clear karega
      dispatch(logout()); // Redux state clear karega
      localStorage.removeItem('last_active_time');
      window.location.href = '/'; 
    };

    // 1. App khulne par session check karein
    checkSession();

    // 2. Tab band hote waqt timestamp save karein
    const saveTimeOnClose = () => {
      localStorage.setItem('last_active_time', Date.now().toString());
    };

    // --- HATAYI GAYI CHEEZEN (EXTRA LOGIC) ---
    /* let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(handleLogout, 2 * 60 * 1000);
      localStorage.setItem('last_active_time', Date.now().toString());
    };
    */

    window.addEventListener('beforeunload', saveTimeOnClose);

    // Activity tracking events commented out (Inactivity par logout nahi hoga)
    // window.addEventListener('mousemove', resetIdleTimer);
    // window.addEventListener('keydown', resetIdleTimer);
    // window.addEventListener('click', resetIdleTimer);

    return () => {
      window.removeEventListener('beforeunload', saveTimeOnClose);
      
      // Clean up activity listeners commented out
      // window.removeEventListener('mousemove', resetIdleTimer);
      // window.removeEventListener('keydown', resetIdleTimer);
      // window.removeEventListener('click', resetIdleTimer);
      // if (idleTimer) clearTimeout(idleTimer);
    };
  }, [dispatch]);

  return null; 
};