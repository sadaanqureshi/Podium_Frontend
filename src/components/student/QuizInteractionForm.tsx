// 'use client';
// import React, { useState } from 'react';
// import { HelpCircle, Send, Loader2, Square, CheckSquare, Circle, CheckCircle } from 'lucide-react';

// const QuizInteractionForm = ({ questions, onSubmit, isSubmitting }: any) => {
//     // Answer state mapping to API structure
//     const [answers, setAnswers] = useState<Record<number, any>>({});

//     const handleOptionSelect = (qId: number, qType: string, optId: number) => {
//         const current = answers[qId] || { question_id: qId, selected_option_ids: [], text_answer: "" };
        
//         if (qType === 'MCQ') {
//             current.selected_option_ids = [optId];
//         } else if (qType === 'BCQ') {
//             const index = current.selected_option_ids.indexOf(optId);
//             if (index > -1) {
//                 current.selected_option_ids.splice(index, 1);
//             } else {
//                 current.selected_option_ids.push(optId);
//             }
//         }
//         setAnswers({ ...answers, [qId]: { ...current } });
//     };

//     const handleTextChange = (qId: number, text: string) => {
//         setAnswers({
//             ...answers,
//             [qId]: { question_id: qId, selected_option_ids: [], text_answer: text }
//         });
//     };

//     const formatAndSubmit = () => {
//         const formattedAnswers = Object.values(answers);
//         onSubmit(formattedAnswers);
//     };

//     return (
//         <div className="space-y-10">
//             <div className="space-y-6">
//                 {questions.map((q: any, index: number) => (
//                     <div key={q.id} className="bg-card-bg border border-border-subtle rounded-[2.5rem] overflow-hidden shadow-sm p-8 hover:border-accent-blue/30">
//                         <div className="flex justify-between items-start mb-8 gap-4">
//                             <div className="flex gap-4">
//                                 <div className="w-10 h-10 rounded-2xl bg-app-bg border border-border-subtle flex items-center justify-center text-accent-blue font-black shadow-inner">
//                                     {index + 1}
//                                 </div>
//                                 <div className="space-y-1">
//                                     <span className="text-[9px] font-black text-accent-blue uppercase tracking-widest px-2 py-0.5 bg-accent-blue/10 rounded-md">{q.question_type}</span>
//                                     <p className="text-xl font-black text-text-main uppercase tracking-tight leading-tight">{q.question_text}</p>
//                                 </div>
//                             </div>
//                             <span className="text-[10px] font-black text-text-muted uppercase border border-border-subtle px-3 py-1 rounded-xl bg-app-bg">{q.marks} PTS</span>
//                         </div>

//                         {/* Question Inputs */}
//                         {q.question_type === 'SHORT' ? (
//                             <textarea 
//                                 onChange={(e) => handleTextChange(q.id, e.target.value)}
//                                 placeholder="Enter your response protocol..."
//                                 className="w-full bg-app-bg border-2 border-border-subtle rounded-[1.5rem] p-6 text-sm font-medium outline-none focus:border-accent-blue min-h-[120px]"
//                             />
//                         ) : (
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 {q.options.map((opt: any) => {
//                                     const isSelected = answers[q.id]?.selected_option_ids?.includes(opt.id);
//                                     return (
//                                         <button
//                                             key={opt.id}
//                                             onClick={() => handleOptionSelect(q.id, q.question_type, opt.id)}
//                                             className={`p-5 rounded-3xl border-2 text-left flex items-center gap-4 ${
//                                                 isSelected 
//                                                 ? 'bg-accent-blue/5 border-accent-blue text-text-main shadow-lg shadow-accent-blue/5' 
//                                                 : 'bg-app-bg border-border-subtle text-text-muted hover:border-text-muted/30'
//                                             }`}
//                                         >
//                                             <div className={`transition-all ${isSelected ? 'text-accent-blue scale-110' : 'text-text-muted/20'}`}>
//                                                 {q.question_type === 'MCQ' ? (
//                                                     isSelected ? <CheckCircle size={20} /> : <Circle size={20} />
//                                                 ) : (
//                                                     isSelected ? <CheckSquare size={20} /> : <Square size={20} />
//                                                 )}
//                                             </div>
//                                             <span className="text-[11px] font-black uppercase tracking-widest">{opt.option_text}</span>
//                                         </button>
//                                     );
//                                 })}
//                             </div>
//                         )}
//                     </div>
//                 ))}
//             </div>

//             {/* Submission Block */}
//             <div className="bg-card-bg border border-border-subtle rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
//                 <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
//                         <HelpCircle size={24} />
//                     </div>
//                     <div>
//                         <p className="text-xs font-black uppercase tracking-tight">Final Registry Check</p>
//                         <p className="text-[10px] text-text-muted font-bold uppercase">Ensure all questions are answered before submission.</p>
//                     </div>
//                 </div>
//                 <button 
//                     onClick={formatAndSubmit}
//                     disabled={isSubmitting}
//                     className="w-full md:w-auto px-10 py-5 bg-accent-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-accent-blue/20 hover:bg-hover-blue transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
//                 >
//                     {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Deploy Answers</>}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default QuizInteractionForm;

'use client';
import React, { useState } from 'react';
import { HelpCircle, Send, Loader2, Square, CheckSquare, Circle, CheckCircle } from 'lucide-react';

const QuizInteractionForm = ({ questions, onSubmit, isSubmitting }: any) => {
    // Answer state mapping to API structure
    const [answers, setAnswers] = useState<Record<number, any>>({});

    const handleOptionSelect = (qId: number, qType: string, optId: number) => {
        const current = answers[qId] || { question_id: qId, selected_option_ids: [], text_answer: "" };
        
        if (qType === 'MCQ') {
            current.selected_option_ids = [optId];
        } else if (qType === 'BCQ') {
            const index = current.selected_option_ids.indexOf(optId);
            if (index > -1) {
                current.selected_option_ids.splice(index, 1);
            } else {
                current.selected_option_ids.push(optId);
            }
        }
        setAnswers({ ...answers, [qId]: { ...current } });
    };

    const handleTextChange = (qId: number, text: string) => {
        setAnswers({
            ...answers,
            [qId]: { question_id: qId, selected_option_ids: [], text_answer: text }
        });
    };

    const formatAndSubmit = () => {
        const formattedAnswers = Object.values(answers);
        onSubmit(formattedAnswers);
    };

    // Helper to make question types human-readable
    const getReadableType = (type: string) => {
        if (type === 'MCQ') return 'Single Choice';
        if (type === 'BCQ') return 'Multiple Choice';
        if (type === 'SHORT') return 'Short Answer';
        return type;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col gap-6">
                {questions.map((q: any, index: number) => (
                    <div key={q.id} className="bg-card-bg border border-border-subtle rounded-2xl p-6 md:p-8 shadow-sm">
                        
                        {/* Question Header (Minimalist & Flat) */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-3">
                            <div className="flex gap-3">
                                <span className="text-accent-blue font-black text-lg">{index + 1}.</span>
                                <div className="space-y-1.5 mt-1">
                                    <h3 className="text-base md:text-lg font-bold text-text-main leading-snug">
                                        {q.question_text}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                                        <span>{getReadableType(q.question_type)}</span>
                                        <span className="w-1 h-1 bg-border-subtle rounded-full"></span>
                                        <span>{q.marks} Points</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Question Inputs */}
                        <div className="pl-6 sm:pl-8">
                            {q.question_type === 'SHORT' ? (
                                <textarea 
                                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                                    placeholder="Type your answer here..."
                                    className="w-full bg-app-bg border border-border-subtle rounded-xl p-4 text-sm text-text-main outline-none focus:border-accent-blue transition-colors min-h-[120px] resize-y"
                                />
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {q.options.map((opt: any) => {
                                        const isSelected = answers[q.id]?.selected_option_ids?.includes(opt.id);
                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() => handleOptionSelect(q.id, q.question_type, opt.id)}
                                                className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition-all ${
                                                    isSelected 
                                                    ? 'bg-accent-blue/5 border-accent-blue text-accent-blue' 
                                                    : 'bg-app-bg border-border-subtle text-text-main hover:border-accent-blue/40'
                                                }`}
                                            >
                                                <div className={`mt-0.5 shrink-0 transition-colors ${isSelected ? 'text-accent-blue' : 'text-text-muted/40'}`}>
                                                    {q.question_type === 'MCQ' ? (
                                                        isSelected ? <CheckCircle size={18} /> : <Circle size={18} />
                                                    ) : (
                                                        isSelected ? <CheckSquare size={18} /> : <Square size={18} />
                                                    )}
                                                </div>
                                                <span className={`text-sm font-medium leading-relaxed ${isSelected ? 'text-text-main' : 'text-text-muted'}`}>
                                                    {opt.option_text}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Submission Block (Professional & Clean) */}
            <div className="bg-card-bg border border-border-subtle rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4 text-center md:text-left">
                    <div className="w-12 h-12 bg-app-bg rounded-full flex items-center justify-center text-text-muted border border-border-subtle shrink-0 hidden sm:flex">
                        <HelpCircle size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-text-main mb-1">Ready to submit?</h4>
                        <p className="text-xs text-text-muted font-medium">Please review your answers before submitting. This action cannot be undone.</p>
                    </div>
                </div>
                
                <button 
                    onClick={formatAndSubmit}
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-8 py-3.5 bg-accent-blue text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin" size={16} />
                    ) : (
                        <Send size={16} /> 
                    )}
                    <span>Submit Answers</span>
                </button>
            </div>
        </div>
    );
};

export default QuizInteractionForm;