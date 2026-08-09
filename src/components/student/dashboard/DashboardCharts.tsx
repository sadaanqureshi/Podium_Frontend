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

const ATTENDANCE_COLORS: Record<string, string> = {
    Present: '#10b981',
    Absent: '#f43f5e',
    Pending: '#f59e0b',
};

const UPDATE_COLORS: Record<string, string> = {
    Lecture: ACCENT_BLUE,
    Assignment: '#f59e0b',
    Quiz: '#10b981',
    Resource: '#64748b',
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

export function CourseProgressChart({
    courses,
}: {
    courses: StudentDashboardResponse['recentCourses'];
}) {
    const data = useMemo(
        () =>
            courses.map((c) => ({
                name:
                    c.courseName.length > 16
                        ? `${c.courseName.slice(0, 16)}…`
                        : c.courseName,
                fullName: c.courseName,
                progress: c.progressPercent ?? 0,
            })),
        [courses]
    );

    if (!courses.length) {
        return (
            <ChartCard title="Course progress" subtitle="Completion by course">
                <EmptyChart label="No enrolled courses yet" />
            </ChartCard>
        );
    }

    return (
        <ChartCard title="Course progress" subtitle="Completion by course">
            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
                    >
                        <CartesianGrid stroke={CHART_GRID} horizontal={false} />
                        <XAxis
                            type="number"
                            domain={[0, 100]}
                            tick={{ fill: CHART_TICK, fontSize: 11 }}
                            unit="%"
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
                            formatter={(value) => [`${value}%`, 'Progress']}
                            labelFormatter={(_, payload) =>
                                payload?.[0]?.payload?.fullName || ''
                            }
                        />
                        <Bar
                            dataKey="progress"
                            fill={ACCENT_BLUE}
                            radius={[0, 8, 8, 0]}
                            barSize={14}
                            animationDuration={1100}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </ChartCard>
    );
}

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

    const rate =
        attendance.ratePercent == null ? '—' : `${Math.round(attendance.ratePercent)}%`;

    if (!attendance.total) {
        return (
            <ChartCard title="Attendance mix" subtitle="Present · absent · pending">
                <EmptyChart label="No attendance records yet" />
            </ChartCard>
        );
    }

    return (
        <ChartCard title="Attendance mix" subtitle="Present · absent · pending">
            <div className="h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={58}
                            outerRadius={84}
                            paddingAngle={3}
                            stroke="none"
                        >
                            {data.map((entry) => (
                                <Cell
                                    key={entry.name}
                                    fill={ATTENDANCE_COLORS[entry.name] || ACCENT_BLUE}
                                />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <p className="text-2xl font-black tabular-nums text-text-main">{rate}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                            Rate
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
                            style={{ backgroundColor: ATTENDANCE_COLORS[d.name] }}
                        />
                        {d.name} · {d.value}
                    </span>
                ))}
            </div>
        </ChartCard>
    );
}

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

    const total = data.reduce((s, d) => s + d.value, 0);

    if (!updates.length || !data.length) {
        return (
            <ChartCard title="Activity mix" subtitle="Recent content types">
                <EmptyChart label="No recent course updates" />
            </ChartCard>
        );
    }

    return (
        <ChartCard title="Activity mix" subtitle="Recent content types">
            <div className="h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={58}
                            outerRadius={84}
                            paddingAngle={3}
                            stroke="none"
                        >
                            {data.map((entry) => (
                                <Cell
                                    key={entry.name}
                                    fill={UPDATE_COLORS[entry.name] || ACCENT_BLUE}
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
                            Items
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
                            style={{ backgroundColor: UPDATE_COLORS[d.name] }}
                        />
                        {d.name} · {d.value}
                    </span>
                ))}
            </div>
        </ChartCard>
    );
}
