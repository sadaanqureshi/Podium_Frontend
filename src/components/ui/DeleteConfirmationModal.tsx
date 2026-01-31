// src/components/ui/DeleteConfirmationModal.tsx

'use client';
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>

                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={40} className="text-red-500" />
                </div>

                <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Pukka Delete Karna Hai?</h2>
                <p className="text-gray-500 text-sm mb-8">Kya aap waqai <span className="font-bold text-gray-800">"{title}"</span> ko hatana chahte hain? Yeh amal wapas nahi ho sakega.</p>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all">Nahi, Rehne do</button>
                    <button onClick={onConfirm} disabled={loading} className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg transition-all active:scale-95 disabled:opacity-50">
                        Haan, Hata do
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;