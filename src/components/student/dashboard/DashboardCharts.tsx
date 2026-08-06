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
import type { StudentDashboardResponse } from '@/lib/api/apiService';

const CHART_TICK = '#94a3b8';
const CHART_GRID = 'rgba(148, 163, 184, 0.15)';
const TOOLTIP_STYLE = {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(148,163,184,0.25)',
    borderRadius: 12,
    color: '#e2e8f0',
    fontSize: 12,
};

export function CourseProgressChart({
    courses,
}: {
    courses: StudentDashboardResponse['recentCourses'];
}) {
    const data = useMemo(
        () =>
            courses.map((c) => ({
                name:
                    c.courseName.length > 18
                        ? `${c.courseName.slice(0, 18)}…`
                        : c.courseName,
                fullName: c.courseName,
                progress: c.progressPercent ?? 0,
            })),
        [courses]
    );

    if (!courses.length) {
        return (
            <EmptyChart label="No enrolled courses yet" />
        );
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
                        domain={[0, 100]}
                        tick={{ fill: CHART_TICK, fontSize: 11 }}
                        unit="%"
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={110}
                        tick={{ fill: CHART_TICK, fontSize: 10 }}
                    />
                    <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value) => [`${value}%`, 'Progress']}
                        labelFormatter={(_, payload) =>
                            payload?.[0]?.payload?.fullName || ''
                        }
                    />
                    <Bar dataKey="progress" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={16} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

const ATTENDANCE_COLORS = {
    Present: '#10b981',
    Absent: '#ef4444',
    Pending: '#f59e0b',
};

export function AttendanceBreakdownChart({
    attendance,
}: {
    attendance: StudentDashboardResponse['metrics']['attendance'];
}) {
    const data = useMemo(
        () =>
            [
                { name: 'Present', value: attendance.present },
                { name: 'Absent', value: attendance.absent },
                { name: 'Pending', value: attendance.pending },
            ].filter((d) => d.value > 0),
        [attendance]
    );

    if (!attendance.total) {
        return <EmptyChart label="No attendance records yet" />;
    }

    const rate =
        attendance.ratePercent == null ? '—' : `${Math.round(attendance.ratePercent)}%`;

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
                            <Cell
                                key={entry.name}
                                fill={ATTENDANCE_COLORS[entry.name as keyof typeof ATTENDANCE_COLORS]}
                            />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    Rate
                </p>
                <p className="text-2xl font-black tabular-nums">{rate}</p>
            </div>
        </div>
    );
}

const UPDATE_COLORS: Record<string, string> = {
    Lecture: '#3b82f6',
    Assignment: '#f59e0b',
    Quiz: '#10b981',
    Resource: '#a78bfa',
};

export function UpdatesTypeChart({
    updates,
}: {
    updates: StudentDashboardResponse['recentUpdates'];
}) {
    const data = useMemo(() => {
        const counts = { lecture: 0, assignment: 0, quiz: 0, resource: 0 };
        for (const u of updates) {
            if (u.type in counts) counts[u.type as keyof typeof counts] += 1;
        }
        return [
            { name: 'Lecture', value: counts.lecture },
            { name: 'Assignment', value: counts.assignment },
            { name: 'Quiz', value: counts.quiz },
            { name: 'Resource', value: counts.resource },
        ].filter((d) => d.value > 0);
    }, [updates]);

    if (!updates.length || !data.length) {
        return <EmptyChart label="No recent course updates" />;
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={82}
                        paddingAngle={3}
                        stroke="none"
                        label={({ name, value }) => `${name} ${value}`}
                    >
                        {data.map((entry) => (
                            <Cell key={entry.name} fill={UPDATE_COLORS[entry.name]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

function EmptyChart({ label }: { label: string }) {
    return (
        <div className="h-64 flex items-center justify-center text-center px-4">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                {label}
            </p>
        </div>
    );
}
