'use client';
import React, { useState, useEffect, use } from 'react';
import { 
    Loader2, ArrowLeft, AlertCircle, 
    CheckCircle2, Award, RefreshCcw 
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
    const courseId = Number(resolvedParams?.courseId || resolvedParams?.courseid);
const quizId = Number(resolvedParams?.quizId || resolvedParams?.quizid || resolvedParams?.id);
    // const courseId = Number(resolvedParams.courseId);
    // const quizId = Number(resolvedParams.quizId);
    
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

            if (data.userAttempt) {
                setIsSubmitted(true); 
                
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
            showToast("Quiz submitted successfully!", "success");
            setIsSubmitted(true);
            loadQuizStatus(true); 
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            showToast(err.message || "Failed to submit quiz.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center bg-app-bg">
            <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
            <p className="text-text-muted font-bold uppercase text-[10px] tracking-widest">Loading Quiz...</p>
        </div>
    );

    if (!quizData) return (
        <div className="h-[80vh] flex flex-col items-center justify-center p-4 text-center bg-app-bg">
            <AlertCircle className="text-red-500 mb-4" size={40} />
            <h2 className="text-sm font-black text-text-main uppercase tracking-widest mb-2">Quiz Not Found</h2>
            <p className="text-text-muted text-[11px] font-medium mb-6">This quiz is unavailable or the link is invalid.</p>
            <Link href={`/student/enrolled-courses/${courseId}`} className="text-accent-blue font-bold text-xs hover:underline transition-all">Return to Course</Link>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-20 bg-app-bg min-h-screen text-text-main animate-in fade-in">
            
            <Link href={`/student/enrolled-courses/${courseId}`} className="inline-flex items-center gap-2 text-text-muted hover:text-text-main font-bold text-xs uppercase tracking-wider transition-colors mb-2">
                <ArrowLeft size={16} /> Exit Quiz
            </Link>

            {isSubmitted ? (
                <div className="space-y-8 pt-4">
                    {/* Minimalist Status Card */}
                    <div className="bg-card-bg border border-border-subtle rounded-2xl p-8 md:p-12 text-center space-y-6 shadow-sm">
                        <div className="w-20 h-20 bg-app-bg rounded-full flex items-center justify-center mx-auto border border-border-subtle">
                            {resultData ? <Award size={36} className="text-amber-500" /> : <CheckCircle2 size={36} className="text-emerald-500" />}
                        </div>
                        
                        <div className="space-y-3">
                            <h2 className="text-2xl font-black tracking-tight text-text-main">
                                {resultData ? "Your Result is Ready" : "Quiz Submitted Successfully"}
                            </h2>
                            <p className="text-text-muted text-sm font-medium max-w-md mx-auto leading-relaxed">
                                {resultData 
                                    ? `You scored ${resultData.totalMarksObtained} points. You can review your detailed results below.`
                                    : "You have successfully finished this quiz. Your teacher will review and grade your answers soon."}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            {!resultData && (
                                <button 
                                    onClick={() => loadQuizStatus(true)}
                                    disabled={checkingStatus}
                                    className="px-6 py-2.5 bg-app-bg text-text-main border border-border-subtle rounded-xl font-bold text-xs hover:bg-border-subtle/20 flex items-center gap-2 disabled:opacity-50 transition-colors w-full sm:w-auto justify-center"
                                >
                                    {checkingStatus ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
                                    Check Status
                                </button>
                            )}
                            
                            <Link href={`/student/enrolled-courses/${courseId}`} className="px-6 py-2.5 bg-text-main text-card-bg rounded-xl font-bold text-xs hover:opacity-90 transition-opacity w-full sm:w-auto justify-center flex items-center">
                                Back to Course
                            </Link>
                        </div>
                    </div>

                    {/* Results Details */}
                    {resultData && (
                        <div id="result-breakdown" className="pt-4">
                            <QuizResultView result={resultData} quizInfo={quizData} />
                        </div>
                    )}
                </div>
            ) : (
                /* Flat Quiz Header */
                <>
                    <div className="border-b border-border-subtle pb-6 mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue rounded-md text-[10px] font-bold uppercase tracking-widest">Quiz</span>
                            <span className="text-[11px] font-medium text-text-muted">{quizData.total_marks} Points</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-text-main">{quizData.title}</h1>
                        {quizData.description && (
                            <p className="text-text-muted mt-3 font-medium text-sm leading-relaxed max-w-2xl">{quizData.description}</p>
                        )}
                    </div>
                    <QuizInteractionForm questions={quizData.questions} onSubmit={handleQuizSubmit} isSubmitting={submitting} />
                </>
            )}
        </div>
    );
};

export default StudentQuizDetailPage;