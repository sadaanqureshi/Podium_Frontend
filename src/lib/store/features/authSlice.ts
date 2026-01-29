import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Backend JSON ke mutabiq interfaces
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

interface AuthState {
  user: any | null;
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  menu: SidebarItem[]; // Dynamic Sidebar data
}

// LocalStorage se data nikalne ka safe function (Next.js SSR compatibility ke liye)
const getInitialAuth = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('auth_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error("Error parsing auth_session:", error);
        return null;
      }
    }
  }
  return null;
};

const savedSession = getInitialAuth();

const initialState: AuthState = {
  user: savedSession?.user || null,
  token: savedSession?.token || null,
  role: savedSession?.role || null,
  isAuthenticated: !!savedSession?.token,
  // Fix: Yahan 'sidebar' ensure karein ke data mapping sahi ho
  menu: savedSession?.sidebar || [],
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // setAuth: Login ke waqt data store karne ke liye
    setAuth: (state, action: PayloadAction<{ user: any; token: string; role: string; sidebar: SidebarItem[] }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.menu = action.payload.sidebar; // Backend ka array yahan store ho raha hai
      state.isAuthenticated = true;

      // Poora payload save karein taaki refresh par initialState ko mil sake
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_session', JSON.stringify(action.payload));
      }
    },
    // logout: State aur LocalStorage clear karne ke liye
    logout: (state) => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_session');
      }
      state.user = null;
      state.token = null;
      state.role = null;
      state.menu = [];
      state.isAuthenticated = false;
    },
    setUser: (state, action) => {
      state.user = action.payload; // Redux state update

      if (typeof window !== 'undefined') {
        const savedSession = localStorage.getItem('auth_session');
        if (savedSession) {
          try {
            const session = JSON.parse(savedSession);
            // Poore session object mein sirf user wala part update karein
            session.user = action.payload;
            // Wapis 'auth_session' mein save karein
            localStorage.setItem('auth_session', JSON.stringify(session));
          } catch (e) {
            console.error("Failed to update auth session", e);
          }
        }
      }
    },
  },
});

export const { setAuth, logout, setUser } = authSlice.actions;
export default authSlice.reducer;