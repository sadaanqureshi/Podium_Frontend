'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    Mail,
    Phone,
    Calendar,
    BookOpen,
    Inbox,
    Users,
    NotebookPen,
    CalendarCheck,
    ImageIcon,
    Tag,
} from 'lucide-react';
import {
    getAdminTeacherByIdAPI,
    type AdminTeacherProfileResponse,
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
    if (value == null || value === '') return 'Free';
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    if (n === 0) return 'Free';
    return `Rs ${n.toLocaleString()}`;
};

const teacherStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'accepted')
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'rejected') return 'bg-red-500/10 text-red-500 border-red-500/20';
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
};

export default function AdminTeacherProfilePage({
    params,
}: {
    params: Promise<{ teacherId: string }>;
}) {
    const { teacherId: teacherIdParam } = use(params);
    const teacherId = Number(teacherIdParam);

    const [data, setData] = useState<AdminTeacherProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!teacherId || Number.isNaN(teacherId)) {
            setError('Teacher not found');
            setLoading(false);
            return;
        }

        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getAdminTeacherByIdAPI(teacherId);
                if (!cancelled) setData(res);
            } catch (err) {
                if (!cancelled) {
                    setError(getErrorMessage(err, 'Failed to load teacher profile'));
                    setData(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [teacherId]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-app-bg text-text-muted">
                <Loader2 className="animate-spin text-accent-blue" size={28} />
                <p className="text-[10px] font-black uppercase tracking-widest">
                    Loading teacher profile…
                </p>
            </div>
        );
    }

    if (error || !data?.teacher) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-app-bg px-6 text-center">
                <AlertCircle className="text-red-500" size={36} />
                <p className="text-sm font-black uppercase tracking-wider text-text-main">
                    {error || 'Teacher not found'}
                </p>
                <Link
                    href="/admin/teacher"
                    className="text-accent-blue text-xs font-bold uppercase tracking-wider hover:underline"
                >
                    Back to teachers
                </Link>
            </div>
        );
    }

    const { teacher, stats, courses } = data;

    return (
        <div className="p-4 md:p-8 bg-app-bg min-h-screen text-text-main space-y-8 pb-16">
            <Link
                href="/admin/teacher"
                className="inline-flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold text-xs uppercase tracking-wider transition-colors"
            >
                <ArrowLeft size={16} /> Back to list
            </Link>

            {/* Header */}
            <section className="relative overflow-hidden rounded-[2rem] border border-border-subtle bg-card-bg p-6 md:p-10 shadow-sm">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.14),_transparent_55%)]" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex items-start gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-2xl bg-accent-blue text-white flex items-center justify-center font-black text-lg shrink-0">
                            {(teacher.firstName?.[0] || 'T').toUpperCase()}
                        </div>
                        <div className="min-w-0 space-y-2">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase truncate">
                                {teacher.firstName} {teacher.lastName}
                            </h1>
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                                <span className="inline-flex items-center gap-1.5">
                                    <Mail size={12} className="text-accent-blue" />
                                    {teacher.email}
                                </span>
                                {teacher.contactNumber && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Phone size={12} className="text-accent-blue" />
                                        {teacher.contactNumber}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar size={12} className="text-accent-blue" />
                                    Joined {formatDate(teacher.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <span
                        className={`self-start px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            teacher.isActive
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/25'
                        }`}
                    >
                        {teacher.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </section>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
                <StatCard
                    label="Accepted Courses"
                    value={String(stats.acceptedCourses ?? 0)}
                    icon={BookOpen}
                    accent="text-accent-blue bg-accent-blue/10"
                />
                <StatCard
                    label="Pending Assignments"
                    value={String(stats.pendingCourseAssignments ?? 0)}
                    icon={Inbox}
                    accent="text-amber-500 bg-amber-500/10"
                />
                <StatCard
                    label="Students Enrolled"
                    value={String(stats.studentsEnrolled ?? 0)}
                    icon={Users}
                    accent="text-emerald-500 bg-emerald-500/10"
                />
                <StatCard
                    label="To Grade"
                    value={String(stats.pendingSubmissionsToGrade ?? 0)}
                    icon={NotebookPen}
                    accent="text-violet-400 bg-violet-500/10"
                />
                <StatCard
                    label="Unmarked Attendance"
                    value={String(stats.unmarkedAttendanceSessions ?? 0)}
                    icon={CalendarCheck}
                    accent="text-red-400 bg-red-500/10"
                />
            </div>

            {/* Courses */}
            <section className="bg-card-bg border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-text-muted">
                    Courses ({courses?.length ?? 0})
                    {stats.totalAssignedCourses != null && (
                        <span className="text-text-muted/70 font-bold normal-case tracking-normal ml-2">
                            · {stats.totalAssignedCourses} assigned total
                        </span>
                    )}
                </h2>
                {!courses?.length ? (
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider py-8 text-center">
                        No courses assigned to this teacher
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {courses.map((course) => (
                            <li
                                key={course.id}
                                className="rounded-xl border border-border-subtle bg-app-bg p-4 flex flex-col sm:flex-row gap-4"
                            >
                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-card-bg shrink-0 border border-border-subtle">
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
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-black tracking-tight truncate">
                                                {course.courseName || 'Untitled course'}
                                            </p>
                                            {course.shortDescription && (
                                                <p className="text-xs text-text-muted font-medium line-clamp-2 mt-0.5">
                                                    {course.shortDescription}
                                                </p>
                                            )}
                                        </div>
                                        <span
                                            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shrink-0 ${teacherStatusBadge(course.teacherStatus)}`}
                                        >
                                            {course.teacherStatus}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                        {course.courseCategory?.name && (
                                            <span className="inline-flex items-center gap-1">
                                                <Tag size={11} className="text-accent-blue" />
                                                {course.courseCategory.name}
                                            </span>
                                        )}
                                        <span className="text-accent-blue">
                                            {formatMoney(course.price)}
                                        </span>
                                        {course.teacherStatus === 'accepted' && (
                                            <span>
                                                {course.enrolledStudentsCount ?? 0} students
                                            </span>
                                        )}
                                        <span
                                            className={
                                                course.isActive === false
                                                    ? 'text-rose-500'
                                                    : 'text-emerald-500'
                                            }
                                        >
                                            {course.isActive === false ? 'Inactive' : 'Active'}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    accent,
}: {
    label: string;
    value: string;
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
            </div>
        </div>
    );
}
