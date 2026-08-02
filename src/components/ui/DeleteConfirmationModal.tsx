// // src/components/ui/DeleteConfirmationModal.tsx

// 'use client';
// import React from 'react';
// import { AlertTriangle, X } from 'lucide-react';

// interface Props {
//     isOpen: boolean;
//     onClose: () => void;
//     onConfirm: () => void;
//     title: string;
//     loading?: boolean;
// }

// const DeleteConfirmationModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, title, loading }) => {
//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm animate-in fade-in duration-300">
//             <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">
//                 <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>

//                 <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
//                     <AlertTriangle size={40} className="text-red-500" />
//                 </div>

//                 <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Are you sure you want to delete?</h2>
//                 <p className="text-gray-500 text-sm mb-8">Are you sure you want to delete <span className="font-bold text-gray-800">"{title}"</span>? This action cannot be undone.</p>

//                 <div className="flex gap-3">
//                     <button onClick={onClose} className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all">No, Cancel</button>
//                     <button onClick={onConfirm} disabled={loading} className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg transition-all active:scale-95 disabled:opacity-50">
//                         Yes, Delete
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DeleteConfirmationModal;

// src/components/ui/DeleteConfirmationModal.tsx

'use client';
import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card-bg w-full max-w-sm rounded-2xl shadow-xl border border-border-subtle p-6 md:p-8 text-center relative overflow-hidden transform transition-all">
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    disabled={loading}
                    className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main hover:bg-border-subtle rounded-xl transition-colors disabled:opacity-50"
                >
                    <X size={18} strokeWidth={2.5} />
                </button>

                {/* Professional Sized Icon */}
                <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-500/20">
                    <AlertTriangle size={24} className="text-red-500" strokeWidth={2.5} />
                </div>

                {/* Clean Typography */}
                <h2 className="text-xl font-bold tracking-tight text-text-main mb-2">
                    Delete Record
                </h2>
                <p className="text-sm text-text-muted mb-8 leading-relaxed">
                    You are about to delete <span className="font-semibold text-text-main">{title}</span>. This action is permanent and cannot be undone.
                </p>

                {/* Standardized Action Buttons */}
                <div className="flex gap-3">
                    <button 
                        onClick={onClose} 
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-text-muted hover:text-text-main hover:bg-app-bg border border-transparent hover:border-border-subtle transition-all disabled:opacity-50"
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