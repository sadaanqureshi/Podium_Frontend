'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
    DollarSign,
    TrendingUp,
    Clock,
    CreditCard,
    FileText,
    User,
    BookOpen,
    Filter,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
    fetchFeesData,
    fetchTransactionDetails,
    clearSelectedTransaction,
} from '@/lib/store/features/financeSlice';
import { resolveMediaUrl, updateEnrollmentStatusAPI } from '@/lib/api/apiService';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/api/errorMessage';
import UserManagementTable from '@/components/ui/UserManagementTable';
import MoreInfo from '@/components/ui/MoreInfo';
import Pagination from '@/components/ui/Pagination';

type FeeFilter = 'all' | 'pending' | 'paid' | 'failed';

const PAGE_LIMIT = 10;

const statusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'paid' || s === 'approved' || s === 'enrolled') {
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
    if (s === 'dismissed' || s === 'rejected' || s === 'failed') {
        return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
};

const FeesManagement = () => {
    const dispatch = useAppDispatch();
    const { showToast } = useToast();

    const [actionLoading, setActionLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FeeFilter>('all');
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);

    const { transactions, stats, loading, selectedTransaction, detailsLoading, meta } =
        useAppSelector((state) => state.finance);

    const totalPages = Math.max(1, meta?.totalPages || 1);

    useEffect(() => {
        dispatch(fetchFeesData({ page, limit: PAGE_LIMIT }));
    }, [dispatch, page]);

    /** Detail API expects the unique transaction uuid (not a shared numeric id). */
    const resolveTransactionId = (item: any): string | number | null => {
        if (!item) return null;
        return item.uuid || item.transactionId || item.id || null;
    };

    const handleView = (itemOrId: any) => {
        const id =
            itemOrId && typeof itemOrId === 'object'
                ? resolveTransactionId(itemOrId)
                : itemOrId;
        if (id == null || id === '') return;
        dispatch(clearSelectedTransaction());
        setIsModalOpen(true);
        dispatch(fetchTransactionDetails(id));
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setRejectOpen(false);
        setRejectionReason('');
        dispatch(clearSelectedTransaction());
    };

    const getEnrollId = () =>
        selectedTransaction?.enrollId ||
        selectedTransaction?.enroll?.id ||
        selectedTransaction?.enrollmentId ||
        null;

    const executeApprove = async () => {
        const enrollId = getEnrollId();
        if (!enrollId) {
            showToast('Error: Enrollment ID missing from details!', 'error');
            return;
        }

        setActionLoading(true);
        try {
            await updateEnrollmentStatusAPI(enrollId, { action: 'approve' });
            showToast('Enrollment approved', 'success');
            dispatch(fetchFeesData({ page, limit: PAGE_LIMIT }));
            handleCloseModal();
        } catch (error: unknown) {
            showToast(getErrorMessage(error, 'Action failed'), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const executeReject = async () => {
        const enrollId = getEnrollId();
        if (!enrollId) {
            showToast('Error: Enrollment ID missing from details!', 'error');
            return;
        }

        const reason = rejectionReason.trim();
        if (!reason) {
            showToast('Please enter a rejection reason', 'error');
            return;
        }

        setActionLoading(true);
        try {
            await updateEnrollmentStatusAPI(enrollId, {
                action: 'reject',
                rejectionReason: reason,
            });
            showToast('Enrollment rejected', 'success');
            dispatch(fetchFeesData({ page, limit: PAGE_LIMIT }));
            handleCloseModal();
        } catch (error: unknown) {
            showToast(getErrorMessage(error, 'Action failed'), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const filterCounts = useMemo(() => {
        const list = transactions || [];
        const counts: Record<FeeFilter, number> = {
            all: list.length,
            pending: 0,
            paid: 0,
            failed: 0,
        };
        for (const txn of list) {
            const status = (txn.status?.toLowerCase() || 'pending') as FeeFilter;
            if (status === 'pending' || status === 'paid' || status === 'failed') {
                counts[status] += 1;
            }
        }
        return counts;
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];
        if (activeFilter === 'all') return transactions;
        return transactions.filter((txn: any) => {
            const status = txn.status?.toLowerCase() || 'pending';
            return status === activeFilter;
        });
    }, [transactions, activeFilter]);

    const feesColumns = useMemo(
        () => [
            {
                header: 'ID',
                key: 'uuid',
                widthClass: 'w-[10%]',
                render: (item: any) => (
                    <span className="font-bold text-accent-blue text-xs tabular-nums">
                        #{item.uuid?.slice(0, 8) || item.id || 'N/A'}
                    </span>
                ),
            },
            {
                header: 'Student',
                key: 'student',
                widthClass: 'w-[20%]',
                render: (item: any) => {
                    const name =
                        item.studentName ||
                        [item.student?.firstName, item.student?.lastName].filter(Boolean).join(' ') ||
                        'Unknown';
                    const email = item.studentEmail || item.student?.email;
                    return (
                        <div className="min-w-0">
                            <p className="font-black text-text-main text-sm tracking-tight truncate">
                                {name}
                            </p>
                            {email && (
                                <p className="text-[10px] text-text-muted font-medium truncate mt-0.5">
                                    {email}
                                </p>
                            )}
                        </div>
                    );
                },
            },
            {
                header: 'Course',
                key: 'courseName',
                widthClass: 'w-[26%]',
                render: (item: any) => (
                    <p
                        className="font-bold text-text-main text-sm leading-snug break-words"
                        title={item.courseName || item.course?.courseName}
                    >
                        {item.courseName || item.course?.courseName || 'General Payment'}
                    </p>
                ),
            },
            {
                header: 'Amount',
                key: 'amount',
                widthClass: 'w-[12%]',
                render: (item: any) => (
                    <span className="font-black text-emerald-500 tabular-nums">
                        ${item.amount || item.course?.price || 0}
                    </span>
                ),
            },
            {
                header: 'Status',
                key: 'status',
                widthClass: 'w-[12%]',
                align: 'center' as const,
                render: (item: any) => {
                    const currentStatus = item.status || 'Pending';
                    return (
                        <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusBadgeClass(currentStatus)}`}
                        >
                            {currentStatus}
                        </span>
                    );
                },
            },
            {
                header: 'Date',
                key: 'createdAt',
                widthClass: 'w-[12%]',
                align: 'right' as const,
                render: (item: any) => (
                    <span className="text-text-muted font-bold text-xs whitespace-nowrap">
                        {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString('en-GB')
                            : '—'}
                    </span>
                ),
            },
        ],
        []
    );

    const generateModalProps = () => {
        const data = selectedTransaction;
        if (!data) return { topCards: [], sections: [], imageProof: null, showActions: false };

        const student = data?.enroll?.student || {};
        const course = data?.enroll?.course || {};
        const studentName =
            `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown';
        const currentStatus = data?.status?.toLowerCase() || 'pending';

        const statusBadge = (
            <span
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusBadgeClass(currentStatus)}`}
            >
                {data.status || 'Pending'}
            </span>
        );

        return {
            topCards: [
                {
                    label: 'Total Amount',
                    value: (
                        <span className="text-3xl font-black text-emerald-500 tracking-tighter">
                            ${data.amount || 0}
                        </span>
                    ),
                },
                { label: 'Status', value: statusBadge },
            ],
            sections: [
                {
                    title: 'Payment Info',
                    icon: <CreditCard size={14} />,
                    fields: [
                        { label: 'Transaction ID', value: data.uuid || 'N/A', isHighlight: true },
                        {
                            label: 'Payment Method',
                            value: data.paymentType || 'N/A',
                            capitalize: true,
                        },
                        {
                            label: 'Date Submitted',
                            value: data.createdAt
                                ? new Date(data.createdAt).toLocaleString('en-GB')
                                : 'N/A',
                        },
                    ],
                },
                {
                    title: 'Student Identity',
                    icon: <User size={14} />,
                    fields: [
                        { label: 'Full Name', value: studentName },
                        { label: 'Email Address', value: student.email || 'N/A' },
                        { label: 'Roll Number', value: student.rollNumber || 'N/A' },
                        { label: 'Contact', value: student.contactNumber || 'N/A' },
                    ],
                },
                {
                    title: 'Course Details',
                    icon: <BookOpen size={14} />,
                    fields: [
                        {
                            label: 'Course Enrolled',
                            value: course.courseName || 'N/A',
                            isHighlight: true,
                        },
                        { label: 'Course Price', value: `$${course.price || '0.00'}` },
                    ],
                },
            ],
            imageProof: (() => {
                const raw =
                    data.screenshotUrl ||
                    data.screenshot_url ||
                    data.paymentScreenshot ||
                    data.proofUrl ||
                    data.transaction?.screenshotUrl ||
                    data.enroll?.transaction?.screenshotUrl ||
                    null;
                const url = resolveMediaUrl(raw);
                return url ? { label: 'Verification Proof', url } : null;
            })(),
            showActions: currentStatus === 'pending',
        };
    };

    const modalConfig = generateModalProps();

    const statCards = [
        {
            label: 'Gross Revenue',
            value: `${stats?.totalRevenue ?? 0}`,
            icon: DollarSign,
            accent: 'text-emerald-500 bg-emerald-500/10',
        },
        {
            label: 'Cleared',
            title: 'Cleared Transactions',
            value: stats?.paidTransactionCount ?? 0,
            icon: TrendingUp,
            accent: 'text-accent-blue bg-accent-blue/10',
        },
        {
            label: 'Awaiting',
            title: 'Pending Payments',
            value: stats?.pendingPayments ?? 0,
            icon: Clock,
            accent: 'text-amber-500 bg-amber-500/10',
        },
        {
            label: 'Volume',
            title: 'Total Transactions',
            value: stats?.totalTransactions ?? 0,
            icon: CreditCard,
            accent: 'text-violet-400 bg-violet-500/10',
        },
    ];

    const filters: { id: FeeFilter; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'pending', label: 'Pending' },
        { id: 'paid', label: 'Paid' },
        { id: 'failed', label: 'Failed' },
    ];

    return (
        <div className="p-4 md:p-8 bg-app-bg min-h-screen text-text-main space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
                    Fees Management
                </h1>
                <p className="text-text-muted text-sm font-medium mt-1">
                    Review payment proofs and approve or reject enrollment fees.
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            title={card.title || card.label}
                            className="bg-card-bg border border-border-subtle rounded-2xl p-4 shadow-sm flex items-center gap-3"
                        >
                            <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.accent}`}
                            >
                                <Icon size={20} strokeWidth={2.25} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest truncate">
                                    {card.label}
                                </p>
                                <p className="text-xl font-black tabular-nums tracking-tight truncate">
                                    {loading && !transactions?.length ? '—' : card.value}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-card-bg rounded-[1rem] shadow-sm border border-border-subtle overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-app-bg/40">
                    <div className="flex items-center gap-2 min-w-0">
                        <Filter size={15} className="text-text-muted shrink-0" />
                        <div>
                            <p className="text-sm font-black text-text-main tracking-tight">
                                Transactions
                            </p>
                            <p className="text-[10px] text-text-muted font-medium">
                                {filteredTransactions.length} shown
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {filters.map((filter) => (
                            <button
                                key={filter.id}
                                type="button"
                                onClick={() => setActiveFilter(filter.id)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                    activeFilter === filter.id
                                        ? 'bg-accent-blue text-white border-accent-blue shadow-md'
                                        : 'bg-card-bg text-text-muted border-border-subtle hover:border-accent-blue/40 hover:text-text-main'
                                }`}
                            >
                                {filter.label}
                                <span
                                    className={`tabular-nums ${
                                        activeFilter === filter.id
                                            ? 'text-white/80'
                                            : 'text-text-muted'
                                    }`}
                                >
                                    {filterCounts[filter.id]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <UserManagementTable
                    embedded
                    data={filteredTransactions}
                    loading={loading}
                    columnConfig={feesColumns}
                    type="Transaction"
                    visibleActions={['view']}
                    onView={(id) => {
                        const match = filteredTransactions.find(
                            (t: any) => t.uuid === id || t.id === id || t.transactionId === id
                        );
                        handleView(match || id);
                    }}
                    onRowClick={(item) => handleView(item)}
                />

                <div className="px-6 py-4 border-t border-border-subtle bg-app-bg/40">
                    <Pagination
                        page={meta?.currentPage || page}
                        totalPages={totalPages}
                        totalItems={meta?.totalItems ?? 0}
                        loading={loading}
                        onPageChange={setPage}
                    />
                </div>
            </div>

            <MoreInfo
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                loading={detailsLoading}
                actionLoading={actionLoading}
                title="Transaction Details"
                subtitle="Review payment & enrollment"
                headerIcon={<FileText size={20} strokeWidth={2.5} />}
                topCards={modalConfig.topCards}
                sections={modalConfig.sections}
                imageProof={modalConfig.imageProof}
                showActions={modalConfig.showActions}
                closedMessage="Transaction Closed"
                onApprove={executeApprove}
                onReject={() => {
                    setRejectionReason('');
                    setRejectOpen(true);
                }}
                approveText="Approve"
                rejectText="Reject"
                rejectReasonOpen={rejectOpen}
                rejectionReason={rejectionReason}
                onRejectionReasonChange={setRejectionReason}
                onConfirmReject={executeReject}
                onCancelReject={() => {
                    setRejectOpen(false);
                    setRejectionReason('');
                }}
                rejectReasonPlaceholder="e.g. Payment proof unclear"
            />
        </div>
    );
};

export default FeesManagement;
