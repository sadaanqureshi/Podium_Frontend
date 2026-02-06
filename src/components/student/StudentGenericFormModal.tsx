'use client';
import React, { useState, useEffect } from 'react';
import { X, Loader2, ChevronDown } from 'lucide-react';

const StudentGenericFormModal = ({ isOpen, onClose, title, fields, onSubmit, loading, initialData, submitText }: any) => {
    const [formValues, setFormValues] = useState<Record<string, any>>({});

    useEffect(() => {
        if (isOpen && initialData) setFormValues(initialData);
        else setFormValues({});
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(formValues).forEach(([key, val]) => formData.append(key, val));
        await onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-card-bg w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-border-subtle transition-colors duration-300">
                <div className="flex justify-between items-center px-10 py-8 form-modal-header transition-colors">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black tracking-tight uppercase">{title}</h2>
                        <div className="h-1.5 w-16 bg-accent-blue rounded-full shadow-sm"></div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/10 dark:hover:bg-card-bg/20 rounded-2xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto no-scrollbar bg-card-bg flex-1">
                    <div className="px-10 py-10 space-y-10">
                        {/* Fields rendering logic wahi rahega */}
                        <p className="text-text-muted font-bold">Student form under maintenance...</p>
                    </div>

                    <div className="px-10 py-12 bg-app-bg flex justify-end gap-6 border-t border-border-subtle mt-auto transition-colors">
                        <button type="button" onClick={onClose} className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-text-muted">Discard</button>
                        <button disabled={loading} className="px-14 py-5 bg-accent-blue text-white rounded-[1.75rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-hover-blue transition-all active:scale-95 shadow-xl shadow-accent-blue/20">
                            {loading ? <Loader2 size={20} className="animate-spin" /> : (submitText || 'Submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentGenericFormModal;