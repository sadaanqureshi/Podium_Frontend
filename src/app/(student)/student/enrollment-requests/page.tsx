'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    Loader2,
    ClipboardList,
    Clock3,
    CheckCircle2,
    XCircle,
    Ban,
    Layers,
    Calendar,
    User,
    Tag,
    ExternalLink,
    ImageIcon,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
    fetchMyEnrollmentRequests,
    clearMyEnrollmentRequests,
} from '@/lib/store/features/courseSlice';
import { useToast } from '@/context/ToastContext';
import type {
    EnrollmentRequestStatus,
    MyEnrollmentRequestItem,
    TransactionStatus,
} from '@/lib/api/apiService';

const STATUS_FILTERS: { label: string; value: EnrollmentRequestStatus | '' }[] = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Enrolled', value: 'enrolled' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Dismissed', value: 'dismissed' },
];

const enrollmentStatusBadge = (status: EnrollmentRequestStatus | string) => {
    switch (status) {
        case 'enrolled':
            return {
                label: 'Approved / Enrolled',
                className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
                Icon: CheckCircle2,
            };
        case 'rejected':
            return {
                label: 'Rejected',
                className: 'bg-red-500/10 border-red-500/20 text-red-500',
                Icon: XCircle,
            };
        case 'dismissed':
            return {
                label: 'Dismissed',
                className: 'bg-text-muted/10 border-border-subtle text-text-muted',
                Icon: Ban,
            };
        case 'pending':
        default:
            return {
                label: 'Pending review',
                className: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
                Icon: Clock3,
            };
    }
};

const transactionStatusBadge = (status: TransactionStatus | string) => {
    switch (status) {
        case 'paid':
            return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
        case 'free':
            return 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue';
        case 'failed':
            return 'bg-red-500/10 border-red-500/20 text-red-500';
        case 'pending':
        default:
            return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
    }
};

const formatPrice = (price: string | null | undefined) => {
    if (price == null || price === '' || Number(price) === 0) return 'Free';
    const n = Number(price);
    if (Number.isNaN(n)) return String(price);
    return `Rs ${n.toLocaleString()}`;
};

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

function RequestCard({ item }: { item: MyEnrollmentRequestItem }) {
    const course = item.course;
    const tx = item.transaction;
    const status = enrollmentStatusBadge(item.status);
    const StatusIcon = status.Icon;
    const teacherName = course?.teacher
        ? `${course.teacher.firstName} ${course.teacher.lastName}`.trim()
        : null;

    return (
        <article className="bg-card-bg border border-border-subtle rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row">
            <div className="sm:w-40 h-36 sm:h-auto shrink-0 bg-app-bg relative">
                {course?.coverImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={course.coverImg}
                        alt={course.courseName || 'Course'}
                        className="w-full h-full object-cover min-h-[9rem]"
                    />
                ) : (
                    <div className="w-full h-full min-h-[9rem] flex items-center justify-center text-text-muted/40">
                        <ImageIcon size={36} />
                    </div>
                )}
            </div>

            <div className="flex-1 p-5 md:p-6 space-y-4 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                        <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-text-main truncate">
                            {course?.courseName || 'Untitled course'}
                        </h3>
                        {course?.shortDescription && (
                            <p className="text-xs text-text-muted font-medium line-clamp-2 leading-relaxed">
                                {course.shortDescription}
                            </p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-text-muted uppercase tracking-wider pt-1">
                            <span className="text-accent-blue">{formatPrice(course?.price)}</span>
                            {course?.courseCategory?.name && (
                                <span className="inline-flex items-center gap-1">
                                    <Tag size={11} className="text-accent-blue" />
                                    {course.courseCategory.name}
                                </span>
                            )}
                            {teacherName && (
                                <span className="inline-flex items-center gap-1">
                                    <User size={11} className="text-accent-blue" />
                                    {teacherName}
                                </span>
                            )}
                        </div>
                    </div>

                    <span
                        className={`inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shrink-0 ${status.className}`}
                    >
                        <StatusIcon size={12} />
                        {status.label}
                    </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1.5">
                        <Calendar size={12} className="text-accent-blue" />
                        Requested {formatDate(item.createdAt)}
                    </span>
                    {item.updatedAt && item.updatedAt !== item.createdAt && (
                        <span className="inline-flex items-center gap-1.5">
                            Updated {formatDate(item.updatedAt)}
                        </span>
                    )}
                </div>

                {item.status === 'rejected' && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">
                            Rejection reason
                        </p>
                        <p className="text-xs font-medium text-text-main leading-relaxed">
                            {item.rejectionReason?.trim() || 'No reason provided'}
                        </p>
                    </div>
                )}

                {tx && (
                    <div className="rounded-xl border border-border-subtle bg-app-bg px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                                Payment
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${transactionStatusBadge(tx.status)}`}
                                >
                                    {tx.status}
                                </span>
                                <span className="text-xs font-bold text-text-main">
                                    {formatPrice(tx.amount)}
                                </span>
                                {tx.paymentType && (
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                        · {tx.paymentType}
                                    </span>
                                )}
                            </div>
                        </div>
                        {tx.screenshotUrl && (
                            <a
                                href={tx.screenshotUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-accent-blue hover:underline shrink-0"
                            >
                                View screenshot <ExternalLink size={12} />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}

export default function EnrollmentRequestsPage() {
    const dispatch = useAppDispatch();
    const { showToast } = useToast();

    const [mounted, setMounted] = useState(false);
    const [statusFilter, setStatusFilter] = useState<EnrollmentRequestStatus | ''>('');

    const {
        myEnrollmentRequests,
        myEnrollmentRequestsSummary,
        myEnrollmentRequestsLoading,
        myEnrollmentRequestsError,
    } = useAppSelector((state) => state.course);

    const loadRequests = useCallback(() => {
        const params =
            statusFilter === ''
                ? undefined
                : { status: statusFilter };
        dispatch(fetchMyEnrollmentRequests(params));
    }, [dispatch, statusFilter]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    useEffect(() => {
        return () => {
            dispatch(clearMyEnrollmentRequests());
        };
    }, [dispatch]);

    // Refetch when tab gains focus so admin approve/reject shows up
    useEffect(() => {
        const onFocus = () => loadRequests();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [loadRequests]);

    useEffect(() => {
        if (myEnrollmentRequestsError) {
            showToast(myEnrollmentRequestsError, 'error');
        }
    }, [myEnrollmentRequestsError, showToast]);

    const summaryCards = [
        {
            label: 'Pending',
            value: myEnrollmentRequestsSummary.pending,
            icon: Clock3,
            accent: 'text-amber-500 bg-amber-500/10',
        },
        {
            label: 'Enrolled',
            value: myEnrollmentRequestsSummary.enrolled,
            icon: CheckCircle2,
            accent: 'text-emerald-500 bg-emerald-500/10',
        },
        {
            label: 'Rejected',
            value: myEnrollmentRequestsSummary.rejected,
            icon: XCircle,
            accent: 'text-red-500 bg-red-500/10',
        },
        {
            label: 'Dismissed',
            value: myEnrollmentRequestsSummary.dismissed,
            icon: Ban,
            accent: 'text-text-muted bg-text-muted/10',
        },
        {
            label: 'Total',
            value: myEnrollmentRequestsSummary.total,
            icon: Layers,
            accent: 'text-accent-blue bg-accent-blue/10',
        },
    ];

    if (!mounted) return <div className="h-screen bg-app-bg transition-none" />;

    return (
        <div className="bg-app-bg min-h-screen text-text-main pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-12 space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-blue/10 text-accent-blue rounded-md text-[10px] font-bold uppercase tracking-widest">
                        <ClipboardList size={12} /> Enrollment Requests
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
                        Enrollment Requests
                    </h1>
                    <p className="text-text-muted text-sm font-medium max-w-xl leading-relaxed">
                        Track every course you requested to enroll in, including admin review status.
                    </p>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                    {summaryCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.label}
                                className="bg-card-bg border border-border-subtle rounded-2xl p-4 md:p-5 shadow-sm flex items-center gap-3"
                            >
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.accent}`}
                                >
                                    <Icon size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest truncate">
                                        {card.label}
                                    </p>
                                    <p className="text-xl font-black tabular-nums">
                                        {myEnrollmentRequestsLoading &&
                                        myEnrollmentRequests.length === 0
                                            ? '—'
                                            : card.value}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Status filter tabs */}
                <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map((tab) => {
                        const active = statusFilter === tab.value;
                        return (
                            <button
                                key={tab.label}
                                type="button"
                                onClick={() => setStatusFilter(tab.value)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                    active
                                        ? 'bg-text-main text-card-bg border-text-main'
                                        : 'bg-card-bg text-text-muted border-border-subtle hover:border-accent-blue/40 hover:text-accent-blue'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* List */}
                {myEnrollmentRequestsLoading && myEnrollmentRequests.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                            Loading requests
                        </p>
                    </div>
                ) : myEnrollmentRequests.length === 0 ? (
                    <div className="bg-card-bg border border-border-subtle rounded-2xl p-12 text-center shadow-sm">
                        <ClipboardList
                            size={40}
                            className="mx-auto mb-4 text-accent-blue/40"
                        />
                        <p className="text-sm font-bold text-text-muted uppercase tracking-wider">
                            {statusFilter
                                ? 'No requests with this status'
                                : 'No enrollment requests yet'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 relative">
                        {myEnrollmentRequestsLoading && (
                            <div className="absolute inset-0 bg-app-bg/40 z-10 flex items-start justify-center pt-8 pointer-events-none">
                                <Loader2 className="animate-spin text-accent-blue" size={28} />
                            </div>
                        )}
                        {myEnrollmentRequests.map((item) => (
                            <RequestCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
