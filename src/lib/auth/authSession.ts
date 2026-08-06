/** Persist login payload so student/teacher can refresh without calling /auth/profile */

const AUTH_SESSION_KEY = 'podium_auth_session';

export type PersistedAuthSession = {
  user: any;
  role: string;
  sidebar: any[];
  token: string;
};

export const persistAuthSession = (payload: PersistedAuthSession) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
};

export const readPersistedAuthSession = (): PersistedAuthSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedAuthSession;
  } catch {
    return null;
  }
};

export const clearPersistedAuthSession = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch {
    /* ignore */
  }
};
