'use client';

import React, { useState, useEffect, useMemo, use } from 'react';
import {
    Users, FileText, BookOpen, Layers, Plus, ArrowLeft,
    Loader2, Video, ClipboardList
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// API aur Components Imports
import {
    getCourseWithContentAPI,
    getStudentsAPI,
    createSectionAPI,
    createResourceAPI,
    createRecordedLectureAPI,
    dismissStudentAPI,
    createLiveLectureAPI,
    createAssignmentAPI,
    enrollStudentAPI,
    deleteLectureAPI,
    updateLectureAPI,
    deleteResourceAPI,
    updateResourceAPI,
    createQuizAPI,
    updateQuizAPI,
    deleteQuizAPI
} from '@/lib/api/apiService';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchCourseContent, refreshCourseContent } from '@/lib/store/features/courseSlice';
import { CourseInfoCard } from '@/components/courses/CourseInfoCard';
import { StudentsTab } from '@/components/courses/StudentsTab';
import { GenericContentTab } from '@/components/courses/GenericContentTab';
import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

// # PROFESSIONAL MAPPING TO FIX "QUIZZE" ERROR
const TAB_TO_TYPE_MAP: Record<string, ModalType> = {
    students: 'student',
    lectures: 'lecture',
    quizzes: 'quiz',
    assignments: 'assignment',
    resources: 'resource'
};

type ModalType = 'student' | 'lecture' | 'quiz' | 'assignment' | 'resource' | 'section';

const UnifiedCourseDetail = ({ params, role }: { params: Promise<{ courseId?: string; id?: string }>, role: 'admin' | 'teacher' }) => {
    const actualParams = use(params) as any;
    const courseId = actualParams.courseId || actualParams.id;
    const dispatch = useAppDispatch();

    const [activeTab, setActiveTab] = useState('students');
    const [activeLectureSubTab, setActiveLectureSubTab] = useState<'recorded' | 'online'>('recorded');

    // Get course content from Redux
    const courseIdNum = courseId ? Number(courseId) : null;
    const cachedCourseData = courseIdNum ? useAppSelector((state) => state.course.courseContent[courseIdNum]) : null;
    const courseLoading = courseIdNum ? useAppSelector((state) => state.course.loading.courseContent[courseIdNum] || false) : false;

    const [fullData, setFullData] = useState<any>(null);
    const [allAvailableStudents, setAllAvailableStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalType, setModalType] = useState<ModalType>('lecture');
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

    const [itemToEdit, setItemToEdit] = useState<any>(null);
    const [itemToDelete, setItemToDelete] = useState<any>(null);

    const tabs = [
        { id: 'students', label: 'Students', icon: Users },
        { id: 'lectures', label: 'Lectures', icon: Video },
        { id: 'quizzes', label: 'Quizzes', icon: FileText },
        { id: 'assignments', label: 'Assignments', icon: ClipboardList },
        { id: 'resources', label: 'Resources', icon: Layers },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            if (courseIdNum) {
                // Fetch from API and it will be cached automatically
                const result = await dispatch(fetchCourseContent(courseIdNum));
                if (fetchCourseContent.fulfilled.match(result)) {
                    setFullData(result.payload.content);
                } else {
                    // Fallback to direct API call if Redux fetch fails
                    const contentRes = await getCourseWithContentAPI(courseIdNum);
                    setFullData(contentRes);
                }
            }

            if (role === 'admin') {
                try {
                    const studentsRes = await getStudentsAPI();
                    const rawStudents = studentsRes.data || [];
                    setAllAvailableStudents(rawStudents.map((s: any) => ({
                        label: `${s.firstName} ${s.lastName} (${s.email})`,
                        value: s.id
                    })));
                } catch (studentErr) {
                    console.error("Admin student list fetch error:", studentErr);
                }
            }
        } catch (err: any) {
            console.error("Main Content Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        if (courseIdNum) {
            // Check if we have cached data, use it immediately
            if (cachedCourseData) {
                setFullData(cachedCourseData);
                setLoading(false);
                // Still fetch students if admin
                if (role === 'admin') {
                    getStudentsAPI().then(studentsRes => {
                        const rawStudents = studentsRes.data || [];
                        setAllAvailableStudents(rawStudents.map((s: any) => ({
                            label: `${s.firstName} ${s.lastName} (${s.email})`,
                            value: s.id
                        })));
                    }).catch(err => console.error("Admin student list fetch error:", err));
                }
            } else {
                fetchData();
            }
        }
    }, [courseIdNum, cachedCourseData, role, dispatch]);

    const activeTabData = useMemo(() => {
        if (!fullData?.sections) return [];
        return fullData.sections.map((sec: any) => ({
            id: sec.id,
            sectionName: sec.title,
            items: sec[activeTab] || []
        }));
    }, [fullData, activeTab]);

    const formFields = useMemo(() => {
        const lectureTypeToUse = itemToEdit ? itemToEdit.lectureType : activeLectureSubTab;

        const configs: Record<string, FormField[]> = {
            section: [
                { name: 'title', label: 'Section Title', type: 'text', required: true },
                { name: 'description', label: 'Brief Description', type: 'textarea' }
            ],
            lecture: lectureTypeToUse === 'online' ? [
                { name: 'title', label: 'Session Title', type: 'text', required: true },
                { name: 'description', label: 'Agenda/Description', type: 'textarea' },
                { name: 'liveStart', label: 'Start Date & Time', type: 'datetime-local', required: true },
                { name: 'lectureOrder', label: 'Order', type: 'number', required: true }
            ] : [
                { name: 'title', label: 'Lecture Title', type: 'text', required: true },
                { name: 'description', label: 'Description', type: 'textarea' },
                { name: 'video', label: 'Video File', type: 'files', required: !itemToEdit },
                { name: 'lectureOrder', label: 'Order', type: 'number', required: true }
            ],
            assignment: [
                { name: 'title', label: 'Assignment Title', type: 'text', required: true },
                { name: 'objective', label: 'Objective', type: 'textarea' },
                { name: 'deliverable', label: 'Deliverable description', type: 'textarea' },
                { name: 'totalMarks', label: 'Total Marks', type: 'number' },
                { name: 'dueDate', label: 'Due Date', type: 'date' },
                { name: 'file', label: 'Attachment', type: 'files', required: false }
            ],
            resource: [
                { name: 'title', label: 'Resource Title', type: 'text', required: true },
                { name: 'resourceType', label: 'Type', type: 'select', options: [{ label: 'PDF', value: 'pdf' }, { label: 'Video', value: 'video' }], required: true },
                { name: 'file', label: 'Upload File', type: 'files', required: !itemToEdit }
            ],
            student: [{ name: 'studentId', label: 'Select Student', type: 'select', options: allAvailableStudents, required: true }],
            // # QUIZ FORM FIELDS WITH DYNAMIC BUILDER
            quiz: [
                { name: 'title', label: 'Quiz Title', type: 'text', required: true },
                { name: 'description', label: 'Quiz Description', type: 'textarea' },
                { name: 'total_marks', label: 'Total Marks', type: 'number', required: true },
                { name: 'start_time', label: 'Start Time', type: 'datetime-local', required: false },
                { name: 'end_time', label: 'End Time', type: 'datetime-local', required: false },
                { name: 'is_Published', label: 'Publish Immediately?', type: 'select', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }] },
                { name: 'questions', label: 'Quiz Questions', type: 'quiz-builder', required: true }
            ],
        };
        return configs[modalType] || [];
    }, [modalType, activeLectureSubTab, allAvailableStudents, itemToEdit]);

    const handleFormSubmit = async (formData: FormData) => {
        setModalLoading(true);
        try {
            const courseIdNum = Number(courseId);
            const rawData = Object.fromEntries(formData);

            if (itemToEdit) {
                if (modalType === 'quiz') {
                    const payload = {
                        ...rawData,
                        questions: JSON.parse(rawData.questions as string),
                        total_marks: Number(rawData.total_marks),
                        is_Published: rawData.is_Published === 'true'
                    };
                    await updateQuizAPI(itemToEdit.id, payload);
                }
                else if (modalType === 'lecture') await updateLectureAPI(itemToEdit.id, courseIdNum, formData);
                else if (modalType === 'resource') await updateResourceAPI(courseIdNum, selectedSectionId!, itemToEdit.id, formData);
                alert("Kamyabi se update ho gaya!");
            } else {
                if (modalType === 'section') await createSectionAPI(courseIdNum, { title: rawData.title as string, description: rawData.description as string });
                else if (modalType === 'assignment') {
                    formData.append('courseId', courseId.toString());
                    formData.append('sectionId', selectedSectionId!.toString());
                    await createAssignmentAPI(formData);
                }
                else if (modalType === 'student') await enrollStudentAPI({ courseId: courseIdNum, studentId: Number(rawData.studentId) });

                // # CREATE QUIZ LOGIC
                else if (modalType === 'quiz') {
                    await createQuizAPI({
                        ...rawData,
                        course_id: courseIdNum,
                        section_id: selectedSectionId,
                        total_marks: Number(rawData.total_marks),
                        is_Published: rawData.is_Published === 'true',
                        questions: JSON.parse(rawData.questions as string)
                    });
                }
                else if (modalType === 'lecture') {
                    if (activeLectureSubTab === 'online') {
                        await createLiveLectureAPI({
                            title: rawData.title, description: rawData.description,
                            courseId: courseIdNum, sectionId: selectedSectionId,
                            liveStart: new Date(rawData.liveStart as string).toISOString(),
                            lectureOrder: Number(rawData.lectureOrder)
                        });
                    } else {
                        formData.append('courseId', courseId.toString());
                        formData.append('sectionId', selectedSectionId!.toString());
                        await createRecordedLectureAPI(formData);
                    }
                }
                else if (modalType === 'resource') await createResourceAPI(courseIdNum, selectedSectionId!, formData);
                alert("Naya content add ho gaya!");
            }

            // Refresh course content in Redux cache
            if (courseIdNum) {
                dispatch(refreshCourseContent(courseIdNum));
            }
            await fetchData();
            setIsModalOpen(false);
            setItemToEdit(null);
        } catch (err: any) { alert(err.message || "Operation fail ho gaya"); }
        finally { setModalLoading(false); }
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        setModalLoading(true);
        try {
            const courseIdNum = Number(courseId);
            const itemId = Number(itemToDelete.id);

            if (itemToDelete.type === 'enrollment') await dismissStudentAPI(itemId, courseIdNum, itemToDelete.studentId);
            else if (itemToDelete.type === 'quiz') await deleteQuizAPI(itemId);
            else if (itemToDelete.type === 'lecture') await deleteLectureAPI(itemId, courseIdNum);
            else if (itemToDelete.type === 'resource') await deleteResourceAPI(courseIdNum, itemToDelete.sectionId, itemId);

            setIsDeleteModalOpen(false);
            await fetchData(); // Refresh fresh state
            alert("Item permanent delete ho gaya!");
        } catch (err: any) { alert(err.message); }
        finally { setModalLoading(false); setItemToDelete(null); }
    };

    if (loading && !fullData) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

    return (
        <div className="w-full bg-gray-50 min-h-screen font-sans text-[#0F172A] pt-0">
            <div className="flex justify-between items-center mb-4 p-8 pb-0">
                <Link href={role === 'admin' ? "/admin/courses" : "/teacher/assigned-courses"} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold transition-all text-sm uppercase tracking-widest">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
            </div>

            <div className="p-8 pt-4">
                <CourseInfoCard data={fullData?.course} />

                <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 my-6 overflow-x-auto no-scrollbar shadow-sm">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 min-h-[450px]">
                    {activeTab === 'students' ? (
                        <StudentsTab
                            data={fullData?.enrollments || []}
                            role={role}
                            onDelete={(id, name) => {
                                setItemToDelete({ id, title: name, type: 'enrollment' });
                                setIsDeleteModalOpen(true);
                            }}
                            onAdd={() => { setModalType('student'); setItemToEdit(null); setIsModalOpen(true); }}
                        />
                    ) : (
                        <GenericContentTab
                            title={activeTab}
                            // # USE MAPPING FOR TYPE TO FIX "QUIZZE" ERROR
                            type={TAB_TO_TYPE_MAP[activeTab] as any}
                            data={activeTabData}
                            role={role}
                            onAddSection={() => { setModalType('section'); setItemToEdit(null); setIsModalOpen(true); }}
                            onSubTabChange={(tab: any) => setActiveLectureSubTab(tab)}
                            onAddItem={(sectionId) => {
                                setSelectedSectionId(sectionId);
                                setModalType(TAB_TO_TYPE_MAP[activeTab]);
                                setItemToEdit(null);
                                setIsModalOpen(true);
                            }}
                            onEditItem={(item, sectionId) => {
                                // # PRE-FILL FIX: Ensuring nested data (questions) is passed to modal
                                console.log("Editing Item Data:", item);
                                setItemToEdit(item);
                                setSelectedSectionId(sectionId);
                                setModalType(TAB_TO_TYPE_MAP[activeTab]);
                                setIsModalOpen(true);
                            }}
                            onDeleteItem={(item, sectionId) => {
                                setItemToDelete({ ...item, type: TAB_TO_TYPE_MAP[activeTab], sectionId });
                                setIsDeleteModalOpen(true);
                            }}
                        />
                    )}
                </div>
            </div>

            <GenericFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setItemToEdit(null); }}
                title={itemToEdit ? `Update ${modalType}` : `Add New ${modalType}`}
                submitText={itemToEdit ? "Update Changes" : "Save Changes"}
                fields={formFields}
                onSubmit={handleFormSubmit}
                loading={modalLoading}
                // # ENSURING INITIAL DATA IS SPREAD CORRECTLY
                initialData={itemToEdit}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title={itemToDelete?.title || "Item"}
                loading={modalLoading}
            />
        </div>
    );
};

export default UnifiedCourseDetail;