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
import { logoutLocal, fetchProfileAPI } from '@/lib/api/apiService'; 
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';

export const SessionManager = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  
  // Redux state se current user nikal rahe hain
  const user = useAppSelector((state) => state.auth.user);
  
  const [isHydrating, setIsHydrating] = useState(true);
  
  // 👉 HYDRATION FIX: Mounted state aur token ko state mein rakhein
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // 👉 HYDRATION FIX: Pehla render server jaisa hoga, phir client par mount hone ke baad token check hoga
  useEffect(() => {
    setMounted(true);
    const currentToken = Cookies.get('authToken') || localStorage.getItem('access_token');
    setToken(currentToken);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Jab tak browser mein mount na ho, kuch check mat karo

    const handleLogout = () => {
      logoutLocal(); // Cookies clear karega
      dispatch(logout()); // Redux state clear karega
      localStorage.removeItem('last_active_time');
      localStorage.removeItem('access_token');
      window.location.href = '/'; 
    };

    const checkSessionAndHydrate = async () => {
      const lastActive = localStorage.getItem('last_active_time');

      // --- LOGIC 1: Tab Close & Inactivity Check ---
      if (token && lastActive) {
        const now = Date.now();
        const diff = now - parseInt(lastActive);
        
        // 2 Minutes logic (2 * 60 * 1000)
        const twoMinutes = 2 * 60 * 1000; 

        if (diff > twoMinutes) {
          handleLogout();
          return; 
        } else {
          localStorage.removeItem('last_active_time');
        }
      }

      // --- LOGIC 2: Session Hydration (Secure Auth Flow) ---
      if (token && !user) {
        try {
          const res = await fetchProfileAPI(token);
          
          dispatch(setAuth({
            user: res.user,
            role: res.user.role.roleName,
            sidebar: res.sidebar,
            token: token
          }));
        } catch (error) {
          console.error("Session verification failed. Token might be invalid.", error);
          handleLogout(); 
        }
      }

      setIsHydrating(false); 
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
  }, [dispatch, token, user, mounted]);

  // 👉 HYDRATION FIX: Agar component abhi mount nahi hua toh server wala default view (children) dikhao
  if (!mounted) {
    return <>{children}</>;
  }

  // Jab tak backend se data aa raha hai aur token majood hai, Loader dikhayen
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