'use client';
import React, { useState, useMemo } from 'react';
import { Users, FileText, Layers, ArrowLeft, Loader2, Video, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { refreshCourseContent, fetchCourseContent, removeLectureLocal, removeResourceLocal } from '@/lib/store/features/courseSlice';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/api/errorMessage';

// UI Components
import { CourseInfoCard } from '@/components/courses/CourseInfoCard';
import { StudentsTab } from '@/components/courses/StudentsTab';
import { GenericContentTab } from '@/components/courses/GenericContentTab';
import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

// APIs
import {
    createSectionAPI, deleteLectureAPI, deleteResourceAPI,
    createAssignmentAPI, createQuizAPI, updateQuizAPI,
    updateLectureAPI, updateResourceAPI, createRecordedLectureAPI,
    createLiveLectureAPI, createResourceAPI, enrollStudentAPI,
    dismissStudentAPI, deleteAssignmentAPI, deleteQuizAPI
} from '@/lib/api/apiService';

import { resolveGoogleConnected } from '@/lib/googleCalendar';

const TAB_TO_TYPE_MAP: any = { students: 'student', lectures: 'lecture', quizzes: 'quiz', assignments: 'assignment', resources: 'resource' };

const UnifiedCourseDetail = ({ courseId, role, data, isLoading, availableStudents, backUrl }: any) => {
    const dispatch = useAppDispatch();
    const { showToast } = useToast();
    const user = useAppSelector((state) => state.auth.user);
    const isCalendarConnected = resolveGoogleConnected(user);

    const [activeTab, setActiveTab] = useState(role === 'student' ? 'lectures' : 'students');
    const [activeLectureSubTab, setActiveLectureSubTab] = useState<'recorded' | 'online'>('recorded');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalType, setModalType] = useState<any>('lecture');
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
    const [itemToEdit, setItemToEdit] = useState<any>(null);
    const [itemToDelete, setItemToDelete] = useState<any>(null);

    const formatModalTitle = (type: string) =>
        type.charAt(0).toUpperCase() + type.slice(1);

    const activeTabData = useMemo(() => {
        if (!data?.sections) return [];
        return data.sections.map((sec: any) => ({
            id: sec.id,
            sectionName: sec.title,
            items: sec[activeTab] || []
        }));
    }, [data, activeTab]);

    const formFields = useMemo(() => {
        const lectureTypeToUse = itemToEdit ? itemToEdit.lectureType : activeLectureSubTab;
        const configs: Record<string, FormField[]> = {
            section: [{ name: 'title', label: 'Section Title', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea' }],
            lecture: lectureTypeToUse === 'online' ? [
                { name: 'title', label: 'Session Title', type: 'text', required: true },
                { name: 'description', label: 'Agenda', type: 'textarea' },
                { name: 'liveStart', label: 'Start Date & Time', type: 'datetime-local', required: true },
                // { name: 'lectureOrder', label: 'Order', type: 'number', required: true }
            ] : [
                { name: 'title', label: 'Lecture Title', type: 'text', required: true },
                { name: 'description', label: 'Description', type: 'textarea' },
                { name: 'video', label: 'Video URL', type: 'text', required: !itemToEdit },
                // { name: 'lectureOrder', label: 'Order', type: 'number', required: true }
            ],
            assignment: [
                { name: 'title', label: 'Assignment Title', type: 'text', required: true },
                { name: 'objective', label: 'Objective', type: 'textarea' },
                { name: 'deliverable', label: 'Deliverable', type: 'textarea' },
                { name: 'totalMarks', label: 'Total Marks', type: 'number' },
                { name: 'dueDate', label: 'Due Date', type: 'date' },
                { name: 'files', label: 'Attachment', type: 'files' }
            ],
            resource: [
                { name: 'title', label: 'Resource Title', type: 'text', required: true },
                { name: 'resourceType', label: 'Type', type: 'select', options: [{ label: 'PDF', value: 'pdf' }, { label: 'Video', value: 'video' }], required: true },
                { name: 'file', label: 'Upload File', type: 'files', required: !itemToEdit },
                { name: 'description', label: 'Description', type: 'textarea' },
            ],
            student: [{ name: 'studentId', label: 'Select Student', type: 'select', options: availableStudents, required: true }],
            quiz: [
                { name: 'title', label: 'Quiz Title', type: 'text', required: true },
                { name: 'description', label: 'Quiz Description', type: 'textarea' },
                { name: 'total_marks', label: 'Total Marks', type: 'number', required: true },
                { name: 'start_time', label: 'Start Time', type: 'datetime-local' },
                { name: 'end_time', label: 'End Time', type: 'datetime-local' },
                { name: 'is_Published', label: 'Publish?', type: 'select', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }] },
                { name: 'questions', label: 'Quiz Questions', type: 'quiz-builder', required: true }
            ],
        };
        return configs[modalType] || [];
    }, [modalType, activeLectureSubTab, availableStudents, itemToEdit]);

    const handleFormSubmit = async (formData: FormData) => {
        setModalLoading(true);
        try {
            const rawData = Object.fromEntries(formData);

            // Clear frontend message when teacher tries live lecture without Google linked
            if (
                !itemToEdit &&
                modalType === 'lecture' &&
                activeLectureSubTab === 'online' &&
                role === 'teacher' &&
                !isCalendarConnected
            ) {
                showToast(
                    'Connect your Google account from Profile before creating an online lecture.',
                    'error'
                );
                return;
            }

            if (itemToEdit) {
                if (modalType === 'quiz') await updateQuizAPI(itemToEdit.id, { ...rawData, questions: JSON.parse(rawData.questions as string), total_marks: Number(rawData.total_marks), is_Published: rawData.is_Published === 'true' });
                else if (modalType === 'lecture') await updateLectureAPI(itemToEdit.id, courseId, formData);
                else if (modalType === 'resource') await updateResourceAPI(courseId, selectedSectionId!, itemToEdit.id, formData);
                showToast(`${formatModalTitle(modalType)} updated successfully`, 'success');
            } else {
                if (modalType === 'section') await createSectionAPI(courseId, { title: rawData.title as string, description: rawData.description as string });
                else if (modalType === 'assignment') {
                    formData.append('courseId', courseId.toString());
                    formData.append('sectionId', selectedSectionId!.toString());
                    const filesField = formData.get('files');
                    if (!filesField || (filesField instanceof File && filesField.size === 0)) formData.delete('files');
                    await createAssignmentAPI(formData);
                }
                else if (modalType === 'student') await enrollStudentAPI({ courseId, studentId: Number(rawData.studentId) });
                else if (modalType === 'quiz') await createQuizAPI({ ...rawData, course_id: courseId, section_id: selectedSectionId, total_marks: Number(rawData.total_marks), is_Published: rawData.is_Published === 'true', questions: JSON.parse(rawData.questions as string) });
                else if (modalType === 'lecture') {
                    if (activeLectureSubTab === 'online') {
                        await createLiveLectureAPI({
                            title: rawData.title,
                            description: rawData.description,
                            courseId: courseId,
                            sectionId: selectedSectionId,
                            liveStart: new Date(rawData.liveStart as string).toISOString(),
                            lectureOrder: Number(rawData.lectureOrder),
                        });
                    } else {
                        await createRecordedLectureAPI({
                            title: rawData.title,
                            videoUrl: rawData.video,
                            description: rawData.description,
                            courseId: courseId,
                            sectionId: selectedSectionId,
                            lectureOrder: Number(rawData.lectureOrder),
                        });
                    }
                }
                else if (modalType === 'resource') await createResourceAPI(courseId, selectedSectionId!, formData);
                showToast(
                    modalType === 'lecture' && activeLectureSubTab === 'online'
                        ? 'Online lecture scheduled successfully'
                        : `${formatModalTitle(modalType)} created successfully`,
                    'success'
                );
            }
            dispatch(refreshCourseContent(courseId));
            dispatch(fetchCourseContent(courseId));
            setIsModalOpen(false); setItemToEdit(null);
        } catch (err: any) {
            showToast(
                getErrorMessage(
                    err,
                    modalType === 'lecture' && activeLectureSubTab === 'online'
                        ? 'Could not create online lecture. Connect Google Calendar in Profile and try again.'
                        : 'Action failed. Please try again.'
                ),
                'error'
            );
        } finally {
            setModalLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        setModalLoading(true);
        try {
            const itemId = Number(itemToDelete.id);
            if (itemToDelete.type === 'lecture') {
                await deleteLectureAPI(itemId, courseId);
                dispatch(removeLectureLocal({ courseId, sectionId: itemToDelete.sectionId, lectureId: itemId }));
            } else if (itemToDelete.type === 'resource') {
                await deleteResourceAPI(courseId, itemToDelete.sectionId, itemId);
                dispatch(removeResourceLocal({ courseId, sectionId: itemToDelete.sectionId, resourceId: itemId }));
            } else {
                if (itemToDelete.type === 'enrollment') await dismissStudentAPI(itemId, courseId, itemToDelete.studentId);
                else if (itemToDelete.type === 'quiz') await deleteQuizAPI(itemId);
                else if (itemToDelete.type === 'assignment') await deleteAssignmentAPI(itemId);
                dispatch(refreshCourseContent(courseId)); dispatch(fetchCourseContent(courseId));
            }
            setIsDeleteModalOpen(false);
            showToast('Deleted successfully', 'success');
        } catch (err: any) {
            showToast(getErrorMessage(err, 'Delete failed. Please try again.'), 'error');
        } finally {
            setModalLoading(false); setItemToDelete(null);
        }
    };

    if (isLoading && !data) return (
        <div className="h-[80vh] flex flex-col items-center justify-center bg-app-bg">
            <Loader2 className="animate-spin text-accent-blue mb-4" size={36} />
            <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading Content...</p>
        </div>
    );

    const allTabs = [
        { id: 'students', label: 'Students', icon: Users },
        { id: 'lectures', label: 'Lectures', icon: Video },
        { id: 'quizzes', label: 'Quizzes', icon: FileText },
        { id: 'assignments', label: 'Assignments', icon: ClipboardList },
        { id: 'resources', label: 'Resources', icon: Layers }
    ];
    const tabs = role === 'student' ? allTabs.filter(t => t.id !== 'students') : allTabs;

    return (
        <div className="w-full bg-app-bg min-h-screen font-sans text-text-main pb-16">
            
            {/* Header: Clean & aligned */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-4">
                <Link href={backUrl} className="inline-flex items-center gap-2 text-text-muted hover:text-text-main font-bold text-xs uppercase tracking-wider transition-colors">
                    <ArrowLeft size={16} /> Back to Courses
                </Link>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                
                {/* Course Overview Card */}
                <CourseInfoCard data={data?.course} />

                {/* Professional Underline Tabs (Fixes Mobile Spacing Completely) */}
                <div className="w-full mt-10 mb-6 border-b border-border-subtle overflow-x-auto no-scrollbar">
                    <div className="flex gap-6 w-max min-w-full px-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 pb-3 text-[11px] md:text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-accent-blue text-accent-blue'
                                        : 'border-transparent text-text-muted hover:text-text-main hover:border-border-subtle'
                                }`}
                            >
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Box: Professional layout, subtle shadows, structured alignment */}
                <div className="bg-card-bg rounded-xl border border-border-subtle p-5 md:p-8 min-h-[350px]">
                    {activeTab === 'students' && role !== 'student' ? (
                        <StudentsTab
                            data={data?.enrollments || []}
                            role={role}
                            onDelete={(id: number, name: string) => { setItemToDelete({ id, title: name, type: 'enrollment' }); setIsDeleteModalOpen(true); }}
                            onAdd={() => { setModalType('student'); setItemToEdit(null); setIsModalOpen(true); }}
                        />
                    ) : (
                        <GenericContentTab
                            title={activeTab}
                            type={TAB_TO_TYPE_MAP[activeTab]}
                            data={activeTabData}
                            role={role}
                            onAddSection={() => { setModalType('section'); setItemToEdit(null); setIsModalOpen(true); }}
                            onSubTabChange={(tab: any) => setActiveLectureSubTab(tab)}
                            onAddItem={(sectionId: number) => { setSelectedSectionId(sectionId); setModalType(TAB_TO_TYPE_MAP[activeTab]); setItemToEdit(null); setIsModalOpen(true); }}
                            onEditItem={(item: any, sectionId: number) => { setItemToEdit(item); setSelectedSectionId(sectionId); setModalType(TAB_TO_TYPE_MAP[activeTab]); setIsModalOpen(true); }}
                            onDeleteItem={(item: any, sectionId: number) => { setItemToDelete({ ...item, type: TAB_TO_TYPE_MAP[activeTab], sectionId }); setIsDeleteModalOpen(true); }}
                        />
                    )}
                </div>
            </div>

            {/* Modals */}
            <GenericFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setItemToEdit(null); }}
                title={itemToEdit ? `Edit ${formatModalTitle(modalType)}` : `Add New ${formatModalTitle(modalType)}`}
                fields={formFields}
                onSubmit={handleFormSubmit}
                loading={modalLoading}
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