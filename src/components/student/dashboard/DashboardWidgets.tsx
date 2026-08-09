'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    BookOpen,
    ClipboardList,
    Percent,
    CalendarCheck,
    CheckCircle2,
    XCircle,
    Clock3,
    Sparkles,
    ArrowUpRight,
    ExternalLink,
    Inbox,
    ImageIcon,
    Video,
    NotebookPen,
    NotepadText,
    BookCopy,
} from 'lucide-react';
import type { StudentDashboardResponse } from '@/lib/api/apiService';
import { formatRelativeTime } from '@/lib/adminDashboardFormat';
import { useCountUp } from '@/components/admin/dashboard/useCountUp';

type Metrics = StudentDashboardResponse['metrics'];
type RecentCourses = StudentDashboardResponse['recentCourses'];
type PendingEnrollments = StudentDashboardResponse['pendingEnrollments'];
type RecentUpdates = StudentDashboardResponse['recentUpdates'];
type RecentAttendance = StudentDashboardResponse['recentAttendance'];

const getUpdateHref = (item: RecentUpdates[number]): string => {
    const courseId = item.course?.id;
    if (!courseId) return '/student/enrolled-courses';
    const sectionId = item.section?.id;
    if (!sectionId) return `/student/enrolled-courses/${courseId}`;
    switch (item.type) {
        case 'lecture':
            return `/student/enrolled-courses/${courseId}/section/${sectionId}/lecture/${item.id}`;
        case 'assignment':
            return `/student/enrolled-courses/${courseId}/section/${sectionId}/assignment/${item.id}`;
        case 'quiz':
            return `/student/enrolled-courses/${courseId}/section/${sectionId}/quiz/${item.id}`;
        case 'resource':
            return `/student/enrolled-courses/${courseId}/section/${sectionId}/resource/${item.id}`;
        default:
            return `/student/enrolled-courses/${courseId}`;
    }
};

function statusBadge(status: string) {
    const s = status.toLowerCase();
    if (s === 'present' || s === 'enrolled' || s === 'paid')
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'absent' || s === 'rejected' || s === 'failed')
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    if (s === '-' || s === 'pending')
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-accent-blue/10 text-accent-blue border-accent-blue/20';
}

export function StudentKpiGrid({ metrics, updatesCount }: { metrics: Metrics; updatesCount: number }) {
    const cards = [
        {
            label: 'Enrolled courses',
            value: metrics.enrolledCoursesCount,
            support: 'Active learning path',
            href: '/student/enrolled-courses',
            icon: BookOpen,
            delay: 0,
        },
        {
            label: 'Pending requests',
            value: metrics.pendingEnrollmentCount,
            support: 'Awaiting admin review',
            href: '/student/enrollment-requests',
            icon: ClipboardList,
            highlight: metrics.pendingEnrollmentCount > 0,
            delay: 40,
        },
        {
            label: 'Avg progress',
            valueLabel:
                metrics.averageProgressPercent == null
                    ? '—'
                    : `${Math.round(metrics.averageProgressPercent)}%`,
            value: metrics.averageProgressPercent ?? 0,
            support: 'Across enrolled courses',
            href: '/student/enrolled-courses',
            icon: Percent,
            useLabel: metrics.averageProgressPercent != null,
            delay: 80,
        },
        {
            label: 'Attendance rate',
            valueLabel:
                metrics.attendance.ratePercent == null
                    ? '—'
                    : `${Math.round(metrics.attendance.ratePercent)}%`,
            value: metrics.attendance.ratePercent ?? 0,
            support: `${metrics.attendance.total} sessions tracked`,
            href: '/student/attendance',
            icon: CalendarCheck,
            useLabel: metrics.attendance.ratePercent != null,
            delay: 120,
        },
        {
            label: 'Present',
            value: metrics.attendance.present,
            support: 'Marked present',
            href: '/student/attendance',
            icon: CheckCircle2,
            delay: 160,
        },
        {
            label: 'Absent',
            value: metrics.attendance.absent,
            support: 'Missed sessions',
            href: '/student/attendance',
            icon: XCircle,
            highlight: metrics.attendance.absent > 0,
            delay: 200,
        },
        {
            label: 'Pending marks',
            value: metrics.attendance.pending,
            support: 'Not yet marked',
            href: '/student/attendance',
            icon: Clock3,
            highlight: metrics.attendance.pending > 0,
            delay: 240,
        },
        {
            label: 'Recent updates',
            value: updatesCount,
            support: 'New lectures & work',
            href: '/student/course-updates',
            icon: Sparkles,
            delay: 280,
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {cards.map((card) => (
                <KpiCard key={card.label} {...card} />
            ))}
        </div>
    );
}

function KpiCard({
    label,
    value,
    valueLabel,
    support,
    href,
    icon: Icon,
    highlight,
    delay = 0,
    useLabel,
}: {
    label: string;
    value?: number;
    valueLabel?: string;
    support: string;
    href: string;
    icon: React.ElementType;
    highlight?: boolean;
    delay?: number;
    useLabel?: boolean;
}) {
    const animated = useCountUp(value ?? 0, 900, value != null && !useLabel);
    const display = useLabel ? valueLabel : valueLabel ?? animated;

    return (
        <Link
            href={href}
            style={{ animationDelay: `${delay}ms` }}
            className={`group relative overflow-hidden rounded-2xl border p-4 md:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-in fade-in slide-in-from-bottom-3 fill-mode-both ${
                highlight
                    ? 'border-accent-blue/35 bg-accent-blue/[0.07]'
                    : 'border-border-subtle bg-card-bg hover:border-accent-blue/30'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center">
                    <Icon size={18} />
                </div>
                <ArrowUpRight
                    size={16}
                    className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-accent-blue transition-all"
                />
            </div>
            <p className="mt-4 text-2xl md:text-3xl font-black tabular-nums tracking-tight text-text-main">
                {display}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
                {label}
            </p>
            <p className="mt-1.5 text-[11px] font-medium text-text-muted leading-snug">{support}</p>
        </Link>
    );
}

export function StudentActionPanel({
    pendingEnrollments,
    recentUpdates,
    recentAttendance,
}: {
    pendingEnrollments: PendingEnrollments;
    recentUpdates: RecentUpdates;
    recentAttendance: RecentAttendance;
}) {
    const dueWork = recentUpdates.filter(
        (u) => u.type === 'assignment' || u.type === 'quiz'
    );

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-lg md:text-xl font-black tracking-tight text-text-main">
                    Needs your attention
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">
                    Requests · new work · attendance
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <ActionColumn
                    title="Pending requests"
                    href="/student/enrollment-requests"
                    empty="No enrollment requests waiting."
                    items={pendingEnrollments.map((item) => ({
                        key: String(item.id),
                        title: item.courseName,
                        subtitle: item.paymentStatus
                            ? `Payment · ${item.paymentStatus}`
                            : 'Awaiting review',
                        meta: 'Pending',
                        time: formatRelativeTime(item.createdAt),
                        href: '/student/enrollment-requests',
                        cta: 'View',
                        thumb: item.coverImg,
                        showThumb: true,
                    }))}
                />
                <ActionColumn
                    title="New assignments & quizzes"
                    href="/student/course-updates"
                    empty="No new assignments or quizzes."
                    items={dueWork.map((item) => ({
                        key: `${item.type}-${item.id}`,
                        title: item.title,
                        subtitle: item.course.courseName,
                        meta: item.type,
                        time: formatRelativeTime(item.occurredAt),
                        href: getUpdateHref(item),
                        cta: 'Open',
                    }))}
                />
                <ActionColumn
                    title="Recent attendance"
                    href="/student/attendance"
                    empty="No recent attendance records."
                    items={recentAttendance.map((item) => ({
                        key: String(item.attendanceId),
                        title: item.lectureTitle,
                        subtitle: item.courseName,
                        meta: item.status === '-' ? 'pending' : item.status,
                        time: item.attendanceDate || '—',
                        href: `/student/enrolled-courses/${item.courseId}`,
                        cta: 'Open',
                    }))}
                />
            </div>
        </section>
    );
}

function ActionColumn({
    title,
    href,
    empty,
    items,
}: {
    title: string;
    href: string;
    empty: string;
    items: Array<{
        key: string;
        title: string;
        subtitle: string;
        meta: string;
        time: string;
        href: string;
        cta: string;
        thumb?: string | null;
        showThumb?: boolean;
    }>;
}) {
    return (
        <div className="rounded-2xl border border-border-subtle bg-card-bg overflow-hidden flex flex-col min-h-[280px]">
            <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between gap-2 bg-app-bg/40">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-text-main">
                    {title}
                </h3>
                <Link
                    href={href}
                    className="text-[10px] font-black uppercase tracking-widest text-accent-blue hover:underline"
                >
                    View all
                </Link>
            </div>
            <div className="flex-1 p-3 space-y-2">
                {!items.length ? (
                    <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center px-4">
                        <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center mb-3">
                            <Inbox size={20} />
                        </div>
                        <p className="text-xs font-medium text-text-muted">{empty}</p>
                    </div>
                ) : (
                    items.slice(0, 5).map((item) => (
                        <Link
                            key={item.key}
                            href={item.href}
                            className="flex items-center gap-3 rounded-xl border border-transparent hover:border-accent-blue/25 hover:bg-accent-blue/[0.06] px-3 py-2.5 transition-colors"
                        >
                            {item.showThumb ? (
                                item.thumb ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={item.thumb}
                                        alt=""
                                        className="w-10 h-10 rounded-lg object-cover border border-border-subtle shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-app-bg border border-border-subtle flex items-center justify-center text-text-muted shrink-0">
                                        <ImageIcon size={14} />
                                    </div>
                                )
                            ) : null}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-black text-text-main truncate">
                                    {item.title}
                                </p>
                                <p className="text-[11px] text-text-muted truncate">
                                    {item.subtitle}
                                </p>
                                <p className="text-[10px] text-text-muted mt-0.5">{item.time}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-xs font-black text-accent-blue capitalize">
                                    {item.meta}
                                </p>
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest text-text-muted mt-1">
                                    {item.cta} <ExternalLink size={10} />
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

export function StudentActivityPanel({
    recentCourses,
    recentUpdates,
    recentAttendance,
}: {
    recentCourses: RecentCourses;
    recentUpdates: RecentUpdates;
    recentAttendance: RecentAttendance;
}) {
    const [tab, setTab] = useState<'courses' | 'updates' | 'attendance'>('courses');

    const tabs = [
        { id: 'courses' as const, label: 'Courses', count: recentCourses.length },
        { id: 'updates' as const, label: 'Updates', count: recentUpdates.length },
        { id: 'attendance' as const, label: 'Attendance', count: recentAttendance.length },
    ];

    const iconFor = (type: string) => {
        if (type === 'lecture') return Video;
        if (type === 'assignment') return NotebookPen;
        if (type === 'quiz') return NotepadText;
        return BookCopy;
    };

    return (
        <section className="rounded-2xl border border-border-subtle bg-card-bg overflow-hidden">
            <div className="px-5 md:px-6 py-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-app-bg/40">
                <div>
                    <h2 className="text-lg font-black tracking-tight text-text-main">
                        Recent activity
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">
                        Your learning feed
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                tab === t.id
                                    ? 'bg-accent-blue text-white border-accent-blue'
                                    : 'border-border-subtle text-text-muted hover:text-text-main'
                            }`}
                        >
                            {t.label}
                            <span className="ml-1.5 tabular-nums opacity-80">{t.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-3 md:p-4 space-y-1.5">
                {tab === 'courses' &&
                    (recentCourses.length ? (
                        recentCourses.map((course) => {
                            const pct = course.progressPercent ?? 0;
                            return (
                                <Link
                                    key={course.enrollmentId}
                                    href={`/student/enrolled-courses/${course.courseId}`}
                                    className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent-blue/[0.06] transition-colors"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={course.coverImg || '/blankcover.jpg'}
                                        alt=""
                                        className="w-11 h-11 rounded-xl object-cover border border-border-subtle shrink-0"
                                    />
                                    <div className="min-w-0 flex-1 space-y-1.5">
                                        <p className="text-sm font-black text-text-main truncate">
                                            {course.courseName}
                                        </p>
                                        <div className="h-1.5 rounded-full bg-border-subtle overflow-hidden max-w-[220px]">
                                            <div
                                                className="h-full bg-accent-blue rounded-full"
                                                style={{ width: `${Math.min(pct, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs font-black tabular-nums text-accent-blue whitespace-nowrap">
                                        {course.progressPercent == null
                                            ? '—'
                                            : `${Math.round(course.progressPercent)}%`}
                                    </span>
                                    <span className="text-[10px] font-bold text-text-muted whitespace-nowrap">
                                        {course.overall.completed}/{course.overall.total}
                                    </span>
                                </Link>
                            );
                        })
                    ) : (
                        <EmptyRecent label="No enrolled courses yet" />
                    ))}

                {tab === 'updates' &&
                    (recentUpdates.length ? (
                        recentUpdates.map((item) => {
                            const Icon = iconFor(item.type);
                            return (
                                <Link
                                    key={`${item.type}-${item.id}`}
                                    href={getUpdateHref(item)}
                                    className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent-blue/[0.06] transition-colors"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center shrink-0 border border-accent-blue/20">
                                        <Icon size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-black text-text-main truncate">
                                            {item.title}
                                        </p>
                                        <p className="text-[11px] text-text-muted truncate">
                                            {item.course.courseName}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusBadge(item.type)}`}
                                    >
                                        {item.type}
                                    </span>
                                    <span className="text-[10px] font-bold text-text-muted whitespace-nowrap">
                                        {formatRelativeTime(item.occurredAt)}
                                    </span>
                                </Link>
                            );
                        })
                    ) : (
                        <EmptyRecent label="No recent course updates" />
                    ))}

                {tab === 'attendance' &&
                    (recentAttendance.length ? (
                        recentAttendance.map((item) => (
                            <Link
                                key={item.attendanceId}
                                href={`/student/enrolled-courses/${item.courseId}`}
                                className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent-blue/[0.06] transition-colors"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-black text-text-main truncate">
                                        {item.lectureTitle}
                                    </p>
                                    <p className="text-[11px] text-text-muted truncate">
                                        {item.courseName}
                                    </p>
                                </div>
                                <span
                                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusBadge(item.status === '-' ? 'pending' : item.status)}`}
                                >
                                    {item.status === '-' ? 'pending' : item.status}
                                </span>
                                <span className="text-[10px] font-bold text-text-muted whitespace-nowrap">
                                    {item.attendanceDate || '—'}
                                </span>
                            </Link>
                        ))
                    ) : (
                        <EmptyRecent label="No recent attendance" />
                    ))}
            </div>
        </section>
    );
}

function EmptyRecent({ label }: { label: string }) {
    return (
        <div className="py-16 text-center text-xs font-medium text-text-muted">{label}</div>
    );
}
