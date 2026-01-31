'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    Edit, Trash2, Eye, Plus, CheckCircle, XCircle, Loader2, AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import SearchBar from '@/components/ui/SearchBar';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
// API Service Imports
import {
    getAllCoursesAPI,
    updateCourseAPI,
    createCourseAPI,
    getCourseCategoriesAPI, // Ensure these are exported in apiService
    getTeachersAPI
} from '@/lib/api/apiService';

// Generic Modal Import
import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';

interface Course {
    id: number;
    courseName: string;
    price: string;
    coverImg: string;
    createdAt: string;
    isActive: boolean;
    courseCategory: { name: string };
    teacher: { firstName: string; lastName: string };
}

const AdminCoursesPage = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [meta, setMeta] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    // Dropdown States
    const [categories, setCategories] = useState<{ label: string, value: number }[]>([]);
    const [teachers, setTeachers] = useState<{ label: string, value: number }[]>([]);

    // Edit/Delete States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [createLoading, setCreateLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal States
    // const [isModalOpen, setIsModalOpen] = useState(false);
    // const [createLoading, setCreateLoading] = useState(false);

    // 1. Fetch All Data (Initial & Page Change)
    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Promise.all se teeno calls ek saath jayengi
            const [coursesRes, catRes, teacherRes] = await Promise.all([
                getAllCoursesAPI(page, 10),
                getCourseCategoriesAPI(),
                getTeachersAPI()
            ]);

            setCourses(coursesRes.data);
            setMeta(coursesRes.meta);

            // Category options transform
            if (catRes) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setCategories(catRes.map((c: any) => ({
                    label: c.name,
                    value: c.id
                })));
            }
            //   console.log('awdnkjawd', categories)
            console.log('Fetched Categories:', catRes.data);
            console.log('fetched teachers:', teacherRes.data);
            // Teacher options transform
            if (teacherRes.data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setTeachers(teacherRes.data.map((t: any) => ({
                    label: `${t.firstName} ${t.lastName}`,
                    value: t.id
                })));
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || "Data load karne mein masla hua hai.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEdit = (course: any) => {
        // Data format set karna taaki modal ke keys se match kare
        setSelectedCourse({
            CourseName: course.courseName,
            Price: course.price,
            CourseCategoryId: course.courseCategory?.id,
            TeacherId: course.teacher?.id,
            ShortDescription: course.shortDescription || "",
            LongDescription: course.longDescription || "",
            Languages: course.languages || [], // Agar backend se array aa raha hai
            id: course.id // API call ke liye ID zaroori hai
        });
        setIsEditModalOpen(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDeleteClick = (course: any) => {
        setSelectedCourse(course);
        setIsDeleteModalOpen(true);
    };

    const handleFormSubmit = async (formData: FormData) => {
        setCreateLoading(true);
        try {
            if (selectedCourse?.id) {
                console.log("UPDATING COURSE ID:", selectedCourse.id);
                await updateCourseAPI(selectedCourse.id, formData);
            } else {
                await createCourseAPI(formData);
                alert("Course created successfully!");
            }
            setIsEditModalOpen(false);
            fetchAllData();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) { alert(err.message); }
        finally { setCreateLoading(false); }
    };
    // 2. Dynamic Form Configuration
    // useMemo isliye use kiya taaki categories/teachers update hon toh fields refresh hon
    //   const courseFields: FormField[] = useMemo(() => [
    //     { name: 'CourseName', label: 'Course Name', type: 'text', placeholder: 'e.g. Blockchain Basics', required: true },
    //     { name: 'Price', label: 'Price ($)', type: 'text', placeholder: '99.99', required: true },
    //     { 
    //       name: 'CourseCategoryId', 
    //       label: 'Course Category', 
    //       type: 'select', 
    //       options: categories, 
    //       required: true 
    //     },
    //     { 
    //       name: 'TeacherId', 
    //       label: 'Assign Teacher', 
    //       type: 'select', 
    //       options: teachers 
    //     },
    //     { name: 'ShortDescription', label: 'Short Description', type: 'textarea', placeholder: 'Max 200 chars', required: true },
    //     { name: 'LongDescription', label: 'Long Description', type: 'textarea', placeholder: 'Details...' },

    //     // Yahan change kiya hai: checkbox-group with options array
    //     { 
    //       name: 'Languages', 
    //       label: 'Select Languages', 
    //       type: 'checkbox-group', 
    //       required: true,
    //       options: [
    //         { label: 'English', value: 'English' },
    //         { label: 'Urdu', value: 'Urdu' },
    //         { label: 'French', value: 'French' },
    //         { label: 'Arabic', value: 'Arabic' }
    //       ]
    //     },

    //     { name: 'image', label: 'Cover Image', type: 'file' }
    // ], [categories, teachers]);


    // Inside AdminCoursesPage.tsx, update courseFields:

    const courseFields: FormField[] = useMemo(() => [
        { name: 'CourseName', label: 'Course Name', type: 'text', placeholder: 'Enter unique course name', required: true },
        { name: 'Price', label: 'Price ($)', type: 'text', placeholder: 'e.g. 49.99', required: true },
        {
            name: 'CourseCategoryId',
            label: 'Course Category',
            type: 'select',
            options: categories,
            required: true
        },
        {
            name: 'TeacherId',
            label: 'Assign Teacher',
            type: 'select',
            options: teachers
        },
        { name: 'ShortDescription', label: 'Short Description', type: 'textarea', placeholder: 'Brief summary...', required: true },
        { name: 'LongDescription', label: 'Long Description', type: 'textarea', placeholder: 'Detailed description...' },
        {
            name: 'Languages',
            label: 'Languages',
            type: 'checkbox-group',
            required: true,
            options: [
                { label: 'Urdu', value: 'urdu' },
                { label: 'English', value: 'english' }
            ]
        },
        { name: 'image', label: 'Cover Image', type: 'files' } // strictly 'image' small letters as per your manual
    ], [categories, teachers]);

    // 3. Handlers
    const handleCreateCourse = async (formData: FormData) => {
        setCreateLoading(true);
        try {
            await createCourseAPI(formData);
            setIsModalOpen(false);
            fetchAllData(); // Refresh table
            alert("Course created successfully!");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            // Agar backend "Course already exists" bhej raha hai toh wahi yahan alert hoga
            alert(err.message);
        } finally {
            setCreateLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="p-4 md:p-8 w-full bg-gray-50 min-h-screen font-sans text-[#0F172A]">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Course Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Saray academic courses yahan se manage karein.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 w-full sm:w-auto justify-center"
                >
                    <Plus size={20} strokeWidth={3} />
                    <span>Create New Course</span>
                </button>
            </div>

            <GenericFormModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setSelectedCourse(null); }}
                title={selectedCourse ? "Edit Course" : "Create New Course"}
                fields={courseFields}
                onSubmit={handleFormSubmit}
                loading={createLoading}
                initialData={selectedCourse} // Pass selected course data
            />
            <GenericFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Academic Course"
                fields={courseFields}
                onSubmit={handleCreateCourse}
                loading={createLoading}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => { alert("Delete trigger for: " + selectedCourse.courseName); setIsDeleteModalOpen(false); }}
                title={selectedCourse?.courseName || ""}
            />

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <SearchBar placeholder="Search by course, teacher or category..." />
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
                        <p className="text-gray-500 font-medium text-sm">Loading data...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-red-500">
                        <AlertCircle size={40} className="mb-2" />
                        <p className="font-medium text-center px-4">{error}</p>
                        <button onClick={() => fetchAllData()} className="mt-4 text-blue-600 font-bold underline">Try again</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 font-bold text-gray-400 uppercase text-[11px] tracking-widest">
                                    <th className="px-6 py-5">Course Name</th>
                                    <th className="px-6 py-5">Price</th>
                                    <th className="px-6 py-5">Category</th>
                                    <th className="px-6 py-5">Teacher</th>
                                    <th className="px-6 py-5 text-center">Status</th>
                                    <th className="px-6 py-5 text-center">Created At</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {courses.length > 0 ? (
                                    courses.map((course) => (
                                        <tr key={course.id} className="hover:bg-blue-50/20 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-gray-50">

                                                        <Image
                                                            src={course.coverImg || '/blankcover.jpg'}
                                                            alt={course.courseName}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <span className="font-bold text-sm">{course.courseName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">${course.price}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-extrabold uppercase">{course.courseCategory?.name}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button className={`p-1 transition-transform active:scale-90 ${course.isActive ? 'text-green-500' : 'text-gray-300'}`}>
                                                    {course.isActive ? <CheckCircle size={22} fill="currentColor" className="text-white fill-green-500" /> : <XCircle size={22} />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center font-medium">{formatDate(course.createdAt)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1 text-gray-400">
                                                    <Link
                                                        href={`/admin/courses/${course.id}`}
                                                        className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>
                                                    <button onClick={() => handleEdit(course)} className="p-2 hover:text-amber-600 transition-all"><Edit size={18} /></button>
                                                    <button onClick={() => handleDeleteClick(course)} className="p-2 hover:text-red-600 transition-all"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={7} className="text-center py-20 text-gray-400 font-medium">Koi courses nahi miley.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {meta && (
                    <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Page {meta.currentPage} of {meta.totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 shadow-sm transition-all">Prev</button>
                            <button onClick={() => setPage(p => p + 1)} disabled={page === meta.totalPages} className="px-4 py-2 text-xs font-bold text-blue-600 bg-white border border-blue-200 rounded-xl disabled:opacity-50 hover:bg-blue-50 shadow-sm transition-all">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCoursesPage;