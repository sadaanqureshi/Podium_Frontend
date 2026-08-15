'use client';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import {
    Filter,
    Check,
    X,
    Loader2,
    FileText,
    ExternalLink,
    Users,
    Clock,
    UserCheck,
    UserX,
    Ban,
    Search,
    ImageIcon,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchEnrollmentsData } from '@/lib/store/features/financeSlice';
import {
    resolveMediaUrl,
    updateEnrollmentStatusAPI,
    AdminEnrollmentStatus,
} from '@/lib/api/apiService';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/api/errorMessage';
import UserManagementTable from '@/components/ui/UserManagementTable';
import Pagination from '@/components/ui/Pagination';

type FilterKey = 'all' | AdminEnrollmentStatus;

const PAGE_LIMIT = 10;
const STATUS_FILTERS: FilterKey[] = ['pending', 'enrolled', 'rejected', 'dismissed', 'all'];

const enrollmentStatusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'enrolled') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'rejected') return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (s === 'dismissed') return 'bg-text-muted/10 text-text-muted border-border-subtle';
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
};

const paymentStatusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'paid' || s === 'free') return 'text-emerald-500';
    if (s === 'failed') return 'text-red-500';
    return 'text-amber-500';
};

const EnrollmentsPageInner = () => {
    const dispatch = useAppDispatch();
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const statusFromUrl = searchParams.get('status')?.toLowerCase() as FilterKey | null;

    const [page, setPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState<FilterKey>(
        statusFromUrl && STATUS_FILTERS.includes(statusFromUrl) ? statusFromUrl : 'pending'
    );
    const [studentName, setStudentName] = useState('');
    const [courseName, setCourseName] = useState('');
    const [studentQuery, setStudentQuery] = useState('');
    const [courseQuery, setCourseQuery] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [reviewItem, setReviewItem] = useState<any | null>(null);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [proofImageFailed, setProofImageFailed] = useState(false);

    useEffect(() => {
        if (statusFromUrl && STATUS_FILTERS.includes(statusFromUrl)) {
            setActiveFilter(statusFromUrl);
            setPage(1);
        }
    }, [statusFromUrl]);

    const { enrollments, enrollmentsLoading, enrollmentsMeta, enrollmentsStats } = useAppSelector(
        (state) => state.finance
    );

    useEffect(() => {
        const t = setTimeout(() => {
            setStudentQuery(studentName.trim());
            setCourseQuery(courseName.trim());
            setPage(1);
        }, 350);
        return () => clearTimeout(t);
    }, [studentName, courseName]);

    useEffect(() => {
        dispatch(
            fetchEnrollmentsData({
                page,
                limit: PAGE_LIMIT,
                status: activeFilter === 'all' ? '' : activeFilter,
                studentName: studentQuery || undefined,
                courseName: courseQuery || undefined,
            })
        );
    }, [dispatch, page, activeFilter, studentQuery, courseQuery]);

    const refreshList = () => {
        dispatch(
            fetchEnrollmentsData({
                page,
                limit: PAGE_LIMIT,
                status: activeFilter === 'all' ? '' : activeFilter,
                studentName: studentQuery || undefined,
                courseName: courseQuery || undefined,
            })
        );
    };

    const closeReview = () => {
        setReviewItem(null);
        setRejectOpen(false);
        setRejectionReason('');
        setProofImageFailed(false);
    };

    const handleApprove = async () => {
        if (!reviewItem?.id) return;
        setActionLoading(true);
        try {
            await updateEnrollmentStatusAPI(reviewItem.id, { action: 'approve' });
            showToast('Enrollment approved', 'success');
            closeReview();
            refreshList();
        } catch (err) {
            showToast(getErrorMessage(err, 'Failed to approve enrollment'), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectSubmit = async () => {
        if (!reviewItem?.id) return;
        const reason = rejectionReason.trim();
        if (!reason) {
            showToast('Please enter a rejection reason', 'error');
            return;
        }
        setActionLoading(true);
        try {
            await updateEnrollmentStatusAPI(reviewItem.id, {
                action: 'reject',
                rejectionReason: reason,
            });
            showToast('Enrollment rejected', 'success');
            closeReview();
            refreshList();
        } catch (err) {
            showToast(getErrorMessage(err, 'Failed to reject enrollment'), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const openReview = (item: any) => {
        setReviewItem(item);
        setRejectOpen(false);
        setRejectionReason('');
        setProofImageFailed(false);
    };

    const enrollmentColumns = useMemo(
        () => [
            {
                header: 'Student',
                key: 'student',
                widthClass: 'w-[22%]',
                render: (item: any) => (
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center font-black text-sm uppercase shrink-0 border border-accent-blue/20">
                            {item.student?.firstName?.[0] || 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="font-black text-text-main tracking-tight text-sm truncate">
                                {item.student?.firstName} {item.student?.lastName}
                            </p>
                            <p className="text-[10px] text-text-muted font-medium truncate mt-0.5">
                                {item.student?.email}
                            </p>
                            {item.student?.rollNumber && (
                                <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                                    {item.student.rollNumber}
                                </p>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Course',
                key: 'course',
                widthClass: 'w-[22%]',
                render: (item: any) => (
                    <p
                        className="font-bold text-text-main text-sm leading-snug break-words"
                        title={item.course?.courseName}
                    >
                        {item.course?.courseName || '—'}
                    </p>
                ),
            },
            {
                header: 'Enrollment',
                key: 'status',
                widthClass: 'w-[12%]',
                align: 'center' as const,
                render: (item: any) => (
                    <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${enrollmentStatusClass(item.status || 'pending')}`}
                    >
                        {item.status || 'pending'}
                    </span>
                ),
            },
            {
                header: 'Payment',
                key: 'payment',
                widthClass: 'w-[14%]',
                render: (item: any) => {
                    const tx = item.transaction;
                    if (!tx) {
                        return <span className="text-xs text-text-muted font-medium">—</span>;
                    }
                    return (
                        <div>
                            <p
                                className={`text-sm font-black tabular-nums ${paymentStatusClass(tx.status || '')}`}
                            >
                                ${tx.amount ?? item.course?.price ?? '0'}
                            </p>
                            <p
                                className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${paymentStatusClass(tx.status || '')}`}
                            >
                                {tx.status || '—'}
                                {tx.paymentType ? ` · ${tx.paymentType}` : ''}
                            </p>
                        </div>
                    );
                },
            },
            {
                header: 'Proof',
                key: 'proof',
                widthClass: 'w-[10%]',
                align: 'center' as const,
                render: (item: any) => {
                    const url = resolveMediaUrl(item.transaction?.screenshotUrl);
                    if (!url) {
                        return <span className="text-[10px] text-text-muted font-bold">—</span>;
                    }
                    return (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border-subtle text-[9px] font-black uppercase tracking-widest text-accent-blue hover:bg-accent-blue/10"
                        >
                            <ImageIcon size={12} /> View
                        </a>
                    );
                },
            },
            {
                header: 'Date',
                key: 'createdAt',
                widthClass: 'w-[10%]',
                align: 'right' as const,
                render: (item: any) => (
                    <span className="text-text-muted font-bold text-xs whitespace-nowrap">
                        {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString('en-GB')
                            : '—'}
                    </span>
                ),
            },
            {
                header: 'Actions',
                key: 'action',
                widthClass: 'w-[12%]',
                align: 'right' as const,
                render: (item: any) => {
                    const isPending = item.status?.toLowerCase() === 'pending';
                    if (!isPending) {
                        return (
                            <button
                                type="button"
                                onClick={() => openReview(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-text-muted border border-border-subtle hover:text-text-main"
                            >
                                <FileText size={12} /> Details
                            </button>
                        );
                    }
                    return (
                        <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => openReview(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent-blue/10 text-accent-blue text-[9px] font-black uppercase tracking-widest hover:bg-accent-blue hover:text-white"
                            >
                                <FileText size={12} /> Review
                            </button>
                        </div>
                    );
                },
            },
        ],
        []
    );

    const stats = enrollmentsStats;
    const meta = enrollmentsMeta;
    const totalPages = Math.max(1, meta?.totalPages || 1);

    const statCards = [
        {
            label: 'Total',
            value: stats?.total ?? 0,
            icon: Users,
            accent: 'text-accent-blue bg-accent-blue/10',
        },
        {
            label: 'Pending',
            value: stats?.pending ?? 0,
            icon: Clock,
            accent: 'text-amber-500 bg-amber-500/10',
        },
        {
            label: 'Enrolled',
            value: stats?.enrolled ?? 0,
            icon: UserCheck,
            accent: 'text-emerald-500 bg-emerald-500/10',
        },
        {
            label: 'Rejected',
            value: stats?.rejected ?? 0,
            icon: UserX,
            accent: 'text-rose-500 bg-rose-500/10',
        },
        {
            label: 'Dismissed',
            value: stats?.dismissed ?? 0,
            icon: Ban,
            accent: 'text-text-muted bg-text-muted/10',
        },
    ];

    const filters: { id: FilterKey; label: string }[] = [
        { id: 'pending', label: 'Pending' },
        { id: 'enrolled', label: 'Enrolled' },
        { id: 'rejected', label: 'Rejected' },
        { id: 'dismissed', label: 'Dismissed' },
        { id: 'all', label: 'All' },
    ];

    const screenshotUrl = resolveMediaUrl(
        reviewItem?.transaction?.screenshotUrl || reviewItem?.screenshotUrl
    );

    const isPendingReview = reviewItem?.status?.toLowerCase() === 'pending';

    return (
        <div className="p-4 md:p-8 bg-app-bg min-h-screen text-text-main space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
                    Student Enrollments
                </h1>
                <p className="text-text-muted text-sm font-medium mt-1">
                    Review payment proofs and manage enrollment requests.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            className="bg-card-bg border border-border-subtle rounded-2xl p-3 md:p-4 shadow-sm flex items-center gap-2.5 min-w-0"
                        >
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.accent}`}
                            >
                                <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-tight">
                                    {card.label}
                                </p>
                                <p className="text-xl font-black tabular-nums">
                                    {enrollmentsLoading && !enrollments?.length ? '—' : card.value}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-card-bg rounded-[1rem] shadow-sm border border-border-subtle overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-border-subtle space-y-4 bg-app-bg/40">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Filter size={15} className="text-text-muted" />
                            <div>
                                <p className="text-sm font-black text-text-main tracking-tight">
                                    Enrollment queue
                                </p>
                                <p className="text-[10px] text-text-muted font-medium">
                                    {meta?.totalItems ?? enrollments.length} matching
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {filters.map((filter) => {
                                const count =
                                    filter.id === 'all'
                                        ? stats?.total
                                        : stats?.[filter.id as keyof typeof stats];
                                return (
                                    <button
                                        key={filter.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveFilter(filter.id);
                                            setPage(1);
                                        }}
                                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                            activeFilter === filter.id
                                                ? 'bg-accent-blue text-white border-accent-blue shadow-md'
                                                : 'bg-card-bg text-text-muted border-border-subtle hover:border-accent-blue/40 hover:text-text-main'
                                        }`}
                                    >
                                        {filter.label}
                                        <span className="tabular-nums opacity-80">{count ?? 0}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="relative block">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                            />
                            <input
                                type="search"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                placeholder="Search student name…"
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-subtle bg-card-bg text-sm text-text-main outline-none focus:border-accent-blue"
                            />
                        </label>
                        <label className="relative block">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                            />
                            <input
                                type="search"
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                placeholder="Search course name…"
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-subtle bg-card-bg text-sm text-text-main outline-none focus:border-accent-blue"
                            />
                        </label>
                    </div>
                </div>

                <UserManagementTable
                    embedded
                    data={enrollments || []}
                    loading={enrollmentsLoading}
                    columnConfig={enrollmentColumns}
                    type="Enrollment"
                    visibleActions={[]}
                    onRowClick={(item) => openReview(item)}
                />

                <div className="px-4 md:px-6 py-4 border-t border-border-subtle bg-app-bg/40">
                    <Pagination
                        page={meta?.currentPage || page}
                        totalPages={totalPages}
                        totalItems={meta?.totalItems ?? 0}
                        loading={enrollmentsLoading}
                        onPageChange={setPage}
                    />
                </div>
            </div>

            {reviewItem && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border-subtle bg-card-bg shadow-2xl">
                        <div className="px-6 py-5 border-b border-border-subtle flex items-start justify-between gap-3 bg-app-bg/60">
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-accent-blue">
                                    {isPendingReview ? 'Pending review' : 'Enrollment details'}
                                </p>
                                <h2 className="text-lg font-black tracking-tight mt-1 truncate">
                                    {reviewItem.course?.courseName || 'Course'}
                                </h2>
                                <p className="text-xs text-text-muted font-medium mt-1">
                                    {reviewItem.student?.firstName} {reviewItem.student?.lastName} ·{' '}
                                    {reviewItem.student?.email}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeReview}
                                className="p-2 rounded-xl border border-border-subtle text-text-muted hover:text-text-main shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-border-subtle bg-app-bg p-3">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                                        Enrollment
                                    </p>
                                    <span
                                        className={`inline-block mt-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${enrollmentStatusClass(reviewItem.status || '')}`}
                                    >
                                        {reviewItem.status}
                                    </span>
                                </div>
                                <div className="rounded-xl border border-border-subtle bg-app-bg p-3">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                                        Payment
                                    </p>
                                    <p
                                        className={`mt-1.5 text-sm font-black ${paymentStatusClass(reviewItem.transaction?.status || '')}`}
                                    >
                                        ${reviewItem.transaction?.amount ?? reviewItem.course?.price ?? '0'}{' '}
                                        <span className="text-[10px] uppercase tracking-widest">
                                            {reviewItem.transaction?.status || '—'}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {reviewItem.rejectionReason && (
                                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">
                                        Rejection reason
                                    </p>
                                    <p className="text-sm text-text-main font-medium">
                                        {reviewItem.rejectionReason}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">
                                    Payment proof
                                </p>
                                {screenshotUrl && !proofImageFailed ? (
                                    <a
                                        href={screenshotUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block rounded-xl border border-border-subtle overflow-hidden bg-app-bg hover:border-accent-blue/40 transition-colors"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={screenshotUrl}
                                            alt="Payment proof"
                                            referrerPolicy="no-referrer"
                                            className="w-full max-h-56 object-contain"
                                            onError={() => setProofImageFailed(true)}
                                        />
                                        <p className="text-center text-[9px] font-black uppercase tracking-widest text-accent-blue py-2 flex items-center justify-center gap-1">
                                            Open full size <ExternalLink size={11} />
                                        </p>
                                    </a>
                                ) : screenshotUrl && proofImageFailed ? (
                                    <div className="rounded-xl border border-border-subtle bg-app-bg p-4 space-y-3">
                                        <div className="flex items-center gap-2 text-text-muted">
                                            <ImageIcon size={16} className="shrink-0" />
                                            <p className="text-xs font-medium">
                                                Preview unavailable — the proof link may have expired or is
                                                unreachable.
                                            </p>
                                        </div>
                                        <a
                                            href={screenshotUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-accent-blue hover:underline"
                                        >
                                            Try open original <ExternalLink size={12} />
                                        </a>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-border-subtle bg-app-bg p-4 flex items-center gap-2 text-text-muted">
                                        <ImageIcon size={16} className="shrink-0 opacity-60" />
                                        <p className="text-xs font-medium">
                                            No payment screenshot attached (free or missing proof).
                                        </p>
                                    </div>
                                )}
                            </div>

                            {isPendingReview &&
                                (rejectOpen ? (
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted">
                                            Rejection reason
                                        </label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            rows={3}
                                            placeholder="e.g. Payment proof unclear"
                                            className="w-full bg-app-bg border border-border-subtle rounded-xl p-3 text-sm text-text-main outline-none focus:border-accent-blue resize-none"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={() => {
                                                    setRejectOpen(false);
                                                    setRejectionReason('');
                                                }}
                                                className="flex-1 py-3 rounded-xl border border-border-subtle text-[10px] font-black uppercase tracking-widest text-text-muted"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={handleRejectSubmit}
                                                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {actionLoading ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <X size={14} />
                                                )}
                                                Confirm reject
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => setRejectOpen(true)}
                                            className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <X size={14} /> Reject
                                        </button>
                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={handleApprove}
                                            className="flex-1 py-3 rounded-xl bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {actionLoading ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Check size={14} />
                                            )}
                                            Approve
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function EnrollmentsPage() {
    return (
        <Suspense
            fallback={
                <div className="p-8 min-h-screen bg-app-bg flex items-center justify-center text-text-muted text-xs font-black uppercase tracking-widest">
                    Loading enrollments…
                </div>
            }
        >
            <EnrollmentsPageInner />
        </Suspense>
    );
}
