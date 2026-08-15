'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    BookOpen,
    Inbox,
    Users,
    NotebookPen,
    CalendarCheck,
    Calendar,
    ArrowUpRight,
    ExternalLink,
    ImageIcon,
    CheckCircle2,
    Clock3,
    Link2,
} from 'lucide-react';
import type { TeacherDashboardResponse } from '@/lib/api/apiService';
import { formatRelativeTime } from '@/lib/adminDashboardFormat';
import { useCountUp } from '@/components/admin/dashboard/useCountUp';
import {
    teacherGradingItemHref,
    teacherGradingItemKey,
} from '@/lib/teacherDashboardEnrichment';

type Metrics = TeacherDashboardResponse['metrics'];
type RecentCourses = TeacherDashboardResponse['recentCourses'];
type PendingAssignments = TeacherDashboardResponse['pendingCourseAssignments'];
type GradingQueue = TeacherDashboardResponse['gradingQueue'];
type RecentAttendance = TeacherDashboardResponse['recentAttendance'];
type GoogleCalendar = TeacherDashboardResponse['googleCalendar'];

function statusBadge(status: string) {
    const s = status.toLowerCase();
    if (s === 'accepted' || s === 'marked' || s === 'connected')
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'rejected') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    if (s === 'pending' || s === 'unmarked' || s === 'needs action')
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-accent-blue/10 text-accent-blue border-accent-blue/20';
}

export function TeacherKpiGrid({
    metrics,
    googleCalendar,
    gradingQueueCount = 0,
}: {
    metrics: Metrics;
    googleCalendar: GoogleCalendar;
    gradingQueueCount?: number;
}) {
    const calendarConnected =
        googleCalendar?.connected === true || metrics.googleCalendarConnected === true;

    const cards = [
        {
            label: 'Accepted courses',
            value: metrics.acceptedCoursesCount ?? 0,
            support: 'Courses you teach',
            href: '/teacher/assigned-courses',
            icon: BookOpen,
            delay: 0,
        },
        {
            label: 'Pending invites',
            value: metrics.pendingCourseAssignmentCount ?? 0,
            support: 'Course assignments waiting',
            href: '/teacher/course-assignments',
            icon: Inbox,
            highlight: (metrics.pendingCourseAssignmentCount ?? 0) > 0,
            delay: 40,
        },
        {
            label: 'Students',
            value: metrics.studentsEnrolledCount ?? 0,
            support: 'Across accepted courses',
            href: '/teacher/assigned-courses',
            icon: Users,
            delay: 80,
        },
        {
            label: 'To grade',
            value: metrics.submissionsToGradeCount ?? 0,
            support: 'Assignments & quizzes awaiting review',
            href: '/teacher/assigned-courses',
            icon: NotebookPen,
            highlight: (metrics.submissionsToGradeCount ?? 0) > 0,
            delay: 120,
        },
        {
            label: 'Unmarked attendance',
            value: metrics.unmarkedAttendanceCount ?? 0,
            support: 'Sessions need marking',
            href: '/teacher/attendance',
            icon: CalendarCheck,
            highlight: (metrics.unmarkedAttendanceCount ?? 0) > 0,
            delay: 160,
        },
        {
            label: 'Open workload',
            value:
                (metrics.pendingCourseAssignmentCount ?? 0) +
                (metrics.submissionsToGradeCount ?? 0) +
                (metrics.unmarkedAttendanceCount ?? 0),
            support: 'Invites + grading + attendance',
            href: '/teacher/assigned-courses',
            icon: Clock3,
            delay: 200,
        },
        {
            label: 'Items in queue',
            value: gradingQueueCount,
            support: 'Assignments & quizzes with pending work',
            href: '/teacher/assigned-courses',
            icon: NotebookPen,
            highlight: gradingQueueCount > 0,
            delay: 240,
        },
        {
            label: 'Calendar',
            valueLabel: calendarConnected ? 'On' : 'Off',
            support: calendarConnected
                ? googleCalendar?.googleEmail || 'Google linked'
                : 'Connect in profile',
            href: '/teacher/profile',
            icon: Calendar,
            highlight: !calendarConnected,
            useLabel: true,
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
            className={`group rounded-2xl border p-3 md:p-5 h-full ${
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
            <p className="mt-3 md:mt-4 text-xl md:text-3xl font-black tabular-nums tracking-tight text-text-main">
                {display}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-text-muted leading-tight">
                {label}
            </p>
            <p className="mt-1.5 text-[11px] font-medium text-text-muted leading-snug min-h-0 md:min-h-[2.25rem]">{support}</p>
        </Link>
    );
}

export function TeacherActionPanel({
    pendingCourseAssignments,
    gradingQueue,
    recentAttendance,
}: {
    pendingCourseAssignments: PendingAssignments;
    gradingQueue: GradingQueue;
    recentAttendance: RecentAttendance;
}) {
    const unmarked = recentAttendance.filter((a) => !a.isMarked);

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-lg md:text-xl font-black tracking-tight text-text-main">
                    Action required
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">
                    Invites · grading · attendance
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <ActionColumn
                    title="Course invites"
                    href="/teacher/course-assignments"
                    empty="No course invitations pending."
                    items={pendingCourseAssignments.map((item) => ({
                        key: String(item.courseId),
                        title: item.courseName,
                        subtitle: item.needsAction ? 'Needs your response' : item.teacherStatus,
                        meta: item.teacherStatus || 'pending',
                        time: formatRelativeTime(item.updatedAt || item.createdAt),
                        href: '/teacher/course-assignments',
                        cta: 'Review',
                        thumb: item.coverImg,
                        showThumb: true,
                    }))}
                />
                <ActionColumn
                    title="Grading queue"
                    href="/teacher/assigned-courses"
                    empty="Nothing waiting to grade."
                    items={gradingQueue.map((item) => ({
                        key: teacherGradingItemKey(item),
                        title: item.title,
                        subtitle: `${item.courseName} · ${item.kind === 'quiz' ? 'Quiz' : 'Assignment'}`,
                        meta: `${item.pendingSubmissionCount} pending`,
                        time: item.dueDate
                            ? `Due ${formatRelativeTime(item.dueDate)}`
                            : 'No due date',
                        href: teacherGradingItemHref(item),
                        cta: 'Grade',
                    }))}
                />
                <ActionColumn
                    title="Unmarked attendance"
                    href="/teacher/attendance"
                    empty="All recent sessions are marked."
                    items={unmarked.map((item) => ({
                        key: String(item.attendanceId),
                        title: item.lectureTitle,
                        subtitle: item.courseName || 'Course',
                        meta: 'Unmarked',
                        time: item.attendanceDate || '—',
                        href: '/teacher/attendance',
                        cta: 'Mark',
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

export function TeacherActivityPanel({
    recentCourses,
    gradingQueue,
    recentAttendance,
    googleCalendar,
}: {
    recentCourses: RecentCourses;
    gradingQueue: GradingQueue;
    recentAttendance: RecentAttendance;
    googleCalendar: GoogleCalendar;
}) {
    const [tab, setTab] = useState<'courses' | 'grading' | 'attendance'>('courses');
    const connected = googleCalendar?.connected === true;

    const tabs = [
        { id: 'courses' as const, label: 'Courses', count: recentCourses.length },
        { id: 'grading' as const, label: 'Grading', count: gradingQueue.length },
        { id: 'attendance' as const, label: 'Attendance', count: recentAttendance.length },
    ];

    return (
        <section className="space-y-4">
            <div className="rounded-2xl border border-border-subtle bg-card-bg overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-app-bg/40">
                    <div>
                        <h2 className="text-lg font-black tracking-tight text-text-main">
                            Recent activity
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">
                            Teaching feed
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
                            recentCourses.map((course) => (
                                <Link
                                    key={course.courseId}
                                    href={`/teacher/assigned-courses/${course.courseId}`}
                                    className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent-blue/[0.06] transition-colors"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={course.coverImg || '/blankcover.jpg'}
                                        alt=""
                                        className="w-11 h-11 rounded-xl object-cover border border-border-subtle shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-black text-text-main truncate">
                                            {course.courseName}
                                        </p>
                                        <p className="text-[11px] text-text-muted truncate">
                                            {course.enrolledStudentsCount ?? 0} students enrolled
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusBadge(course.teacherStatus || 'accepted')}`}
                                    >
                                        {course.teacherStatus || 'accepted'}
                                    </span>
                                </Link>
                            ))
                        ) : (
                            <EmptyRecent label="No accepted courses yet" />
                        ))}

                    {tab === 'grading' &&
                        (gradingQueue.length ? (
                            gradingQueue.map((item) => (
                                <Link
                                    key={teacherGradingItemKey(item)}
                                    href={teacherGradingItemHref(item)}
                                    className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent-blue/[0.06] transition-colors"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center shrink-0 border border-accent-blue/20">
                                        <NotebookPen size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-black text-text-main truncate">
                                            {item.title}
                                        </p>
                                        <p className="text-[11px] text-text-muted truncate">
                                            {item.courseName} ·{' '}
                                            {item.kind === 'quiz' ? 'Quiz' : 'Assignment'}
                                        </p>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-accent-blue/10 text-accent-blue border-accent-blue/20">
                                        {item.pendingSubmissionCount} pending
                                    </span>
                                    <span className="text-[10px] font-bold text-text-muted whitespace-nowrap">
                                        {item.dueDate
                                            ? formatRelativeTime(item.dueDate)
                                            : '—'}
                                    </span>
                                </Link>
                            ))
                        ) : (
                            <EmptyRecent label="Nothing in the grading queue" />
                        ))}

                    {tab === 'attendance' &&
                        (recentAttendance.length ? (
                            recentAttendance.map((item) => {
                                const marked = item.isMarked === true;
                                return (
                                    <Link
                                        key={item.attendanceId}
                                        href="/teacher/attendance"
                                        className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent-blue/[0.06] transition-colors"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-black text-text-main truncate">
                                                {item.lectureTitle}
                                            </p>
                                            <p className="text-[11px] text-text-muted truncate">
                                                {item.courseName || 'Course'}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusBadge(marked ? 'marked' : 'unmarked')}`}
                                        >
                                            {marked ? 'Marked' : 'Unmarked'}
                                        </span>
                                        <span className="text-[10px] font-bold text-text-muted whitespace-nowrap">
                                            {item.attendanceDate || '—'}
                                        </span>
                                    </Link>
                                );
                            })
                        ) : (
                            <EmptyRecent label="No recent attendance sessions" />
                        ))}
                </div>
            </div>

            <Link
                href="/teacher/profile"
                className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-card-bg p-5 hover:border-accent-blue/30 transition-colors"
            >
                <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        connected
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500'
                    }`}
                >
                    {connected ? <CheckCircle2 size={20} /> : <Link2 size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-text-main">Google Calendar</p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                        {connected
                            ? googleCalendar.googleEmail ||
                              'Linked for live lecture scheduling'
                            : 'Connect from your profile to schedule live lectures'}
                    </p>
                </div>
                <span
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusBadge(connected ? 'connected' : 'pending')}`}
                >
                    {connected ? 'Connected' : 'Connect'}
                </span>
                <ArrowUpRight size={16} className="text-text-muted shrink-0" />
            </Link>
        </section>
    );
}

function EmptyRecent({ label }: { label: string }) {
    return (
        <div className="py-16 text-center text-xs font-medium text-text-muted">{label}</div>
    );
}
