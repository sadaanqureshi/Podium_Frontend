'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, Info, AlertCircle, X } from 'lucide-react';
import type { ToastType } from '@/lib/toastBus';

export type ToastItem = {
    id: string;
    message: string;
    type: ToastType;
};

interface ToastStackProps {
    toasts: ToastItem[];
    onClose: (id: string) => void;
}

const DURATION: Record<ToastType, number> = {
    success: 3000,
    info: 3500,
    warning: 4000,
    error: 4500,
};

const STYLES: Record<ToastType, string> = {
    success: 'bg-emerald-950/95 border-emerald-500/40 text-emerald-300',
    error: 'bg-red-950/95 border-red-500/40 text-red-300',
    warning: 'bg-amber-950/95 border-amber-500/40 text-amber-300',
    info: 'bg-slate-900/95 border-sky-500/40 text-sky-300',
};

const IconFor = ({ type }: { type: ToastType }) => {
    if (type === 'success') return <CheckCircle2 size={18} className="shrink-0" />;
    if (type === 'warning') return <AlertTriangle size={18} className="shrink-0" />;
    if (type === 'info') return <Info size={18} className="shrink-0" />;
    return <AlertCircle size={18} className="shrink-0" />;
};

function ToastCard({
    item,
    onClose,
}: {
    item: ToastItem;
    onClose: (id: string) => void;
}) {
    useEffect(() => {
        const timer = setTimeout(() => onClose(item.id), DURATION[item.type]);
        return () => clearTimeout(timer);
    }, [item.id, item.type, onClose]);

    return (
        <div
            role="status"
            aria-live="polite"
            className={`flex items-start justify-between gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-300 ${STYLES[item.type]}`}
        >
            <div className="flex items-start gap-3 min-w-0">
                <IconFor type={item.type} />
                <span className="text-sm font-semibold leading-snug break-words">
                    {item.message}
                </span>
            </div>
            <button
                type="button"
                onClick={() => onClose(item.id)}
                className="hover:opacity-70 transition-opacity shrink-0 mt-0.5"
                aria-label="Dismiss"
            >
                <X size={16} />
            </button>
        </div>
    );
}

/** Stacked toasts — portaled to body so they sit above modals/backdrops. */
const ToastStack: React.FC<ToastStackProps> = ({ toasts, onClose }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !toasts.length) return null;

    return createPortal(
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] w-[min(92vw,28rem)] flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <ToastCard key={t.id} item={t} onClose={onClose} />
            ))}
        </div>,
        document.body
    );
};

export default ToastStack;
