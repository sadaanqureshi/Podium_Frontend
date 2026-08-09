'use client';

import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import type { AdminDashboardResponse } from '@/lib/api/apiService';
import { formatMoney, formatMonthLabel } from '@/lib/adminDashboardFormat';

const TOOLTIP_STYLE = {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(37,99,235,0.35)',
    borderRadius: 12,
    color: '#f8fafc',
    fontSize: 12,
};

const STATUS_COLORS: Record<string, string> = {
    pending: '#f59e0b',
    enrolled: '#10b981',
    accepted: '#10b981',
    rejected: '#f43f5e',
    dismissed: '#64748b',
    unassigned: '#94a3b8',
};

const ACCENT_BLUE = '#2563eb';

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

export function EnrollmentsByStatusChart({
    data,
}: {
    data: AdminDashboardResponse['charts']['enrollmentsByStatus'];
}) {
    const chartData = useMemo(
        () =>
            (data || []).map((d) => ({
                name: d.label,
                value: d.value,
                color: STATUS_COLORS[d.label.toLowerCase()] || ACCENT_BLUE,
            })),
        [data]
    );
    const total = chartData.reduce((s, d) => s + d.value, 0);

    if (!chartData.length || total === 0) {
        return (
            <ChartCard title="Enrollments by status" subtitle="Pipeline mix">
                <EmptyChart label="No enrollment data yet" />
            </ChartCard>
        );
    }

    return (
        <ChartCard title="Enrollments by status" subtitle="Pipeline mix">
            <div className="h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={58}
                            outerRadius={84}
                            paddingAngle={3}
                            stroke="none"
                        >
                            {chartData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <p className="text-2xl font-black tabular-nums text-text-main">{total}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                            Total
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {chartData.map((d) => (
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

export function CoursesByAssignmentChart({
    data,
}: {
    data: AdminDashboardResponse['charts']['coursesByAssignmentStatus'];
}) {
    const chartData = useMemo(
        () =>
            (data || []).map((d) => ({
                name: d.label,
                value: d.value,
                color: STATUS_COLORS[d.label.toLowerCase()] || '#94a3b8',
            })),
        [data]
    );
    const total = chartData.reduce((s, d) => s + d.value, 0);

    if (!chartData.length || total === 0) {
        return (
            <ChartCard title="Courses by assignment" subtitle="Teacher coverage">
                <EmptyChart label="No assignment data yet" />
            </ChartCard>
        );
    }

    return (
        <ChartCard title="Courses by assignment" subtitle="Teacher coverage">
            <div className="h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={58}
                            outerRadius={84}
                            paddingAngle={3}
                            stroke="none"
                        >
                            {chartData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <p className="text-2xl font-black tabular-nums text-text-main">{total}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                            Courses
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {chartData.map((d) => (
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

export function RevenueTrendChart({
    data,
}: {
    data: AdminDashboardResponse['charts']['revenueLast6Months'];
}) {
    const chartData = useMemo(
        () =>
            (data || []).map((d) => ({
                month: formatMonthLabel(d.month),
                amount: Number.parseFloat(d.amount) || 0,
            })),
        [data]
    );

    if (!chartData.length) {
        return (
            <ChartCard title="Revenue · 6 months" subtitle="Paid volume trend">
                <EmptyChart label="No revenue history yet" />
            </ChartCard>
        );
    }

    return (
        <ChartCard title="Revenue · 6 months" subtitle="Paid volume trend">
            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="adminRevFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={ACCENT_BLUE} stopOpacity={0.35} />
                                <stop offset="100%" stopColor={ACCENT_BLUE} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={48}
                            tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                        />
                        <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            formatter={(value) => [formatMoney(Number(value)), 'Revenue']}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke={ACCENT_BLUE}
                            strokeWidth={2.5}
                            fill="url(#adminRevFill)"
                            animationDuration={1100}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </ChartCard>
    );
}
