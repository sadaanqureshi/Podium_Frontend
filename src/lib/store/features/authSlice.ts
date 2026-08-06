import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { clearPersistedAuthSession } from '@/lib/auth/authSession';

interface SidebarChild {
  id: number;
  name: string;
  is_enable: boolean;
}

interface SidebarItem {
  id: number;
  name: string;
  is_enable: boolean;
  children?: SidebarChild[];
}

export type AuthRoleObject = {
  id?: number;
  roleName?: string;
  name?: string;
};

interface AuthState {
  user: any | null;
  token: string | null;
  /** Display/slug role name from API (never trust client-edited storage) */
  role: string | null;
  /** role.id from API: 1 admin, 2 teacher, 3 student */
  roleId: number | null;
  isAuthenticated: boolean;
  menu: SidebarItem[];
  /** True while GET /auth/profile is in flight on boot */
  authBootstrapping: boolean;
  /** True only after a successful profile sync this session */
  profileSynced: boolean;
}

const getInitialToken = () => {
  if (typeof window !== 'undefined') {
    return Cookies.get('authToken') || null;
  }
  return null;
};

const initialState: AuthState = {
  user: null,
  token: getInitialToken(),
  role: null,
  roleId: null,
  isAuthenticated: false,
  menu: [],
  authBootstrapping: true,
  profileSynced: false,
};

function roleNameFromPayload(role: string | AuthRoleObject | null | undefined): string | null {
  if (!role) return null;
  if (typeof role === 'string') return role;
  return role.roleName || role.name || null;
}

function roleIdFromPayload(role: string | AuthRoleObject | null | undefined, user?: any): number | null {
  if (role && typeof role === 'object' && typeof role.id === 'number') return role.id;
  if (user?.role && typeof user.role.id === 'number') return user.role.id;
  return null;
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthBootstrapping: (state, action: PayloadAction<boolean>) => {
      state.authBootstrapping = action.payload;
    },
    setAuth: (
      state,
      action: PayloadAction<{
        user: any;
        token: string;
        role: string | AuthRoleObject;
        sidebar: SidebarItem[];
      }>
    ) => {
      const roleName = roleNameFromPayload(action.payload.role);
      const roleId = roleIdFromPayload(action.payload.role, action.payload.user);

      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = roleName;
      state.roleId = roleId;
      state.menu = action.payload.sidebar || [];
      state.isAuthenticated = true;
      state.profileSynced = true;
      state.authBootstrapping = false;

      // Do NOT persist user/role/sidebar as authority — only cookies hold the JWT.
      // Clear any older spoofable local session cache.
      clearPersistedAuthSession();
    },
    logout: (state) => {
      if (typeof window !== 'undefined') {
        Cookies.remove('authToken', { path: '/' });
        Cookies.remove('userRole', { path: '/' });
        clearPersistedAuthSession();
      }
      state.user = null;
      state.token = null;
      state.role = null;
      state.roleId = null;
      state.menu = [];
      state.isAuthenticated = false;
      state.profileSynced = false;
      state.authBootstrapping = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload?.role?.id != null) {
        state.roleId = action.payload.role.id;
      }
      if (action.payload?.role?.roleName) {
        state.role = action.payload.role.roleName;
      }
    },
  },
});

export const { setAuth, logout, setUser, setAuthBootstrapping } = authSlice.actions;
export default authSlice.reducer;
