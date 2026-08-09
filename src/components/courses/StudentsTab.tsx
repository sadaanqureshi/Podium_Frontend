'use client';
import React, { useMemo } from 'react';
import { UserPlus, Calendar, Mail, Check, X, ExternalLink } from 'lucide-react';
import UserManagementTable from '@/components/ui/UserManagementTable';
import { resolveMediaUrl } from '@/lib/api/apiService';

export type EnrollmentRosterVariant = 'enrolled' | 'pending' | 'rejected';

interface StudentsTabProps {
    data: any[];
    onAdd?: () => void;
    role: string;
    loading?: boolean;
    onDelete?: (id: number, name: string) => void;
    variant?: EnrollmentRosterVariant;
    onApprove?: (item: any) => void;
    onReject?: (item: any) => void;
    actionLoading?: boolean;
}

const studentNameOf = (item: any) =>
    item.studentName ||
    `${item.student?.firstName || ''} ${item.student?.lastName || ''}`.trim() ||
    'Student';

const studentEmailOf = (item: any) => item.studentEmail || item.student?.email || '—';

const titles: Record<EnrollmentRosterVariant, { title: string; subtitle: string }> = {
    enrolled: {
        title: 'Enrolled Students',
        subtitle: 'Students currently enrolled in this course.',
    },
    pending: {
        title: 'Pending Requests',
        subtitle: 'Approve or reject enrollment requests for this course.',
    },
    rejected: {
        title: 'Rejected Requests',
        subtitle: 'Declined enrollments with recorded rejection reasons.',
    },
};

export const StudentsTab = ({
    data,
    onAdd,
    role,
    onDelete,
    loading = false,
    variant = 'enrolled',
    onApprove,
    onReject,
    actionLoading = false,
}: StudentsTabProps) => {
    if (role === 'student') return null;

    const copy = titles[variant];

    const enrollmentColumns = useMemo(() => {
        const cols: any[] = [
            {
                header: 'Student Identity',
                key: 'display_identity',
                render: (item: any) => {
                    const name = studentNameOf(item);
                    return (
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-app-bg border border-border-subtle flex items-center justify-center font-black text-accent-blue text-xs shadow-sm uppercase ">
                                {name?.[0] || 'S'}
                            </div>
                            <p className="font-black text-text-main text-sm uppercase tracking-tight">
                                {name}
                            </p>
                        </div>
                    );
                },
            },
            {
                header: 'Email Address',
                key: 'studentEmail',
                render: (item: any) => (
                    <div className="flex items-center gap-2 text-text-muted font-bold text-xs">
                        <Mail size={12} className="text-accent-blue/60" />
                        {studentEmailOf(item)}
                    </div>
                ),
            },
            {
                header: variant === 'rejected' ? 'Rejected On' : 'Date',
                key: 'enrolledAt',
                align: 'center' as const,
                render: (item: any) => {
                    const raw =
                        variant === 'rejected'
                            ? item.rejectedAt || item.updatedAt || item.createdAt
                            : item.enrolledAt || item.updatedAt || item.createdAt;
                    return (
                        <div className="flex items-center justify-center gap-2 text-text-muted font-black text-[10px] uppercase">
                            <Calendar size={13} className="text-accent-blue/40" />
                            {raw ? new Date(raw).toLocaleDateString('en-GB') : 'N/A'}
                        </div>
                    );
                },
            },
        ];

        if (variant === 'rejected') {
            cols.push({
                header: 'Reason',
                key: 'rejectionReason',
                render: (item: any) => (
                    <p className="text-xs text-text-muted font-medium max-w-[260px]">
                        {item.rejectionReason?.trim() || 'No reason provided'}
                    </p>
                ),
            });
        }

        if (variant === 'pending' || variant === 'rejected') {
            cols.push({
                header: 'Proof',
                key: 'proof',
                align: 'center' as const,
                render: (item: any) => {
                    const url = resolveMediaUrl(item.transaction?.screenshotUrl || item.screenshotUrl);
                    if (!url) {
                        return <span className="text-[10px] text-text-muted font-bold">—</span>;
                    }
                    return (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-accent-blue hover:underline"
                        >
                            View <ExternalLink size={11} />
                        </a>
                    );
                },
            });
        }

        cols.push({
            header: 'Status',
            key: 'status',
            align: 'right' as const,
            render: (item: any) => {
                const status = (item.status || variant).toLowerCase();
                const cls =
                    status === 'enrolled' || status === 'accepted'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : status === 'pending'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          : status === 'rejected'
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : 'bg-text-muted/10 text-text-muted border-border-subtle';
                return (
                    <span
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${cls}`}
                    >
                        {item.status || variant}
                    </span>
                );
            },
        });

        if (variant === 'pending' && role === 'admin') {
            cols.push({
                header: 'Actions',
                key: 'actions',
                align: 'right' as const,
                render: (item: any) => (
                    <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => onApprove?.(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest disabled:opacity-40"
                        >
                            <Check size={12} strokeWidth={3} /> Approve
                        </button>
                        <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => onReject?.(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-black uppercase tracking-widest disabled:opacity-40"
                        >
                            <X size={12} strokeWidth={3} /> Reject
                        </button>
                    </div>
                ),
            });
        }

        return cols;
    }, [variant, role, actionLoading, onApprove, onReject]);

    const showEnroll = role === 'admin' && variant === 'enrolled' && !!onAdd;
    const showDismiss = role === 'admin' && variant === 'enrolled' && !!onDelete;

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 px-2">
                <div>
                    <h2 className="text-2xl font-black text-text-main uppercase tracking-tight">
                        {role === 'teacher' ? 'Course Roster' : copy.title}
                    </h2>
                    <p className="text-text-muted text-xs font-medium underline decoration-accent-blue/20">
                        {role === 'teacher'
                            ? 'Verified student directory for this intake.'
                            : copy.subtitle}
                    </p>
                </div>

                {showEnroll && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="flex items-center gap-2 px-6 py-3 bg-accent-blue text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-hover-blue transition-all shadow-xl shadow-accent-blue/20 active:scale-95"
                    >
                        <UserPlus size={16} strokeWidth={3} />
                        <span>Enroll Student</span>
                    </button>
                )}
            </div>

            <UserManagementTable
                data={data}
                loading={loading}
                columnConfig={enrollmentColumns}
                type="enrollment"
                visibleActions={showDismiss ? ['delete'] : []}
                onDelete={
                    onDelete
                        ? (id, name) => {
                              const row = data.find((d) => d.id === id);
                              onDelete(id, name || studentNameOf(row));
                          }
                        : undefined
                }
            />
        </div>
    );
};
