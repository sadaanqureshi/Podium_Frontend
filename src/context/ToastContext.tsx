'use client';

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
} from 'react';
import ToastStack, { type ToastItem } from '@/components/ui/Toast';
import { toastBus, type ToastType } from '@/lib/toastBus';

const MAX_TOASTS = 3;
const DEDUPE_MS = 2000;

interface ToastContextType {
    showToast: (msg: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const recentRef = useRef<Map<string, number>>(new Map());

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((msg: string, type: ToastType = 'error') => {
        const message = (msg || '').trim();
        if (!message) return;

        const key = `${type}::${message}`;
        const now = Date.now();
        const last = recentRef.current.get(key);
        if (last != null && now - last < DEDUPE_MS) return;
        recentRef.current.set(key, now);

        // prune old dedupe keys
        for (const [k, ts] of recentRef.current) {
            if (now - ts > DEDUPE_MS * 2) recentRef.current.delete(k);
        }

        const id = `${now}-${Math.random().toString(36).slice(2, 9)}`;
        setToasts((prev) => {
            const next = [...prev, { id, message, type }];
            return next.slice(-MAX_TOASTS);
        });
    }, []);

    // Bridge Redux middleware / non-React callers
    useEffect(() => {
        return toastBus.subscribe(({ message, type }) => {
            showToast(message, type);
        });
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastStack toasts={toasts} onClose={dismiss} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
