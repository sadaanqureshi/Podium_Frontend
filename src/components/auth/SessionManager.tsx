// 'use client';
// import { useEffect } from 'react';
// import { useAppDispatch } from '@/lib/store/hooks';
// import { logout } from '@/lib/store/features/authSlice'; 
// import { logoutLocal } from '@/lib/api/apiService'; 
// import Cookies from 'js-cookie';

// export const SessionManager = () => {
//   const dispatch = useAppDispatch();

//   useEffect(() => {
//     const checkSession = () => {
//       const token = Cookies.get('authToken');
//       const lastActive = localStorage.getItem('last_active_time');

//       if (token && lastActive) {
//         const now = Date.now();
//         const diff = now - parseInt(lastActive);
        
//         // 2 Minutes logic (2 * 60 * 1000)
//         const twoMinutes = 1 * 60 * 1000;

//         if (diff > twoMinutes) {
//           handleLogout();
//         } else {
//           // Agar user 2 min ke andar wapas aa gaya, toh timestamp clear kar dein
//           localStorage.removeItem('last_active_time');
//         }
//       }
//     };

//     const handleLogout = () => {
//       logoutLocal(); // Cookies clear karega
//       dispatch(logout()); // Redux state clear karega
//       localStorage.removeItem('last_active_time');
//       window.location.href = '/'; 
//     };

//     // 1. App khulne par session check karein
//     checkSession();

//     // 2. Tab band hote waqt timestamp save karein
//     const saveTimeOnClose = () => {
//       localStorage.setItem('last_active_time', Date.now().toString());
//     };

//     // --- HATAYI GAYI CHEEZEN (EXTRA LOGIC) ---
//     /* let idleTimer: NodeJS.Timeout;
//     const resetIdleTimer = () => {
//       if (idleTimer) clearTimeout(idleTimer);
//       idleTimer = setTimeout(handleLogout, 2 * 60 * 1000);
//       localStorage.setItem('last_active_time', Date.now().toString());
//     };
//     */

//     window.addEventListener('beforeunload', saveTimeOnClose);

//     // Activity tracking events commented out (Inactivity par logout nahi hoga)
//     // window.addEventListener('mousemove', resetIdleTimer);
//     // window.addEventListener('keydown', resetIdleTimer);
//     // window.addEventListener('click', resetIdleTimer);

//     return () => {
//       window.removeEventListener('beforeunload', saveTimeOnClose);
      
//       // Clean up activity listeners commented out
//       // window.removeEventListener('mousemove', resetIdleTimer);
//       // window.removeEventListener('keydown', resetIdleTimer);
//       // window.removeEventListener('click', resetIdleTimer);
//       // if (idleTimer) clearTimeout(idleTimer);
//     };
//   }, [dispatch]);

//   return null; 
// };

'use client';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setAuth, logout } from '@/lib/store/features/authSlice'; 
import { logoutLocal, fetchProfileAPI } from '@/lib/api/apiService'; // fetchProfileAPI zaroor import karein
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';

export const SessionManager = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  
  // Redux state se current user nikal rahe hain
  const user = useAppSelector((state) => state.auth.user);
  
  // Token cookies se le rahe hain (Middleware bhi yahi use karta hai)
  // const token = Cookies.get('authToken') || localStorage.getItem('access_token');
  const token = Cookies.get('authToken') || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);  
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const handleLogout = () => {
      logoutLocal(); // Cookies clear karega
      dispatch(logout()); // Redux state clear karega
      localStorage.removeItem('last_active_time');
      localStorage.removeItem('access_token');
      window.location.href = '/'; 
    };

    const checkSessionAndHydrate = async () => {
      const lastActive = localStorage.getItem('last_active_time');

      // --- LOGIC 1: Tab Close & Inactivity Check (Aapka purana logic) ---
      if (token && lastActive) {
        const now = Date.now();
        const diff = now - parseInt(lastActive);
        
        // Fix: 2 Minutes logic (2 * 60 * 1000)
        const twoMinutes = 2 * 60 * 1000; 

        if (diff > twoMinutes) {
          handleLogout();
          return; // Execute rok do agar session expire ho gaya hai
        } else {
          // Agar user 2 min ke andar wapas aa gaya, toh timestamp clear kar dein
          localStorage.removeItem('last_active_time');
        }
      }

      // --- LOGIC 2: Session Hydration (Secure Auth Flow) ---
      // Agar token majood hai magar Redux khali hai (yani Refresh hua hai)
      if (token && !user) {
        try {
          // Backend se fresh permissions aur data mangwao
          const res = await fetchProfileAPI(token);
          
          dispatch(setAuth({
            user: res.user,
            role: res.user.role.roleName,
            sidebar: res.sidebar,
            token: token
          }));
        } catch (error) {
          console.error("Session verification failed. Token might be invalid.", error);
          handleLogout(); // Token fake ya expire ho chuka hai toh bahar phenk do
        }
      }

      setIsHydrating(false); // Checking khatam
    };

    checkSessionAndHydrate();

    // --- LOGIC 3: Save Timestamp on Close/Refresh ---
    const saveTimeOnClose = () => {
      localStorage.setItem('last_active_time', Date.now().toString());
    };

    window.addEventListener('beforeunload', saveTimeOnClose);

    return () => {
      window.removeEventListener('beforeunload', saveTimeOnClose);
    };
  }, [dispatch, token, user]);

  // Jab tak backend se data aa raha hai, UI ko rok kar ek Loader dikhayen
  if (isHydrating && token && !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-app-bg">
        <Loader2 className="animate-spin text-accent-blue" size={40} />
      </div>
    );
  }

  // Sab safe hai, poori app ko render hone do
  return <>{children}</>; 
};