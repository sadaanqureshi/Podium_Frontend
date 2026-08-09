'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeft,
    AlertCircle,
    Award,
    ClipboardList,
    FileQuestion,
    ExternalLink,
    Loader2,
} from 'lucide-react';
import {
    getCourseMarksheetAPI,
    resolveMediaUrl,
    type CourseMarksheetResponse,
} from '@/lib/api/apiService';
import { getErrorMessage } from '@/lib/api/errorMessage';

type TabId = 'assignments' | 'quizzes';

export default function CourseMarksheetView({ courseId }: { courseId: number }) {
    const [data, setData] = useState<CourseMarksheetResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorStatus, setErrorStatus] = useState<number | null>(null);
    const [tab, setTab] = useState<TabId>('assignments');

    useEffect(() => {
        if (!Number.isFinite(courseId) || courseId <= 0) {
            setError('Invalid course');
            setLoading(false);
            return;
        }

        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError(null);
            setErrorStatus(null);
            try {
                const res = await getCourseMarksheetAPI(courseId);
                if (!cancelled) setData(res);
            } catch (err: unknown) {
                if (cancelled) return;
                const status =
                    err && typeof err === 'object' && 'status' in err
                        ? Number((err as { status?: number }).status)
                        : null;
                setErrorStatus(status);
                setError(
                    status === 403
                        ? 'You are not enrolled in this course'
                        : getErrorMessage(err, 'Failed to load marksheet')
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [courseId]);

    const hasWork = useMemo(() => {
        if (!data) return false;
        return (data.assignments?.length || 0) + (data.quizzes?.length || 0) > 0;
    }, [data]);

    if (loading) return <MarksheetSkeleton />;

    if (error || !data) {
        return (
            <div className="min-h-screen bg-app-bg text-text-main flex items-center justify-center px-6">
                <div className="max-w-md w-full rounded-2xl border border-border-subtle bg-card-bg p-8 text-center space-y-4 shadow-xl">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                        <AlertCircle size={22} />
                    </div>
                    <h1 className="text-lg font-black tracking-tight">
                        {errorStatus === 403 ? 'Access denied' : 'Marksheet unavailable'}
                    </h1>
                    <p className="text-sm text-text-muted font-medium">
                        {error || 'Something went wrong'}
                    </p>
                    <Link
                        href="/student/enrolled-courses"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest hover:bg-hover-blue"
                    >
                        <ArrowLeft size={14} /> Back to courses
                    </Link>
                </div>
            </div>
        );
    }

    const { student, course, summary } = data;
    const cover = resolveMediaUrl(course?.coverImg) || '/blankcover.jpg';
    const overallPct = summary?.overall?.percentage ?? null;
    const studentName = `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || 'Student';
    const assignments = data.assignments || [];
    const quizzes = data.quizzes || [];

    return (
        <div className="min-h-screen bg-app-bg text-text-main pb-20 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.10),_transparent_50%)]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 md:pt-8 space-y-6">
                <Link
                    href={`/student/enrolled-courses/${courseId}`}
                    className="inline-flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold text-xs uppercase tracking-wider transition-colors"
                >
                    <ArrowLeft size={16} /> Back to course
                </Link>

                <section className="rounded-[1.75rem] border border-border-subtle bg-card-bg p-5 md:p-8 shadow-xl overflow-hidden relative">
                    <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent-blue/10 blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5 md:gap-6">
                        <div className="relative w-full md:w-36 h-28 md:h-24 rounded-2xl overflow-hidden border border-border-subtle shrink-0 bg-app-bg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={cover}
                                alt={course?.courseName || 'Course'}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent-blue">
                                My grades · Marksheet
                            </p>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-text-main leading-tight">
                                {course?.courseName || 'Course'}
                            </h1>
                            <p className="text-sm font-semibold text-text-main">
                                {studentName}
                                {student?.email && (
                                    <span className="text-text-muted font-medium">
                                        {' '}
                                        · {student.email}
                                    </span>
                                )}
                            </p>
                            <p className="text-[12px] text-text-muted font-medium">
                                {summary?.overall?.obtainedMarks ?? 0} /{' '}
                                {summary?.overall?.gradedTotalMarks ?? 0} graded ·{' '}
                                {summary?.overall?.possibleTotalMarks ?? 0} total possible
                            </p>
                        </div>

                        <div className="shrink-0 self-start md:self-center">
                            <div
                                className={`inline-flex flex-col items-center justify-center min-w-[7.5rem] px-5 py-4 rounded-2xl border ${
                                    overallPct == null
                                        ? 'bg-app-bg border-border-subtle'
                                        : 'bg-emerald-500/10 border-emerald-500/25'
                                }`}
                            >
                                <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1">
                                    Overall
                                </p>
                                <p
                                    className={`text-3xl font-black tabular-nums ${
                                        overallPct == null ? 'text-text-muted' : 'text-emerald-500'
                                    }`}
                                >
                                    {overallPct == null ? '—' : `${formatPct(overallPct)}%`}
                                </p>
                                {overallPct == null && (
                                    <p className="text-[10px] font-bold text-text-muted mt-1">
                                        Awaiting grades
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <SummaryCard
                        icon={ClipboardList}
                        label="Assignments"
                        percentage={summary?.assignments?.percentage ?? null}
                        graded={summary?.assignments?.graded ?? 0}
                        total={summary?.assignments?.total ?? 0}
                        submitted={summary?.assignments?.submitted ?? 0}
                        missing={summary?.assignments?.missing ?? 0}
                    />
                    <SummaryCard
                        icon={FileQuestion}
                        label="Quizzes"
                        percentage={summary?.quizzes?.percentage ?? null}
                        graded={summary?.quizzes?.graded ?? 0}
                        total={summary?.quizzes?.total ?? 0}
                        submitted={summary?.quizzes?.submitted ?? 0}
                        missing={summary?.quizzes?.missing ?? 0}
                    />
                    <SummaryCard
                        icon={Award}
                        label="Overall"
                        percentage={summary?.overall?.percentage ?? null}
                        graded={summary?.overall?.gradedItems ?? 0}
                        total={summary?.overall?.totalItems ?? 0}
                        emphasize
                    />
                </div>

                {!hasWork ? (
                    <div className="rounded-2xl border border-dashed border-border-subtle bg-card-bg px-6 py-16 text-center">
                        <p className="text-sm font-bold text-text-main">
                            No graded work yet for this course
                        </p>
                        <p className="text-[12px] text-text-muted mt-1">
                            Assignments and quizzes will appear here once they are published.
                        </p>
                    </div>
                ) : (
                    <section className="rounded-2xl border border-border-subtle bg-card-bg overflow-hidden shadow-sm">
                        <div className="flex gap-1 p-2 border-b border-border-subtle bg-app-bg/40">
                            <TabButton
                                active={tab === 'assignments'}
                                onClick={() => setTab('assignments')}
                                count={assignments.length}
                            >
                                Assignments
                            </TabButton>
                            <TabButton
                                active={tab === 'quizzes'}
                                onClick={() => setTab('quizzes')}
                                count={quizzes.length}
                            >
                                Quizzes
                            </TabButton>
                        </div>

                        <div className="p-3 sm:p-5">
                            {tab === 'assignments' ? (
                                <AssignmentsPanel items={assignments} courseId={courseId} />
                            ) : (
                                <QuizzesPanel items={quizzes} courseId={courseId} />
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

function formatPct(value: number) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatDate(value?: string | null) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '—';
    }
}

function formatMarks(obtained: number | null | undefined, total: number | null | undefined) {
    if (obtained == null || obtained === undefined) return '—';
    if (total == null) return String(obtained);
    return `${obtained} / ${total}`;
}

function statusBadge(status: string) {
    const s = String(status || '').toLowerCase();
    if (s === 'graded') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25';
    if (s === 'submitted' || s === 'late')
        return 'bg-amber-500/10 text-amber-500 border-amber-500/25';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/25';
}

function groupBySection<T extends { sectionTitle?: string | null }>(items: T[]) {
    const map = new Map<string, T[]>();
    for (const item of items) {
        const key = item.sectionTitle?.trim() || 'General';
        const list = map.get(key) || [];
        list.push(item);
        map.set(key, list);
    }
    return Array.from(map.entries());
}

function SummaryCard({
    icon: Icon,
    label,
    percentage,
    graded,
    total,
    submitted,
    missing,
    emphasize,
}: {
    icon: React.ElementType;
    label: string;
    percentage: number | null;
    graded: number;
    total: number;
    submitted?: number;
    missing?: number;
    emphasize?: boolean;
}) {
    return (
        <div
            className={`rounded-2xl border p-5 ${
                emphasize
                    ? 'border-accent-blue/30 bg-accent-blue/[0.06]'
                    : 'border-border-subtle bg-card-bg'
            }`}
        >
            <div className="w-9 h-9 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center mb-3">
                <Icon size={16} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                {label}
            </p>
            <p className="mt-1 text-3xl font-black tabular-nums text-text-main">
                {percentage == null ? '—' : `${formatPct(percentage)}%`}
            </p>
            <p className="mt-1 text-[12px] text-text-muted font-medium">
                {percentage == null ? 'Awaiting grades' : `${graded} / ${total} graded`}
            </p>
            {(submitted != null || missing != null) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    <MiniChip className="bg-emerald-500/10 text-emerald-500" label={`${graded} graded`} />
                    {submitted != null && (
                        <MiniChip
                            className="bg-amber-500/10 text-amber-500"
                            label={`${submitted} submitted`}
                        />
                    )}
                    {missing != null && (
                        <MiniChip
                            className="bg-slate-500/10 text-slate-400"
                            label={`${missing} missing`}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function MiniChip({ label, className }: { label: string; className: string }) {
    return (
        <span
            className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${className}`}
        >
            {label}
        </span>
    );
}

function TabButton({
    active,
    onClick,
    count,
    children,
}: {
    active: boolean;
    onClick: () => void;
    count: number;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                active
                    ? 'bg-text-main text-card-bg dark:bg-accent-blue dark:text-white'
                    : 'text-text-muted hover:bg-card-bg'
            }`}
        >
            {children}
            <span className="tabular-nums opacity-80">{count}</span>
        </button>
    );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusBadge(status)}`}
        >
            {status || 'missing'}
        </span>
    );
}

function AssignmentsPanel({
    items,
    courseId,
}: {
    items: CourseMarksheetResponse['assignments'];
    courseId: number;
}) {
    if (!items.length) return <EmptyPanel label="No assignments in this course yet" />;
    const groups = groupBySection(items);

    return (
        <div className="space-y-6">
            {groups.map(([section, rows]) => (
                <div key={section} className="space-y-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">
                        {section}
                    </h3>
                    <div className="md:hidden space-y-2">
                        {rows.map((item) => (
                            <Link
                                key={item.id}
                                href={`/student/enrolled-courses/${courseId}/section/${item.sectionId}/assignment/${item.id}`}
                                className="block rounded-xl border border-border-subtle bg-app-bg/50 p-4 hover:border-accent-blue/35 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-sm font-bold text-text-main">{item.title}</p>
                                    <StatusBadge status={item.status} />
                                </div>
                                <p className="text-[11px] text-text-muted mt-2">
                                    Due {formatDate(item.dueDate)}
                                </p>
                                <p className="text-sm font-black tabular-nums text-text-main mt-2">
                                    {formatMarks(item.marksObtained, item.totalMarks)}
                                </p>
                                {item.comments && (
                                    <p className="text-[12px] text-text-muted mt-1 line-clamp-2">
                                        {item.comments}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-border-subtle">
                        <table className="w-full text-left">
                            <thead className="bg-app-bg/60 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <tr>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Due</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Marks</th>
                                    <th className="px-4 py-3">Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t border-border-subtle hover:bg-accent-blue/[0.04]"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/student/enrolled-courses/${courseId}/section/${item.sectionId}/assignment/${item.id}`}
                                                className="text-sm font-bold text-text-main hover:text-accent-blue"
                                            >
                                                {item.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-[12px] text-text-muted font-medium whitespace-nowrap">
                                            {formatDate(item.dueDate)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="px-4 py-3 text-sm font-black tabular-nums">
                                            {formatMarks(item.marksObtained, item.totalMarks)}
                                        </td>
                                        <td className="px-4 py-3 text-[12px] text-text-muted max-w-xs truncate">
                                            {item.comments || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}

function QuizzesPanel({
    items,
    courseId,
}: {
    items: CourseMarksheetResponse['quizzes'];
    courseId: number;
}) {
    if (!items.length) return <EmptyPanel label="No quizzes in this course yet" />;
    const groups = groupBySection(items);

    return (
        <div className="space-y-6">
            {groups.map(([section, rows]) => (
                <div key={section} className="space-y-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">
                        {section}
                    </h3>
                    <div className="md:hidden space-y-2">
                        {rows.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-xl border border-border-subtle bg-app-bg/50 p-4 space-y-2"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-sm font-bold text-text-main">{item.title}</p>
                                    <StatusBadge status={item.attemptStatus} />
                                </div>
                                <p className="text-sm font-black tabular-nums">
                                    {formatMarks(item.marksObtained, item.totalMarks)}
                                </p>
                                <p className="text-[11px] text-text-muted">
                                    Submitted {formatDate(item.submittedAt)}
                                </p>
                                {item.comments && (
                                    <p className="text-[12px] text-text-muted line-clamp-2">
                                        {item.comments}
                                    </p>
                                )}
                                {item.attemptStatus !== 'missing' && item.attemptId != null && (
                                    <Link
                                        href={`/student/enrolled-courses/${courseId}/section/${item.sectionId}/quiz/${item.id}`}
                                        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-accent-blue"
                                    >
                                        View result <ExternalLink size={12} />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-border-subtle">
                        <table className="w-full text-left">
                            <thead className="bg-app-bg/60 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <tr>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Marks</th>
                                    <th className="px-4 py-3">Submitted</th>
                                    <th className="px-4 py-3">Comments</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t border-border-subtle hover:bg-accent-blue/[0.04]"
                                    >
                                        <td className="px-4 py-3 text-sm font-bold text-text-main">
                                            {item.title}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={item.attemptStatus} />
                                        </td>
                                        <td className="px-4 py-3 text-sm font-black tabular-nums">
                                            {formatMarks(item.marksObtained, item.totalMarks)}
                                        </td>
                                        <td className="px-4 py-3 text-[12px] text-text-muted whitespace-nowrap">
                                            {formatDate(item.submittedAt)}
                                        </td>
                                        <td className="px-4 py-3 text-[12px] text-text-muted max-w-xs truncate">
                                            {item.comments || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {item.attemptStatus !== 'missing' &&
                                                item.attemptId != null && (
                                                    <Link
                                                        href={`/student/enrolled-courses/${courseId}/section/${item.sectionId}/quiz/${item.id}`}
                                                        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-accent-blue hover:underline"
                                                    >
                                                        View result <ExternalLink size={12} />
                                                    </Link>
                                                )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyPanel({ label }: { label: string }) {
    return <div className="py-14 text-center text-sm font-medium text-text-muted">{label}</div>;
}

function MarksheetSkeleton() {
    return (
        <div className="min-h-screen bg-app-bg px-4 sm:px-6 pt-8 pb-20">
            <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
                <div className="h-4 w-32 rounded bg-card-bg border border-border-subtle" />
                <div className="h-40 rounded-[1.75rem] bg-card-bg border border-border-subtle" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-36 rounded-2xl bg-card-bg border border-border-subtle"
                        />
                    ))}
                </div>
                <div className="h-80 rounded-2xl bg-card-bg border border-border-subtle flex items-center justify-center gap-3 text-text-muted">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">
                        Loading marksheet…
                    </span>
                </div>
            </div>
        </div>
    );
}
