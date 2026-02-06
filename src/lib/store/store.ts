import { configureStore, Middleware, isPending, isFulfilled, isRejected } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import assignmentReducer from './features/assignmentSlice';
import courseReducer from './features/courseSlice';
import uiReducer, { startLoading, stopLoading } from './features/uiSlice';
import userReducer from './features/userSlice'; // # New
import academicReducer from './features/academicSlice'; // # New
import financeReducer from './features/financeSlice'; // # New

const loadingMiddleware: Middleware = (storeAPI) => (next) => (action: any) => {
  if (isPending(action)) storeAPI.dispatch(startLoading());
  if (isFulfilled(action) || isRejected(action)) storeAPI.dispatch(stopLoading());
  return next(action);
};

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      assignment: assignmentReducer,
      course: courseReducer,
      ui: uiReducer,
      users: userReducer,
      academic: academicReducer,
      finance: financeReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(loadingMiddleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];