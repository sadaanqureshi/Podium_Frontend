'use client';
import React from 'react';
import { Award, CheckCircle, XCircle, MessageCircle, AlertCircle } from 'lucide-react';

const QuizResultView = ({ result, quizInfo }: any) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Summary Box */}
            <div className="bg-card-bg rounded-[2.5rem] p-10 border border-border-subtle shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div>
                        <span className="px-4 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Official Score</span>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mt-2">{quizInfo.title}</h2>
                    </div>
                    
                    <div className="bg-app-bg/50 p-6 rounded-3xl border border-border-subtle flex items-center gap-6 shadow-inner">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Total Score</p>
                            <p className="text-4xl font-black text-accent-blue">
                                {result.totalMarksObtained} <span className="text-lg text-text-muted">/ {quizInfo.total_marks}</span>
                            </p>
                        </div>
                        <Award size={42} className="text-amber-500" />
                    </div>
                </div>

                {result.comments && (
                    <div className="mt-8 p-5 bg-accent-blue/5 rounded-2xl border border-dashed border-accent-blue/20 flex gap-4 items-center text-accent-blue">
                        <MessageCircle size={20} className="shrink-0" />
                        <p className="text-sm font-medium italic">"{result.comments}"</p>
                    </div>
                )}
            </div>

            {/* Individual Answers Breakdown */}
            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-muted ml-2">Question Breakdown</h3>
                {result.answers?.map((ans: any, idx: number) => (
                    <div key={idx} className="bg-card-bg border border-border-subtle rounded-[2rem] p-8 shadow-sm">
                        <div className="flex justify-between items-start mb-6 gap-4">
                            <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${ans.isCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {ans.isCorrect ? <CheckCircle size={22} /> : <XCircle size={22} />}
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-text-main leading-tight pt-1">{ans.questionText}</p>
                                    <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-widest">Type: {ans.questionType}</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-text-muted uppercase bg-app-bg px-3 py-1 rounded-lg shrink-0">
                                {ans.marksObtained} / {ans.marksAllocated} Marks
                            </span>
                        </div>

                        {/* Options Section */}
                        {ans.questionType !== 'SHORT' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                {ans.allOptions?.map((opt: any) => {
                                    const isSelected = ans.studentSelectedOptions?.includes(opt.id);
                                    return (
                                        <div key={opt.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between text-[11px] font-bold uppercase ${
                                            isSelected 
                                            ? (opt.isCorrect ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-500' : 'border-red-500/40 bg-red-500/5 text-red-500')
                                            : (opt.isCorrect ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500/40' : 'border-border-subtle bg-app-bg text-text-muted/20')
                                        }`}>
                                            <span className="flex items-center gap-3">
                                                {opt.isCorrect ? <CheckCircle size={14} /> : (isSelected ? <XCircle size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-current opacity-20" />)}
                                                {opt.text}
                                            </span>
                                            {isSelected && <span className="text-[8px] px-2 py-0.5 bg-current/10 rounded">Your Answer</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        
                        {/* Short Answer View */}
                        {ans.questionType === 'SHORT' && (
                            <div className="mt-4 p-5 bg-app-bg rounded-xl border border-border-subtle text-sm font-medium">
                                <p className="text-[9px] font-bold text-text-muted uppercase mb-2">Your Submitted Text:</p>
                                {ans.studentAnswerText || "No text provided."}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuizResultView;