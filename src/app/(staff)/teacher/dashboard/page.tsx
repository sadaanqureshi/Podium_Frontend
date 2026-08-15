'use client';

import React, { Suspense, useEffect } from 'react';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchTeacherDashboard } from '@/lib/store/features/teacherDashboardSlice';
import { useToast } from '@/context/ToastContext';
import {
    TeacherKpiGrid,
    TeacherActionPanel,
    TeacherActivityPanel,
} from '@/components/teacher/dashboard/TeacherDashboardWidgets';
import {
    StudentsPerCourseChart,
    WorkloadSnapshotChart,
    AttendanceMarkStatusChart,
    GradingQueueChart,
} from '@/components/teacher/dashboard/TeacherDashboardCharts';

function TeacherDashboardInner() {
    const dispatch = useAppDispatch();
    const { showToast } = useToast();
    const { data, loading, error } = useAppSelector((s) => s.teacherDashboard);

    const refresh = () => {
        dispatch(fetchTeacherDashboard());
    };

    useEffect(() => {
        if (data) return;
        dispatch(fetchTeacherDashboard());
    }, [dispatch, data]);

    useEffect(() => {
        if (error && data) {
            showToast(error, 'error');
        }
    }, [error, data, showToast]);

    if (loading && !data) {
        return <DashboardSkeleton />;
    }

    if (error && !data) {
        return (
            <div className="min-h-screen bg-app-bg text-text-main flex items-center justify-center px-6">
                <div className="max-w-md w-full rounded-2xl border border-border-subtle bg-card-bg p-8 text-center space-y-4 shadow-xl">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                        <AlertCircle size={22} />
                    </div>
                    <p className="text-sm font-black uppercase tracking-wider">{error}</p>
                    <button
                        type="button"
                        onClick={refresh}
                        className="inline-flex items-center gap-2 mx-auto px-5 py-3 rounded-xl bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest hover:bg-hover-blue"
                    >
                        <RefreshCw size={14} /> Try again
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const {
        welcome,
        metrics,
        recentCourses,
        pendingCourseAssignments,
        gradingQueue,
        recentAttendance,
        googleCalendar,
    } = data;

    const pendingActions =
        (metrics.pendingCourseAssignmentCount ?? 0) +
        (metrics.submissionsToGradeCount ?? 0) +
        (metrics.unmarkedAttendanceCount ?? 0);

    return (
        <div className="bg-app-bg text-text-main pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 md:pt-10 space-y-8 md:space-y-10">
                <section className="rounded-[1.75rem] md:rounded-[2rem] border border-border-subtle bg-card-bg p-6 md:p-10">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                        <div className="space-y-3 max-w-2xl">
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-accent-blue">
                                Instructor hub
                            </p>
                            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight text-text-main">
                                Welcome back, {welcome.firstName}
                            </h1>
                            <p className="text-sm font-medium text-text-muted uppercase tracking-wider">
                                Courses · grading · attendance
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="rounded-2xl border border-accent-blue/25 bg-accent-blue/10 px-4 py-3 min-w-[150px]">
                                <p className="text-[9px] font-black uppercase tracking-widest text-accent-blue">
                                    Students taught
                                </p>
                                <p className="text-xl font-black tabular-nums text-text-main mt-1">
                                    {metrics.studentsEnrolledCount ?? 0}
                                </p>
                            </div>
                            <div
                                className={`rounded-2xl border px-4 py-3 min-w-[140px] ${
                                    pendingActions > 0
                                        ? 'border-accent-blue/35 bg-accent-blue/10'
                                        : 'border-border-subtle bg-app-bg'
                                }`}
                            >
                                <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                                    Action required
                                </p>
                                <p className="text-xl font-black tabular-nums text-accent-blue mt-1">
                                    {pendingActions}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={refresh}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-border-subtle text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent-blue hover:border-accent-blue/30 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <RefreshCw size={14} />
                                )}
                                Refresh
                            </button>
                        </div>
                    </div>
                </section>

                <TeacherKpiGrid
                    metrics={metrics}
                    googleCalendar={googleCalendar}
                    gradingQueueCount={gradingQueue.length}
                />

                <TeacherActionPanel
                    pendingCourseAssignments={pendingCourseAssignments}
                    gradingQueue={gradingQueue}
                    recentAttendance={recentAttendance}
                />

                <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <StudentsPerCourseChart courses={recentCourses} />
                    <WorkloadSnapshotChart metrics={metrics} />
                    <AttendanceMarkStatusChart items={recentAttendance} />
                </section>

                <GradingQueueChart items={gradingQueue} />

                <TeacherActivityPanel
                    recentCourses={recentCourses}
                    gradingQueue={gradingQueue}
                    recentAttendance={recentAttendance}
                    googleCalendar={googleCalendar}
                />
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-app-bg px-4 sm:px-6 pt-10 pb-20">
            <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                <div className="h-40 rounded-[2rem] bg-card-bg border border-border-subtle" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-36 rounded-2xl bg-card-bg border border-border-subtle"
                        />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-72 rounded-2xl bg-card-bg border border-border-subtle"
                        />
                    ))}
                </div>
                <div className="flex items-center justify-center gap-3 py-10 text-text-muted">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">
                        Loading dashboard…
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function TeacherDashboardPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <TeacherDashboardInner />
        </Suspense>
    );
}
