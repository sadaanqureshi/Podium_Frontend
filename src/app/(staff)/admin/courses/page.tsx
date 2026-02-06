'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchAdminCourses } from '@/lib/store/features/courseSlice';
import { updateCourseAPI, createCourseAPI, getCourseCategoriesAPI, getTeachersAPI } from '@/lib/api/apiService';
import UserManagementTable from '@/components/ui/UserManagementTable';
import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { useToast } from '@/context/ToastContext';

const AdminCoursesPage = () => {
    const dispatch = useAppDispatch();
    const { showToast } = useToast();
    const router = useRouter();
    
    // Redux State
    const { adminCourses, loading: reduxLoading } = useAppSelector((state) => state.course);
    
    const [page, setPage] = useState(1);
    const [categories, setCategories] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchAdminCourses({ page, limit: 10 }));
        const loadMeta = async () => {
            const [catRes, teacherRes] = await Promise.all([getCourseCategoriesAPI(), getTeachersAPI()]);
            setCategories(catRes.map((c: any) => ({ label: c.name, value: c.id })));
            setTeachers(teacherRes.data.map((t: any) => ({ label: `${t.firstName} ${t.lastName}`, value: t.id })));
        };
        loadMeta();
    }, [dispatch, page]);

    const columnConfig = useMemo(() => [
        {
            header: 'Course Identity', key: 'firstName',
            render: (item: any) => (
                <div className="flex items-center gap-4">
                    <img src={item.coverImg || '/blankcover.jpg'} className="w-11 h-11 rounded-xl object-cover border border-border-subtle" />
                    <span className="font-black text-sm text-text-main uppercase italic">{item.courseName}</span>
                </div>
            )
        },
        { header: 'Price', key: 'price', render: (item: any) => <span className="font-bold text-text-muted italic">${item.price}</span> },
        { header: 'Instructor', key: 'teacher', render: (item: any) => <span className="text-xs font-black text-text-muted uppercase">{item.teacher?.firstName} {item.teacher?.lastName}</span> },
        {
            header: 'Sync', key: 'isActive', align: 'center' as const,
            render: (item: any) => item.isActive ? <CheckCircle size={18} className="text-emerald-500 mx-auto" /> : <XCircle size={18} className="text-text-muted opacity-30 mx-auto" />
        }
    ], []);

    const courseFields: FormField[] = useMemo(() => [
        { name: 'CourseName', label: 'Course Name', type: 'text', required: true },
        { name: 'Price', label: 'Price ($)', type: 'text', required: true },
        { name: 'CourseCategoryId', label: 'Category', type: 'select', options: categories, required: true },
        { name: 'TeacherId', label: 'Assign Teacher', type: 'select', options: teachers },
        { name: 'ShortDescription', label: 'Short Description', type: 'textarea', required: true },
        { name: 'LongDescription', label: 'Long Description', type: 'textarea' },
        { name: 'Languages', label: 'Languages', type: 'checkbox-group', options: [{ label: 'Urdu', value: 'urdu' }, { label: 'English', value: 'english' }], required: true },
        { name: 'image', label: 'Cover Image', type: 'files' }
    ], [categories, teachers]);

    const handleFormSubmit = async (formData: FormData) => {
        setActionLoading(true);
        try {
            if (selectedCourse?.id) {
                // # REQUIREMENT: Partial Update (Dirty Fields Only)
                const patchData = new FormData();
                let hasChanges = false;

                formData.forEach((value, key) => {
                    const oldValue = selectedCourse[key];
                    // Compare new value with the mapped selectedCourse data
                    if (value !== String(oldValue) && key !== 'image') {
                        patchData.append(key, value);
                        hasChanges = true;
                    }
                    // Always allow image if selected
                    if (key === 'image' && (value as File).size > 0) {
                        patchData.append(key, value);
                        hasChanges = true;
                    }
                });

                if (!hasChanges) {
                    showToast("No changes detected", "success");
                    setIsModalOpen(false);
                    return;
                }

                await updateCourseAPI(selectedCourse.id, patchData);
                showToast("Course modified successfully", "success");
            } else {
                await createCourseAPI(formData);
                showToast("New course created successfully", "success");
            }
            setIsModalOpen(false);
            dispatch(fetchAdminCourses({ page, limit: 10 }));
        } catch (err: any) { showToast(err.message, "error"); }
        finally { setActionLoading(false); }
    };

    return (
        <div className="p-4 md:p-8 w-full bg-app-bg min-h-screen text-text-main">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Course Management</h1>
                <button onClick={() => { setSelectedCourse(null); setIsModalOpen(true); }} className="px-8 py-4 bg-accent-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95">
                    <Plus size={18} strokeWidth={3} /> Create Course
                </button>
            </div>

            <div className="bg-card-bg rounded-[2.5rem] shadow-2xl border border-border-subtle overflow-hidden">
                <UserManagementTable 
                    data={adminCourses.data} loading={reduxLoading.adminCourses} 
                    columnConfig={columnConfig} type="Course" visibleActions={['view', 'edit', 'delete']}
                    onView={(id) => router.push(`/admin/courses/${id}`)}
                    onEdit={(item) => {
                        setSelectedCourse({
                            id: item.id,
                            CourseName: item.courseName,
                            Price: item.price,
                            CourseCategoryId: item.courseCategory?.id,
                            TeacherId: item.teacher?.id,
                            ShortDescription: item.shortDescription,
                            LongDescription: item.longDescription,
                            Languages: item.languages
                        });
                        setIsModalOpen(true);
                    }}
                />
                {/* Pagination Logic same as yours */}
            </div>

            <GenericFormModal 
                isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} 
                title={selectedCourse?.id ? "Edit Course" : "Create Course"} 
                fields={courseFields} onSubmit={handleFormSubmit} 
                loading={actionLoading} initialData={selectedCourse} 
            />
        </div>
    );
};

export default AdminCoursesPage;