'use client';

import React from 'react';
import Link from 'next/link';
import {
    BookOpen,
    ClipboardList,
    Percent,
    CalendarCheck,
    ImageIcon,
    ChevronRight,
    Video,
    NotebookPen,
    NotepadText,
    BookCopy,
    CheckCircle2,
    XCircle,
    Clock3,
} from 'lucide-react';
import type { StudentDashboardResponse } from '@/lib/api/apiService';

const getUpdateHref = (
    item: StudentDashboardResponse['recentUpdates'][number]
): string => {
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

const formatDate = (value: string | null) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatRelative = (value: string | null) => {
    if (!value) return 'Recently';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const mins = Math.floor((Date.now() - d.getTime()) / 60_000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(value);
};

export function DashboardMetricCards({
    metrics,
}: {
    metrics: StudentDashboardResponse['metrics'];
}) {
    const cards = [
        {
            label: 'Enrolled Courses',
            value: String(metrics.enrolledCoursesCount),
            href: '/student/enrolled-courses',
            icon: BookOpen,
            accent: 'text-accent-blue bg-accent-blue/10',
        },
        {
            label: 'Pending Requests',
            value: String(metrics.pendingEnrollmentCount),
            href: '/student/enrollment-requests',
            icon: ClipboardList,
            accent: 'text-amber-500 bg-amber-500/10',
        },
        {
            label: 'Avg Progress',
            value:
                metrics.averageProgressPercent == null
                    ? '—'
                    : `${Math.round(metrics.averageProgressPercent)}%`,
            href: '/student/enrolled-courses',
            icon: Percent,
            accent: 'text-emerald-500 bg-emerald-500/10',
        },
        {
            label: 'Attendance Rate',
            value:
                metrics.attendance.ratePercent == null
                    ? '—'
                    : `${Math.round(metrics.attendance.ratePercent)}%`,
            href: '/student/attendance',
            icon: CalendarCheck,
            accent: 'text-violet-400 bg-violet-500/10',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <Link
                        key={card.label}
                        href={card.href}
                        className="bg-card-bg border border-border-subtle rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-accent-blue/40 transition-colors"
                    >
                        <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.accent}`}
                        >
                            <Icon size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest truncate">
                                {card.label}
                            </p>
                            <p className="text-2xl font-black tabular-nums">{card.value}</p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

export function RecentCoursesWidget({
    courses,
}: {
    courses: StudentDashboardResponse['recentCourses'];
}) {
    return (
        <WidgetShell
            title="Recent Courses"
            href="/student/enrolled-courses"
            empty={!courses.length}
            emptyLabel="No enrolled courses yet"
        >
            <ul className="space-y-3">
                {courses.map((course) => {
                    const pct = course.progressPercent ?? 0;
                    return (
                        <li key={course.enrollmentId}>
                            <Link
                                href={`/student/enrolled-courses/${course.courseId}`}
                                className="flex items-center gap-3 p-3 rounded-xl bg-app-bg border border-border-subtle hover:border-accent-blue/40 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-card-bg shrink-0">
                                    {course.coverImg ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={course.coverImg}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-text-muted/40">
                                            <ImageIcon size={18} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <p className="text-xs font-black uppercase tracking-tight truncate">
                                        {course.courseName}
                                    </p>
                                    <div className="h-1.5 rounded-full bg-border-subtle overflow-hidden">
                                        <div
                                            className="h-full bg-accent-blue rounded-full"
                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                        {course.progressPercent == null
                                            ? '—'
                                            : `${Math.round(course.progressPercent)}%`}{' '}
                                        · {course.overall.completed}/{course.overall.total}
                                    </p>
                                </div>
                                <ChevronRight size={16} className="text-text-muted shrink-0" />
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </WidgetShell>
    );
}

export function PendingEnrollmentsWidget({
    items,
}: {
    items: StudentDashboardResponse['pendingEnrollments'];
}) {
    return (
        <WidgetShell
            title="Pending Requests"
            href="/student/enrollment-requests"
            empty={!items.length}
            emptyLabel="No pending enrollment requests"
        >
            <ul className="space-y-3">
                {items.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-app-bg border border-border-subtle"
                    >
                        <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-tight truncate">
                                {item.courseName}
                            </p>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">
                                {formatDate(item.createdAt)}
                            </p>
                        </div>
                        <span className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-amber-500/10 border-amber-500/20 text-amber-500">
                            {item.paymentStatus || 'pending'}
                        </span>
                    </li>
                ))}
            </ul>
        </WidgetShell>
    );
}

export function RecentUpdatesWidget({
    updates,
}: {
    updates: StudentDashboardResponse['recentUpdates'];
}) {
    const iconFor = (type: string) => {
        if (type === 'lecture') return Video;
        if (type === 'assignment') return NotebookPen;
        if (type === 'quiz') return NotepadText;
        return BookCopy;
    };

    return (
        <WidgetShell
            title="Recent Updates"
            href="/student/course-updates"
            empty={!updates.length}
            emptyLabel="No recent course updates"
        >
            <ul className="space-y-3">
                {updates.map((item) => {
                    const Icon = iconFor(item.type);
                    const href = getUpdateHref(item);
                    return (
                        <li key={`${item.type}-${item.id}`}>
                            <Link
                                href={href}
                                className="flex items-start gap-3 p-3 rounded-xl bg-app-bg border border-border-subtle hover:border-accent-blue/40 transition-colors"
                            >
                                <div className="w-9 h-9 rounded-lg bg-accent-blue/10 text-accent-blue flex items-center justify-center shrink-0">
                                    <Icon size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-accent-blue">
                                        {item.type}
                                    </p>
                                    <p className="text-xs font-black uppercase tracking-tight truncate mt-0.5">
                                        {item.title}
                                    </p>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">
                                        {item.course.courseName} · {formatRelative(item.occurredAt)}
                                    </p>
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </WidgetShell>
    );
}

export function RecentAttendanceWidget({
    items,
}: {
    items: StudentDashboardResponse['recentAttendance'];
}) {
    const badge = (status: string) => {
        if (status === 'present')
            return {
                label: 'Present',
                className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
                Icon: CheckCircle2,
            };
        if (status === 'absent')
            return {
                label: 'Absent',
                className: 'bg-red-500/10 border-red-500/20 text-red-500',
                Icon: XCircle,
            };
        return {
            label: 'Pending',
            className: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
            Icon: Clock3,
        };
    };

    return (
        <WidgetShell
            title="Recent Attendance"
            href="/student/attendance"
            empty={!items.length}
            emptyLabel="No recent attendance"
        >
            <ul className="space-y-3">
                {items.map((item) => {
                    const b = badge(item.status);
                    const BadgeIcon = b.Icon;
                    return (
                        <li
                            key={item.attendanceId}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-app-bg border border-border-subtle"
                        >
                            <div className="min-w-0">
                                <p className="text-xs font-black uppercase tracking-tight truncate">
                                    {item.lectureTitle}
                                </p>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">
                                    {item.courseName} · {item.attendanceDate || 'Not dated'}
                                </p>
                            </div>
                            <span
                                className={`inline-flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${b.className}`}
                            >
                                <BadgeIcon size={11} />
                                {b.label}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </WidgetShell>
    );
}

function WidgetShell({
    title,
    href,
    children,
    empty,
    emptyLabel,
}: {
    title: string;
    href: string;
    children: React.ReactNode;
    empty: boolean;
    emptyLabel: string;
}) {
    return (
        <div className="bg-card-bg border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
                    {title}
                </h3>
                <Link
                    href={href}
                    className="text-[10px] font-black uppercase tracking-widest text-accent-blue hover:underline"
                >
                    View all
                </Link>
            </div>
            {empty ? (
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider py-6 text-center">
                    {emptyLabel}
                </p>
            ) : (
                children
            )}
        </div>
    );
}
