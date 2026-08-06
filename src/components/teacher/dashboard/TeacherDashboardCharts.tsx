'use client';

import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
} from 'recharts';
import type { TeacherDashboardResponse } from '@/lib/api/apiService';

const CHART_TICK = '#94a3b8';
const CHART_GRID = 'rgba(148, 163, 184, 0.15)';
const TOOLTIP_STYLE = {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(148,163,184,0.25)',
    borderRadius: 12,
    color: '#e2e8f0',
    fontSize: 12,
};

function EmptyChart({ label }: { label: string }) {
    return (
        <div className="h-64 flex items-center justify-center text-center px-4">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</p>
        </div>
    );
}

/** Chart 1 — Students per accepted course */
export function StudentsPerCourseChart({
    courses,
}: {
    courses: TeacherDashboardResponse['recentCourses'];
}) {
    const data = useMemo(
        () =>
            courses.map((c) => ({
                name:
                    c.courseName.length > 16
                        ? `${c.courseName.slice(0, 16)}…`
                        : c.courseName,
                fullName: c.courseName,
                students: c.enrolledStudentsCount ?? 0,
            })),
        [courses]
    );

    if (!courses.length) {
        return <EmptyChart label="No accepted courses yet" />;
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                    <CartesianGrid stroke={CHART_GRID} horizontal={false} />
                    <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{ fill: CHART_TICK, fontSize: 11 }}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tick={{ fill: CHART_TICK, fontSize: 10 }}
                    />
                    <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value) => [value, 'Students']}
                        labelFormatter={(_, payload) =>
                            payload?.[0]?.payload?.fullName || ''
                        }
                    />
                    <Bar
                        dataKey="students"
                        fill="#3b82f6"
                        radius={[0, 8, 8, 0]}
                        barSize={16}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

const WORKLOAD_COLORS: Record<string, string> = {
    'Pending assignments': '#f59e0b',
    'To grade': '#3b82f6',
    'Unmarked attendance': '#ef4444',
};

/** Chart 2 — Workload snapshot from metrics */
export function WorkloadSnapshotChart({
    metrics,
}: {
    metrics: TeacherDashboardResponse['metrics'];
}) {
    const data = useMemo(
        () =>
            [
                {
                    name: 'Pending assignments',
                    value: metrics.pendingCourseAssignmentCount ?? 0,
                },
                {
                    name: 'To grade',
                    value: metrics.submissionsToGradeCount ?? 0,
                },
                {
                    name: 'Unmarked attendance',
                    value: metrics.unmarkedAttendanceCount ?? 0,
                },
            ].filter((d) => d.value > 0),
        [metrics]
    );

    const total =
        (metrics.pendingCourseAssignmentCount ?? 0) +
        (metrics.submissionsToGradeCount ?? 0) +
        (metrics.unmarkedAttendanceCount ?? 0);

    if (!total) {
        return <EmptyChart label="No pending teaching work" />;
    }

    return (
        <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={82}
                        paddingAngle={3}
                        stroke="none"
                    >
                        {data.map((entry) => (
                            <Cell key={entry.name} fill={WORKLOAD_COLORS[entry.name]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    Open
                </p>
                <p className="text-2xl font-black tabular-nums">{total}</p>
            </div>
        </div>
    );
}

/** Chart 3 — Marked vs unmarked from recentAttendance */
export function AttendanceMarkStatusChart({
    items,
}: {
    items: TeacherDashboardResponse['recentAttendance'];
}) {
    const data = useMemo(() => {
        const marked = items.filter((a) => a.isMarked).length;
        const unmarked = items.filter((a) => !a.isMarked).length;
        return [
            { name: 'Marked', value: marked },
            { name: 'Unmarked', value: unmarked },
        ].filter((d) => d.value > 0);
    }, [items]);

    if (!items.length || !data.length) {
        return <EmptyChart label="No recent attendance sessions" />;
    }

    const colors: Record<string, string> = {
        Marked: '#10b981',
        Unmarked: '#f59e0b',
    };

    return (
        <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={82}
                        paddingAngle={3}
                        stroke="none"
                    >
                        {data.map((entry) => (
                            <Cell key={entry.name} fill={colors[entry.name]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    Sessions
                </p>
                <p className="text-2xl font-black tabular-nums">{items.length}</p>
            </div>
        </div>
    );
}

/** Chart 4 — Grading queue pending counts */
export function GradingQueueChart({
    items,
}: {
    items: TeacherDashboardResponse['gradingQueue'];
}) {
    const data = useMemo(
        () =>
            items.map((g) => ({
                name:
                    g.title.length > 14 ? `${g.title.slice(0, 14)}…` : g.title,
                fullName: g.title,
                pending: g.pendingSubmissionCount ?? 0,
            })),
        [items]
    );

    if (!items.length) {
        return <EmptyChart label="Nothing in the grading queue" />;
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 8, right: 8, left: 0, bottom: 40 }}
                >
                    <CartesianGrid stroke={CHART_GRID} vertical={false} />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: CHART_TICK, fontSize: 10 }}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                        height={50}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fill: CHART_TICK, fontSize: 11 }}
                    />
                    <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value) => [value, 'Pending']}
                        labelFormatter={(_, payload) =>
                            payload?.[0]?.payload?.fullName || ''
                        }
                    />
                    <Bar dataKey="pending" fill="#a78bfa" radius={[8, 8, 0, 0]} barSize={28} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
