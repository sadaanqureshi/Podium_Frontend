'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    BookOpen,
    CheckCircle,
    XCircle,
    Users,
    UserMinus,
    Inbox,
    ClipboardList,
    GraduationCap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchAdminCourses } from '@/lib/store/features/courseSlice';
import {
    updateCourseAPI,
    createCourseAPI,
    getCourseCategoriesAPI,
    getTeachersAPI,
} from '@/lib/api/apiService';
import UserManagementTable from '@/components/ui/UserManagementTable';
import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/api/errorMessage';

const PAGE_LIMIT = 10;

const teacherStatusBadge = (status: string | undefined) => {
    const s = (status || '').toLowerCase();
    if (s === 'accepted')
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'rejected') return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (s === 'pending') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-text-muted/10 text-text-muted border-border-subtle';
};

const AdminCoursesPage = () => {
    const dispatch = useAppDispatch();
    const { showToast } = useToast();
    const router = useRouter();

    const { adminCourses, loading: reduxLoading } = useAppSelector((state) => state.course);

    const [page, setPage] = useState(1);
    const [categories, setCategories] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchAdminCourses({ page, limit: PAGE_LIMIT }));
    }, [dispatch, page]);

    useEffect(() => {
        const loadMeta = async () => {
            try {
                const [catRes, teacherRes] = await Promise.all([
                    getCourseCategoriesAPI(),
                    getTeachersAPI(),
                ]);
                const cats = Array.isArray(catRes) ? catRes : catRes?.data || [];
                const teacherList = Array.isArray(teacherRes)
                    ? teacherRes
                    : teacherRes?.data || [];
                setCategories(cats.map((c: any) => ({ label: c.name, value: c.id })));
                setTeachers(
                    teacherList.map((t: any) => ({
                        label: `${t.firstName} ${t.lastName}`,
                        value: t.id,
                    }))
                );
            } catch {
                /* meta optional for list view */
            }
        };
        loadMeta();
    }, []);

    const stats = adminCourses.stats;
    const meta = adminCourses.meta;
    const totalPages = Math.max(1, meta?.totalPages || 1);

    const columnConfig = useMemo(
        () => [
            {
                header: 'Course',
                key: 'course',
                widthClass: 'w-[30%]',
                render: (item: any) => (
                    <div className="flex items-start gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={item.coverImg || '/blankcover.jpg'}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-border-subtle shrink-0 mt-0.5"
                        />
                        <p
                            className="font-black text-sm text-text-main leading-snug break-words"
                            title={item.courseName}
                        >
                            {item.courseName}
                        </p>
                    </div>
                ),
            },
            {
                header: 'Category',
                key: 'category',
                widthClass: 'w-[10%]',
                render: (item: any) => (
                    <span className="block truncate text-xs font-bold text-text-muted" title={item.courseCategory?.name}>
                        {item.courseCategory?.name || '—'}
                    </span>
                ),
            },
            {
                header: 'Teacher',
                key: 'teacher',
                widthClass: 'w-[14%]',
                render: (item: any) => {
                    const name = item.teacher
                        ? `${item.teacher.firstName} ${item.teacher.lastName}`
                        : 'Unassigned';
                    return (
                        <span className="block text-xs font-black text-text-muted uppercase leading-snug break-words" title={name}>
                            {name}
                        </span>
                    );
                },
            },
            {
                header: 'Status',
                key: 'teacherStatus',
                widthClass: 'w-[10%]',
                align: 'center' as const,
                render: (item: any) => (
                    <span
                        className={`inline-block px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${teacherStatusBadge(item.teacherStatus)}`}
                    >
                        {item.teacherStatus || '—'}
                    </span>
                ),
            },
            {
                header: 'Enrolled',
                key: 'enrolled',
                widthClass: 'w-[8%]',
                align: 'center' as const,
                render: (item: any) => (
                    <span className="text-sm font-black tabular-nums">
                        {item.enrolledStudentsCount ?? 0}
                    </span>
                ),
            },
            {
                header: 'Pending',
                key: 'pending',
                widthClass: 'w-[8%]',
                align: 'center' as const,
                render: (item: any) => (
                    <span className="text-sm font-black tabular-nums text-amber-500">
                        {item.pendingEnrollmentsCount ?? 0}
                    </span>
                ),
            },
            {
                header: 'Active',
                key: 'isActive',
                widthClass: 'w-[7%]',
                align: 'center' as const,
                render: (item: any) =>
                    item.isActive ? (
                        <CheckCircle size={18} className="text-emerald-500 mx-auto" />
                    ) : (
                        <XCircle size={18} className="text-text-muted opacity-40 mx-auto" />
                    ),
            },
            {
                header: 'Price',
                key: 'price',
                widthClass: 'w-[9%]',
                render: (item: any) => (
                    <span className="font-bold text-text-muted whitespace-nowrap">${item.price}</span>
                ),
            },
        ],
        []
    );

    const courseFields: FormField[] = useMemo(
        () => [
            { name: 'CourseName', label: 'Course Name', type: 'text', required: true },
            { name: 'Price', label: 'Price ($)', type: 'text', required: true },
            {
                name: 'CourseCategoryId',
                label: 'Category',
                type: 'select',
                options: categories,
                required: true,
            },
            { name: 'TeacherId', label: 'Assign Teacher', type: 'select', options: teachers },
            {
                name: 'ShortDescription',
                label: 'Short Description',
                type: 'textarea',
                required: true,
            },
            { name: 'LongDescription', label: 'Long Description', type: 'textarea' },
            {
                name: 'Languages',
                label: 'Languages',
                type: 'checkbox-group',
                options: [
                    { label: 'Urdu', value: 'urdu' },
                    { label: 'English', value: 'english' },
                ],
                required: true,
            },
            { name: 'image', label: 'Cover Image', type: 'files' },
        ],
        [categories, teachers]
    );

    const openDetail = (id: number) => router.push(`/admin/courses/${id}`);

    const handleFormSubmit = async (formData: FormData) => {
        setActionLoading(true);
        try {
            if (selectedCourse?.id) {
                const patchData = new FormData();
                let hasChanges = false;

                formData.forEach((value, key) => {
                    const oldValue = selectedCourse[key];
                    if (value !== String(oldValue) && key !== 'image') {
                        patchData.append(key, value);
                        hasChanges = true;
                    }
                    if (key === 'image' && (value as File).size > 0) {
                        patchData.append(key, value);
                        hasChanges = true;
                    }
                });

                if (!hasChanges) {
                    showToast('No changes detected', 'success');
                    setIsModalOpen(false);
                    return;
                }

                await updateCourseAPI(selectedCourse.id, patchData);
                showToast('Course modified successfully', 'success');
            } else {
                await createCourseAPI(formData);
                showToast('New course created successfully', 'success');
            }
            setIsModalOpen(false);
            dispatch(fetchAdminCourses({ page, limit: PAGE_LIMIT }));
        } catch (err: unknown) {
            showToast(getErrorMessage(err, 'Failed to save course'), 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const statCards = [
        {
            label: 'Total',
            title: 'Total Courses',
            value: stats?.totalCourses ?? 0,
            icon: BookOpen,
            accent: 'text-accent-blue bg-accent-blue/10',
        },
        {
            label: 'Active',
            title: 'Active Courses',
            value: stats?.activeCourses ?? 0,
            icon: CheckCircle,
            accent: 'text-emerald-500 bg-emerald-500/10',
        },
        {
            label: 'Inactive',
            title: 'Inactive Courses',
            value: stats?.inactiveCourses ?? 0,
            icon: XCircle,
            accent: 'text-rose-500 bg-rose-500/10',
        },
        {
            label: 'With Teacher',
            title: 'Courses With Teacher',
            value: stats?.withTeacher ?? 0,
            icon: GraduationCap,
            accent: 'text-violet-400 bg-violet-500/10',
        },
        {
            label: 'No Teacher',
            title: 'Courses Without Teacher',
            value: stats?.withoutTeacher ?? 0,
            icon: UserMinus,
            accent: 'text-text-muted bg-text-muted/10',
        },
        {
            label: 'Pending Assign',
            title: 'Pending Teacher Assignments',
            value: stats?.pendingTeacherAssignments ?? 0,
            icon: Inbox,
            accent: 'text-amber-500 bg-amber-500/10',
        },
        {
            label: 'Enrolled',
            title: 'Total Enrolled Students',
            value: stats?.totalEnrolledStudents ?? 0,
            icon: Users,
            accent: 'text-sky-400 bg-sky-500/10',
        },
        {
            label: 'Pending Req',
            title: 'Pending Enrollment Requests',
            value: stats?.pendingEnrollmentRequests ?? 0,
            icon: ClipboardList,
            accent: 'text-amber-500 bg-amber-500/10',
        },
    ];

    return (
        <div className="p-4 md:p-8 w-full bg-app-bg min-h-screen text-text-main space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
                        Course Management
                    </h1>
                    <p className="text-text-muted text-sm font-medium mt-1">
                        Overview of courses, teachers, and enrollment demand.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setSelectedCourse(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95"
                >
                    <Plus size={18} strokeWidth={3} /> Create Course
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.title}
                            title={card.title}
                            className="bg-card-bg border border-border-subtle rounded-2xl p-3.5 shadow-sm flex items-center gap-2.5"
                        >
                            <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${card.accent}`}
                            >
                                <Icon size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-widest leading-tight">
                                    {card.label}
                                </p>
                                <p className="text-lg font-black tabular-nums">
                                    {reduxLoading.adminCourses && !adminCourses.data?.length
                                        ? '—'
                                        : card.value}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-card-bg rounded-[1rem] shadow-2xl border border-border-subtle overflow-hidden">
                <UserManagementTable
                    embedded
                    data={adminCourses.data || []}
                    loading={reduxLoading.adminCourses}
                    columnConfig={columnConfig}
                    type="Course"
                    visibleActions={['view', 'edit']}
                    onView={openDetail}
                    onRowClick={(item) => openDetail(item.id)}
                    onEdit={(item) => {
                        setSelectedCourse({
                            id: item.id,
                            CourseName: item.courseName,
                            Price: item.price,
                            CourseCategoryId: item.courseCategory?.id,
                            TeacherId: item.teacher?.id,
                            ShortDescription: item.shortDescription,
                            LongDescription: item.longDescription,
                            Languages: item.languages,
                        });
                        setIsModalOpen(true);
                    }}
                />

                <div className="px-4 md:px-6 py-4 border-t border-border-subtle bg-app-bg/40">
                    <Pagination
                        page={meta?.currentPage || page}
                        totalPages={totalPages}
                        totalItems={meta?.totalItems ?? 0}
                        loading={reduxLoading.adminCourses}
                        onPageChange={setPage}
                    />
                </div>
            </div>

            <GenericFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedCourse?.id ? 'Edit Course' : 'Create Course'}
                fields={courseFields}
                onSubmit={handleFormSubmit}
                loading={actionLoading}
                initialData={selectedCourse}
            />
        </div>
    );
};

export default AdminCoursesPage;
