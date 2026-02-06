'use client';
import React, { useState, useEffect, use } from 'react';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Info, Send, Award } from 'lucide-react';
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
    
            console.log("🚀 Deploying Payload:", payload);
    
            await gradeQuizAttemptAPI(attemptId, payload);
            showToast("Grade successful: Grade deployed to registry", "success");
            
        } catch (err: any) { 
            showToast(err.message || "Deployment failed", "error"); 
        } finally { 
            setSubmitting(false); 
        }
    };
    if (loading) return <div className="h-screen flex items-center justify-center bg-app-bg"><Loader2 className="animate-spin text-accent-blue" size={48} /></div>;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 bg-app-bg min-h-screen text-text-main pb-20">
            <div className="flex justify-between items-center">
                <Link href={`/teacher/assigned-courses/${resolvedParams.courseId}/section/${resolvedParams.sectionId}/quiz/${resolvedParams.quizId}/submissions`} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-black text-xs uppercase tracking-widest">
                    <ArrowLeft size={16} /> Back to Ledger
                </Link>
                <button onClick={handleAutoGrade} className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-500/20 active:scale-95">Run Auto-Grade</button>
            </div>

            <div className="hero-registry-card rounded-[2.5rem] p-8 shadow-xl border border-border-subtle flex justify-between items-center">
                <div>
                    <span className="text-[9px] font-black uppercase text-accent-blue tracking-widest">Manual Evaluation</span>
                    <h1 className="text-3xl font-black uppercase tracking-tighter mt-1">{data.studentName}</h1>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-text-muted uppercase">Cumulative Grade Score</p>
                    <p className="text-3xl font-black text-accent-blue">{Object.values(manualGrades).reduce((a, b) => a + b, 0)} Pts</p>
                </div>
            </div>

            <div className="space-y-6">
                {data.answers.map((ans: any) => (
                    <div key={ans.questionId} className="p-8 bg-card-bg border border-border-subtle rounded-[2.5rem] shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-black text-lg uppercase tracking-tight max-w-2xl">{ans.questionText}</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-text-muted uppercase px-3 py-1 bg-app-bg rounded-lg">Weight: {ans.marksAllocated}</span>
                                <input 
                                    type="number" 
                                    value={manualGrades[ans.questionId]} 
                                    onChange={(e) => setManualGrades({...manualGrades, [ans.questionId]: Number(e.target.value)})}
                                    className="w-16 p-2 bg-app-bg border border-accent-blue/30 rounded-xl text-center text-xs font-black outline-none focus:border-accent-blue" 
                                />
                            </div>
                        </div>

                        {ans.questionType === 'SHORT' ? (
                            <div className="p-5 bg-app-bg rounded-2xl border border-border-subtle italic text-sm text-text-muted">
                                "{ans.studentAnswerText || 'No response protocol recorded.'}"
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {ans.allOptions.map((opt: any) => {
                                    const isSelected = ans.studentSelectedOptions?.includes(opt.id);
                                    return (
                                        <div key={opt.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between text-[11px] font-black uppercase tracking-widest ${
                                            isSelected ? (opt.isCorrect ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-500' : 'border-red-500/40 bg-red-500/5 text-red-500') : (opt.isCorrect ? 'border-emerald-500/20 bg-transparent text-emerald-500/50' : 'border-border-subtle bg-app-bg text-text-muted/40')
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                {opt.isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                                {opt.text}
                                            </div>
                                            {isSelected && <span className="text-[8px] px-2 py-0.5 bg-current/10 rounded">STUDENT CHOICE</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-card-bg p-8 rounded-[2.5rem] border border-border-subtle space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2">Grade Comments / Feedback</label>
                <textarea 
                    value={comments} 
                    onChange={(e) => setComments(e.target.value)} 
                    rows={4} 
                    className="w-full bg-app-bg p-6 rounded-3xl border border-border-subtle outline-none focus:border-accent-blue font-medium text-sm transition-all" 
                    placeholder="Type mission debriefing..."
                />
                <button 
                    onClick={handleFinalSubmit}
                    disabled={submitting}
                    className="w-full py-5 bg-accent-blue text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-accent-blue/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                    {submitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Deploy Grade to Registry</>}
                </button>
            </div>
        </div>
    );
};

export default GradingDetailPage;