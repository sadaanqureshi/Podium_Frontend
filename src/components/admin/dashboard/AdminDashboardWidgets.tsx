'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Users,
    GraduationCap,
    BookOpen,
    ClipboardList,
    Inbox,
    DollarSign,
    Clock,
    Activity,
    ExternalLink,
    ImageIcon,
    ArrowUpRight,
} from 'lucide-react';
import type { AdminDashboardResponse } from '@/lib/api/apiService';
import { resolveMediaUrl } from '@/lib/api/apiService';
import { formatMoney, formatRelativeTime } from '@/lib/adminDashboardFormat';
import { useCountUp } from '@/components/admin/dashboard/useCountUp';

type Metrics = AdminDashboardResponse['metrics'];
type ActionRequired = AdminDashboardResponse['actionRequired'];
type RecentActivity = AdminDashboardResponse['recentActivity'];

function statusBadge(status: string) {
    const s = status.toLowerCase();
    if (s === 'enrolled' || s === 'accepted')
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'rejected') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    if (s === 'unassigned' || s === 'dismissed')
        return 'bg-text-muted/10 text-text-muted border-border-subtle';
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
}

export function AdminKpiGrid({ metrics }: { metrics: Metrics }) {
    const cards = [
        {
            label: 'Students',
            value: metrics.students.total,
            support: `+${metrics.students.newThisMonth} this month · ${metrics.students.active} active`,
            href: '/admin/student',
            icon: Users,
            delay: 0,
        },
        {
            label: 'Teachers',
            value: metrics.teachers.total,
            support: `+${metrics.teachers.newThisMonth} this month · ${metrics.teachers.active} active`,
            href: '/admin/teacher',
            icon: GraduationCap,
            delay: 40,
        },
        {
            label: 'Courses',
            value: metrics.courses.total,
            support: `${metrics.courses.active} active · ${metrics.courses.withoutTeacher} without teacher`,
            href: '/admin/courses',
            icon: BookOpen,
            delay: 80,
        },
        {
            label: 'Enrollments pending',
            value: metrics.enrollments.pending,
            support: `${metrics.enrollments.total} total enrollments`,
            href: '/admin/enrollments?status=pending',
            icon: ClipboardList,
            highlight: metrics.enrollments.pending > 0,
            delay: 120,
        },
        {
            label: 'Assignments pending',
            value: metrics.teacherAssignments.pending,
            support: `${metrics.teacherAssignments.unassigned} unassigned courses`,
            href: '/admin/teacher-assignments?status=pending',
            icon: Inbox,
            highlight: metrics.teacherAssignments.pending > 0,
            delay: 160,
        },
        {
            label: 'Total revenue',
            valueLabel: formatMoney(metrics.revenue.totalRevenue),
            support: `${metrics.revenue.paidCount} paid · ${metrics.revenue.freeCount} free`,
            href: '/admin/fees',
            icon: DollarSign,
            delay: 200,
        },
        {
            label: 'Pending payments',
            valueLabel: formatMoney(metrics.revenue.pendingAmount),
            support: `${metrics.revenue.pendingCount} awaiting review`,
            href: '/admin/fees',
            icon: Clock,
            highlight: metrics.revenue.pendingCount > 0,
            delay: 240,
        },
        {
            label: 'Workload',
            value: metrics.workload.pendingSubmissionsToGrade,
            support: `${metrics.workload.unmarkedAttendanceSessions} unmarked attendance`,
            href: '/admin/courses',
            icon: Activity,
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
}: {
    label: string;
    value?: number;
    valueLabel?: string;
    support: string;
    href: string;
    icon: React.ElementType;
    highlight?: boolean;
    delay?: number;
}) {
    const animated = useCountUp(value ?? 0, 900, value != null);

    return (
        <Link
            href={href}
            style={{ animationDelay: `${delay}ms` }}
            className={`group relative overflow-hidden rounded-2xl border p-3 md:p-5 h-full shadow-sm transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-lg animate-in fade-in slide-in-from-bottom-3 fill-mode-both ${
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
                {valueLabel ?? animated}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-text-muted leading-tight">
                {label}
            </p>
            <p className="mt-1.5 text-[11px] font-medium text-text-muted leading-snug min-h-0 md:min-h-[2.25rem]">{support}</p>
        </Link>
    );
}

export function ActionRequiredPanel({ actionRequired }: { actionRequired: ActionRequired }) {
    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-lg md:text-xl font-black tracking-tight text-text-main">
                    Action required
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">
                    Triage queue · enrollments · teachers · fees
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <ActionColumn
                    title="Pending enrollments"
                    href="/admin/enrollments?status=pending"
                    empty="No enrollment requests waiting."
                    items={actionRequired.pendingEnrollments.map((item) => ({
                        key: String(item.id),
                        title: item.studentName,
                        subtitle: item.courseName,
                        meta: formatMoney(item.amount),
                        time: formatRelativeTime(item.createdAt),
                        href: '/admin/enrollments?status=pending',
                        cta: 'Review',
                        thumb: item.screenshotUrl,
                        showThumb: true,
                    }))}
                />
                <ActionColumn
                    title="Teacher assignments"
                    href="/admin/teacher-assignments?status=pending"
                    empty="No teacher invitations pending."
                    items={actionRequired.pendingTeacherAssignments.map((item) => ({
                        key: String(item.courseId),
                        title: item.courseName,
                        subtitle: item.teacherName || 'Unassigned',
                        meta: item.assignmentStatus,
                        time: formatRelativeTime(item.updatedAt),
                        href: '/admin/teacher-assignments?status=pending',
                        cta: 'Assign',
                    }))}
                />
                <ActionColumn
                    title="Pending payments"
                    href="/admin/fees"
                    empty="No payment proofs awaiting review."
                    items={actionRequired.pendingPayments.map((item) => ({
                        key: item.uuid,
                        title: item.studentName,
                        subtitle: item.courseName,
                        meta: formatMoney(item.amount),
                        time: formatRelativeTime(item.createdAt),
                        href: '/admin/fees',
                        cta: 'Open',
                        thumb: item.screenshotUrl,
                        showThumb: true,
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
                    items.slice(0, 5).map((item) => {
                        const thumb = resolveMediaUrl(item.thumb);
                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                className="flex items-center gap-3 rounded-xl border border-transparent hover:border-accent-blue/25 hover:bg-accent-blue/[0.06] px-3 py-2.5 transition-colors"
                            >
                                {item.showThumb ? (
                                    thumb ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={thumb}
                                            alt=""
                                            className="w-10 h-10 rounded-lg object-cover border border-border-subtle shrink-0"
                                            referrerPolicy="no-referrer"
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
                        );
                    })
                )}
            </div>
        </div>
    );
}

export function RecentActivityPanel({ recentActivity }: { recentActivity: RecentActivity }) {
    const [tab, setTab] = useState<'enrollments' | 'courses' | 'students'>('enrollments');

    const tabs = [
        {
            id: 'enrollments' as const,
            label: 'Enrollments',
            count: recentActivity.recentEnrollments.length,
        },
        {
            id: 'courses' as const,
            label: 'Courses',
            count: recentActivity.recentCourses.length,
        },
        {
            id: 'students' as const,
            label: 'Students',
            count: recentActivity.recentStudents.length,
        },
    ];

    return (
        <section className="rounded-2xl border border-border-subtle bg-card-bg overflow-hidden">
            <div className="px-5 md:px-6 py-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-app-bg/40">
                <div>
                    <h2 className="text-lg font-black tracking-tight text-text-main">
                        Recent activity
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">
                        Latest platform movement
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
                {tab === 'enrollments' &&
                    (recentActivity.recentEnrollments.length ? (
                        recentActivity.recentEnrollments.map((item) => (
                            <Link
                                key={item.id}
                                href="/admin/enrollments"
                                className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent-blue/[0.06] transition-colors"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-black text-text-main truncate">
                                        {item.studentName}
                                    </p>
                                    <p className="text-[11px] text-text-muted truncate">
                                        {item.courseName}
                                    </p>
                                </div>
                                <span
                                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusBadge(item.status)}`}
                                >
                                    {item.status}
                                </span>
                                <span className="text-[10px] font-bold text-text-muted whitespace-nowrap">
                                    {formatRelativeTime(item.createdAt)}
                                </span>
                            </Link>
                        ))
                    ) : (
                        <EmptyRecent label="No recent enrollments" />
                    ))}

                {tab === 'courses' &&
                    (recentActivity.recentCourses.length ? (
                        recentActivity.recentCourses.map((item) => (
                            <Link
                                key={item.id}
                                href={`/admin/courses/${item.id}`}
                                className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent-blue/[0.06] transition-colors"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.coverImg || '/blankcover.jpg'}
                                    alt=""
                                    className="w-11 h-11 rounded-xl object-cover border border-border-subtle shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-black text-text-main truncate">
                                        {item.courseName}
                                    </p>
                                    <p className="text-[11px] text-text-muted truncate">
                                        {item.teacherName || 'No teacher'}
                                    </p>
                                </div>
                                <span
                                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusBadge(item.teacherStatus)}`}
                                >
                                    {item.teacherStatus}
                                </span>
                                <span className="text-[10px] font-bold text-text-muted whitespace-nowrap">
                                    {formatRelativeTime(item.createdAt)}
                                </span>
                            </Link>
                        ))
                    ) : (
                        <EmptyRecent label="No recent courses" />
                    ))}

                {tab === 'students' &&
                    (recentActivity.recentStudents.length ? (
                        recentActivity.recentStudents.map((item) => (
                            <Link
                                key={item.id}
                                href={`/admin/student/${item.id}`}
                                className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent-blue/[0.06] transition-colors"
                            >
                                <div className="w-11 h-11 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center font-black text-sm uppercase shrink-0 border border-accent-blue/20">
                                    {item.firstName?.[0] || 'S'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-black text-text-main truncate">
                                        {item.firstName} {item.lastName}
                                    </p>
                                    <p className="text-[11px] text-text-muted truncate">
                                        {item.email}
                                    </p>
                                </div>
                                <span className="text-[10px] font-bold text-text-muted whitespace-nowrap">
                                    {formatRelativeTime(item.createdAt)}
                                </span>
                            </Link>
                        ))
                    ) : (
                        <EmptyRecent label="No recent students" />
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
