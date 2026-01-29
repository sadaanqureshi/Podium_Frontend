'use client';
import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar, Clock, ChevronDown } from 'lucide-react';

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'select' | 'files' | 'checkbox-group' | 'date' | 'time';
    placeholder?: string;
    required?: boolean;
    options?: { label: string; value: string | number }[];
}

interface GenericFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    fields: FormField[];
    onSubmit: (data: FormData) => Promise<void>;
    loading?: boolean;
    initialData?: any;
    submitText?: string;
}

const GenericFormModal: React.FC<GenericFormModalProps> = ({
    isOpen, onClose, title, fields, onSubmit, loading, initialData, submitText
}) => {
    const [formValues, setFormValues] = useState<Record<string, any>>({});

    // Jab modal khule ya initialData badle, values reset karein
    useEffect(() => {
        if (isOpen && initialData) {
            setFormValues(initialData);
        } else {
            setFormValues({});
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleInputChange = (name: string, value: any) => {
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (name: string, files: FileList | null) => {
        if (files && files.length > 0) {
            handleInputChange(name, files[0]); // Store binary File object
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();

        // Sirf wahi fields bhejni hain jo Modal config mein define hain
        fields.forEach((field) => {
            const value = formValues[field.name];

            // 1. Binary File Logic (Hamesha bhejni hai agar select hui ho)
            if (value && typeof value === 'object' && 'name' in value && 'size' in value) {
                formData.append(field.name, value as File);
                return;
            }

            // 2. Dirty Fields Logic (Strings/Numbers ke liye comparison)
            if (initialData && initialData.hasOwnProperty(field.name)) {
                if (value == initialData[field.name]) {
                    return; // Skip if value is same as original
                }
            }

            // 3. Append valid textual values
            if (value !== null && value !== undefined && value !== "") {
                formData.append(field.name, value.toString());
            }
        });

        await onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-10 py-7 border-b border-gray-50">
                    <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto">
                    <div className="px-10 py-8 space-y-7">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {fields.map((field) => (
                                <div key={field.name} className={(field.type === 'textarea') ? 'md:col-span-2' : ''}>
                                    <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-800 mb-2.5 ml-1">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>

                                    {field.type === 'select' ? (
                                        <div className="relative group">
                                            <select required={field.required} value={formValues[field.name] || ''} onChange={(e) => handleInputChange(field.name, e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none text-sm font-bold text-slate-700 transition-all appearance-none cursor-pointer">
                                                <option value="" disabled>Select {field.label}</option>
                                                {field.options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" size={18} />
                                        </div>
                                    ) 
                                    : field.type === 'files' ? (
                                        <div className="relative group">
                                            <input type="file" required={field.required && !initialData} onChange={(e) => handleFileChange(field.name, e.target.files)} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none text-sm font-bold text-slate-700 transition-all" />
                                        </div>
                                    )
                                    : field.type === 'textarea' ? (
                                        <textarea required={field.required} value={formValues[field.name] || ''} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none min-h-[120px] text-sm font-bold text-slate-700 transition-all" onChange={(e) => handleInputChange(field.name, e.target.value)} />
                                    ) : (
                                        <input type={field.type} required={field.required} value={formValues[field.name] || ''} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none text-sm font-bold text-slate-700 transition-all" onChange={(e) => handleInputChange(field.name, e.target.value)} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="px-10 py-8 bg-slate-50/50 flex justify-end gap-4 border-t border-gray-100 mt-auto">
                        <button type="button" onClick={onClose} className="px-8 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                        <button disabled={loading} className="px-10 py-4 bg-[#0F172A] text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-black disabled:opacity-50 flex items-center gap-3 transition-all active:scale-95 shadow-xl">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : (submitText || 'Save Changes')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GenericFormModal;