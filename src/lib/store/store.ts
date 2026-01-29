import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';

/**
 * Redux store ko configure kiya gaya hai.
 * Yahan saare reducers register honge.
 */
export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      // Baaki reducers yahan add karein
    },
    // Middleware configuration agar zaroorat ho
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Store ki types define ki gayi hain taaki hooks mein use ho sakein
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];