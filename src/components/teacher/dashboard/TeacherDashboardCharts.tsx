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

const TOOLTIP_STYLE = {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(37,99,235,0.35)',
    borderRadius: 12,
    color: '#f8fafc',
    fontSize: 12,
};

const CHART_TICK = '#94a3b8';
const CHART_GRID = 'rgba(148, 163, 184, 0.12)';
const ACCENT_BLUE = '#2563eb';

const WORKLOAD_COLORS: Record<string, string> = {
    'Pending invites': '#f59e0b',
    'To grade': ACCENT_BLUE,
    'Unmarked attendance': '#f43f5e',
};

function ChartCard({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border-subtle bg-card-bg p-5 md:p-6 shadow-sm min-h-[300px] flex flex-col">
            <div className="mb-4">
                <h3 className="text-sm font-black tracking-tight text-text-main">{title}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">
                    {subtitle}
                </p>
            </div>
            <div className="flex-1 min-h-[220px]">{children}</div>
        </div>
    );
}

function EmptyChart({ label }: { label: string }) {
    return (
        <div className="h-full min-h-[220px] flex items-center justify-center text-xs font-bold text-text-muted">
            {label}
        </div>
    );
}

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
        return (
            <ChartCard title="Students per course" subtitle="Enrollment by course">
                <EmptyChart label="No accepted courses yet" />
            </ChartCard>
        );
    }

    return (
        <ChartCard title="Students per course" subtitle="Enrollment by course">
            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%" debounce={300}>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
                    >
                        <CartesianGrid stroke={CHART_GRID} horizontal={false} />
                        <XAxis
                            type="number"
                            allowDecimals={false}
                            tick={{ fill: CHART_TICK, fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={100}
                            tick={{ fill: CHART_TICK, fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
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
                            fill={ACCENT_BLUE}
                            radius={[0, 8, 8, 0]}
                            barSize={14}
                            isAnimationActive={false}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </ChartCard>
    );
}

export function WorkloadSnapshotChart({
    metrics,
}: {
    metrics: TeacherDashboardResponse['metrics'];
}) {
    const data = useMemo(
        () =>
            [
                {
                    name: 'Pending invites',
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
        return (
            <ChartCard title="Workload mix" subtitle="Open teaching work">
                <EmptyChart label="No pending teaching work" />
            </ChartCard>
        );
    }

    return (
        <ChartCard title="Workload mix" subtitle="Open teaching work">
            <div className="h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%" debounce={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={58}
                            outerRadius={84}
                            paddingAngle={3}
                            stroke="none"
                            isAnimationActive={false}
                        >
                            {data.map((entry) => (
                                <Cell
                                    key={entry.name}
                                    fill={WORKLOAD_COLORS[entry.name] || ACCENT_BLUE}
                                />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <p className="text-2xl font-black tabular-nums text-text-main">{total}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                            Open
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {data.map((d) => (
                    <span
                        key={d.name}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted"
                    >
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: WORKLOAD_COLORS[d.name] }}
                        />
                        {d.name} · {d.value}
                    </span>
                ))}
            </div>
        </ChartCard>
    );
}

export function AttendanceMarkStatusChart({
    items,
}: {
    items: TeacherDashboardResponse['recentAttendance'];
}) {
    const data = useMemo(() => {
        const marked = items.filter((a) => a.isMarked).length;
        const unmarked = items.filter((a) => !a.isMarked).length;
        return [
            { name: 'Marked', value: marked, color: '#10b981' },
            { name: 'Unmarked', value: unmarked, color: '#f59e0b' },
        ].filter((d) => d.value > 0);
    }, [items]);

    if (!items.length || !data.length) {
        return (
            <ChartCard title="Attendance status" subtitle="Recent sessions">
                <EmptyChart label="No recent attendance sessions" />
            </ChartCard>
        );
    }

    return (
        <ChartCard title="Attendance status" subtitle="Recent sessions">
            <div className="h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%" debounce={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={58}
                            outerRadius={84}
                            paddingAngle={3}
                            stroke="none"
                            isAnimationActive={false}
                        >
                            {data.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <p className="text-2xl font-black tabular-nums text-text-main">
                            {items.length}
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                            Sessions
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {data.map((d) => (
                    <span
                        key={d.name}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted"
                    >
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: d.color }}
                        />
                        {d.name} · {d.value}
                    </span>
                ))}
            </div>
        </ChartCard>
    );
}

export function GradingQueueChart({
    items,
}: {
    items: TeacherDashboardResponse['gradingQueue'];
}) {
    const data = useMemo(
        () =>
            items.map((g) => ({
                name: g.title.length > 14 ? `${g.title.slice(0, 14)}…` : g.title,
                fullName: g.title,
                pending: g.pendingSubmissionCount ?? 0,
            })),
        [items]
    );

    if (!items.length) {
        return (
            <ChartCard title="Grading queue" subtitle="Pending submissions by assignment & quiz">
                <EmptyChart label="Nothing in the grading queue" />
            </ChartCard>
        );
    }

    return (
        <ChartCard title="Grading queue" subtitle="Pending submissions by assignment & quiz">
            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%" debounce={300}>
                    <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 36 }}>
                        <CartesianGrid stroke={CHART_GRID} vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: CHART_TICK, fontSize: 10 }}
                            interval={0}
                            angle={-25}
                            textAnchor="end"
                            height={48}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fill: CHART_TICK, fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={36}
                        />
                        <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            formatter={(value) => [value, 'Pending']}
                            labelFormatter={(_, payload) =>
                                payload?.[0]?.payload?.fullName || ''
                            }
                        />
                        <Bar
                            dataKey="pending"
                            fill={ACCENT_BLUE}
                            radius={[8, 8, 0, 0]}
                            barSize={28}
                            isAnimationActive={false}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </ChartCard>
    );
}
