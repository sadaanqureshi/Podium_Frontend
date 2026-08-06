'use client';

import React from 'react';
import { AlertOctagon, X, Loader2 } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    loading?: boolean;
}

const DeleteConfirmationModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, title, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card-bg w-full max-w-sm rounded-2xl shadow-xl border border-border-subtle p-6 md:p-8 text-center relative overflow-hidden transform transition-all scale-in-95">
                
                {/* Subtle Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[40px] pointer-events-none -mr-16 -mt-16"></div>

                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    disabled={loading}
                    className="absolute top-3 right-3 p-2 text-text-muted hover:text-text-main hover:bg-app-bg rounded-lg transition-colors disabled:opacity-50 z-10"
                >
                    <X size={18} strokeWidth={2.5} />
                </button>

                {/* Minimal Icon Area */}
                <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-5 border border-red-500/20 relative z-10">
                    <AlertOctagon size={24} className="text-red-500" strokeWidth={2.5} />
                </div>

                {/* Clean Typography */}
                <h2 className="text-xl font-bold tracking-tight text-text-main mb-2 relative z-10">
                    Delete Record
                </h2>
                <p className="text-sm text-text-muted mb-8 leading-relaxed relative z-10">
                    Are you sure you want to delete <span className="font-semibold text-text-main">"{title}"</span>? This action is permanent.
                </p>

                {/* Minimal Action Buttons */}
                <div className="flex gap-3 relative z-10">
                    <button 
                        onClick={onClose} 
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-text-muted bg-app-bg border border-border-subtle hover:text-text-main hover:border-text-muted/50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        disabled={loading} 
                        className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-red-500 hover:bg-red-600 shadow-sm transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;