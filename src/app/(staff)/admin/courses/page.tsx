'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Plus, CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// API Service Imports
import {
    getAllCoursesAPI,
    updateCourseAPI,
    createCourseAPI,
    getCourseCategoriesAPI,
    getTeachersAPI
} from '@/lib/api/apiService';

// UI Components
import UserManagementTable from '@/components/ui/UserManagementTable';
import SearchBar from '@/components/ui/SearchBar';
import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

const AdminCoursesPage = () => {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [courses, setCourses] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dropdown States
    const [categories, setCategories] = useState<{ label: string, value: number }[]>([]);
    const [teachers, setTeachers] = useState<{ label: string, value: number }[]>([]);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // 1. Fetch All Data Logic
    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [coursesRes, catRes, teacherRes] = await Promise.all([
                getAllCoursesAPI(page, 10),
                getCourseCategoriesAPI(),
                getTeachersAPI()
            ]);

            setCourses(coursesRes.data);
            setMeta(coursesRes.meta);

            if (catRes) setCategories(catRes.map((c: any) => ({ label: c.name, value: c.id })));
            if (teacherRes.data) setTeachers(teacherRes.data.map((t: any) => ({ label: `${t.firstName} ${t.lastName}`, value: t.id })));
        } catch (err: any) {
            setError(err.message || "Terminal sync failed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, [page]);

    // # 2. TABLE COLUMN CONFIGURATION (Using Design Tokens)
    const columnConfig = useMemo(() => [
        {
            header: 'Course Identity',
            key: 'firstName', // Table component is avatar logic ke liye firstName dhoondta hai
            render: (item: any) => (
                <div className="flex items-center gap-4">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-border-subtle bg-app-bg shadow-sm">
                        <img src={item.coverImg || '/blankcover.jpg'} alt={item.courseName} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-black text-sm text-text-main uppercase tracking-tight italic">{item.courseName}</span>
                </div>
            )
        },
        { header: 'Price', key: 'price', render: (item: any) => <span className="font-bold text-text-muted italic">${item.price}</span> },
        { 
            header: 'Sector', key: 'courseCategory', 
            render: (item: any) => (
                <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue rounded-full text-[9px] font-black uppercase tracking-widest border border-accent-blue/20">
                    {item.courseCategory?.name || 'N/A'}
                </span>
            )
        },
        { header: 'Instructor', key: 'teacher', render: (item: any) => <span className="text-xs font-black text-text-muted uppercase">{item.teacher ? `${item.teacher.firstName} ${item.teacher.lastName}` : 'Unassigned'}</span> },
        {
            header: 'Sync', key: 'isActive', align: 'center' as const,
            render: (item: any) => item.isActive ? <CheckCircle size={18} className="text-emerald-500 mx-auto" /> : <XCircle size={18} className="text-text-muted opacity-30 mx-auto" />
        },
        { header: 'Registry', key: 'createdAt', align: 'right' as const, render: (item: any) => <span className="text-[10px] font-black text-text-muted uppercase">{new Date(item.createdAt).toLocaleDateString('en-GB')}</span> }
    ], []);

    // # 3. DYNAMIC FORM FIELDS (Names must match handleEdit mapping)
    const courseFields: FormField[] = useMemo(() => [
        { name: 'CourseName', label: 'Course Name', type: 'text', placeholder: 'Enter course name', required: true },
        { name: 'Price', label: 'Price ($)', type: 'text', placeholder: '99.99', required: true },
        { name: 'CourseCategoryId', label: 'Category', type: 'select', options: categories, required: true },
        { name: 'TeacherId', label: 'Assign Teacher', type: 'select', options: teachers },
        { name: 'ShortDescription', label: 'Short Description', type: 'textarea', required: true },
        { name: 'LongDescription', label: 'Long Description', type: 'textarea' },
        { 
            name: 'Languages', label: 'Languages', type: 'checkbox-group', 
            options: [{ label: 'Urdu', value: 'urdu' }, { label: 'English', value: 'english' }], required: true 
        },
        { name: 'image', label: 'Cover Image', type: 'files' }
    ], [categories, teachers]);

    // Handlers
    const handleFormSubmit = async (formData: FormData) => {
        setActionLoading(true);
        try {
            if (selectedCourse?.id) await updateCourseAPI(selectedCourse.id, formData);
            else await createCourseAPI(formData);
            setIsModalOpen(false);
            setSelectedCourse(null);
            fetchAllData();
        } catch (err: any) { alert(err.message); }
        finally { setActionLoading(false); }
    };

    return (
        <div className="p-4 md:p-8 w-full bg-app-bg min-h-screen text-text-main transition-colors duration-300">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Academic Inventory</h1>
                    <p className="text-text-muted text-sm font-medium italic underline decoration-accent-blue/30 underline-offset-4 tracking-tighter">Control and manage all podium courses.</p>
                </div>
                <button 
                    onClick={() => { setSelectedCourse(null); setIsModalOpen(true); }} 
                    className="flex items-center gap-2 px-8 py-4 bg-accent-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-accent-blue/20 hover:bg-hover-blue transition-all active:scale-95"
                >
                    <Plus size={18} strokeWidth={3} /> <span>Architect Asset</span>
                </button>
            </div>

            {/* Filter */}
            <div className="bg-card-bg p-5 rounded-[2.5rem] border border-border-subtle mb-8 shadow-sm">
                <SearchBar placeholder="Search assets..." />
            </div>

            {/* # TABLE INTEGRATION */}
            <div className="bg-card-bg rounded-[2.5rem] shadow-2xl border border-border-subtle overflow-hidden">
                {error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-red-500">
                        <AlertCircle size={40} className="mb-2" />
                        <p className="font-medium text-center px-4 italic">{error}</p>
                        <button onClick={() => fetchAllData()} className="mt-4 text-accent-blue font-black uppercase text-xs underline">Re-Sync Terminal</button>
                    </div>
                ) : (
                    <UserManagementTable 
                        data={courses}
                        loading={loading}
                        columnConfig={columnConfig}
                        type="Course"
                        visibleActions={['view', 'edit', 'delete']}
                        onView={(id) => router.push(`/admin/courses/${id}`)}
                        onEdit={(item) => {
                            // # CRITICAL FIX: Mapping backend data to Modal field names
                            setSelectedCourse({
                                id: item.id,
                                CourseName: item.courseName,
                                Price: item.price,
                                CourseCategoryId: item.courseCategory?.id,
                                TeacherId: item.teacher?.id,
                                ShortDescription: item.shortDescription || "",
                                LongDescription: item.longDescription || "",
                                Languages: item.languages || []
                            });
                            setIsModalOpen(true);
                        }}
                        onDelete={(id, name) => {
                            setSelectedCourse({ id, courseName: name });
                            setIsDeleteModalOpen(true);
                        }}
                    />
                )}

                {/* Pagination (Themed) */}
                {meta && (
                    <div className="px-8 py-6 bg-app-bg/50 border-t border-border-subtle flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Sector Page {meta.currentPage} / {meta.totalPages}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-6 py-2.5 bg-card-bg border border-border-subtle text-text-main rounded-xl disabled:opacity-20 text-[10px] font-black uppercase hover:bg-sidebar-to">Prev</button>
                            <button onClick={() => setPage(p => p + 1)} disabled={page === meta.totalPages} className="px-6 py-2.5 bg-card-bg border border-accent-blue/30 text-accent-blue rounded-xl disabled:opacity-20 text-[10px] font-black uppercase hover:bg-accent-blue hover:text-white">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Consolidate Modal into ONE component to avoid state lag */}
            <GenericFormModal 
                isOpen={isModalOpen} 
                onClose={() => { setIsModalOpen(false); setSelectedCourse(null); }} 
                title={selectedCourse?.id ? "Modify Course Assets" : "Architect New Asset"} 
                fields={courseFields} 
                onSubmit={handleFormSubmit} 
                loading={actionLoading} 
                initialData={selectedCourse} 
            />
            
            <DeleteConfirmationModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={() => { alert("Purge Asset: " + selectedCourse?.courseName); setIsDeleteModalOpen(false); }} 
                title={selectedCourse?.courseName || ""} 
            />
        </div>
    );
};

export default AdminCoursesPage;