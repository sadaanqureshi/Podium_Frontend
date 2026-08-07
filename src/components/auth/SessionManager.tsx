'use client';

/**
 * Auth bootstrap — JWT is the only credential; GET /auth/profile is the
 * source of truth for user / role / sidebar on every refresh.
 *
 * Prevents role spoofing via Redux DevTools / localStorage / sessionStorage.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  setAuth,
  logout,
  setAuthBootstrapping,
} from '@/lib/store/features/authSlice';
import {
  clearAuthCookies,
  fetchProfileAPI,
  setAuthCookies,
} from '@/lib/api/apiService';
import { clearPersistedAuthSession } from '@/lib/auth/authSession';
import { withGoogleConnectedFlag } from '@/lib/googleCalendar';
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';
import {
  getDashboardPathForRole,
  getPortalRoleFromPath,
  getSignInPathForRole,
  roleFromProfileUser,
  normalizeRole,
} from '@/lib/navigationConfig';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get('authToken') || localStorage.getItem('access_token') || null;
}

function isAuthRoute(pathname: string) {
  return pathname.includes('/signin') || pathname.includes('/signup');
}

function isProtectedPortalRoute(pathname: string) {
  const portal = getPortalRoleFromPath(pathname);
  return !!portal && !isAuthRoute(pathname);
}

function readErrorMeta(error: unknown): {
  status?: number;
  isNetworkError: boolean;
  message: string;
} {
  if (typeof error !== 'object' || error === null) {
    return { isNetworkError: false, message: String(error) };
  }
  const e = error as {
    status?: number;
    isNetworkError?: boolean;
    message?: string;
  };
  return {
    status: e.status,
    isNetworkError: !!e.isNetworkError || e.status === 0,
    message: e.message || 'Auth profile sync failed',
  };
}

export const SessionManager = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const { user, authBootstrapping, profileSynced, roleId } = useAppSelector(
    (state) => state.auth
  );

  const [mounted, setMounted] = useState(false);
  const syncInFlight = useRef(false);
  const lastSyncedToken = useRef<string | null>(null);
  const lastFocusSyncAt = useRef(0);

  const hardLogout = useCallback(
    (portalHint?: string) => {
      const portal =
        normalizeRole(portalHint) ||
        getPortalRoleFromPath(pathname) ||
        'student';
      dispatch(logout());
      clearAuthCookies();
      clearPersistedAuthSession();
      window.location.href = getSignInPathForRole(portal);
    },
    [dispatch, pathname]
  );

  const syncProfile = useCallback(
    async (opts?: { force?: boolean; silent?: boolean }) => {
      const token = getStoredToken();
      const portal = getPortalRoleFromPath(pathname);

      if (!token) {
        lastSyncedToken.current = null;
        dispatch(logout());
        dispatch(setAuthBootstrapping(false));
        return;
      }

      if (!opts?.force && lastSyncedToken.current === token && profileSynced) {
        dispatch(setAuthBootstrapping(false));
        return;
      }

      if (syncInFlight.current) return;
      syncInFlight.current = true;

      if (!opts?.silent) {
        dispatch(setAuthBootstrapping(true));
      }

      try {
        const profile = await fetchProfileAPI(token);
        const apiUser = withGoogleConnectedFlag(profile.user, profile);
        const apiRole = apiUser?.role;
        const apiRoleName = apiRole?.roleName || apiRole?.name || '';
        const realPortal = roleFromProfileUser(apiUser);

        dispatch(
          setAuth({
            token,
            user: apiUser,
            role: apiRole || apiRoleName,
            sidebar: profile.sidebar || [],
          })
        );

        setAuthCookies(token, String(apiRoleName || realPortal));
        clearPersistedAuthSession();
        lastSyncedToken.current = token;

        if (portal && realPortal && portal !== realPortal) {
          router.replace(getDashboardPathForRole(realPortal));
        }

        if (realPortal && isAuthRoute(pathname)) {
          router.replace(getDashboardPathForRole(realPortal));
        }
      } catch (error: unknown) {
        const { status, isNetworkError, message } = readErrorMeta(error);

        // Network / backend down: keep current session, never crash the UI
        if (isNetworkError) {
          if (!opts?.silent) {
            console.warn('[SessionManager]', message);
          }
          dispatch(setAuthBootstrapping(false));
          return;
        }

        if (status === 401 || status === 400 || status === 403) {
          hardLogout(portal || undefined);
          return;
        }

        if (!opts?.silent) {
          console.warn('[SessionManager] profile sync failed:', message);
        }
        dispatch(setAuthBootstrapping(false));
      } finally {
        syncInFlight.current = false;
      }
    },
    [dispatch, hardLogout, pathname, profileSynced, router]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Every full page refresh / first mount
  useEffect(() => {
    if (!mounted) return;
    void syncProfile({ force: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boot once on mount
  }, [mounted]);

  // Quiet re-validate on focus (debounced) — corrects Inspect edits without overlays
  useEffect(() => {
    if (!mounted) return;

    const onFocus = () => {
      if (document.visibilityState !== 'visible') return;
      if (!getStoredToken()) return;

      const now = Date.now();
      if (now - lastFocusSyncAt.current < 15_000) return;
      lastFocusSyncAt.current = now;

      void syncProfile({ force: true, silent: true });
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [mounted, syncProfile]);

  // Soft portal guard after sync (API role wins)
  useEffect(() => {
    if (!profileSynced || authBootstrapping) return;

    const portal = getPortalRoleFromPath(pathname);
    const real =
      roleFromProfileUser(user) ||
      (roleId === 1
        ? 'admin'
        : roleId === 2
          ? 'teacher'
          : roleId === 3
            ? 'student'
            : '');

    if (portal && real && portal !== real && !isAuthRoute(pathname)) {
      router.replace(getDashboardPathForRole(real));
    }
  }, [authBootstrapping, pathname, profileSynced, roleId, router, user]);

  if (!mounted) {
    return <>{children}</>;
  }

  if (authBootstrapping && isProtectedPortalRoute(pathname)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-app-bg gap-3">
        <Loader2 className="animate-spin text-accent-blue" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
          Verifying session
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
