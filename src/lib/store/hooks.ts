import { useDispatch, useSelector, useStore } from 'react-redux';
import type { RootState, AppDispatch, AppStore } from './store';

/**
 * Ye hooks poori app mein 'any' type se bachne ke liye banaye gaye hain.
 */

// useDispatch ka typed version
export const useAppDispatch = () => useDispatch<AppDispatch>();

// useSelector ka typed version
export const useAppSelector = <T>(selector: (state: RootState) => T) => useSelector(selector);

// useStore ka typed version
export const useAppStore = () => useStore<AppStore>();