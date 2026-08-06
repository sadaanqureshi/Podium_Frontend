'use client';

import React from 'react';
import Link from 'next/link';
import {
    BookOpen,
    Inbox,
    Users,
    NotebookPen,
    CalendarCheck,
    ImageIcon,
    ChevronRight,
    CheckCircle2,
    Clock3,
    Calendar,
    Link2,
} from 'lucide-react';
import type { TeacherDashboardResponse } from '@/lib/api/apiService';

const formatDate = (value: string | null | undefined) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export function TeacherMetricCards({
    metrics,
}: {
    metrics: TeacherDashboardResponse['metrics'];
}) {
    const cards = [
        {
            label: 'Accepted Courses',
            value: String(metrics.acceptedCoursesCount ?? 0),
            href: '/teacher/assigned-courses',
            icon: BookOpen,
            accent: 'text-accent-blue bg-accent-blue/10',
        },
        {
            label: 'Pending Assignments',
            value: String(metrics.pendingCourseAssignmentCount ?? 0),
            href: '/teacher/course-assignments',
            icon: Inbox,
            accent: 'text-amber-500 bg-amber-500/10',
        },
        {
            label: 'Students',
            value: String(metrics.studentsEnrolledCount ?? 0),
            href: '/teacher/assigned-courses',
            icon: Users,
            accent: 'text-emerald-500 bg-emerald-500/10',
        },
        {
            label: 'To Grade',
            value: String(metrics.submissionsToGradeCount ?? 0),
            href: '/teacher/assigned-courses',
            icon: NotebookPen,
            accent: 'text-violet-400 bg-violet-500/10',
        },
        {
            label: 'Unmarked Attendance',
            value: String(metrics.unmarkedAttendanceCount ?? 0),
            href: '/teacher/attendance',
            icon: CalendarCheck,
            accent: 'text-red-400 bg-red-500/10',
        },
    ];

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Link
                            key={card.label}
                            href={card.href}
                            className="bg-card-bg border border-border-subtle rounded-2xl p-4 md:p-5 shadow-sm flex items-center gap-3 hover:border-accent-blue/40 transition-colors"
                        >
                            <div
                                className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 ${card.accent}`}
                            >
                                <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest truncate">
                                    {card.label}
                                </p>
                                <p className="text-xl md:text-2xl font-black tabular-nums">
                                    {card.value}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    metrics.googleCalendarConnected
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500'
                        : 'bg-amber-500/10 border-amber-500/25 text-amber-500'
                }`}
            >
                <Calendar size={12} />
                Google Calendar{' '}
                {metrics.googleCalendarConnected ? 'connected' : 'not connected'}
            </div>
        </div>
    );
}

export function RecentCoursesWidget({
    courses,
}: {
    courses: TeacherDashboardResponse['recentCourses'];
}) {
    return (
        <WidgetShell
            title="Recent Courses"
            href="/teacher/assigned-courses"
            empty={!courses.length}
            emptyLabel="No accepted courses yet"
        >
            <ul className="space-y-3">
                {courses.map((course) => (
                    <li key={course.courseId}>
                        <Link
                            href={`/teacher/assigned-courses/${course.courseId}`}
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
                            <div className="flex-1 min-w-0 space-y-1">
                                <p className="text-xs font-black uppercase tracking-tight truncate">
                                    {course.courseName}
                                </p>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                    {course.enrolledStudentsCount ?? 0} students enrolled
                                </p>
                            </div>
                            <ChevronRight size={16} className="text-text-muted shrink-0" />
                        </Link>
                    </li>
                ))}
            </ul>
        </WidgetShell>
    );
}

export function PendingCourseAssignmentsWidget({
    items,
}: {
    items: TeacherDashboardResponse['pendingCourseAssignments'];
}) {
    return (
        <WidgetShell
            title="Pending Course Assignments"
            href="/teacher/course-assignments"
            empty={!items.length}
            emptyLabel="No pending course assignments"
        >
            <ul className="space-y-3">
                {items.map((item) => (
                    <li key={item.courseId}>
                        <Link
                            href="/teacher/course-assignments"
                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-app-bg border border-border-subtle hover:border-accent-blue/40 transition-colors"
                        >
                            <div className="min-w-0 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-card-bg shrink-0">
                                    {item.coverImg ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={item.coverImg}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-text-muted/40">
                                            <ImageIcon size={16} />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-black uppercase tracking-tight truncate">
                                        {item.courseName}
                                    </p>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">
                                        {formatDate(item.createdAt)}
                                    </p>
                                </div>
                            </div>
                            {item.needsAction && (
                                <span className="shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-amber-500/10 border-amber-500/20 text-amber-500">
                                    Action required
                                </span>
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
        </WidgetShell>
    );
}

export function GradingQueueWidget({
    items,
}: {
    items: TeacherDashboardResponse['gradingQueue'];
}) {
    return (
        <WidgetShell
            title="Grading Queue"
            href="/teacher/assigned-courses"
            empty={!items.length}
            emptyLabel="Nothing waiting to grade"
        >
            <ul className="space-y-3">
                {items.map((item) => (
                    <li key={item.assignmentId}>
                        <Link
                            href={`/teacher/assigned-courses/${item.courseId}`}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-app-bg border border-border-subtle hover:border-accent-blue/40 transition-colors"
                        >
                            <div className="min-w-0">
                                <p className="text-xs font-black uppercase tracking-tight truncate">
                                    {item.title}
                                </p>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">
                                    {item.courseName}
                                    {item.dueDate ? ` · Due ${formatDate(item.dueDate)}` : ''}
                                </p>
                            </div>
                            <span className="shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-violet-500/10 border-violet-500/20 text-violet-400">
                                {item.pendingSubmissionCount} pending
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </WidgetShell>
    );
}

export function RecentAttendanceWidget({
    items,
}: {
    items: TeacherDashboardResponse['recentAttendance'];
}) {
    return (
        <WidgetShell
            title="Recent Attendance"
            href="/teacher/attendance"
            empty={!items.length}
            emptyLabel="No recent attendance sessions"
        >
            <ul className="space-y-3">
                {items.map((item) => {
                    const marked = item.isMarked === true;
                    return (
                        <li key={item.attendanceId}>
                            <Link
                                href="/teacher/attendance"
                                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-app-bg border border-border-subtle hover:border-accent-blue/40 transition-colors"
                            >
                                <div className="min-w-0">
                                    <p className="text-xs font-black uppercase tracking-tight truncate">
                                        {item.lectureTitle}
                                    </p>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">
                                        {item.courseName || 'Course'} ·{' '}
                                        {item.attendanceDate || 'Not dated'}
                                    </p>
                                    {!marked && (
                                        <p className="text-[10px] font-black uppercase tracking-widest text-accent-blue mt-1.5">
                                            Mark attendance →
                                        </p>
                                    )}
                                </div>
                                <span
                                    className={`inline-flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                        marked
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                            : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                    }`}
                                >
                                    {marked ? (
                                        <CheckCircle2 size={11} />
                                    ) : (
                                        <Clock3 size={11} />
                                    )}
                                    {marked ? 'Marked' : 'Pending'}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </WidgetShell>
    );
}

export function GoogleCalendarStatusWidget({
    googleCalendar,
}: {
    googleCalendar: TeacherDashboardResponse['googleCalendar'];
}) {
    const connected = googleCalendar?.connected === true;

    return (
        <div className="bg-card-bg border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
                    Google Calendar
                </h3>
                <Link
                    href="/teacher/profile"
                    className="text-[10px] font-black uppercase tracking-widest text-accent-blue hover:underline"
                >
                    {connected ? 'Manage' : 'Connect'}
                </Link>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-app-bg border border-border-subtle">
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        connected
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500'
                    }`}
                >
                    {connected ? <CheckCircle2 size={18} /> : <Link2 size={18} />}
                </div>
                <div className="min-w-0 space-y-1">
                    <p className="text-xs font-black uppercase tracking-tight">
                        {connected ? 'Connected' : 'Not connected'}
                    </p>
                    <p className="text-[11px] font-medium text-text-muted leading-relaxed">
                        {connected
                            ? googleCalendar.googleEmail ||
                              'Your Google Calendar is linked for live lectures.'
                            : 'Connect Google Calendar from your profile to schedule live lectures.'}
                    </p>
                </div>
            </div>
        </div>
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
