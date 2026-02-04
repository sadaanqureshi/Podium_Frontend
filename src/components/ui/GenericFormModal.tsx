'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    Loader2,
    ChevronDown,
    Plus,
    Trash2,
    CheckCircle2
} from 'lucide-react';

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'select' | 'files' | 'checkbox-group' | 'date' | 'time' | 'datetime-local' | 'quiz-builder';
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

// ==========================================
// 1. QUESTION BUILDER COMPONENT
// ==========================================
const QuestionBuilder = ({
    onChange,
    initialData
}: {
    onChange: (data: any) => void;
    initialData?: any[];
}) => {
    const [questions, setQuestions] = useState<any[]>([]);

    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setQuestions(initialData);
        }
    }, [initialData]);

    const addQuestion = () => {
        const newQuestions = [
            ...questions,
            { question_text: '', question_type: 'MCQ', marks: 5, options: [] }
        ];
        setQuestions(newQuestions);
        onChange(newQuestions);
    };

    const removeQuestion = (index: number) => {
        const updated = questions.filter((_, i) => i !== index);
        setQuestions(updated);
        onChange(updated);
    };

    const toggleCorrectOption = (qIndex: number, oIndex: number) => {
        const updated = [...questions];
        const currentQ = updated[qIndex];

        if (currentQ.question_type === 'MCQ') {
            // MCQ: Only one can be correct
            currentQ.options.forEach((opt: any, i: number) => {
                opt.is_correct = i === oIndex;
            });
        } else {
            // BCQ: Multiple can be correct
            currentQ.options[oIndex].is_correct = !currentQ.options[oIndex].is_correct;
        }

        setQuestions(updated);
        onChange(updated);
    };

    const addOption = (qIndex: number) => {
        const updated = [...questions];
        if (!updated[qIndex].options) updated[qIndex].options = [];
        updated[qIndex].options.push({ option_text: '', is_correct: false });
        setQuestions(updated);
        onChange(updated);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const updated = [...questions];
        updated[qIndex].options = updated[qIndex].options.filter((_: any, i: number) => i !== oIndex);
        setQuestions(updated);
        onChange(updated);
    };

    const updateQuestionText = (index: number, text: string) => {
        const updated = [...questions];
        updated[index].question_text = text;
        setQuestions(updated);
        onChange(updated);
    };

    const updateQuestionType = (index: number, type: string) => {
        const updated = [...questions];
        updated[index].question_type = type;
        setQuestions(updated);
        onChange(updated);
    };

    const updateMarks = (index: number, val: number) => {
        const updated = [...questions];
        updated[index].marks = val;
        setQuestions(updated);
        onChange(updated);
    };

    const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex].option_text = text;
        setQuestions(updated);
        onChange(updated);
    };

    return (
        <div className="md:col-span-2 space-y-6 bg-blue-50/20 p-8 rounded-[2.5rem] border-2 border-blue-50">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-sm font-black uppercase text-blue-900/60 tracking-widest">
                    Quiz Designer
                </h3>
                <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                >
                    <Plus size={14} /> Add Question
                </button>
            </div>

            {questions.map((q, qIndex) => (
                <div
                    key={qIndex}
                    className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6 animate-in slide-in-from-top-4 duration-300"
                >
                    <div className="flex justify-between gap-4">
                        <input
                            placeholder="Enter Question Text..."
                            className="flex-1 text-sm font-bold bg-transparent outline-none border-b-2 border-slate-50 focus:border-blue-500 py-2 transition-all"
                            value={q.question_text || ''}
                            onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-300 hover:text-red-500 p-2 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <select
                            className="w-full p-3 bg-slate-50 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-blue-200"
                            value={q.question_type}
                            onChange={(e) => updateQuestionType(qIndex, e.target.value)}
                        >
                            <option value="MCQ">MCQ (Single Choice)</option>
                            <option value="BCQ">BCQ (Multiple Choice)</option>
                            <option value="SHORT">Short Answer</option>
                        </select>
                        <input
                            type="number"
                            className="w-full p-3 bg-slate-50 rounded-xl text-xs font-bold outline-none"
                            placeholder="Marks"
                            value={q.marks || 0}
                            onChange={(e) => updateMarks(qIndex, Number(e.target.value))}
                        />
                    </div>

                    {q.question_type !== 'SHORT' && (
                        <div className="space-y-3 pl-4 border-l-2 border-blue-50">
                            {q.options?.map((opt: any, oIndex: number) => (
                                <div key={oIndex} className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-50">
                                    <input
                                        placeholder="Option..."
                                        className="flex-1 text-xs font-medium bg-transparent px-3 outline-none"
                                        value={opt.option_text || ''}
                                        onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleCorrectOption(qIndex, oIndex)}
                                            className={`p-1.5 rounded-lg transition-all ${opt.is_correct ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-50 text-slate-200'
                                                }`}
                                        >
                                            <CheckCircle2 size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeOption(qIndex, oIndex)}
                                            className="p-1.5 text-red-200 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addOption(qIndex)}
                                className="text-[10px] font-black text-blue-500 uppercase hover:text-blue-700"
                            >
                                + Add Option
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// ==========================================
// 2. MAIN MODAL COMPONENT
// ==========================================
const GenericFormModal: React.FC<GenericFormModalProps> = ({
    isOpen,
    onClose,
    title,
    fields,
    onSubmit,
    loading,
    initialData,
    submitText
}) => {
    const [formValues, setFormValues] = useState<Record<string, any>>({});

    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    useEffect(() => {
        if (isOpen && initialData) {
            const formattedData = { ...initialData };

            // Map potential camelCase/snake_case keys from API
            const startTime = initialData.start_time || initialData.startTime;
            const endTime = initialData.end_time || initialData.endTime;
            const totalMarks = initialData.total_marks || initialData.totalMarks;

            if (startTime) formattedData.start_time = new Date(startTime).toISOString().slice(0, 16);
            if (endTime) formattedData.end_time = new Date(endTime).toISOString().slice(0, 16);
            if (totalMarks) formattedData.total_marks = totalMarks;

            setFormValues(formattedData);
        } else {
            setFormValues({});
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();

        fields.forEach((field) => {
            const value = formValues[field.name];

            if (field.type === 'files') {
                if (value && typeof value === 'object' && value instanceof File) {
                    formData.append(field.name, value);
                }
            } else if (field.type === 'quiz-builder') {
                formData.append(field.name, JSON.stringify(value || []));
            } else if (value !== null && value !== undefined && value !== "") {
                formData.append(field.name, value.toString());
            }
        });

        try {
            await onSubmit(formData);
        } catch (err: any) {
            console.log("ALERT: Submission failed - " + err.message);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-800">

                {/* HEADER */}
                <div className="flex justify-between items-center px-10 py-8 border-b border-slate-700 bg-[#0F172A] text-white">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black tracking-tight uppercase">{title}</h2>
                        <div className="h-1.5 w-16 bg-blue-500 rounded-full shadow-sm"></div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/10 text-blue-400 rounded-2xl transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* FORM BODY */}
                <form onSubmit={handleSubmit} className="overflow-y-auto no-scrollbar bg-white flex-1">
                    <div className="px-10 py-10 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {fields.map((field) => (
                                <div
                                    key={field.name}
                                    className={(field.type === 'textarea' || field.type === 'quiz-builder') ? 'md:col-span-2' : ''}
                                >
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-blue-900/40 mb-4 ml-1">
                                        {field.label} {field.required && <span className="text-blue-500">*</span>}
                                    </label>

                                    {/* Field Type Switch */}
                                    {field.type === 'select' ? (
                                        <div className="relative group">
                                            <select
                                                required={field.required}
                                                value={formValues[field.name] || ''}
                                                onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
                                                className="w-full px-8 py-5 rounded-[1.5rem] border-2 border-slate-100 bg-slate-50/30 hover:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-100/50 focus:border-blue-600 outline-none text-sm font-bold appearance-none cursor-pointer transition-all"
                                            >
                                                <option value="" disabled>Choose {field.label}...</option>
                                                {field.options?.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500 group-focus-within:rotate-180 transition-transform duration-300">
                                                <ChevronDown size={22} strokeWidth={3} />
                                            </div>
                                        </div>
                                    ) : field.type === 'datetime-local' ? (
                                        <div className="relative group">
                                            <input
                                                type="datetime-local"
                                                required={field.required}
                                                min={getMinDateTime()}
                                                value={formValues[field.name] || ''}
                                                className="w-full px-8 py-5 rounded-[1.5rem] border-2 border-slate-100 bg-slate-50/30 focus:bg-white focus:border-blue-600 outline-none text-sm font-bold text-slate-700 transition-all custom-blue-calendar"
                                                onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
                                            />
                                            <style jsx>{`
                        .custom-blue-calendar::-webkit-calendar-picker-indicator {
                          display: block;
                          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>');
                          cursor: pointer;
                          width: 24px;
                          height: 24px;
                        }
                      `}</style>
                                        </div>
                                    ) : field.type === 'quiz-builder' ? (
                                        <QuestionBuilder
                                            initialData={formValues[field.name]}
                                            onChange={(data) => setFormValues({ ...formValues, [field.name]: data })}
                                        />
                                    ) : field.type === 'textarea' ? (
                                        <textarea
                                            required={field.required}
                                            value={formValues[field.name] || ''}
                                            placeholder={field.placeholder}
                                            className="w-full px-8 py-6 rounded-[2rem] border-2 border-slate-100 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-blue-100/50 focus:border-blue-600 outline-none min-h-[160px] text-sm font-bold text-slate-700 transition-all shadow-sm"
                                            onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
                                        />
                                    ) : field.type === 'files' ? (
                                        <input
                                            type="file"
                                            onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.files?.[0] })}
                                            className="w-full px-8 py-5 rounded-[1.5rem] border-2 border-slate-100 bg-slate-50/30 text-xs font-bold"
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            value={formValues[field.name] || ''}
                                            className="w-full px-8 py-5 rounded-[1.5rem] border-2 border-slate-100 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-blue-100/50 focus:border-blue-600 outline-none text-sm font-bold text-slate-700 transition-all shadow-sm"
                                            onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="px-10 py-12 bg-slate-50/50 flex flex-col sm:flex-row justify-end gap-6 border-t border-blue-50 mt-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-slate-600 transition-all"
                        >
                            Discard
                        </button>
                        <button
                            disabled={loading}
                            className="px-14 py-5 bg-blue-600 text-white rounded-[1.75rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-4 transition-all active:scale-95 shadow-[0_20px_40px_rgba(37,99,235,0.3)]"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                submitText || 'Save All Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GenericFormModal;