// import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// // Backend JSON ke mutabiq interfaces
// interface SidebarChild {
//   id: number;
//   name: string;
//   is_enable: boolean;
// }

// interface SidebarItem {
//   id: number;
//   name: string;
//   is_enable: boolean;
//   children?: SidebarChild[];
// }

// interface AuthState {
//   user: any | null;
//   token: string | null;
//   role: string | null;
//   isAuthenticated: boolean;
//   menu: SidebarItem[]; 
// }

// // Sirf Token get karna hai, baqi sab backend dega
// const getInitialToken = () => {
//   if (typeof window !== 'undefined') {
//     return localStorage.getItem('access_token') || null;
//   }
//   return null;
// };

// const initialState: AuthState = {
//   user: null,
//   token: getInitialToken(),
//   role: null,
//   isAuthenticated: false, // Page load par false rahega jab tak profile fetch na ho
//   menu: [],
// };

// export const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     setAuth: (state, action: PayloadAction<{ user: any; token: string; role: string; sidebar: SidebarItem[] }>) => {
//       state.user = action.payload.user;
//       state.token = action.payload.token;
//       state.role = action.payload.role;
//       state.menu = action.payload.sidebar;
//       state.isAuthenticated = true;

//       // SIRF Token ko local storage mein save karein
//       if (typeof window !== 'undefined') {
//         localStorage.setItem('access_token', action.payload.token);
//       }
//     },
//     logout: (state) => {
//       if (typeof window !== 'undefined') {
//         localStorage.removeItem('access_token');
//         // Cookie remove karne ka logic API ya component level par hoga
//       }
//       state.user = null;
//       state.token = null;
//       state.role = null;
//       state.menu = [];
//       state.isAuthenticated = false;
//     },
//     setUser: (state, action) => {
//       state.user = action.payload;
//     },
//   },
// });

// export const { setAuth, logout, setUser } = authSlice.actions;
// export default authSlice.reducer;




import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

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
  menu: SidebarItem[]; 
}

// 👉 FIX: Ab initial token localStorage ke bajaye strictly Cookie se aayega
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
  isAuthenticated: false, 
  menu: [],
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: any; token: string; role: string; sidebar: SidebarItem[] }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.menu = action.payload.sidebar;
      state.isAuthenticated = true;
      // LocalStorage hata diya! Token save karne ki zimmedari ab sirf SignInPage ki (via Cookie) hai.
    },
    logout: (state) => {
      if (typeof window !== 'undefined') {
        Cookies.remove('authToken');
        Cookies.remove('userRole');
      }
      state.user = null;
      state.token = null;
      state.role = null;
      state.menu = [];
      state.isAuthenticated = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setAuth, logout, setUser } = authSlice.actions;
export default authSlice.reducer;