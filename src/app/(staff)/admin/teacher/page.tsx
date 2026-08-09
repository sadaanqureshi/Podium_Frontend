'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Users,
    UserCheck,
    UserX,
    BookOpen,
    Inbox,
    Sparkles,
} from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchAllTeachers } from '@/lib/store/features/userSlice';
import { createTeachersAPI, updateTeachersAPI, deleteTeachersAPI } from '@/lib/api/apiService';
import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';
import UserManagementTable from '@/components/ui/UserManagementTable';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/api/errorMessage';

const PAGE_LIMIT = 10;

const TeacherManagement = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { showToast } = useToast();

    const { teachers, loading } = useAppSelector((state) => state.users);
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState('');

    useEffect(() => {
        dispatch(fetchAllTeachers({ page, limit: PAGE_LIMIT }));
    }, [dispatch, page]);

    const stats = teachers.stats;
    const meta = teachers.meta;
    const totalPages = Math.max(1, meta?.totalPages || 1);

    const teacherFields: FormField[] = useMemo(() => {
        const baseFields: FormField[] = [
            { name: 'firstName', label: 'First Name', type: 'text', required: true },
            { name: 'lastName', label: 'Last Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'text', required: true },
            { name: 'contactNumber', label: 'Contact Number', type: 'text' },
        ];

        if (selectedUser) {
            return [
                ...baseFields.slice(0, 3),
                {
                    name: 'password',
                    label: 'Reset Password',
                    type: 'text',
                    placeholder: 'Enter new password or leave blank',
                },
                ...baseFields.slice(3),
            ];
        }
        return baseFields;
    }, [selectedUser]);

    const teacherColumns = useMemo(
        () => [
            { header: 'Faculty Name', key: 'firstName' },
            { header: 'Official Email', key: 'email' },
            { header: 'Phone', key: 'contactNumber' },
            {
                header: 'Status',
                key: 'isActive',
                align: 'center' as const,
                render: (item: any) => (
                    <span
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
                            item.isActive
                                ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/20'
                                : 'bg-app-bg text-text-muted border-border-subtle'
                        }`}
                    >
                        {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                ),
            },
        ],
        []
    );

    const openProfile = (id: number) => {
        router.push(`/admin/teacher/${id}`);
    };

    const handleSubmit = async (formData: FormData) => {
        setModalLoading(true);
        const data = Object.fromEntries(formData);
        try {
            if (selectedUser) {
                if (!data.password) delete data.password;
                await updateTeachersAPI(selectedUser.id, data);
                showToast('Teacher Information updated', 'success');
            } else {
                await createTeachersAPI(data);
                showToast('Teacher registered', 'success');
            }
            setModalOpen(false);
            dispatch(fetchAllTeachers({ page, limit: PAGE_LIMIT }));
        } catch (err: unknown) {
            showToast(getErrorMessage(err, 'Failed to save teacher'), 'error');
        } finally {
            setModalLoading(false);
        }
    };

    const statCards = [
        {
            label: 'Total Teachers',
            value: stats?.totalTeachers ?? 0,
            icon: Users,
            accent: 'text-accent-blue bg-accent-blue/10',
        },
        {
            label: 'Active',
            value: stats?.activeTeachers ?? 0,
            icon: UserCheck,
            accent: 'text-emerald-500 bg-emerald-500/10',
        },
        {
            label: 'Inactive',
            value: stats?.inactiveTeachers ?? 0,
            icon: UserX,
            accent: 'text-rose-500 bg-rose-500/10',
        },
        {
            label: 'With Accepted Courses',
            value: stats?.teachersWithAcceptedCourses ?? 0,
            icon: BookOpen,
            accent: 'text-violet-400 bg-violet-500/10',
        },
        {
            label: 'Pending Course Assignments',
            value: stats?.pendingCourseAssignments ?? 0,
            icon: Inbox,
            accent: 'text-amber-500 bg-amber-500/10',
        },
        {
            label: 'New This Month',
            value: stats?.newTeachersThisMonth ?? 0,
            icon: Sparkles,
            accent: 'text-sky-400 bg-sky-500/10',
        },
    ];

    return (
        <div className="p-4 md:p-8 bg-app-bg min-h-screen text-text-main space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                        Teacher List
                    </h1>
                    <p className="text-text-muted text-sm font-medium mt-1">
                        Browse teachers and open a profile for courses & workload.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setSelectedUser(null);
                        setModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95"
                >
                    <Plus size={18} strokeWidth={3} /> Register Teacher
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            className="bg-card-bg border border-border-subtle rounded-2xl p-4 shadow-sm flex items-center gap-3"
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
                                    {loading && !teachers.data?.length ? '—' : card.value}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-card-bg rounded-[1rem] shadow-2xl border border-border-subtle overflow-hidden">
                <UserManagementTable
                    data={teachers.data || []}
                    loading={loading || false}
                    columnConfig={teacherColumns}
                    visibleActions={['view', 'edit', 'delete']}
                    onView={openProfile}
                    onRowClick={(item) => openProfile(item.id)}
                    onEdit={(user) => {
                        setSelectedUser({ ...user, isActive: String(user.isActive) });
                        setModalOpen(true);
                    }}
                    onDelete={(id, name) => {
                        setDeleteId(id);
                        setDeleteName(name);
                    }}
                    type="Teacher"
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

            <DeleteConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={async () => {
                    await deleteTeachersAPI(deleteId!);
                    dispatch(fetchAllTeachers({ page, limit: PAGE_LIMIT }));
                    setDeleteId(null);
                }}
                title={deleteName}
            />
            <GenericFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedUser ? 'Edit Teacher Information' : 'Add New Teacher'}
                fields={teacherFields}
                onSubmit={handleSubmit}
                loading={modalLoading}
                initialData={selectedUser}
            />
        </div>
    );
};

export default TeacherManagement;
