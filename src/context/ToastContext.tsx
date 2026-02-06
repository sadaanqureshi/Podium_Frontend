'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '@/components/ui/Toast';

interface ToastContextType {
    showToast: (msg: string, type: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | null }>({
        msg: '',
        type: null,
    });

    const showToast = useCallback((msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
    }, []);

    const hideToast = useCallback(() => {
        setToast({ msg: '', type: null });
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Global Toast Component */}
            <Toast 
                message={toast.msg} 
                type={toast.type} 
                onClose={hideToast} 
            />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
};