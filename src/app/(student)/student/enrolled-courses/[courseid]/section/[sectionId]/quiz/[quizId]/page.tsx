'use client';

import React, { useState, useEffect, use, useMemo, useRef } from 'react';
import {
    Loader2,
    ArrowLeft,
    AlertCircle,
    CheckCircle2,
    Award,
    RefreshCcw,
    Clock3,
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/api/errorMessage';
import { fetchCourseContent } from '@/lib/store/features/courseSlice';
import {
    getSpecificQuizAPI,
    submitQuizAnswersAPI,
    getStudentQuizResultAPI,
    getCourseMarksheetAPI,
} from '@/lib/api/apiService';
import {
    getQuizAttemptId,
    getQuizAttemptMarks,
    hasQuizAttempt,
    isQuizAttemptGraded,
    pickQuizAttempt,
    unwrapQuizResult,
    type QuizAttemptRow,
} from '@/lib/quizSubmissions';
import QuizInteractionForm from '@/components/student/QuizInteractionForm';
import QuizResultView from '@/components/student/QuizResultView';

function quizWindowState(quiz: any): 'before' | 'open' | 'after' | 'open-always' {
    const start = quiz?.start_time || quiz?.startTime;
    const end = quiz?.end_time || quiz?.endTime;
    if (!start && !end) return 'open-always';
    const now = Date.now();
    if (start && now < new Date(start).getTime()) return 'before';
    if (end && now > new Date(end).getTime()) return 'after';
    return 'open';
}

function attemptFromMarksheet(row: any): QuizAttemptRow | null {
    if (!row) return null;
    const status = String(row.attemptStatus ?? row.status ?? '').toLowerCase();
    if (!status || status === 'missing') return null;
    return {
        id: row.attemptId ?? row.id,
        attemptId: row.attemptId,
        status,
        isGraded: status === 'graded' || row.marksObtained != null,
        submittedAt: row.submittedAt ?? null,
        totalMarksObtained: row.marksObtained,
        comments: row.comments ?? null,
    };
}

const StudentQuizDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const courseId = Number(resolvedParams?.courseId || resolvedParams?.courseid);
    const quizId = Number(
        resolvedParams?.quizId || resolvedParams?.quizid || resolvedParams?.id
    );

    const dispatch = useAppDispatch();
    const { showToast } = useToast();
    const { courseContent } = useAppSelector((state) => state.course);
    const submitLock = useRef(false);

    const [quizData, setQuizData] = useState<any>(null);
    const [attempt, setAttempt] = useState<QuizAttemptRow | null>(null);
    const [resultData, setResultData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const windowState = useMemo(
        () => (quizData ? quizWindowState(quizData) : 'open-always'),
        [quizData]
    );

    const hasSubmitted = hasQuizAttempt(attempt);
    const isGraded = isQuizAttemptGraded(attempt);
    const obtainedMarks = getQuizAttemptMarks(attempt) ?? getQuizAttemptMarks(resultData);
    const totalMarks = quizData?.total_marks ?? quizData?.totalMarks ?? '—';

    const loadQuizStatus = async (showSilently = false) => {
        if (!showSilently) setLoading(true);
        else setCheckingStatus(true);
        setLoadError(null);

        try {
            if (!courseContent[courseId]) await dispatch(fetchCourseContent(courseId));

            const data = await getSpecificQuizAPI(quizId, { forStudent: true });
            setQuizData(data);

            let nextAttempt = pickQuizAttempt(data);
            if (!hasQuizAttempt(nextAttempt) && courseId) {
                try {
                    const sheet = await getCourseMarksheetAPI(courseId);
                    const row = (sheet.quizzes || []).find((q) => Number(q.id) === quizId);
                    nextAttempt = attemptFromMarksheet(row);
                } catch {
                    /* marksheet is a fallback only */
                }
            }

            if (!hasQuizAttempt(nextAttempt)) {
                setAttempt(null);
                setResultData(null);
                return;
            }

            setAttempt(nextAttempt);

            if (!isQuizAttemptGraded(nextAttempt)) {
                setResultData(null);
                return;
            }

            const attemptId = getQuizAttemptId(nextAttempt);
            if (!attemptId) {
                setResultData({
                    totalMarksObtained: getQuizAttemptMarks(nextAttempt),
                    comments: (nextAttempt as any).comments ?? null,
                    answers: [],
                });
                return;
            }

            try {
                const result = unwrapQuizResult(await getStudentQuizResultAPI(attemptId));
                setResultData(result);
            } catch {
                setResultData({
                    totalMarksObtained: getQuizAttemptMarks(nextAttempt),
                    comments: (nextAttempt as any).comments ?? null,
                    answers: [],
                });
            }
        } catch (err) {
            const msg = getErrorMessage(err, 'Failed to load quiz');
            setLoadError(msg);
            if (!showSilently) showToast(msg, 'error');
        } finally {
            setLoading(false);
            setCheckingStatus(false);
        }
    };

    useEffect(() => {
        loadQuizStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId, quizId]);

    const handleQuizSubmit = async (answers: any[]) => {
        if (submitLock.current || submitting || hasSubmitted) return;
        if (windowState === 'before' || windowState === 'after') {
            showToast(
                windowState === 'before'
                    ? 'This quiz has not started yet.'
                    : 'The quiz window has ended.',
                'error'
            );
            return;
        }

        submitLock.current = true;
        setSubmitting(true);
        try {
            const submitted = await submitQuizAnswersAPI({ quiz_id: quizId, answers });
            const submittedAttempt = pickQuizAttempt(submitted) || pickQuizAttempt(submitted?.data);
            if (hasQuizAttempt(submittedAttempt)) setAttempt(submittedAttempt);
            else setAttempt({ status: 'submitted', submittedAt: new Date().toISOString() });
            showToast('Quiz submitted successfully!', 'success');
            await loadQuizStatus(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: unknown) {
            showToast(getErrorMessage(err, 'Failed to submit quiz.'), 'error');
            submitLock.current = false;
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center bg-app-bg">
                <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
                <p className="text-text-muted font-bold uppercase text-[10px] tracking-widest">
                    Loading Quiz...
                </p>
            </div>
        );

    if (!quizData)
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center p-4 text-center bg-app-bg">
                <AlertCircle className="text-red-500 mb-4" size={40} />
                <h2 className="text-sm font-black text-text-main uppercase tracking-widest mb-2">
                    Quiz Not Found
                </h2>
                <p className="text-text-muted text-[11px] font-medium mb-6">
                    {loadError || 'This quiz is unavailable or the link is invalid.'}
                </p>
                <Link
                    href={`/student/enrolled-courses/${courseId}`}
                    className="text-accent-blue font-bold text-xs hover:underline transition-all"
                >
                    Return to Course
                </Link>
            </div>
        );

    const canAttempt =
        !hasSubmitted && (windowState === 'open' || windowState === 'open-always');

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-20 bg-app-bg min-h-screen text-text-main animate-in fade-in">
            <Link
                href={`/student/enrolled-courses/${courseId}`}
                className="inline-flex items-center gap-2 text-text-muted hover:text-text-main font-bold text-xs uppercase tracking-wider transition-colors mb-2"
            >
                <ArrowLeft size={16} /> Exit Quiz
            </Link>

            {hasSubmitted ? (
                <div className="space-y-8 pt-4">
                    <div className="bg-card-bg border border-border-subtle rounded-2xl p-8 md:p-12 text-center space-y-6 shadow-sm">
                        <div className="w-20 h-20 bg-app-bg rounded-full flex items-center justify-center mx-auto border border-border-subtle">
                            {isGraded ? (
                                <Award size={36} className="text-amber-500" />
                            ) : (
                                <CheckCircle2 size={36} className="text-emerald-500" />
                            )}
                        </div>

                        <div className="space-y-3">
                            <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                    isGraded
                                        ? 'bg-emerald-500/10 text-emerald-600'
                                        : 'bg-emerald-500/10 text-emerald-600'
                                }`}
                            >
                                <CheckCircle2 size={12} />
                                {isGraded ? 'Graded' : 'Submitted'}
                            </span>
                            <h2 className="text-2xl font-black tracking-tight text-text-main">
                                {isGraded ? 'Your Result is Ready' : 'Quiz Submitted Successfully'}
                            </h2>
                            <p className="text-text-muted text-sm font-medium max-w-md mx-auto leading-relaxed">
                                {isGraded
                                    ? `You scored ${obtainedMarks ?? '—'} / ${totalMarks} points.`
                                    : 'You already submitted this quiz. You cannot attempt it again. Your teacher will grade it soon.'}
                            </p>
                        </div>

                        {isGraded && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600">
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    Marks obtained
                                </span>
                                <span className="text-lg font-black tabular-nums">
                                    {obtainedMarks ?? '—'} / {totalMarks}
                                </span>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            {!isGraded && (
                                <button
                                    type="button"
                                    onClick={() => loadQuizStatus(true)}
                                    disabled={checkingStatus}
                                    className="px-6 py-2.5 bg-app-bg text-text-main border border-border-subtle rounded-xl font-bold text-xs hover:bg-border-subtle/20 flex items-center gap-2 disabled:opacity-50 transition-colors w-full sm:w-auto justify-center"
                                >
                                    {checkingStatus ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : (
                                        <RefreshCcw size={16} />
                                    )}
                                    Check Status
                                </button>
                            )}

                            <Link
                                href={`/student/enrolled-courses/${courseId}`}
                                className="px-6 py-2.5 bg-text-main text-card-bg rounded-xl font-bold text-xs hover:opacity-90 transition-opacity w-full sm:w-auto justify-center flex items-center"
                            >
                                Back to Course
                            </Link>
                        </div>
                    </div>

                    {isGraded && resultData?.answers?.length > 0 && (
                        <div id="result-breakdown" className="pt-4">
                            <QuizResultView result={resultData} quizInfo={quizData} />
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="border-b border-border-subtle pb-6 mb-6">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue rounded-md text-[10px] font-bold uppercase tracking-widest">
                                Quiz
                            </span>
                            <span className="text-[11px] font-medium text-text-muted">
                                {totalMarks} Points
                            </span>
                            {windowState === 'before' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    <Clock3 size={12} /> Not started
                                </span>
                            )}
                            {windowState === 'after' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20">
                                    <Clock3 size={12} /> Closed
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-text-main">
                            {quizData.title}
                        </h1>
                        {quizData.description && (
                            <p className="text-text-muted mt-3 font-medium text-sm leading-relaxed max-w-2xl">
                                {quizData.description}
                            </p>
                        )}
                    </div>

                    {!canAttempt ? (
                        <div className="rounded-2xl border border-border-subtle bg-card-bg p-10 text-center space-y-3">
                            <Clock3 className="mx-auto text-amber-500" size={32} />
                            <p className="text-sm font-black uppercase tracking-widest">
                                {windowState === 'before'
                                    ? 'Quiz has not started yet'
                                    : 'Quiz window has ended'}
                            </p>
                            <p className="text-xs text-text-muted font-medium">
                                You cannot submit answers outside the available time window.
                            </p>
                        </div>
                    ) : (
                        <QuizInteractionForm
                            questions={quizData.questions || []}
                            onSubmit={handleQuizSubmit}
                            isSubmitting={submitting}
                            totalQuestions={(quizData.questions || []).length}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default StudentQuizDetailPage;
