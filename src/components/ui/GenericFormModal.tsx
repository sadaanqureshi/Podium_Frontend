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
            currentQ.options.forEach((opt: any, i: number) => {
                opt.is_correct = i === oIndex;
            });
        } else {
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
        <div className="md:col-span-2 space-y-6 bg-app-bg p-8 rounded-[2.5rem] border-2 border-border-subtle transition-colors">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-sm font-black uppercase text-text-muted tracking-widest">
                    Quiz Designer
                </h3>
                <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-2 px-6 py-2.5 bg-accent-blue text-white rounded-2xl text-[10px] font-black uppercase hover:bg-hover-blue transition-all shadow-lg active:scale-95"
                >
                    <Plus size={14} strokeWidth={3} /> Add Question
                </button>
            </div>

            {questions.map((q, qIndex) => (
                <div
                    key={qIndex}
                    className="bg-card-bg p-8 rounded-[2rem] border border-border-subtle shadow-sm space-y-6 animate-in slide-in-from-top-4 duration-300"
                >
                    <div className="flex justify-between gap-4">
                        <input
                            placeholder="Enter Question Text..."
                            className="flex-1 text-sm font-bold bg-transparent outline-none border-b-2 border-border-subtle focus:border-accent-blue py-2 transition-all text-text-main"
                            value={q.question_text || ''}
                            onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-text-muted hover:text-red-500 p-2 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <select
                            className="w-full p-3 bg-app-bg text-text-main rounded-xl text-xs font-bold outline-none border border-border-subtle focus:border-accent-blue transition-all"
                            value={q.question_type}
                            onChange={(e) => updateQuestionType(qIndex, e.target.value)}
                        >
                            <option value="MCQ">MCQ (Single Choice)</option>
                            <option value="BCQ">BCQ (Multiple Choice)</option>
                            <option value="SHORT">Short Answer</option>
                        </select>
                        <input
                            type="number"
                            className="w-full p-3 bg-app-bg text-text-main rounded-xl text-xs font-bold outline-none border border-border-subtle focus:border-accent-blue transition-all"
                            placeholder="Marks"
                            value={q.marks || 0}
                            onChange={(e) => updateMarks(qIndex, Number(e.target.value))}
                        />
                    </div>

                    {q.question_type !== 'SHORT' && (
                        <div className="space-y-3 pl-4 border-l-2 border-border-subtle">
                            {q.options?.map((opt: any, oIndex: number) => (
                                <div key={oIndex} className="flex items-center gap-4 bg-app-bg p-2 rounded-2xl shadow-sm border border-border-subtle">
                                    <input
                                        placeholder="Option Text..."
                                        className="flex-1 text-xs font-medium bg-transparent px-3 outline-none text-text-main"
                                        value={opt.option_text || ''}
                                        onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleCorrectOption(qIndex, oIndex)}
                                            className={`p-1.5 rounded-lg transition-all ${opt.is_correct ? 'bg-emerald-500 text-white shadow-lg' : 'bg-card-bg text-text-muted border border-border-subtle'
                                                }`}
                                        >
                                            <CheckCircle2 size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeOption(qIndex, oIndex)}
                                            className="p-1.5 text-text-muted hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addOption(qIndex)}
                                className="text-[10px] font-black text-accent-blue uppercase hover:opacity-80 transition-all ml-1"
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
            console.error("Submission failed");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-card-bg w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-border-subtle transition-colors duration-300">

                {/* HEADER: Applied .form-modal-header for Light Blue / Pitch Black switch */}
                <div className="flex justify-between items-center px-10 py-8 form-modal-header transition-colors">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black tracking-tight uppercase">{title}</h2>
                        <div className="h-1.5 w-16 bg-accent-blue rounded-full shadow-sm"></div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/10 dark:hover:bg-card-bg/20 rounded-2xl transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* FORM BODY */}
                <form onSubmit={handleSubmit} className="overflow-y-auto no-scrollbar bg-card-bg flex-1">
                    <div className="px-10 py-10 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {fields.map((field) => (
                                <div
                                    key={field.name}
                                    className={(field.type === 'textarea' || field.type === 'quiz-builder') ? 'md:col-span-2' : ''}
                                >
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-text-muted mb-4 ml-1">
                                        {field.label} {field.required && <span className="text-accent-blue">*</span>}
                                    </label>

                                    {field.type === 'select' ? (
                                        <div className="relative group">
                                            <select
                                                required={field.required}
                                                value={formValues[field.name] || ''}
                                                onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
                                                className="w-full px-8 py-5 rounded-[1.5rem] border-2 border-border-subtle bg-app-bg hover:border-accent-blue/50 focus:bg-card-bg focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue outline-none text-sm font-bold text-text-main appearance-none cursor-pointer transition-all"
                                            >
                                                <option value="" disabled className="bg-card-bg">Choose {field.label}...</option>
                                                {field.options?.map((opt) => (
                                                    <option key={opt.value} value={opt.value} className="bg-card-bg text-text-main">{opt.label}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-accent-blue group-focus-within:rotate-180 transition-transform duration-300">
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
                                                className="w-full px-8 py-5 rounded-[1.5rem] border-2 border-border-subtle bg-app-bg text-text-main focus:bg-card-bg focus:border-accent-blue outline-none text-sm font-bold transition-all custom-blue-calendar"
                                                onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
                                            />
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
                                            className="w-full px-8 py-6 rounded-[2rem] border-2 border-border-subtle bg-app-bg text-text-main focus:bg-card-bg focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue outline-none min-h-[160px] text-sm font-bold transition-all shadow-sm"
                                            onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
                                        />
                                    ) : field.type === 'files' ? (
                                        <input
                                            type="file"
                                            onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.files?.[0] })}
                                            className="w-full px-8 py-5 rounded-[1.5rem] border-2 border-border-subtle bg-app-bg text-text-muted text-xs font-bold transition-all cursor-pointer"
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            value={formValues[field.name] || ''}
                                            className="w-full px-8 py-5 rounded-[1.5rem] border-2 border-border-subtle bg-app-bg text-text-main focus:bg-card-bg focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue outline-none text-sm font-bold transition-all shadow-sm"
                                            onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="px-10 py-12 bg-app-bg flex flex-col sm:flex-row justify-end gap-6 border-t border-border-subtle mt-auto transition-colors">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-text-muted hover:text-text-main transition-all"
                        >
                            Discard
                        </button>
                        <button
                            disabled={loading}
                            className="px-14 py-5 bg-accent-blue text-white rounded-[1.75rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-hover-blue disabled:opacity-50 flex items-center justify-center gap-4 transition-all active:scale-95 shadow-xl shadow-accent-blue/20"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                submitText || 'Apply Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <style jsx>{`
                .custom-blue-calendar::-webkit-calendar-picker-indicator {
                  filter: invert(0.5) sepia(1) saturate(5) hue-rotate(200deg);
                  cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default GenericFormModal;