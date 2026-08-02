// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//     X,
//     Loader2,
//     ChevronDown,
//     Plus,
//     Trash2,
//     CheckCircle2,
//     AlertCircle
// } from 'lucide-react';

// export interface FormField {
//     name: string;
//     label: string;
//     type: 'text' | 'number' | 'textarea' | 'select' | 'files' | 'checkbox-group' | 'date' | 'time' | 'datetime-local' | 'quiz-builder';
//     placeholder?: string;
//     required?: boolean;
//     options?: { label: string; value: string | number }[];
// }

// interface GenericFormModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     title: string;
//     fields: FormField[];
//     onSubmit: (data: FormData) => Promise<void>;
//     loading?: boolean;
//     initialData?: any;
//     submitText?: string;
// }

// // ==========================================
// // 1. QUESTION BUILDER COMPONENT
// // ==========================================
// const QuestionBuilder = ({
//     onChange,
//     initialData,
//     error // Parent se error receive kar raha hai
// }: {
//     onChange: (data: any) => void;
//     initialData?: any[];
//     error?: string;
// }) => {
//     const [questions, setQuestions] = useState<any[]>([]);

//     useEffect(() => {
//         if (initialData && initialData.length > 0) {
//             setQuestions(initialData);
//         }
//     }, [initialData]);

//     const updateAndNotify = (updated: any[]) => {
//         setQuestions(updated);
//         onChange(updated);
//     };

//     const addQuestion = () => {
//         const newQuestions = [
//             ...questions,
//             { question_text: '', question_type: 'MCQ', marks: 5, options: [] }
//         ];
//         updateAndNotify(newQuestions);
//     };

//     const removeQuestion = (index: number) => {
//         const updated = questions.filter((_, i) => i !== index);
//         updateAndNotify(updated);
//     };

//     const toggleCorrectOption = (qIndex: number, oIndex: number) => {
//         const updated = [...questions];
//         const currentQ = updated[qIndex];

//         if (currentQ.question_type === 'MCQ') {
//             currentQ.options.forEach((opt: any, i: number) => {
//                 opt.is_correct = i === oIndex;
//             });
//         } else {
//             currentQ.options[oIndex].is_correct = !currentQ.options[oIndex].is_correct;
//         }
//         updateAndNotify(updated);
//     };

//     const addOption = (qIndex: number) => {
//         const updated = [...questions];
//         if (!updated[qIndex].options) updated[qIndex].options = [];
//         updated[qIndex].options.push({ option_text: '', is_correct: false });
//         updateAndNotify(updated);
//     };

//     const removeOption = (qIndex: number, oIndex: number) => {
//         const updated = [...questions];
//         updated[qIndex].options = updated[qIndex].options.filter((_: any, i: number) => i !== oIndex);
//         updateAndNotify(updated);
//     };

//     const updateQuestionText = (index: number, text: string) => {
//         const updated = [...questions];
//         updated[index].question_text = text;
//         updateAndNotify(updated);
//     };

//     const updateQuestionType = (index: number, type: string) => {
//         const updated = [...questions];
//         updated[index].question_type = type;
//         updateAndNotify(updated);
//     };

//     const updateMarks = (index: number, val: number) => {
//         const updated = [...questions];
//         updated[index].marks = val;
//         updateAndNotify(updated);
//     };

//     const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
//         const updated = [...questions];
//         updated[qIndex].options[oIndex].option_text = text;
//         updateAndNotify(updated);
//     };

//     return (
//         <div className={`md:col-span-2 space-y-6 bg-app-bg p-8 border-2 transition-all ${error ? 'border-red-500/50 shadow-lg shadow-red-500/5' : 'border-border-subtle'}`}>
//             <div className="flex justify-between items-center px-2">
//                 <div>
//                     <h3 className="text-sm font-black uppercase text-text-muted tracking-widest">Quiz Designer</h3>
//                     {error && <p className="text-[10px] font-bold text-red-500 uppercase mt-1 tracking-wider italic">{error}</p>}
//                 </div>
//                 <button
//                     type="button"
//                     onClick={addQuestion}
//                     className="flex items-center gap-2 px-6 py-2.5 bg-accent-blue text-white rounded-2xl text-[10px] font-black uppercase hover:bg-hover-blue transition-all shadow-lg active:scale-95"
//                 >
//                     <Plus size={14} strokeWidth={3} /> Add Question
//                 </button>
//             </div>

//             {questions.map((q, qIndex) => (
//                 <div key={qIndex} className="bg-card-bg p-8 rounded-[2rem] border border-border-subtle shadow-sm space-y-6 animate-in slide-in-from-top-4 duration-300">
//                     <div className="flex justify-between gap-4">
//                         <input
//                             placeholder="Enter Question Text..."
//                             className="flex-1 text-sm font-bold bg-transparent outline-none border-b-2 border-border-subtle focus:border-accent-blue py-2 transition-all text-text-main"
//                             value={q.question_text || ''}
//                             onChange={(e) => updateQuestionText(qIndex, e.target.value)}
//                         />
//                         <button type="button" onClick={() => removeQuestion(qIndex)} className="text-text-muted hover:text-red-500 p-2 transition-colors">
//                             <Trash2 size={18} />
//                         </button>
//                     </div>

//                     <div className="grid grid-cols-2 gap-6">
//                         <select
//                             className="w-full p-3 bg-app-bg text-text-main rounded-xl text-xs font-bold outline-none border border-border-subtle focus:border-accent-blue transition-all"
//                             value={q.question_type}
//                             onChange={(e) => updateQuestionType(qIndex, e.target.value)}
//                         >
//                             <option value="MCQ">MCQ (Single Choice)</option>
//                             <option value="BCQ">BCQ (Multiple Choice)</option>
//                             <option value="SHORT">Short Answer</option>
//                         </select>
//                         <input
//                             type="number"
//                             className="w-full p-3 bg-app-bg text-text-main rounded-xl text-xs font-bold outline-none border border-border-subtle focus:border-accent-blue transition-all"
//                             placeholder="Marks"
//                             value={q.marks || 0}
//                             onChange={(e) => updateMarks(qIndex, Number(e.target.value))}
//                         />
//                     </div>

//                     {q.question_type !== 'SHORT' && (
//                         <div className="space-y-3 pl-4 border-l-2 border-border-subtle">
//                             {q.options?.map((opt: any, oIndex: number) => (
//                                 <div key={oIndex} className="flex items-center gap-4 bg-app-bg p-2 rounded-2xl shadow-sm border border-border-subtle">
//                                     <input
//                                         placeholder="Option Text..."
//                                         className="flex-1 text-xs font-medium bg-transparent px-3 outline-none text-text-main"
//                                         value={opt.option_text || ''}
//                                         onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
//                                     />
//                                     <div className="flex gap-2">
//                                         <button
//                                             type="button"
//                                             onClick={() => toggleCorrectOption(qIndex, oIndex)}
//                                             className={`p-1.5 rounded-lg transition-all ${opt.is_correct ? 'bg-emerald-500 text-white shadow-lg' : 'bg-card-bg text-text-muted border border-border-subtle'}`}
//                                         >
//                                             <CheckCircle2 size={14} />
//                                         </button>
//                                         <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="p-1.5 text-text-muted hover:text-red-500 transition-colors">
//                                             <Trash2 size={14} />
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                             <button type="button" onClick={() => addOption(qIndex)} className="text-[10px] font-black text-accent-blue uppercase hover:opacity-80 transition-all ml-1">+ Add Option</button>
//                         </div>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// };

// // ==========================================
// // 2. MAIN MODAL COMPONENT
// // ==========================================
// const GenericFormModal: React.FC<GenericFormModalProps> = ({
//     isOpen,
//     onClose,
//     title,
//     fields,
//     onSubmit,
//     loading,
//     initialData,
//     submitText
// }) => {
//     const [formValues, setFormValues] = useState<Record<string, any>>({});
//     const [errors, setErrors] = useState<Record<string, string>>({}); // Validation Errors state

//     const getMinDateTime = () => {
//         const now = new Date();
//         now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
//         return now.toISOString().slice(0, 16);
//     };

//     useEffect(() => {
//         if (isOpen && initialData) {
//             const formattedData = { ...initialData };
//             const startTime = initialData.start_time || initialData.startTime;
//             const endTime = initialData.end_time || initialData.endTime;
//             const totalMarks = initialData.total_marks || initialData.totalMarks;

//             if (startTime) formattedData.start_time = new Date(startTime).toISOString().slice(0, 16);
//             if (endTime) formattedData.end_time = new Date(endTime).toISOString().slice(0, 16);
//             if (totalMarks) formattedData.total_marks = totalMarks;

//             setFormValues(formattedData);
//         } else {
//             setFormValues({});
//             setErrors({});
//         }
//     }, [isOpen, initialData]);

//     // --- PROFESSIONAL VALIDATION LOGIC ---
//     const validate = () => {
//         const newErrors: Record<string, string> = {};
//         const nameRegex = /^[A-Za-z\s'-]+$/;
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         const phoneRegex = /^\+?[0-9]{11,13}$/;

//         fields.forEach((field) => {
//             const val = formValues[field.name];

//             // 1. Required Check
//             if (field.required && (!val || (Array.isArray(val) && val.length === 0))) {
//                 newErrors[field.name] = `${field.label} is strictly required.`;
//             }

//             // 2. CreateStudentDto Logic Implementation
//             if (val) {
//                 if (field.name === 'firstName' || field.name === 'lastName') {
//                     if (val.length < 3 || val.length > 50) newErrors[field.name] = "Node must be 3-50 characters.";
//                     else if (!nameRegex.test(val)) newErrors[field.name] = "Only letters, spaces, hyphens allowed.";
//                 }

//                 if (field.name === 'email') {
//                     if (!emailRegex.test(val)) newErrors[field.name] = "Enter a valid registry email.";
//                     else if (val.length < 5 || val.length > 100) newErrors[field.name] = "Email volume out of range.";
//                 }

//                 if (field.name === 'contactNumber' && !phoneRegex.test(val)) {
//                     newErrors[field.name] = "Invalid contact format (e.g. +923001234567).";
//                 }

//                 if (field.name === 'password' && val.length < 6) {
//                     newErrors[field.name] = "Security Key must be min 6 characters.";
//                 }
//             }

//             // 3. Quiz Builder Deep Audit
//             if (field.type === 'quiz-builder' && val) {
//                 const quiz = val as any[];
//                 quiz.forEach((q, idx) => {
//                     if (!q.question_text) newErrors[field.name] = `Question ${idx + 1} has no text.`;
//                     if (q.question_type !== 'SHORT') {
//                         if (!q.options || q.options.length < 2) newErrors[field.name] = `Question ${idx + 1} requires 2+ options.`;
//                         if (!q.options.some((o: any) => o.is_correct)) newErrors[field.name] = `Question ${idx + 1} missing correct key.`;
//                     }
//                 });
//             }
//         });

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleInputChange = (name: string, value: any) => {
//         setFormValues({ ...formValues, [name]: value });
//         if (errors[name]) {
//             setErrors((prev) => {
//                 const updated = { ...prev };
//                 delete updated[name];
//                 return updated;
//             });
//         }
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         // Validation Guard
//         if (!validate()) return;

//         const formData = new FormData();
//         fields.forEach((field) => {
//             const value = formValues[field.name];
//             if (field.type === 'files') {
//                 if (value instanceof File) formData.append(field.name, value);
//             } else if (field.type === 'quiz-builder') {
//                 formData.append(field.name, JSON.stringify(value || []));
//             } else if (value !== null && value !== undefined && value !== "") {
//                 formData.append(field.name, value.toString());
//             }
//         });

//         try {
//             await onSubmit(formData);
//         } catch (err: any) {
//             console.error("Submission failed");
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
//             <div className="bg-card-bg w-full max-w-4xl rounded-[1rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-border-subtle transition-all duration-300">

//                 {/* HEADER */}
//                 <div className="flex justify-between items-center px-10 py-8 form-modal-header transition-colors">
//                     <div className="space-y-1">
//                         <h2 className="text-3xl font-black tracking-tight uppercase italic">{title}</h2>
//                         <div className="h-1.5 w-16 bg-accent-blue rounded-full"></div>
//                     </div>
//                     <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={24} /></button>
//                 </div>

//                 {/* FORM BODY */}
//                 <form onSubmit={handleSubmit} className="overflow-y-auto no-scrollbar bg-card-bg flex-1">
//                     <div className="px-10 py-10 space-y-10">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
//                             {fields.map((field) => (
//                                 <div key={field.name} className={(field.type === 'textarea' || field.type === 'quiz-builder') ? 'md:col-span-2' : ''}>
//                                     <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-text-muted mb-4 ml-1">
//                                         {field.label} {field.required && <span className="text-accent-blue">*</span>}
//                                     </label>

//                                     {field.type === 'quiz-builder' ? (
//                                         <QuestionBuilder
//                                             initialData={formValues[field.name]}
//                                             onChange={(data) => handleInputChange(field.name, data)}
//                                             error={errors[field.name]}
//                                         />
//                                     ) : (
//                                         <div className="space-y-2">
//                                             {field.type === 'select' ? (
//                                                 <div className="relative">
//                                                     <select
//                                                         value={formValues[field.name] || ''}
//                                                         onChange={(e) => handleInputChange(field.name, e.target.value)}
//                                                         className={`w-full px-8 py-5 rounded-[1.5rem] border-2 bg-app-bg text-sm font-bold text-text-main appearance-none cursor-pointer transition-all outline-none ${errors[field.name] ? 'border-red-500 bg-red-500/5 shadow-inner' : 'border-border-subtle focus:border-accent-blue'}`}
//                                                     >
//                                                         <option value="" disabled>Choose {field.label}...</option>
//                                                         {field.options?.map((opt) => (
//                                                             <option key={opt.value} value={opt.value}>{opt.label}</option>
//                                                         ))}
//                                                     </select>
//                                                     <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-accent-blue pointer-events-none" size={22} strokeWidth={3} />
//                                                 </div>
//                                             ) : (
//                                                 // <input
//                                                 //     type={field.type === 'textarea' ? 'text' : field.type}
//                                                 //     placeholder={field.placeholder}
//                                                 //     value={formValues[field.name] || ''}
//                                                 //     onChange={(e) => handleInputChange(field.name, e.target.value)}
//                                                 //     className={`w-full px-8 py-5 rounded-[1.5rem] border-2 bg-app-bg text-text-main text-sm font-bold transition-all outline-none ${errors[field.name] ? 'border-red-500 bg-red-500/5 shadow-inner' : 'border-border-subtle focus:border-accent-blue'}`}
//                                                 // />
//                                                 <input
//                                                     type={field.type === 'files' ? 'file' : (field.type === 'textarea' ? 'text' : field.type)}
//                                                     placeholder={field.placeholder}
//                                                     value={field.type === 'files' ? undefined : (formValues[field.name] || '')}
//                                                     onChange={(e) => {
//                                                         if (field.type === 'files') {
//                                                             const file = e.target.files?.[0];
//                                                             handleInputChange(field.name, file || null);
//                                                         } else {
//                                                             handleInputChange(field.name, e.target.value);
//                                                         }
//                                                     }}
//                                                     className={`w-full px-8 py-5 rounded-[1.5rem] border-2 bg-app-bg text-text-main text-sm font-bold transition-all outline-none ${errors[field.name] ? 'border-red-500 bg-red-500/5 shadow-inner' : 'border-border-subtle focus:border-accent-blue'} ${field.type === 'files' ? 'file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-accent-blue file:text-white hover:file:bg-hover-blue cursor-pointer' : ''}`}
//                                                 />
//                                             )}

//                                             {/* ERROR FEEDBACK UI */}
//                                             {errors[field.name] && (
//                                                 <div className="flex items-center gap-2 mt-2 ml-4 text-red-500 animate-in fade-in slide-in-from-top-1">
//                                                     <AlertCircle size={12} />
//                                                     <span className="text-[10px] font-black uppercase tracking-widest">{errors[field.name]}</span>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     {/* FOOTER */}
//                     <div className="px-10 py-12 bg-app-bg flex flex-col sm:flex-row justify-end gap-6 border-t border-border-subtle mt-auto">
//                         <button type="button" onClick={onClose} className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-text-muted hover:text-text-main transition-all">Discard</button>
//                         <button
//                             disabled={loading}
//                             className="px-14 py-5 bg-accent-blue text-white rounded-[1.75rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-hover-blue disabled:opacity-50 flex items-center justify-center gap-4 transition-all active:scale-95 shadow-xl shadow-accent-blue/20"
//                         >
//                             {loading ? <Loader2 size={20} className="animate-spin" /> : (submitText || 'Apply Changes')}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//             <style jsx>{`
//                 .custom-blue-calendar::-webkit-calendar-picker-indicator {
//                     filter: invert(0.5) sepia(1) saturate(5) hue-rotate(200deg);
//                     cursor: pointer;
//                 }
//             `}</style>
//         </div>
//     );
// };

// export default GenericFormModal;

'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    Loader2,
    ChevronDown,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle
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
    initialData,
    error 
}: {
    onChange: (data: any) => void;
    initialData?: any[];
    error?: string;
}) => {
    const [questions, setQuestions] = useState<any[]>([]);

    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setQuestions(initialData);
        }
    }, [initialData]);

    const updateAndNotify = (updated: any[]) => {
        setQuestions(updated);
        onChange(updated);
    };

    const addQuestion = () => {
        const newQuestions = [
            ...questions,
            { question_text: '', question_type: 'MCQ', marks: 5, options: [] }
        ];
        updateAndNotify(newQuestions);
    };

    const removeQuestion = (index: number) => {
        const updated = questions.filter((_, i) => i !== index);
        updateAndNotify(updated);
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
        updateAndNotify(updated);
    };

    const addOption = (qIndex: number) => {
        const updated = [...questions];
        if (!updated[qIndex].options) updated[qIndex].options = [];
        updated[qIndex].options.push({ option_text: '', is_correct: false });
        updateAndNotify(updated);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const updated = [...questions];
        updated[qIndex].options = updated[qIndex].options.filter((_: any, i: number) => i !== oIndex);
        updateAndNotify(updated);
    };

    const updateQuestionText = (index: number, text: string) => {
        const updated = [...questions];
        updated[index].question_text = text;
        updateAndNotify(updated);
    };

    const updateQuestionType = (index: number, type: string) => {
        const updated = [...questions];
        updated[index].question_type = type;
        updateAndNotify(updated);
    };

    const updateMarks = (index: number, val: number) => {
        const updated = [...questions];
        updated[index].marks = val;
        updateAndNotify(updated);
    };

    const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex].option_text = text;
        updateAndNotify(updated);
    };

    return (
        <div className={`md:col-span-2 space-y-4 bg-app-bg p-6 rounded-xl border transition-all ${error ? 'border-red-500/50 bg-red-50/50' : 'border-border-subtle'}`}>
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="text-sm font-bold text-text-main">Quiz Designer</h3>
                    {error && <p className="text-xs font-medium text-red-500 mt-1">{error}</p>}
                </div>
                <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg text-xs font-semibold hover:bg-hover-blue transition-colors shadow-sm active:scale-95"
                >
                    <Plus size={16} strokeWidth={2.5} /> Add Question
                </button>
            </div>

            {questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-card-bg p-6 rounded-xl border border-border-subtle shadow-sm space-y-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between gap-4 items-end">
                        <input
                            placeholder="Enter Question Text..."
                            className="flex-1 text-base font-semibold bg-transparent outline-none border-b border-border-subtle focus:border-accent-blue py-2 transition-colors text-text-main placeholder:font-normal"
                            value={q.question_text || ''}
                            onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                        />
                        <button type="button" onClick={() => removeQuestion(qIndex)} className="text-text-muted hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-red-50">
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <select
                            className="w-full p-2.5 bg-app-bg text-text-main rounded-lg text-sm font-medium outline-none border border-border-subtle focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/10 transition-all"
                            value={q.question_type}
                            onChange={(e) => updateQuestionType(qIndex, e.target.value)}
                        >
                            <option value="MCQ">MCQ (Single Choice)</option>
                            <option value="BCQ">BCQ (Multiple Choice)</option>
                            <option value="SHORT">Short Answer</option>
                        </select>
                        <input
                            type="number"
                            className="w-full p-2.5 bg-app-bg text-text-main rounded-lg text-sm font-medium outline-none border border-border-subtle focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/10 transition-all"
                            placeholder="Marks"
                            value={q.marks || 0}
                            onChange={(e) => updateMarks(qIndex, Number(e.target.value))}
                        />
                    </div>

                    {q.question_type !== 'SHORT' && (
                        <div className="space-y-3 pl-2 border-l-2 border-border-subtle">
                            {q.options?.map((opt: any, oIndex: number) => (
                                <div key={oIndex} className="flex items-center gap-3 bg-app-bg p-2 rounded-lg border border-border-subtle">
                                    <input
                                        placeholder="Option Text..."
                                        className="flex-1 text-sm font-medium bg-transparent px-3 outline-none text-text-main"
                                        value={opt.option_text || ''}
                                        onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                                    />
                                    <div className="flex gap-1.5 pr-1">
                                        <button
                                            type="button"
                                            onClick={() => toggleCorrectOption(qIndex, oIndex)}
                                            title="Mark as correct"
                                            className={`p-1.5 rounded-md transition-colors ${opt.is_correct ? 'bg-emerald-500 text-white' : 'bg-card-bg text-text-muted hover:bg-border-subtle border border-border-subtle'}`}
                                        >
                                            <CheckCircle2 size={16} />
                                        </button>
                                        <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={() => addOption(qIndex)} className="text-xs font-semibold text-accent-blue hover:text-hover-blue transition-colors ml-2 mt-2 flex items-center gap-1">
                                <Plus size={14} /> Add Option
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
    const [errors, setErrors] = useState<Record<string, string>>({}); 

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
            setErrors({});
        }
    }, [isOpen, initialData]);

    // --- PROFESSIONAL VALIDATION LOGIC ---
    const validate = () => {
        const newErrors: Record<string, string> = {};
        const nameRegex = /^[A-Za-z\s'-]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?[0-9]{11,13}$/;

        fields.forEach((field) => {
            const val = formValues[field.name];

            // 1. Required Check
            if (field.required && (!val || (Array.isArray(val) && val.length === 0))) {
                newErrors[field.name] = `${field.label} is required.`;
            }

            // 2. CreateStudentDto Logic Implementation
            if (val) {
                if (field.name === 'firstName' || field.name === 'lastName') {
                    if (val.length < 3 || val.length > 50) newErrors[field.name] = "Must be 3-50 characters.";
                    else if (!nameRegex.test(val)) newErrors[field.name] = "Only letters, spaces, hyphens allowed.";
                }

                if (field.name === 'email') {
                    if (!emailRegex.test(val)) newErrors[field.name] = "Enter a valid email address.";
                    else if (val.length < 5 || val.length > 100) newErrors[field.name] = "Email volume out of range.";
                }

                if (field.name === 'contactNumber' && !phoneRegex.test(val)) {
                    newErrors[field.name] = "Invalid contact format (e.g. +923001234567).";
                }

                if (field.name === 'password' && val.length < 6) {
                    newErrors[field.name] = "Password must be min 6 characters.";
                }
            }

            // 3. Quiz Builder Deep Audit
            if (field.type === 'quiz-builder' && val) {
                const quiz = val as any[];
                quiz.forEach((q, idx) => {
                    if (!q.question_text) newErrors[field.name] = `Question ${idx + 1} has no text.`;
                    if (q.question_type !== 'SHORT') {
                        if (!q.options || q.options.length < 2) newErrors[field.name] = `Question ${idx + 1} requires 2+ options.`;
                        if (!q.options.some((o: any) => o.is_correct)) newErrors[field.name] = `Question ${idx + 1} missing correct key.`;
                    }
                });
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (name: string, value: any) => {
        setFormValues({ ...formValues, [name]: value });
        if (errors[name]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation Guard
        if (!validate()) return;

        const formData = new FormData();
        fields.forEach((field) => {
            const value = formValues[field.name];
            if (field.type === 'files') {
                if (value instanceof File) formData.append(field.name, value);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card-bg w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-border-subtle">

                {/* HEADER */}
                <div className="flex justify-between items-center px-8 py-6 border-b border-border-subtle bg-app-bg/50">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-text-main">{title}</h2>
                        <p className="text-xs text-text-muted mt-1 font-medium">Please fill in the details below.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main hover:bg-border-subtle rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* FORM BODY */}
                <form onSubmit={handleSubmit} className="overflow-y-auto no-scrollbar bg-card-bg flex-1">
                    <div className="px-8 py-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {fields.map((field) => (
                                <div key={field.name} className={(field.type === 'textarea' || field.type === 'quiz-builder') ? 'md:col-span-2' : ''}>
                                    <label className="block text-xs font-semibold text-text-main mb-2">
                                        {field.label} {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                    </label>

                                    {field.type === 'quiz-builder' ? (
                                        <QuestionBuilder
                                            initialData={formValues[field.name]}
                                            onChange={(data) => handleInputChange(field.name, data)}
                                            error={errors[field.name]}
                                        />
                                    ) : (
                                        <div className="space-y-1">
                                            {field.type === 'select' ? (
                                                <div className="relative">
                                                    <select
                                                        value={formValues[field.name] || ''}
                                                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                        className={`w-full px-4 py-3 rounded-xl border bg-app-bg text-sm font-medium text-text-main appearance-none cursor-pointer transition-all outline-none focus:ring-2 focus:ring-accent-blue/20 ${errors[field.name] ? 'border-red-500 bg-red-50' : 'border-border-subtle focus:border-accent-blue'}`}
                                                    >
                                                        <option value="" disabled>Select {field.label}</option>
                                                        {field.options?.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
                                                </div>
                                            ) : (
                                                <input
                                                    type={field.type === 'files' ? 'file' : (field.type === 'textarea' ? 'text' : field.type)}
                                                    placeholder={field.placeholder}
                                                    value={field.type === 'files' ? undefined : (formValues[field.name] || '')}
                                                    onChange={(e) => {
                                                        if (field.type === 'files') {
                                                            const file = e.target.files?.[0];
                                                            handleInputChange(field.name, file || null);
                                                        } else {
                                                            handleInputChange(field.name, e.target.value);
                                                        }
                                                    }}
                                                    className={`w-full px-4 py-3 rounded-xl border bg-app-bg text-text-main text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-accent-blue/20 ${errors[field.name] ? 'border-red-500 bg-red-50' : 'border-border-subtle focus:border-accent-blue'} ${field.type === 'files' ? 'file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-accent-blue/10 file:text-accent-blue hover:file:bg-accent-blue/20 cursor-pointer text-text-muted' : ''}`}
                                                />
                                            )}

                                            {/* ERROR FEEDBACK UI */}
                                            {errors[field.name] && (
                                                <div className="flex items-center gap-1.5 mt-1 text-red-500">
                                                    <AlertCircle size={14} />
                                                    <span className="text-xs font-medium">{errors[field.name]}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="px-8 py-5 bg-app-bg/80 flex justify-end gap-3 border-t border-border-subtle mt-auto sticky bottom-0">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-6 py-2.5 text-sm font-semibold text-text-muted hover:text-text-main hover:bg-border-subtle rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-accent-blue text-white rounded-xl font-semibold text-sm hover:bg-hover-blue disabled:opacity-60 flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {submitText || 'Save Changes'}
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