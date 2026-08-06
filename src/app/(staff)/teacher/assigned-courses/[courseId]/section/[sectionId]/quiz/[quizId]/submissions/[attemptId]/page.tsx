'use client';
import React, { useState, useEffect, use } from 'react';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Send, Award, Zap } from 'lucide-react';
import Link from 'next/link';
import { getQuizAttemptDetailAPI, gradeQuizAttemptAPI } from '@/lib/api/apiService';
import { useToast } from '@/context/ToastContext';

const GradingDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const attemptId = Number(resolvedParams.attemptId);
    const { showToast } = useToast();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [manualGrades, setManualGrades] = useState<Record<number, number>>({});
    const [comments, setComments] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getQuizAttemptDetailAPI(attemptId);
                setData(res.data || res);
                // Initialize manual grades with existing scores
                const initialScores: any = {};
                (res.data?.answers || res.answers || []).forEach((a: any) => {
                    initialScores[a.questionId] = a.marksObtained || 0;
                });
                setManualGrades(initialScores);
                setComments(res.data?.comments || res.comments || '');
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, [attemptId]);

    // AUTO-GRADE LOGIC
    const handleAutoGrade = () => {
        const newGrades = { ...manualGrades };
        data.answers.forEach((ans: any) => {
            if (ans.questionType === 'MCQ' || ans.questionType === 'BCQ') {
                const correctOptionIds = ans.allOptions.filter((o: any) => o.isCorrect).map((o: any) => o.id);
                const studentSelection = ans.studentSelectedOptions || [];
                
                // Compare arrays for BCQ/MCQ
                const isCorrect = correctOptionIds.length === studentSelection.length && 
                                  correctOptionIds.every((id: any) => studentSelection.includes(id));
                
                newGrades[ans.questionId] = isCorrect ? ans.marksAllocated : 0;
            }
        });
        setManualGrades(newGrades);
        showToast("Auto-Grade completed for MCQs/BCQs", "success");
    };

    // 👉 MARKS VALIDATION HANDLER
    const handleScoreChange = (questionId: number, maxMarks: number, value: string) => {
        const numValue = Number(value);
        if (numValue < 0) {
            setManualGrades(prev => ({ ...prev, [questionId]: 0 }));
            showToast("Marks cannot be less than 0", "error");
        } else if (numValue > maxMarks) {
            setManualGrades(prev => ({ ...prev, [questionId]: maxMarks }));
            showToast(`Maximum marks for this question is ${maxMarks}`, "error");
        } else {
            setManualGrades(prev => ({ ...prev, [questionId]: numValue }));
        }
    };

    const handleFinalSubmit = async () => {
        setSubmitting(true);
        try {
            // # 1. Prepare Questions Array as per the JSON format
            const questionsPayload = data.answers.map((ans: any) => {
                const marks = manualGrades[ans.questionId] || 0;
                return {
                    question_id: Number(ans.questionId),
                    marks_obtained: Number(marks),
                    is_correct: marks > 0 
                };
            });
    
            // # 2. Construct Exact Request Body
            const payload = { 
                comments: comments || "Well done!", 
                questions: questionsPayload 
            };
    
            await gradeQuizAttemptAPI(attemptId, payload);
            showToast("Grade successfully uploaded", "success");
            
        } catch (err: any) { 
            showToast(err.message || "Deployment failed", "error"); 
        } finally { 
            setSubmitting(false); 
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-app-bg"><Loader2 className="animate-spin text-accent-blue" size={40} /></div>;

    const totalCalculatedScore = Object.values(manualGrades).reduce((a, b) => a + b, 0);

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 bg-app-bg min-h-screen text-text-main pb-20 animate-in fade-in slide-in-from-top-4">
            
            {/* Header Navigation & Auto-Grade */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link href={`/teacher/assigned-courses/${resolvedParams.courseId}/section/${resolvedParams.sectionId}/quiz/${resolvedParams.quizId}/submissions`} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold text-xs uppercase tracking-wider transition-colors">
                    <ArrowLeft size={16} /> Back to Submissions
                </Link>
                <button onClick={handleAutoGrade} className="px-5 py-2.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-emerald-500/20 transition-all flex items-center gap-2">
                    <Zap size={16} /> Auto-Grade Selection
                </button>
            </div>

            {/* Hero / Summary Card */}
            <div className="bg-card-bg rounded-2xl p-6 md:p-8 shadow-sm border border-border-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent-blue/5 rounded-full blur-[60px] pointer-events-none"></div>
                
                <div className="relative z-10">
                    <span className="text-[10px] font-bold uppercase text-accent-blue tracking-widest bg-accent-blue/10 px-2.5 py-1 rounded-md mb-2 inline-block">
                        Manual Evaluation
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight capitalize text-text-main mt-1">
                        {data.studentName}
                    </h1>
                </div>
                
                <div className="relative z-10 text-left md:text-right bg-app-bg p-4 rounded-xl border border-border-subtle w-full md:w-auto flex items-center justify-between md:block">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Calculated Score</p>
                    <div className="flex items-center gap-2 text-2xl font-extrabold text-accent-blue">
                        <Award size={24} className="text-accent-blue/50 hidden md:block" /> {totalCalculatedScore} <span className="text-sm text-text-muted font-bold ml-1">Pts</span>
                    </div>
                </div>
            </div>

            {/* Questions Grading Area */}
            <div className="space-y-6 pt-2">
                {data.answers.map((ans: any, index: number) => (
                    <div key={ans.questionId} className="p-6 md:p-8 bg-card-bg border border-border-subtle rounded-2xl shadow-sm">
                        
                        {/* Question Header & Score Input */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border-subtle/50">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">Question {index + 1}</p>
                                <h3 className="font-extrabold text-lg text-text-main leading-snug">{ans.questionText}</h3>
                            </div>
                            
                            <div className="flex items-center gap-3 bg-app-bg border border-border-subtle p-2 rounded-xl shrink-0">
                                <span className="text-[10px] font-bold text-text-muted uppercase px-2">Weight: {ans.marksAllocated}</span>
                                <div className="h-6 w-px bg-border-subtle"></div>
                                {/* 👉 REPLACED onChange with HandleScoreChange */}
                                <input 
                                    type="number" 
                                    value={manualGrades[ans.questionId] !== undefined ? manualGrades[ans.questionId] : ''} 
                                    onChange={(e) => handleScoreChange(ans.questionId, ans.marksAllocated, e.target.value)}
                                    className="w-16 p-1.5 bg-card-bg border border-border-subtle rounded-lg text-center text-xs font-bold outline-none focus:border-accent-blue transition-colors" 
                                />
                            </div>
                        </div>

                        {/* Question Options / Answer Area */}
                        {ans.questionType === 'SHORT' ? (
                            <div className="p-4 bg-app-bg rounded-xl border border-border-subtle text-sm text-text-main font-medium leading-relaxed whitespace-pre-wrap">
                                {ans.studentAnswerText || <span className="text-text-muted italic">No response provided.</span>}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {ans.allOptions.map((opt: any) => {
                                    const isSelected = ans.studentSelectedOptions?.includes(opt.id);
                                    
                                    // Determine styling based on correctness & selection
                                    let optionStyle = "bg-app-bg border-border-subtle text-text-muted";
                                    let icon = <div className="w-4 h-4 rounded-full border-2 border-border-subtle shrink-0"></div>;

                                    if (isSelected) {
                                        if (opt.isCorrect) {
                                            optionStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600";
                                            icon = <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />;
                                        } else {
                                            optionStyle = "bg-red-500/10 border-red-500/30 text-red-500";
                                            icon = <XCircle size={18} className="text-red-500 shrink-0" />;
                                        }
                                    } else if (opt.isCorrect) {
                                        optionStyle = "bg-transparent border-emerald-500/30 text-emerald-500/60 border-dashed";
                                        icon = <CheckCircle2 size={18} className="text-emerald-500/50 shrink-0" />;
                                    }

                                    return (
                                        <div key={opt.id} className={`p-3.5 rounded-xl border-2 flex items-center justify-between text-xs font-bold transition-colors ${optionStyle}`}>
                                            <div className="flex items-center gap-3">
                                                {icon}
                                                <span className="leading-snug">{opt.text}</span>
                                            </div>
                                            {isSelected && <span className="text-[9px] px-2 py-1 bg-current/10 rounded-md uppercase tracking-wider shrink-0 ml-2">Student</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Final Feedback & Submit Section */}
            <div className="bg-card-bg p-6 md:p-8 rounded-2xl border border-border-subtle shadow-sm space-y-4">
                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-text-main mb-2 ml-1">Feedback Comments</label>
                    <textarea 
                        value={comments} 
                        onChange={(e) => setComments(e.target.value)} 
                        rows={3} 
                        className="w-full bg-app-bg p-4 rounded-xl border border-border-subtle outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20 font-medium text-sm transition-all resize-none" 
                        placeholder="Add constructive feedback for the student..."
                    />
                </div>
                
                <div className="flex justify-end pt-2">
                    <button 
                        onClick={handleFinalSubmit}
                        disabled={submitting}
                        className="w-full sm:w-auto px-10 py-3.5 bg-accent-blue text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all hover:bg-accent-blue/90 active:scale-95 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Send size={16} /> Submit Evaluation</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GradingDetailPage;