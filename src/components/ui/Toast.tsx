'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | null;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (type) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [type, duration, onClose]);

    if (!type) return null;

    return (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-top-5 duration-300 w-[90%] max-w-md">
            <div className={`flex items-center justify-between gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
                type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                : 'bg-red-500/10 border-red-500/20 text-red-500'
            } bg-card-bg backdrop-blur-xl transition-all`}>
                
                <div className="flex items-center gap-3">
                    {type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    <span className="text-xs font-black uppercase tracking-widest leading-none">
                        {message}
                    </span>
                </div>

                <button onClick={onClose} className="hover:opacity-70 transition-opacity">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default Toast;