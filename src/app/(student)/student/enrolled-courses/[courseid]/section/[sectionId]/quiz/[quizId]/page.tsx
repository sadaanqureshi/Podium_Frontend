'use client';
import React, { useState, useEffect, use } from 'react';
import { 
    Loader2, ArrowLeft, HelpCircle, AlertCircle, 
    Send, CheckCircle2, Award, FileText, RefreshCcw 
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useToast } from '@/context/ToastContext';
import { fetchCourseContent } from '@/lib/store/features/courseSlice';
import { getSpecificQuizAPI, submitQuizAnswersAPI, getStudentQuizResultAPI } from '@/lib/api/apiService';

import QuizInteractionForm from '@/components/student/QuizInteractionForm';
import QuizResultView from '@/components/student/QuizResultView';

const StudentQuizDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const courseId = Number(resolvedParams.courseId);
    const quizId = Number(resolvedParams.quizId);
    
    const dispatch = useAppDispatch();
    const { showToast } = useToast();
    const { courseContent } = useAppSelector((state) => state.course);

    const [quizData, setQuizData] = useState<any>(null);
    const [resultData, setResultData] = useState<any>(null); 
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);

    const loadQuizStatus = async (showSilently = false) => {
        if (!showSilently) setLoading(true);
        else setCheckingStatus(true);
        
        try {
            if (!courseContent[courseId]) await dispatch(fetchCourseContent(courseId));
            
            const data = await getSpecificQuizAPI(quizId);
            setQuizData(data);

            // # CHECK: Agar student pehle hi quiz de chuka hai (userAttempt exists)
            if (data.userAttempt) {
                setIsSubmitted(true); // Is se form hide ho jayega
                
                // Agar teacher ne marks de diye hain
                if (data.userAttempt.isGraded) {
                    const result = await getStudentQuizResultAPI(data.userAttempt.id);
                    setResultData(result);
                }
            }
        } catch (err) {
            console.error("Error loading quiz data");
        } finally {
            setLoading(false);
            setCheckingStatus(false);
        }
    };

    useEffect(() => {
        loadQuizStatus();
    }, [courseId, quizId]);

    const handleQuizSubmit = async (answers: any[]) => {
        setSubmitting(true);
        try {
            await submitQuizAnswersAPI({ quiz_id: quizId, answers });
            showToast("Quiz finished! Your answers are saved.", "success");
            setIsSubmitted(true);
            loadQuizStatus(true); // Status refresh karo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            showToast(err.message || "Failed to submit", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
            <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
            <p className="text-text-muted font-bold uppercase text-[10px] tracking-widest">Getting Quiz Ready...</p>
        </div>
    );

    if (!quizData) return (
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-app-bg">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-black text-text-main uppercase">Quiz Not Found</h2>
            <Link href={`/student/enrolled-courses/${courseId}`} className="mt-4 text-accent-blue font-bold uppercase text-xs underline underline-offset-8">Go Back</Link>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20 bg-app-bg min-h-screen text-text-main">
            
            <Link href={`/student/enrolled-courses/${courseId}`} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold text-[10px] uppercase tracking-widest transition-all">
                <ArrowLeft size={16} /> Exit Quiz
            </Link>

            {isSubmitted ? (
                <div className="space-y-8">
                    {/* Status Card (Always shown after submission) */}
                    <div className="bg-card-bg border border-border-subtle rounded-[3rem] p-10 md:p-16 text-center space-y-8 animate-in zoom-in-95 shadow-xl">
                        <div className="w-24 h-24 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto border border-accent-blue/20">
                            {resultData ? <Award size={48} className="text-amber-500" /> : <CheckCircle2 size={48} className="text-emerald-500" />}
                        </div>
                        
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black uppercase tracking-tight text-text-main">
                                {resultData ? "Your Result is Ready!" : "Quiz Already Submitted!"}
                            </h2>
                            <p className="text-text-muted text-base font-medium max-w-md mx-auto">
                                {resultData 
                                    ? `You have scored ${resultData.totalMarksObtained} marks. Details are given below.`
                                    : "You have already finished this quiz. Please wait for the teacher to check your answers."}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {!resultData && (
                                <button 
                                    onClick={() => loadQuizStatus(true)}
                                    disabled={checkingStatus}
                                    className="px-10 py-5 bg-app-bg text-text-main border-2 border-border-subtle rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-card-bg flex items-center gap-3 disabled:opacity-50"
                                >
                                    {checkingStatus ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
                                    Refresh Status
                                </button>
                            )}
                            
                            <Link href={`/student/enrolled-courses/${courseId}`} className="px-10 py-5 bg-text-main text-card-bg rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:opacity-90 transition-all">
                                Back to Course
                            </Link>
                        </div>
                    </div>

                    {/* Results Table (Shows only when resultData is available) */}
                    {resultData && (
                        <div id="result-breakdown" className="pt-8">
                            <QuizResultView result={resultData} quizInfo={quizData} />
                        </div>
                    )}
                </div>
            ) : (
                /* Original Quiz Form (Only for first-time attempt) */
                <>
                    <div className="hero-registry-card rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden border border-border-subtle">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue rounded-full text-[9px] font-bold uppercase tracking-widest border border-accent-blue/20">Active Quiz</span>
                                <span className="text-[9px] font-bold text-text-muted uppercase">{quizData.total_marks} Marks Total</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight">{quizData.title}</h1>
                            <p className="text-text-muted mt-4 font-medium text-sm max-w-2xl leading-relaxed">{quizData.description}</p>
                        </div>
                    </div>
                    <QuizInteractionForm questions={quizData.questions} onSubmit={handleQuizSubmit} isSubmitting={submitting} />
                </>
            )}
        </div>
    );
};

export default StudentQuizDetailPage;