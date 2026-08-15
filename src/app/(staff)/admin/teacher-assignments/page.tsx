'use client';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import {
    Filter,
    Search,
    Users,
    Clock,
    UserCheck,
    UserX,
    UserMinus,
    GraduationCap,
    Loader2,
    X,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchTeacherAssignments } from '@/lib/store/features/courseSlice';
import {
    assignTeacherToCourseAPI,
    getTeachersAPI,
    AdminTeacherAssignmentStatus,
} from '@/lib/api/apiService';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/api/errorMessage';
import UserManagementTable from '@/components/ui/UserManagementTable';
import Pagination from '@/components/ui/Pagination';

type FilterKey = 'all' | AdminTeacherAssignmentStatus;

const PAGE_LIMIT = 10;
const STATUS_FILTERS: FilterKey[] = [
    'pending',
    'accepted',
    'rejected',
    'unassigned',
    'all',
];

const statusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'accepted') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'rejected') return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (s === 'unassigned') return 'bg-text-muted/10 text-text-muted border-border-subtle';
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
};

const TeacherAssignmentsPageInner = () => {
    const dispatch = useAppDispatch();
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const statusFromUrl = searchParams.get('status')?.toLowerCase() as FilterKey | null;

    const [page, setPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState<FilterKey>(
        statusFromUrl && STATUS_FILTERS.includes(statusFromUrl) ? statusFromUrl : 'pending'
    );

    useEffect(() => {
        if (statusFromUrl && STATUS_FILTERS.includes(statusFromUrl)) {
            setActiveFilter(statusFromUrl);
            setPage(1);
        }
    }, [statusFromUrl]);
    const [teacherName, setTeacherName] = useState('');
    const [courseName, setCourseName] = useState('');
    const [teacherQuery, setTeacherQuery] = useState('');
    const [courseQuery, setCourseQuery] = useState('');

    const [assignOpen, setAssignOpen] = useState(false);
    const [assignItem, setAssignItem] = useState<any | null>(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
    const [teacherOptions, setTeacherOptions] = useState<{ label: string; value: number }[]>([]);
    const [teachersLoading, setTeachersLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const { teacherAssignments, teacherAssignmentsLoading } = useAppSelector(
        (state) => state.course
    );
    const rows = useMemo(
        () =>
            (teacherAssignments.data || []).map((row) => ({
                ...row,
                // Table row key expects `id`
                id: row.courseId,
            })),
        [teacherAssignments.data]
    );
    const stats = teacherAssignments.stats;
    const meta = teacherAssignments.meta;
    const totalPages = Math.max(1, meta?.totalPages || 1);

    useEffect(() => {
        const t = setTimeout(() => {
            setTeacherQuery(teacherName.trim());
            setCourseQuery(courseName.trim());
            setPage(1);
        }, 350);
        return () => clearTimeout(t);
    }, [teacherName, courseName]);

    const listParams = useMemo(
        () => ({
            page,
            limit: PAGE_LIMIT,
            status: (activeFilter === 'all' ? '' : activeFilter) as AdminTeacherAssignmentStatus | '',
            teacherName: teacherQuery || undefined,
            courseName: courseQuery || undefined,
        }),
        [page, activeFilter, teacherQuery, courseQuery]
    );

    useEffect(() => {
        dispatch(fetchTeacherAssignments(listParams));
    }, [dispatch, listParams]);

    const refreshList = () => {
        dispatch(fetchTeacherAssignments(listParams));
    };

    const loadTeachers = async () => {
        setTeachersLoading(true);
        try {
            const res = await getTeachersAPI();
            const list = Array.isArray(res) ? res : res?.data || [];
            setTeacherOptions(
                list.map((t: any) => ({
                    label: `${t.firstName} ${t.lastName}${t.email ? ` (${t.email})` : ''}`,
                    value: t.id,
                }))
            );
        } catch (err) {
            showToast(getErrorMessage(err, 'Failed to load teachers'), 'error');
            setTeacherOptions([]);
        } finally {
            setTeachersLoading(false);
        }
    };

    const openAssign = async (item: any) => {
        setAssignItem(item);
        setSelectedTeacherId(item.teacher?.id ? String(item.teacher.id) : '');
        setAssignOpen(true);
        if (!teacherOptions.length) await loadTeachers();
    };

    const closeAssign = () => {
        setAssignOpen(false);
        setAssignItem(null);
        setSelectedTeacherId('');
    };

    const handleAssignSubmit = async () => {
        if (!assignItem?.courseId) return;
        const teacherId = Number(selectedTeacherId);
        if (!teacherId) {
            showToast('Please select a teacher', 'error');
            return;
        }
        setActionLoading(true);
        try {
            await assignTeacherToCourseAPI(assignItem.courseId, teacherId);
            showToast('Teacher assignment invitation sent', 'success');
            closeAssign();
            refreshList();
        } catch (err) {
            showToast(getErrorMessage(err, 'Failed to assign teacher'), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const actionLabel = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'accepted' || s === 'pending') return 'Reassign';
        return 'Assign Teacher';
    };

    const columns = useMemo(
        () => [
            {
                header: 'Course',
                key: 'course',
                widthClass: 'w-[28%]',
                render: (item: any) => (
                    <div className="flex items-start gap-3 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={item.coverImg || '/blankcover.jpg'}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-border-subtle shrink-0"
                        />
                        <div className="min-w-0">
                            <p className="font-black text-sm text-text-main leading-snug break-words">
                                {item.courseName}
                            </p>
                            {item.price != null && (
                                <p className="text-[10px] text-emerald-500 font-bold mt-0.5">
                                    ${item.price}
                                </p>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Category',
                key: 'category',
                widthClass: 'w-[12%]',
                render: (item: any) => (
                    <span className="block truncate text-xs font-bold text-text-muted">
                        {item.courseCategory?.name || '—'}
                    </span>
                ),
            },
            {
                header: 'Teacher',
                key: 'teacher',
                widthClass: 'w-[22%]',
                render: (item: any) => {
                    if (!item.teacher) {
                        return (
                            <span className="text-xs font-bold text-text-muted italic">
                                No teacher
                            </span>
                        );
                    }
                    return (
                        <div className="min-w-0">
                            <p className="font-black text-sm text-text-main truncate">
                                {item.teacher.firstName} {item.teacher.lastName}
                            </p>
                            <p className="text-[10px] text-text-muted font-medium truncate mt-0.5">
                                {item.teacher.email}
                            </p>
                        </div>
                    );
                },
            },
            {
                header: 'Status',
                key: 'status',
                widthClass: 'w-[12%]',
                align: 'center' as const,
                render: (item: any) => (
                    <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusClass(item.assignmentStatus || 'unassigned')}`}
                    >
                        {item.assignmentStatus || 'unassigned'}
                    </span>
                ),
            },
            {
                header: 'Updated',
                key: 'updatedAt',
                widthClass: 'w-[12%]',
                align: 'right' as const,
                render: (item: any) => (
                    <span className="text-text-muted font-bold text-xs whitespace-nowrap">
                        {item.updatedAt
                            ? new Date(item.updatedAt).toLocaleDateString('en-GB')
                            : item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString('en-GB')
                              : '—'}
                    </span>
                ),
            },
            {
                header: 'Actions',
                key: 'actions',
                widthClass: 'w-[14%]',
                align: 'right' as const,
                render: (item: any) => (
                    <div onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => openAssign(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-blue/10 text-accent-blue text-[9px] font-black uppercase tracking-widest hover:bg-accent-blue hover:text-white transition-colors"
                        >
                            <GraduationCap size={13} />
                            {actionLabel(item.assignmentStatus || '')}
                        </button>
                    </div>
                ),
            },
        ],
        [teacherOptions.length]
    );

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
            label: 'Accepted',
            value: stats?.accepted ?? 0,
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
            label: 'Unassigned',
            value: stats?.unassigned ?? 0,
            icon: UserMinus,
            accent: 'text-text-muted bg-text-muted/10',
        },
    ];

    const filters: { id: FilterKey; label: string }[] = [
        { id: 'pending', label: 'Pending' },
        { id: 'accepted', label: 'Accepted' },
        { id: 'rejected', label: 'Rejected' },
        { id: 'unassigned', label: 'Unassigned' },
        { id: 'all', label: 'All' },
    ];

    return (
        <div className="p-4 md:p-8 bg-app-bg min-h-screen text-text-main space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
                    Teacher Assignments
                </h1>
                <p className="text-text-muted text-sm font-medium mt-1">
                    Assign teachers to courses and track invitation status.
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
                                    {teacherAssignmentsLoading && !rows.length ? '—' : card.value}
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
                                    Assignment queue
                                </p>
                                <p className="text-[10px] text-text-muted font-medium">
                                    {meta?.totalItems ?? rows.length} matching
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
                                value={teacherName}
                                onChange={(e) => setTeacherName(e.target.value)}
                                placeholder="Search teacher name…"
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
                    data={rows}
                    loading={teacherAssignmentsLoading}
                    columnConfig={columns}
                    type="Assignment"
                />

                <div className="px-4 md:px-6 py-4 border-t border-border-subtle bg-app-bg/40">
                    <Pagination
                        page={meta?.currentPage || page}
                        totalPages={totalPages}
                        totalItems={meta?.totalItems ?? 0}
                        loading={teacherAssignmentsLoading}
                        onPageChange={setPage}
                    />
                </div>
            </div>

            {assignOpen && assignItem && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-border-subtle bg-card-bg shadow-2xl">
                        <div className="px-6 py-5 border-b border-border-subtle flex items-start justify-between gap-3 bg-app-bg/60">
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-accent-blue">
                                    {actionLabel(assignItem.assignmentStatus || '')}
                                </p>
                                <h2 className="text-lg font-black tracking-tight mt-1 truncate">
                                    {assignItem.courseName}
                                </h2>
                                <p className="text-xs text-text-muted font-medium mt-1">
                                    Sends an invitation email. Status becomes pending until the
                                    teacher responds.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeAssign}
                                className="p-2 rounded-xl border border-border-subtle text-text-muted hover:text-text-main shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <label className="block space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    Select teacher
                                </span>
                                <select
                                    value={selectedTeacherId}
                                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                                    disabled={teachersLoading || actionLoading}
                                    className="w-full rounded-xl border border-border-subtle bg-app-bg px-3 py-3 text-sm text-text-main outline-none focus:border-accent-blue disabled:opacity-50"
                                >
                                    <option value="">
                                        {teachersLoading ? 'Loading teachers…' : 'Choose a teacher'}
                                    </option>
                                    {teacherOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={closeAssign}
                                    className="flex-1 py-3 rounded-xl border border-border-subtle text-[10px] font-black uppercase tracking-widest text-text-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={actionLoading || !selectedTeacherId}
                                    onClick={handleAssignSubmit}
                                    className="flex-1 py-3 rounded-xl bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <GraduationCap size={14} />
                                    )}
                                    Send invitation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function TeacherAssignmentsPage() {
    return (
        <Suspense
            fallback={
                <div className="p-8 min-h-screen bg-app-bg flex items-center justify-center text-text-muted text-xs font-black uppercase tracking-widest">
                    Loading teacher assignments…
                </div>
            }
        >
            <TeacherAssignmentsPageInner />
        </Suspense>
    );
}
