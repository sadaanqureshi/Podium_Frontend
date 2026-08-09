'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    Mail,
    Phone,
    Hash,
    Calendar,
    BookOpen,
    Clock3,
    XCircle,
    CheckCircle2,
    CreditCard,
    ExternalLink,
    ImageIcon,
    Percent,
    ClipboardList,
} from 'lucide-react';
import {
    getAdminStudentByIdAPI,
    type AdminStudentProfileResponse,
} from '@/lib/api/apiService';
import { getErrorMessage } from '@/lib/api/errorMessage';

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

const formatMoney = (value: string | null | undefined) => {
    if (value == null || value === '') return '—';
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return `Rs ${n.toLocaleString()}`;
};

const enrollmentBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'enrolled')
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'rejected' || s === 'dismissed')
        return 'bg-red-500/10 text-red-500 border-red-500/20';
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
};

const paymentBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'paid' || s === 'free')
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'failed') return 'bg-red-500/10 text-red-500 border-red-500/20';
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
};

const attendanceBadge = (status: string) => {
    if (status === 'present')
        return {
            className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            Icon: CheckCircle2,
            label: 'Present',
        };
    if (status === 'absent')
        return {
            className: 'bg-red-500/10 text-red-500 border-red-500/20',
            Icon: XCircle,
            label: 'Absent',
        };
    return {
        className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        Icon: Clock3,
        label: status || 'Pending',
    };
};

export default function AdminStudentProfilePage({
    params,
}: {
    params: Promise<{ studentId: string }>;
}) {
    const { studentId: studentIdParam } = use(params);
    const studentId = Number(studentIdParam);

    const [data, setData] = useState<AdminStudentProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!studentId || Number.isNaN(studentId)) {
            setError('Student not found');
            setLoading(false);
            return;
        }

        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getAdminStudentByIdAPI(studentId);
                if (!cancelled) setData(res);
            } catch (err) {
                if (!cancelled) {
                    setError(getErrorMessage(err, 'Failed to load student profile'));
                    setData(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [studentId]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-app-bg text-text-muted">
                <Loader2 className="animate-spin text-accent-blue" size={28} />
                <p className="text-[10px] font-black uppercase tracking-widest">
                    Loading student profile…
                </p>
            </div>
        );
    }

    if (error || !data?.student) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-app-bg px-6 text-center">
                <AlertCircle className="text-red-500" size={36} />
                <p className="text-sm font-black uppercase tracking-wider text-text-main">
                    {error || 'Student not found'}
                </p>
                <Link
                    href="/admin/student"
                    className="text-accent-blue text-xs font-bold uppercase tracking-wider hover:underline"
                >
                    Back to students
                </Link>
            </div>
        );
    }

    const { student, stats, enrollments, recentAttendance } = data;
    const rate =
        stats.attendanceRatePercent == null
            ? '—'
            : `${Math.round(stats.attendanceRatePercent)}%`;

    return (
        <div className="p-4 md:p-8 bg-app-bg min-h-screen text-text-main space-y-8 pb-16">
            <Link
                href="/admin/student"
                className="inline-flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold text-xs uppercase tracking-wider transition-colors"
            >
                <ArrowLeft size={16} /> Back to registry
            </Link>

            {/* Header */}
            <section className="relative overflow-hidden rounded-[2rem] border border-border-subtle bg-card-bg p-6 md:p-10 shadow-sm">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.14),_transparent_55%)]" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex items-start gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-2xl bg-accent-blue text-white flex items-center justify-center font-black text-lg shrink-0">
                            {(student.firstName?.[0] || 'S').toUpperCase()}
                        </div>
                        <div className="min-w-0 space-y-2">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase truncate">
                                {student.firstName} {student.lastName}
                            </h1>
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                                <span className="inline-flex items-center gap-1.5">
                                    <Mail size={12} className="text-accent-blue" />
                                    {student.email}
                                </span>
                                {student.contactNumber && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Phone size={12} className="text-accent-blue" />
                                        {student.contactNumber}
                                    </span>
                                )}
                                {student.rollNumber && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Hash size={12} className="text-accent-blue" />
                                        {student.rollNumber}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar size={12} className="text-accent-blue" />
                                    Joined {formatDate(student.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <span
                        className={`self-start px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            student.isActive
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/25'
                        }`}
                    >
                        {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </section>

            {/* Profile stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
                <StatCard
                    label="Enrolled Courses"
                    value={String(stats.enrolledCourses ?? 0)}
                    icon={BookOpen}
                    accent="text-accent-blue bg-accent-blue/10"
                />
                <StatCard
                    label="Pending / Rejected"
                    value={`${stats.pendingEnrollments ?? 0} / ${stats.rejectedEnrollments ?? 0}`}
                    icon={ClipboardList}
                    accent="text-amber-500 bg-amber-500/10"
                />
                <StatCard
                    label="Attendance Rate"
                    value={rate}
                    sub={`${stats.attendancePresent ?? 0} present · ${stats.attendanceAbsent ?? 0} absent`}
                    icon={Percent}
                    accent="text-emerald-500 bg-emerald-500/10"
                />
                <StatCard
                    label="Total Paid"
                    value={formatMoney(stats.totalPaidAmount)}
                    icon={CreditCard}
                    accent="text-violet-400 bg-violet-500/10"
                />
                <StatCard
                    label="Pending Payments"
                    value={String(stats.pendingPayments ?? 0)}
                    icon={Clock3}
                    accent="text-amber-500 bg-amber-500/10"
                />
                <StatCard
                    label="Failed Payments"
                    value={String(stats.failedPayments ?? 0)}
                    icon={XCircle}
                    accent="text-red-500 bg-red-500/10"
                />
            </div>

            {/* Enrollments */}
            <section className="bg-card-bg border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-text-muted">
                    Enrollments ({enrollments?.length ?? 0})
                </h2>
                {!enrollments?.length ? (
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider py-8 text-center">
                        No enrollments for this student
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {enrollments.map((en) => {
                            const teacher = en.course?.teacher
                                ? `${en.course.teacher.firstName} ${en.course.teacher.lastName}`.trim()
                                : null;
                            return (
                                <li
                                    key={en.id}
                                    className="rounded-xl border border-border-subtle bg-app-bg p-4 flex flex-col sm:flex-row gap-4"
                                >
                                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-card-bg shrink-0 border border-border-subtle">
                                        {en.course?.coverImg ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={en.course.coverImg}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-text-muted/40">
                                                <ImageIcon size={18} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-black tracking-tight truncate">
                                                    {en.course?.courseName || 'Untitled course'}
                                                </p>
                                                {teacher && (
                                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                                                        Teacher · {teacher}
                                                    </p>
                                                )}
                                            </div>
                                            <span
                                                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${enrollmentBadge(en.status)}`}
                                            >
                                                {en.status}
                                            </span>
                                        </div>

                                        {en.status === 'rejected' && (
                                            <p className="text-xs text-red-500 font-medium">
                                                Reason:{' '}
                                                {en.rejectionReason?.trim() || 'No reason provided'}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                            {en.transaction && (
                                                <>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-md border ${paymentBadge(en.transaction.status)}`}
                                                    >
                                                        {en.transaction.status}
                                                    </span>
                                                    <span>{formatMoney(en.transaction.amount)}</span>
                                                    {en.transaction.screenshotUrl && (
                                                        <a
                                                            href={en.transaction.screenshotUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-accent-blue hover:underline"
                                                        >
                                                            Proof <ExternalLink size={11} />
                                                        </a>
                                                    )}
                                                </>
                                            )}
                                            <span>Requested {formatDate(en.createdAt)}</span>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            {/* Recent attendance */}
            <section className="bg-card-bg border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-text-muted">
                    Recent Attendance
                </h2>
                {!recentAttendance?.length ? (
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider py-8 text-center">
                        No recent attendance
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {recentAttendance.map((item) => {
                            const b = attendanceBadge(item.status);
                            const BadgeIcon = b.Icon;
                            return (
                                <li
                                    key={item.attendanceId}
                                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-app-bg border border-border-subtle"
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-black tracking-tight truncate">
                                            {item.lectureTitle}
                                        </p>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">
                                            {item.courseName} · {item.attendanceDate || 'Not dated'}
                                        </p>
                                    </div>
                                    <span
                                        className={`inline-flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${b.className}`}
                                    >
                                        <BadgeIcon size={11} />
                                        {b.label}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}

function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    accent,
}: {
    label: string;
    value: string;
    sub?: string;
    icon: React.ComponentType<{ size?: number }>;
    accent: string;
}) {
    return (
        <div className="bg-card-bg border border-border-subtle rounded-2xl p-4 shadow-sm flex items-start gap-3">
            <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}
            >
                <Icon size={18} />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest truncate">
                    {label}
                </p>
                <p className="text-lg font-black tabular-nums leading-tight mt-0.5">{value}</p>
                {sub && (
                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-1">
                        {sub}
                    </p>
                )}
            </div>
        </div>
    );
}
