'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import Link from 'next/link';
import {
    Loader2,
    ArrowLeft,
    ClipboardList,
    AlertCircle,
    Megaphone,
    Users,
    HelpCircle,
    CalendarClock,
    Pencil,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchCourseContent, refreshCourseContent } from '@/lib/store/features/courseSlice';
import { getSpecificQuizAPI, updateQuizAPI, getQuizSubmissionsAPI } from '@/lib/api/apiService';
import { getErrorMessage } from '@/lib/api/errorMessage';
import { useToast } from '@/context/ToastContext';
import GenericFormModal from '@/components/ui/GenericFormModal';
import {
    countRealQuizAttempts,
    normalizeQuizAttemptsList,
    resolveQuizCountFromWithContent,
} from '@/lib/quizSubmissions';

const QuizDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const courseId = Number(resolvedParams.courseId);
    const quizId = Number(resolvedParams.quizId);
    const sectionId = resolvedParams.sectionId;
    const dispatch = useAppDispatch();
    const { showToast } = useToast();

    const { courseContent } = useAppSelector((state) => state.course);
    const fullData = courseContent[courseId];

    const [localQuiz, setLocalQuiz] = useState<any>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [submissionCount, setSubmissionCount] = useState<number | null>(null);
    const [pendingReviewCount, setPendingReviewCount] = useState(0);

    const courseQuiz = useMemo(
        () =>
            fullData?.sections
                ?.flatMap((s: any) => s.quizzes || [])
                ?.find((q: any) => q.id === quizId),
        [fullData, quizId]
    );

    useEffect(() => {
        const getFullQuizData = async () => {
            if (!courseId || !quizId) return;
            setIsInitialLoading(true);
            try {
                if (!fullData) await dispatch(fetchCourseContent(courseId)).unwrap();
                const specificQuiz = await getSpecificQuizAPI(quizId);
                setLocalQuiz(specificQuiz);
            } catch (err) {
                showToast(getErrorMessage(err, 'Failed to load quiz'), 'error');
            } finally {
                setIsInitialLoading(false);
            }
        };
        getFullQuizData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId, quizId, dispatch]);

    useEffect(() => {
        let cancelled = false;
        const loadAttempts = async () => {
            const fromContent = resolveQuizCountFromWithContent(courseQuiz || localQuiz);
            if (fromContent !== null) {
                setSubmissionCount(fromContent);
            }
            try {
                const res = await getQuizSubmissionsAPI(quizId);
                if (cancelled) return;
                const rows = normalizeQuizAttemptsList(res);
                const real = countRealQuizAttempts(rows);
                setSubmissionCount(real ?? 0);
                setPendingReviewCount(
                    rows.filter((r) => r.isGraded !== true && isAttemptPresent(r)).length
                );
            } catch {
                if (cancelled) return;
                if (fromContent === null) setSubmissionCount(0);
            }
        };
        if (quizId) loadAttempts();
        return () => {
            cancelled = true;
        };
    }, [quizId, courseQuiz, localQuiz]);

    const displayQuiz = localQuiz || courseQuiz;

    const isPublished =
        displayQuiz?.is_Published === true ||
        displayQuiz?.isPublished === true ||
        displayQuiz?.is_Published === 'true';

    const totalMarks = Number(displayQuiz?.total_marks ?? displayQuiz?.totalMarks ?? 0);
    const questionCount = displayQuiz?.questions?.length || 0;
    const startAt = displayQuiz?.start_time || displayQuiz?.startTime || null;
    const endAt = displayQuiz?.end_time || displayQuiz?.endTime || null;
    const submissionsHref = `/teacher/assigned-courses/${courseId}/section/${sectionId}/quiz/${quizId}/submissions`;

    const handleUpdateSubmit = async (formData: FormData) => {
        setModalLoading(true);
        try {
            const rawData = Object.fromEntries(formData);
            const questions = JSON.parse(rawData.questions as string);
            const total_marks =
                Number(rawData.total_marks) ||
                questions.reduce((sum: number, q: any) => sum + (Number(q?.marks) || 0), 0);
            const payload = {
                ...rawData,
                total_marks,
                is_Published: rawData.is_Published === 'true',
                questions,
            };
            await updateQuizAPI(quizId, payload);
            setIsEditModalOpen(false);
            const updated = await getSpecificQuizAPI(quizId);
            setLocalQuiz(updated);
            dispatch(refreshCourseContent(courseId));
            dispatch(fetchCourseContent(courseId));
            showToast(
                payload.is_Published ? 'Quiz published / updated' : 'Quiz saved as draft',
                'success'
            );
        } catch (err: unknown) {
            showToast(getErrorMessage(err, 'Quiz update failed'), 'error');
        } finally {
            setModalLoading(false);
        }
    };

    const handleQuickPublish = async () => {
        if (!displayQuiz) return;
        setModalLoading(true);
        try {
            await updateQuizAPI(quizId, {
                title: displayQuiz.title,
                description: displayQuiz.description,
                total_marks: Number(displayQuiz.total_marks ?? displayQuiz.totalMarks ?? 0),
                start_time: displayQuiz.start_time || displayQuiz.startTime || null,
                end_time: displayQuiz.end_time || displayQuiz.endTime || null,
                is_Published: !isPublished,
                questions: displayQuiz.questions || [],
            });
            const updated = await getSpecificQuizAPI(quizId);
            setLocalQuiz(updated);
            dispatch(refreshCourseContent(courseId));
            showToast(!isPublished ? 'Quiz published for students' : 'Quiz set to draft', 'success');
        } catch (err: unknown) {
            showToast(getErrorMessage(err, 'Failed to update publish status'), 'error');
        } finally {
            setModalLoading(false);
        }
    };

    if (isInitialLoading)
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
                <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
                <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">
                    Loading quiz…
                </p>
            </div>
        );

    if (!displayQuiz)
        return (
            <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-app-bg">
                <AlertCircle className="text-red-500 mb-4" size={48} />
                <h2 className="text-xl font-extrabold tracking-tight text-text-main mb-2">
                    Quiz Not Found
                </h2>
                <Link
                    href={`/teacher/assigned-courses/${courseId}`}
                    className="text-accent-blue font-bold text-sm hover:underline"
                >
                    Return to Course
                </Link>
            </div>
        );

    return (
        <div className="min-h-screen bg-app-bg text-text-main pb-20 relative overflow-x-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.10),_transparent_50%)]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 md:pt-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Link
                        href={`/teacher/assigned-courses/${courseId}`}
                        className="inline-flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to course
                    </Link>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleQuickPublish}
                            disabled={modalLoading}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border disabled:opacity-50 ${
                                isPublished
                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            }`}
                        >
                            {modalLoading ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Megaphone size={14} />
                            )}
                            {isPublished ? 'Set draft' : 'Publish live'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border-subtle bg-card-bg text-text-main hover:border-accent-blue/40"
                        >
                            <Pencil size={14} /> Edit quiz
                        </button>
                        <Link
                            href={submissionsHref}
                            className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-accent-blue text-white hover:bg-hover-blue"
                        >
                            <Users size={14} />
                            Submissions
                            {typeof submissionCount === 'number' && submissionCount > 0 && (
                                <span className="ml-0.5 min-w-[1.25rem] h-5 px-1.5 rounded-md bg-white/20 text-[10px] tabular-nums flex items-center justify-center">
                                    {submissionCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Hero */}
                <section className="rounded-[1.75rem] border border-border-subtle bg-card-bg p-6 md:p-8 shadow-xl overflow-hidden relative">
                    <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent-blue/10 blur-3xl" />
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-start gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 text-accent-blue border border-accent-blue/20 flex items-center justify-center shrink-0">
                            <ClipboardList size={28} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                                    Quiz
                                </span>
                                <span
                                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                        isPublished
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/25'
                                    }`}
                                >
                                    {isPublished ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-text-main leading-tight">
                                {displayQuiz.title}
                            </h1>
                            {displayQuiz.description && (
                                <p className="text-sm text-text-muted font-medium leading-relaxed max-w-2xl">
                                    {displayQuiz.description}
                                </p>
                            )}
                            {(startAt || endAt) && (
                                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 pt-1">
                                    <div className="inline-flex items-center gap-2 text-[12px]">
                                        <CalendarClock size={14} className="text-accent-blue shrink-0" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                            Start
                                        </span>
                                        <span className="font-semibold text-text-main tabular-nums">
                                            {startAt
                                                ? new Date(startAt).toLocaleString('en-GB')
                                                : 'Not set'}
                                        </span>
                                    </div>
                                    <div className="inline-flex items-center gap-2 text-[12px]">
                                        <CalendarClock size={14} className="text-accent-blue shrink-0 sm:hidden" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                            End
                                        </span>
                                        <span className="font-semibold text-text-main tabular-nums">
                                            {endAt
                                                ? new Date(endAt).toLocaleString('en-GB')
                                                : 'Not set'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* KPI strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Kpi
                        icon={HelpCircle}
                        label="Questions"
                        value={String(questionCount)}
                        support="In this quiz"
                    />
                    <Kpi
                        icon={ClipboardList}
                        label="Total points"
                        value={String(totalMarks || '—')}
                        support="Max score"
                    />
                    <Kpi
                        icon={Users}
                        label="Submissions"
                        value={submissionCount == null ? '…' : String(submissionCount)}
                        support={
                            pendingReviewCount > 0
                                ? `${pendingReviewCount} awaiting review`
                                : 'Student attempts'
                        }
                        highlight={(submissionCount ?? 0) > 0}
                        href={submissionsHref}
                    />
                    <Kpi
                        icon={Megaphone}
                        label="Visibility"
                        value={isPublished ? 'Live' : 'Draft'}
                        support={isPublished ? 'Visible to students' : 'Hidden from students'}
                        highlight={!isPublished}
                    />
                </div>

                {/* Questions */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
                        <h2 className="text-sm font-black uppercase tracking-widest text-text-main">
                            Questions ({questionCount})
                        </h2>
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(true)}
                            className="text-[10px] font-black uppercase tracking-widest text-accent-blue hover:underline"
                        >
                            Manage questions
                        </button>
                    </div>

                    {!questionCount ? (
                        <div className="rounded-2xl border border-dashed border-border-subtle bg-card-bg p-12 text-center space-y-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
                                No questions yet
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest"
                            >
                                <Pencil size={14} /> Add questions
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {displayQuiz.questions.map((q: any, index: number) => (
                                <article
                                    key={q.id ?? index}
                                    className="rounded-2xl border border-border-subtle bg-card-bg p-5 md:p-6"
                                >
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-accent-blue mb-1.5">
                                                Question {index + 1} · {q.question_type}
                                            </p>
                                            <p className="font-bold text-base text-text-main leading-snug">
                                                {q.question_text}
                                            </p>
                                        </div>
                                        <span className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-app-bg border border-border-subtle text-text-muted">
                                            {q.marks} pts
                                        </span>
                                    </div>

                                    {q.question_type === 'SHORT' ? (
                                        <p className="text-[11px] font-medium text-text-muted italic">
                                            Short answer — graded manually after submission.
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {q.options?.map((opt: any, i: number) => {
                                                const correct = opt.is_correct || opt.isCorrect;
                                                return (
                                                    <div
                                                        key={opt.id ?? i}
                                                        className={`px-3.5 py-3 rounded-xl border text-[13px] font-semibold flex items-center gap-2.5 ${
                                                            correct
                                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                                                : 'bg-app-bg border-border-subtle text-text-muted'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-2 h-2 rounded-full shrink-0 ${
                                                                correct
                                                                    ? 'bg-emerald-500'
                                                                    : 'bg-border-subtle'
                                                            }`}
                                                        />
                                                        {opt.option_text}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <GenericFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit quiz"
                fields={[
                    { name: 'title', label: 'Quiz Title', type: 'text', required: true },
                    { name: 'description', label: 'Quiz Description', type: 'textarea' },
                    { name: 'start_time', label: 'Start Time', type: 'datetime-local' },
                    { name: 'end_time', label: 'End Time', type: 'datetime-local' },
                    {
                        name: 'is_Published',
                        label: 'Availability',
                        type: 'select',
                        options: [
                            { label: 'Published (Live)', value: 'true' },
                            { label: 'Draft', value: 'false' },
                        ],
                    },
                    {
                        name: 'questions',
                        label: 'Manage Questions',
                        type: 'quiz-builder',
                        required: true,
                    },
                ]}
                onSubmit={handleUpdateSubmit}
                loading={modalLoading}
                initialData={{
                    ...displayQuiz,
                    start_time: startAt
                        ? new Date(startAt).toISOString().slice(0, 16)
                        : '',
                    end_time: endAt ? new Date(endAt).toISOString().slice(0, 16) : '',
                    is_Published: String(
                        displayQuiz?.is_Published ?? displayQuiz?.isPublished ?? false
                    ),
                }}
            />
        </div>
    );
};

function isAttemptPresent(row: { submittedAt?: string | null; id?: number; attemptId?: number }) {
    return Boolean(row.submittedAt || row.id != null || row.attemptId != null);
}

function Kpi({
    icon: Icon,
    label,
    value,
    support,
    highlight,
    href,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    support: string;
    highlight?: boolean;
    href?: string;
}) {
    const className = `rounded-2xl border p-4 transition-all ${
        highlight
            ? 'border-accent-blue/35 bg-accent-blue/[0.07]'
            : 'border-border-subtle bg-card-bg'
    } ${href ? 'hover:-translate-y-0.5 hover:border-accent-blue/40' : ''}`;

    const body = (
        <>
            <div className="w-9 h-9 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center mb-3">
                <Icon size={16} />
            </div>
            <p className="text-2xl font-black tabular-nums text-text-main">{value}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
                {label}
            </p>
            <p className="mt-1 text-[11px] text-text-muted">{support}</p>
        </>
    );

    if (href) {
        return (
            <Link href={href} className={className}>
                {body}
            </Link>
        );
    }
    return <div className={className}>{body}</div>;
}

export default QuizDetailPage;
