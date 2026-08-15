'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import {
    Calendar,
    ClipboardList,
    Download,
    CheckCircle2,
    Loader2,
    ArrowLeft,
    AlertCircle,
    X,
    Users,
    Target,
    FileCheck2,
    Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/api/errorMessage';
import {
    formatSubmissionScore,
    formatSubmissionStatus,
    getSubmissionMarks,
    hasSubmissionStatus,
    isSubmissionGraded,
    isSubmissionLate,
} from '@/lib/assignmentSubmissions';
import { fetchCourseContent } from '@/lib/store/features/courseSlice';
import { fetchSubmissions, submitGrade } from '@/lib/store/features/assignmentSlice';
import UserManagementTable from '@/components/ui/UserManagementTable';

const AssignmentDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const assignmentId = Number(resolvedParams.assignmentId || resolvedParams.id);
    const courseId = Number(resolvedParams.courseId);

    const dispatch = useAppDispatch();
    const { showToast } = useToast();

    const { courseContent, loading: reduxCourseLoading } = useAppSelector((state) => state.course);
    const { submissionsCache, loading: reduxSubLoading } = useAppSelector(
        (state) => state.assignment
    );

    const fullData = courseContent[courseId];
    const assignment = useMemo(() => {
        if (!fullData?.sections) return null;
        return fullData.sections
            .flatMap((s: any) => s.assignments || [])
            .find((a: any) => a.id === assignmentId);
    }, [fullData, assignmentId]);

    const submissions = useMemo(
        () => (submissionsCache[assignmentId] || []).filter(hasSubmissionStatus),
        [submissionsCache, assignmentId]
    );
    const isTableLoading = reduxSubLoading[assignmentId];

    const [showSubmissions, setShowSubmissions] = useState(false);
    const [selectedSub, setSelectedSub] = useState<any>(null);
    const [gradeData, setGradeData] = useState({ marksObtained: '', comments: '' });
    const [gradeLoading, setGradeLoading] = useState(false);
    const [marksError, setMarksError] = useState<string | null>(null);

    const totalMarks = Number(assignment?.totalMarks ?? assignment?.total_marks ?? 0);
    const dueDate = assignment?.dueDate ?? assignment?.due_date ?? null;
    const startDate =
        assignment?.startDate ??
        assignment?.start_date ??
        assignment?.startTime ??
        assignment?.start_time ??
        null;

    const gradedCount = useMemo(
        () => submissions.filter((s) => isSubmissionGraded(s)).length,
        [submissions]
    );
    const pendingCount = Math.max(0, submissions.length - gradedCount);

    useEffect(() => {
        if (!fullData && courseId) {
            dispatch(fetchCourseContent(courseId));
        }
    }, [courseId, fullData, dispatch]);

    // Prefetch submissions for KPI badges (same pattern as quiz detail)
    useEffect(() => {
        if (!assignmentId) return;
        if (submissionsCache[assignmentId] !== undefined) return;
        dispatch(fetchSubmissions(assignmentId));
    }, [assignmentId, submissionsCache, dispatch]);

    const openSubmissions = () => {
        setShowSubmissions(true);
        if (submissionsCache[assignmentId] === undefined) {
            dispatch(fetchSubmissions(assignmentId));
        }
        requestAnimationFrame(() => {
            document
                .getElementById('assignment-submissions')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    const toggleSubmissions = () => {
        if (showSubmissions) {
            setShowSubmissions(false);
            return;
        }
        openSubmissions();
    };

    const validateMarks = (raw: string): string | null => {
        if (raw === '' || raw == null) return 'Enter marks obtained.';
        const value = Number(raw);
        if (Number.isNaN(value)) return 'Enter a valid number.';
        if (value < 0) return 'Marks cannot be negative.';
        if (totalMarks > 0 && value > totalMarks) {
            return `Marks cannot exceed total marks (${totalMarks}).`;
        }
        return null;
    };

    const handleMarksChange = (raw: string) => {
        setGradeData((prev) => ({ ...prev, marksObtained: raw }));
        setMarksError(validateMarks(raw));
    };

    const handleGradeSubmit = async () => {
        const error = validateMarks(gradeData.marksObtained);
        if (error) {
            setMarksError(error);
            showToast(error, 'error');
            return;
        }

        const studentId =
            selectedSub?.studentId ??
            selectedSub?.student?.id ??
            selectedSub?.userId ??
            selectedSub?.id;
        if (studentId == null) {
            showToast('Student ID missing. Cannot grade this submission.', 'error');
            return;
        }

        setGradeLoading(true);
        const studentName =
            [selectedSub?.firstName, selectedSub?.lastName].filter(Boolean).join(' ').trim() ||
            'student';
        const marks = Number(gradeData.marksObtained);
        const isUpdate = isSubmissionGraded(selectedSub);
        try {
            await dispatch(
                submitGrade({
                    assignmentId,
                    studentId: Number(studentId),
                    gradeData: {
                        marksObtained: marks,
                        comments: gradeData.comments,
                    },
                })
            ).unwrap();
            const scoreLabel = `${marks}${totalMarks > 0 ? ` / ${totalMarks}` : ''}`;
            setSelectedSub(null);
            setMarksError(null);
            showToast(
                isUpdate
                    ? `Updated grade for ${studentName}: ${scoreLabel} marks`
                    : `Graded ${studentName}: ${scoreLabel} marks`,
                'success'
            );
        } catch (err) {
            showToast(
                getErrorMessage(err, isUpdate ? 'Failed to update grade' : 'Failed to submit grade'),
                'error'
            );
        } finally {
            setGradeLoading(false);
        }
    };

    const columnConfig = [
        {
            header: 'Student',
            key: 'firstName',
            render: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {item.firstName?.[0] || 'S'}
                    </div>
                    <div>
                        <p className="font-bold text-sm text-text-main capitalize">
                            {item.firstName} {item.lastName}
                        </p>
                        <p className="text-[10px] text-text-muted font-medium lowercase tracking-wide">
                            {item.email}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Submitted',
            key: 'submittedAt',
            render: (item: any) => {
                const late = isSubmissionLate(item.submittedAt, dueDate);
                return (
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-text-muted">
                            {item.submittedAt
                                ? new Date(item.submittedAt).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  })
                                : '—'}
                        </span>
                        {late && (
                            <span className="inline-flex w-fit px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border bg-rose-500/10 text-rose-500 border-rose-500/25">
                                Late
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Status',
            key: 'status',
            align: 'center' as const,
            render: (item: any) => {
                const status = formatSubmissionStatus(item);
                const graded = isSubmissionGraded(item);
                const late = isSubmissionLate(item.submittedAt, dueDate);
                const className = graded
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                    : late
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/25'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/25';
                return (
                    <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${className}`}
                    >
                        {status}
                    </span>
                );
            },
        },
        {
            header: 'Files',
            key: 'submissionFiles',
            align: 'center' as const,
            render: (item: any) => (
                <div className="flex justify-center gap-2">
                    {item.submissionFiles?.map((f: string, i: number) => (
                        <a
                            key={i}
                            href={f}
                            target="_blank"
                            title="Download File"
                            className="p-2 bg-app-bg rounded-lg text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 border border-border-subtle transition-colors"
                        >
                            <Download size={16} />
                        </a>
                    ))}
                </div>
            ),
        },
        {
            header: 'Score',
            key: 'marksObtained',
            align: 'center' as const,
            render: (item: any) => {
                const graded = isSubmissionGraded(item);
                const label = formatSubmissionScore(item, totalMarks);
                return (
                    <span
                        className={`text-xs font-bold px-2 py-1 rounded-md ${
                            graded
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-app-bg text-text-muted'
                        }`}
                    >
                        {label}
                    </span>
                );
            },
        },
        {
            header: 'Action',
            key: 'action',
            align: 'right' as const,
            render: (item: any) => {
                const graded = isSubmissionGraded(item);
                const marks = getSubmissionMarks(item);
                return (
                    <button
                        onClick={() => {
                            setSelectedSub(item);
                            const initialMarks = marks != null ? String(marks) : '';
                            setGradeData({
                                marksObtained: initialMarks,
                                comments: item.comments || '',
                            });
                            setMarksError(initialMarks ? validateMarks(initialMarks) : null);
                        }}
                        className={`px-4 py-2 rounded-lg text-[11px] font-bold tracking-wide transition-colors ${
                            graded
                                ? 'bg-card-bg text-text-main border border-border-subtle hover:border-accent-blue'
                                : 'bg-accent-blue text-white hover:bg-accent-blue/90'
                        }`}
                    >
                        {graded ? 'Update Grade' : 'Grade Submission'}
                    </button>
                );
            },
        },
    ];

    const isPageLoading = reduxCourseLoading.courseContent[courseId] || !fullData;

    if (isPageLoading)
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
                <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
                <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">
                    Loading assignment…
                </p>
            </div>
        );

    if (!assignment)
        return (
            <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-app-bg">
                <AlertCircle className="text-red-500 mb-4" size={48} />
                <h2 className="text-xl font-extrabold tracking-tight text-text-main mb-2">
                    Assignment Not Found
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
                            onClick={toggleSubmissions}
                            className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-accent-blue text-white hover:bg-hover-blue"
                        >
                            <Users size={14} />
                            {showSubmissions ? 'Hide submissions' : 'Submissions'}
                            {submissions.length > 0 && (
                                <span className="ml-0.5 min-w-[1.25rem] h-5 px-1.5 rounded-md bg-white/20 text-[10px] tabular-nums flex items-center justify-center">
                                    {submissions.length}
                                </span>
                            )}
                        </button>
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
                                    Assignment
                                </span>
                                {pendingCount > 0 && (
                                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-amber-500/10 text-amber-500 border-amber-500/25">
                                        {pendingCount} to grade
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-text-main leading-tight">
                                {assignment.title}
                            </h1>
                            {assignment.objective && (
                                <p className="text-sm text-text-muted font-medium leading-relaxed max-w-2xl line-clamp-2">
                                    {assignment.objective}
                                </p>
                            )}
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 pt-1">
                                {startDate && (
                                    <div className="inline-flex items-center gap-2 text-[12px]">
                                        <Calendar size={14} className="text-accent-blue shrink-0" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                            Start
                                        </span>
                                        <span className="font-semibold text-text-main tabular-nums">
                                            {new Date(startDate).toLocaleString('en-GB')}
                                        </span>
                                    </div>
                                )}
                                <div className="inline-flex items-center gap-2 text-[12px]">
                                    <Calendar size={14} className="text-accent-blue shrink-0" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                        Due
                                    </span>
                                    <span className="font-semibold text-text-main tabular-nums">
                                        {dueDate
                                            ? new Date(dueDate).toLocaleString('en-GB')
                                            : 'Not set'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* KPI strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Kpi
                        icon={ClipboardList}
                        label="Total points"
                        value={String(totalMarks || '—')}
                        support="Max score"
                    />
                    <Kpi
                        icon={Users}
                        label="Submissions"
                        value={
                            submissionsCache[assignmentId] === undefined && isTableLoading
                                ? '…'
                                : String(submissions.length)
                        }
                        support="Student work received"
                        highlight={submissions.length > 0}
                        onClick={openSubmissions}
                    />
                    <Kpi
                        icon={FileCheck2}
                        label="Graded"
                        value={String(gradedCount)}
                        support="Scores recorded"
                    />
                    <Kpi
                        icon={Clock}
                        label="Pending"
                        value={String(pendingCount)}
                        support="Awaiting review"
                        highlight={pendingCount > 0}
                        onClick={openSubmissions}
                    />
                </div>

                {/* Brief */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
                        <h2 className="text-sm font-black uppercase tracking-widest text-text-main">
                            Assignment brief
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <article className="rounded-2xl border border-border-subtle bg-card-bg p-5 md:p-6">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-9 h-9 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center">
                                    <Target size={16} />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    Objective
                                </h3>
                            </div>
                            <p className="text-sm font-medium text-text-main leading-relaxed whitespace-pre-wrap">
                                {assignment.objective || 'No objective provided.'}
                            </p>
                        </article>
                        <article className="rounded-2xl border border-border-subtle bg-card-bg p-5 md:p-6">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-9 h-9 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center">
                                    <FileCheck2 size={16} />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    Deliverables
                                </h3>
                            </div>
                            <p className="text-sm font-medium text-text-main leading-relaxed whitespace-pre-wrap">
                                {assignment.deliverable || 'No requirements provided.'}
                            </p>
                        </article>
                    </div>
                </section>

                {/* Submissions table */}
                {showSubmissions && (
                    <section
                        id="assignment-submissions"
                        className="rounded-2xl border border-border-subtle bg-card-bg shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
                    >
                        <div className="px-5 sm:px-6 py-4 border-b border-border-subtle flex flex-wrap items-center justify-between gap-3 bg-app-bg/40">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-text-main">
                                    Student submissions
                                </h3>
                                <p className="text-[11px] text-text-muted font-medium mt-0.5">
                                    Review files and grade student work
                                </p>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted px-2.5 py-1 bg-card-bg border border-border-subtle rounded-lg tabular-nums">
                                {submissions.length} total
                            </span>
                        </div>
                        <div className="p-2">
                            <UserManagementTable
                                data={submissions}
                                loading={isTableLoading}
                                columnConfig={columnConfig}
                                type="Submission"
                            />
                        </div>
                    </section>
                )}
            </div>

            {/* Grading modal */}
            {selectedSub && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card-bg w-full max-w-md rounded-2xl shadow-xl animate-in zoom-in-95 border border-border-subtle overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center px-6 py-5 border-b border-border-subtle bg-app-bg/50">
                            <div>
                                <h3 className="text-lg font-extrabold tracking-tight text-text-main">
                                    Grade assignment
                                </h3>
                                <p className="text-xs text-text-muted font-medium mt-0.5 capitalize">
                                    {selectedSub.firstName} {selectedSub.lastName}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedSub(null);
                                    setMarksError(null);
                                }}
                                className="p-2 text-text-muted hover:text-text-main hover:bg-card-bg rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-text-muted mb-2 tracking-wider">
                                    Score (Max: {totalMarks || 0})
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={totalMarks || undefined}
                                    step="any"
                                    value={gradeData.marksObtained}
                                    onChange={(e) => handleMarksChange(e.target.value)}
                                    className={`w-full p-3.5 bg-app-bg text-text-main rounded-xl border outline-none focus:ring-1 font-bold transition-all ${
                                        marksError
                                            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                                            : 'border-border-subtle focus:border-accent-blue focus:ring-accent-blue/20'
                                    }`}
                                    placeholder="Enter marks"
                                />
                                {marksError ? (
                                    <p className="mt-2 text-[11px] font-bold text-rose-500">
                                        {marksError}
                                    </p>
                                ) : (
                                    <p className="mt-2 text-[11px] font-medium text-text-muted">
                                        Marks must be between 0 and {totalMarks || 0}.
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-text-muted mb-2 tracking-wider">
                                    Feedback comments
                                </label>
                                <textarea
                                    rows={4}
                                    value={gradeData.comments}
                                    onChange={(e) =>
                                        setGradeData({ ...gradeData, comments: e.target.value })
                                    }
                                    className="w-full p-3.5 bg-app-bg text-text-main rounded-xl border border-border-subtle outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20 font-medium transition-all resize-none"
                                    placeholder="Add feedback for the student..."
                                />
                            </div>
                        </div>

                        <div className="p-6 pt-0 mt-auto">
                            <button
                                type="button"
                                onClick={handleGradeSubmit}
                                disabled={
                                    gradeLoading || !gradeData.marksObtained || !!marksError
                                }
                                className="w-full py-3.5 bg-accent-blue text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 hover:bg-accent-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {gradeLoading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        {isSubmissionGraded(selectedSub)
                                            ? 'Update Grade'
                                            : 'Submit Grade'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

function Kpi({
    icon: Icon,
    label,
    value,
    support,
    highlight,
    onClick,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    support: string;
    highlight?: boolean;
    onClick?: () => void;
}) {
    const className = `rounded-2xl border p-4 text-left transition-all ${
        highlight
            ? 'border-accent-blue/35 bg-accent-blue/[0.07]'
            : 'border-border-subtle bg-card-bg'
    } ${onClick ? 'hover:-translate-y-0.5 hover:border-accent-blue/40 cursor-pointer' : ''}`;

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

    if (onClick) {
        return (
            <button type="button" onClick={onClick} className={className}>
                {body}
            </button>
        );
    }
    return <div className={className}>{body}</div>;
}

export default AssignmentDetailPage;
