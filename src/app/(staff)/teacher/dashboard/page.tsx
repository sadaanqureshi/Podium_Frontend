'use client';

import React, { useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchTeacherDashboard } from '@/lib/store/features/teacherDashboardSlice';
import {
    TeacherMetricCards,
    RecentCoursesWidget,
    PendingCourseAssignmentsWidget,
    GradingQueueWidget,
    RecentAttendanceWidget,
    GoogleCalendarStatusWidget,
} from '@/components/teacher/dashboard/TeacherDashboardWidgets';
import {
    StudentsPerCourseChart,
    WorkloadSnapshotChart,
    AttendanceMarkStatusChart,
    GradingQueueChart,
} from '@/components/teacher/dashboard/TeacherDashboardCharts';

export default function TeacherDashboard() {
    const dispatch = useAppDispatch();
    const { data, loading, error } = useAppSelector((s) => s.teacherDashboard);

    useEffect(() => {
        dispatch(fetchTeacherDashboard());
    }, [dispatch]);

    const refresh = () => {
        dispatch(fetchTeacherDashboard());
    };

    if (loading && !data) {
        return (
            <div className="bg-app-bg h-full">
                <div className="max-w-6xl mx-auto px-6 pt-12 space-y-8">
                    <div className="hero-registry-card rounded-[3rem] p-10 md:p-16 border border-border-subtle animate-pulse">
                        <div className="h-4 w-40 bg-border-subtle rounded mb-6" />
                        <div className="h-10 w-3/4 max-w-xl bg-border-subtle rounded mb-4" />
                        <div className="h-4 w-2/3 max-w-md bg-border-subtle rounded" />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-24 rounded-2xl bg-card-bg border border-border-subtle animate-pulse"
                            />
                        ))}
                    </div>
                    <div className="flex items-center justify-center py-16 text-text-muted gap-3">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">
                            Loading dashboard…
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="bg-app-bg h-full flex items-center justify-center px-6">
                <div className="max-w-md w-full bg-card-bg border border-border-subtle rounded-2xl p-8 text-center space-y-4 shadow-sm">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                        <AlertCircle size={22} />
                    </div>
                    <p className="text-sm font-black uppercase tracking-wider">{error}</p>
                    <button
                        type="button"
                        onClick={refresh}
                        className="inline-flex items-center gap-2 mx-auto px-5 py-3 rounded-xl bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90"
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

    return (
        <div className="bg-app-bg h-full">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 md:pt-12 pb-16 space-y-8 md:space-y-10">
                {/* Welcome hero */}
                <div className="hero-registry-card rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 border border-border-subtle relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-accent-blue/5 rounded-full blur-[100px] -mr-40 -mt-40" />
                    <div className="relative z-10 space-y-4 text-center md:text-left">
                        <span className="text-[10px] font-black text-accent-blue uppercase tracking-[0.3em]">
                            Instructor Hub
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                            Welcome to Podium Professional, {welcome.firstName}{' '}
                            {welcome.lastName}
                        </h1>
                        <p className="text-text-muted text-sm font-medium max-w-xl leading-relaxed uppercase tracking-wider">
                            Your teaching overview — courses, grading, attendance, and assignments.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={refresh}
                            className="inline-flex items-center gap-1.5 shrink-0 hover:underline"
                        >
                            <RefreshCw size={12} /> Retry
                        </button>
                    </div>
                )}

                <TeacherMetricCards metrics={metrics} />

                {/* Charts 1–3 above the fold */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    <ChartCard title="Students per Course" className="lg:col-span-1">
                        <StudentsPerCourseChart courses={recentCourses} />
                    </ChartCard>
                    <ChartCard title="Workload Snapshot">
                        <WorkloadSnapshotChart metrics={metrics} />
                    </ChartCard>
                    <ChartCard title="Attendance Mark Status">
                        <AttendanceMarkStatusChart items={recentAttendance} />
                    </ChartCard>
                </div>

                <ChartCard title="Grading Queue">
                    <GradingQueueChart items={gradingQueue} />
                </ChartCard>

                {/* Widgets */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <RecentCoursesWidget courses={recentCourses} />
                    <PendingCourseAssignmentsWidget items={pendingCourseAssignments} />
                    <GradingQueueWidget items={gradingQueue} />
                    <RecentAttendanceWidget items={recentAttendance} />
                    <div className="lg:col-span-2">
                        <GoogleCalendarStatusWidget googleCalendar={googleCalendar} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChartCard({
    title,
    children,
    className = '',
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`bg-card-bg border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm space-y-2 ${className}`}
        >
            <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
                {title}
            </h3>
            {children}
        </div>
    );
}
