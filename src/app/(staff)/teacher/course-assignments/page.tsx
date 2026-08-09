'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    Loader2,
    Inbox,
    Clock3,
    CheckCircle2,
    XCircle,
    Tag,
    ImageIcon,
} from 'lucide-react';
import {
    getAssignedCourses,
    respondToCourseAssignment,
    type AssignedCourseItem,
    type AssignedCoursesMeta,
    type AssignedCoursesSummary,
} from '@/lib/api/apiService';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/api/errorMessage';
import Pagination from '@/components/ui/Pagination';

type FilterTab = 'pending' | 'accepted' | 'all';

const TABS: { id: FilterTab; label: string }[] = [
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'all', label: 'All' },
];

function formatPrice(price: string | null | undefined) {
    if (price == null || price === '' || Number(price) === 0) return 'Free';
    const n = Number(price);
    if (Number.isNaN(n)) return String(price);
    return `Rs ${n.toLocaleString()}`;
}

function statusBadge(status: string, needsAction?: boolean) {
    if (needsAction || status === 'pending') {
        return {
            label: 'Action required',
            className: 'bg-amber-500/10 border-amber-500/25 text-amber-500',
            Icon: Clock3,
        };
    }
    if (status === 'accepted') {
        return {
            label: 'Accepted',
            className: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500',
            Icon: CheckCircle2,
        };
    }
    if (status === 'rejected') {
        return {
            label: 'Rejected',
            className: 'bg-red-500/10 border-red-500/25 text-red-500',
            Icon: XCircle,
        };
    }
    return {
        label: status || 'Unknown',
        className: 'bg-text-muted/10 border-border-subtle text-text-muted',
        Icon: Inbox,
    };
}

function AssignmentCardSkeleton() {
    return (
        <div className="rounded-2xl border border-border-subtle bg-card-bg overflow-hidden animate-pulse flex flex-col sm:flex-row">
            <div className="sm:w-44 h-36 sm:h-auto bg-app-bg shrink-0" />
            <div className="flex-1 p-5 space-y-3">
                <div className="h-3 w-24 rounded bg-border-subtle" />
                <div className="h-5 w-2/3 rounded bg-border-subtle" />
                <div className="h-3 w-full rounded bg-border-subtle" />
                <div className="h-3 w-1/2 rounded bg-border-subtle" />
                <div className="flex gap-2 pt-2">
                    <div className="h-9 w-24 rounded-xl bg-border-subtle" />
                    <div className="h-9 w-24 rounded-xl bg-border-subtle" />
                </div>
            </div>
        </div>
    );
}

function AssignmentCard({
    item,
    actingId,
    onAccept,
    onReject,
}: {
    item: AssignedCourseItem;
    actingId: number | null;
    onAccept: (id: number) => void;
    onReject: (id: number) => void;
}) {
    const badge = statusBadge(String(item.teacherStatus), item.needsAction);
    const StatusIcon = badge.Icon;
    const busy = actingId === item.id;
    const showActions = item.needsAction === true || item.teacherStatus === 'pending';
    const desc = (item.shortDescription || '').trim();

    return (
        <article className="rounded-2xl border border-border-subtle bg-card-bg overflow-hidden shadow-sm flex flex-col sm:flex-row">
            <div className="relative sm:w-44 h-36 sm:min-h-[10rem] shrink-0 bg-app-bg">
                {item.coverImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={item.coverImg}
                        alt={item.courseName || 'Course'}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-text-muted/35">
                        <ImageIcon size={28} />
                    </div>
                )}
            </div>

            <div className="flex-1 p-5 md:p-6 flex flex-col gap-3 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${badge.className}`}
                    >
                        <StatusIcon size={11} />
                        {badge.label}
                    </span>
                    {item.courseCategory?.name && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            <Tag size={11} className="text-accent-blue" />
                            {item.courseCategory.name}
                        </span>
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue">
                        {formatPrice(item.price)}
                    </span>
                </div>

                <div className="min-w-0 space-y-1.5">
                    <h3 className="text-base md:text-lg font-black tracking-tight text-text-main truncate">
                        {item.courseName || 'Untitled course'}
                    </h3>
                    <p className="text-xs text-text-muted font-medium leading-relaxed line-clamp-2">
                        {desc || 'No description provided.'}
                    </p>
                    {item.createdBy && (
                        <p className="text-[10px] font-bold text-text-muted/80 uppercase tracking-wider">
                            From {item.createdBy.firstName} {item.createdBy.lastName}
                        </p>
                    )}
                </div>

                {showActions && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => onAccept(item.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/90 disabled:opacity-50"
                        >
                            {busy ? (
                                <Loader2 size={13} className="animate-spin" />
                            ) : (
                                <CheckCircle2 size={13} />
                            )}
                            Accept
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => onReject(item.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 disabled:opacity-50"
                        >
                            <XCircle size={13} />
                            Reject
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
}

export default function TeacherCourseAssignmentsPage() {
    const { showToast } = useToast();

    const [tab, setTab] = useState<FilterTab>('pending');
    const [page, setPage] = useState(1);
    const [items, setItems] = useState<AssignedCourseItem[]>([]);
    const [meta, setMeta] = useState<AssignedCoursesMeta | null>(null);
    const [summary, setSummary] = useState<AssignedCoursesSummary>({
        pending: 0,
        accepted: 0,
        filter: 'pending',
    });
    const [loading, setLoading] = useState(true);
    const [actingId, setActingId] = useState<number | null>(null);
    const [rejectTarget, setRejectTarget] = useState<AssignedCourseItem | null>(null);
    const limit = 10;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAssignedCourses({
                status: tab === 'all' ? undefined : tab,
                page,
                limit,
            });
            setItems(res.data || []);
            setMeta(res.meta);
            setSummary(res.summary || { pending: 0, accepted: 0, filter: tab });
        } catch (err) {
            showToast(getErrorMessage(err, 'Failed to load course assignments'), 'error');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [tab, page, showToast]);

    useEffect(() => {
        load();
    }, [load]);

    const handleTab = (next: FilterTab) => {
        setTab(next);
        setPage(1);
    };

    const handleAccept = async (courseId: number) => {
        setActingId(courseId);
        try {
            const res = await respondToCourseAssignment(courseId, 'accept');
            showToast(res.message || 'Course assignment accepted', 'success');
            await load();
        } catch (err) {
            showToast(getErrorMessage(err, 'Failed to accept assignment'), 'error');
        } finally {
            setActingId(null);
        }
    };

    const confirmReject = async () => {
        if (!rejectTarget) return;
        const courseId = rejectTarget.id;
        setActingId(courseId);
        try {
            const res = await respondToCourseAssignment(courseId, 'reject');
            showToast(res.message || 'Course assignment rejected', 'success');
            setRejectTarget(null);
            await load();
        } catch (err) {
            showToast(getErrorMessage(err, 'Failed to reject assignment'), 'error');
        } finally {
            setActingId(null);
        }
    };

    const emptyCopy =
        tab === 'pending'
            ? 'No pending course assignments'
            : tab === 'accepted'
              ? 'No accepted courses yet'
              : 'No course assignments found';

    const totalPages = Math.max(1, meta?.totalPages || 1);

    return (
        <div className="bg-app-bg min-h-screen text-text-main">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 md:pt-10 pb-16 space-y-8">
                <section className="relative overflow-hidden rounded-[2rem] border border-border-subtle bg-card-bg p-8 md:p-10 shadow-sm">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.16),_transparent_55%)]" />
                    <div className="relative z-10 space-y-3">
                        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-accent-blue">
                            <Inbox size={14} /> Teacher
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                            Course Assignments
                        </h1>
                        <p className="text-sm text-text-muted font-medium max-w-xl">
                            Review courses assigned by admin. Accept to start teaching, or reject if
                            you cannot take the course.
                        </p>
                    </div>
                </section>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2">
                    {TABS.map((t) => {
                        const active = tab === t.id;
                        const count =
                            t.id === 'pending'
                                ? summary.pending
                                : t.id === 'accepted'
                                  ? summary.accepted
                                  : summary.pending + summary.accepted;
                        return (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => handleTab(t.id)}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                    active
                                        ? 'bg-accent-blue text-white border-accent-blue'
                                        : 'bg-card-bg text-text-muted border-border-subtle hover:border-accent-blue/40 hover:text-text-main'
                                }`}
                            >
                                {t.label}
                                <span
                                    className={`min-w-[1.25rem] px-1.5 py-0.5 rounded-md text-center tabular-nums ${
                                        active
                                            ? 'bg-white/20 text-white'
                                            : 'bg-app-bg text-text-muted border border-border-subtle'
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* List */}
                <div className="space-y-4">
                    {loading && items.length === 0 ? (
                        <>
                            <AssignmentCardSkeleton />
                            <AssignmentCardSkeleton />
                            <AssignmentCardSkeleton />
                        </>
                    ) : !loading && items.length === 0 ? (
                        <div className="rounded-2xl border border-border-subtle bg-card-bg p-12 text-center">
                            <Inbox className="mx-auto text-text-muted/35 mb-4" size={36} />
                            <p className="text-sm font-black uppercase tracking-widest text-text-muted">
                                {emptyCopy}
                            </p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <AssignmentCard
                                key={item.id}
                                item={item}
                                actingId={actingId}
                                onAccept={handleAccept}
                                onReject={(id) => {
                                    const found = items.find((c) => c.id === id) || null;
                                    setRejectTarget(found);
                                }}
                            />
                        ))
                    )}

                    {loading && items.length > 0 && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="animate-spin text-accent-blue" size={22} />
                        </div>
                    )}
                </div>

                <Pagination
                    className="pt-2"
                    page={meta?.currentPage || page}
                    totalPages={totalPages}
                    totalItems={meta?.totalItems ?? 0}
                    loading={loading}
                    onPageChange={setPage}
                />
            </div>

            {/* Reject confirm */}
            {rejectTarget && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-card-bg p-6 md:p-8 shadow-2xl space-y-5">
                        <div className="space-y-2">
                            <h2 className="text-lg font-black tracking-tight">Reject assignment?</h2>
                            <p className="text-sm text-text-muted font-medium leading-relaxed">
                                You are about to reject{' '}
                                <span className="text-text-main font-bold">
                                    {rejectTarget.courseName}
                                </span>
                                . This cannot be undone from this screen.
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                disabled={actingId != null}
                                onClick={() => setRejectTarget(null)}
                                className="px-4 py-2.5 rounded-xl border border-border-subtle text-[10px] font-black uppercase tracking-widest text-text-muted"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={actingId != null}
                                onClick={confirmReject}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                            >
                                {actingId === rejectTarget.id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <XCircle size={14} />
                                )}
                                Confirm reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
