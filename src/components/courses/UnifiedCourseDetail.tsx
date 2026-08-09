'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Users,
    FileText,
    Layers,
    ArrowLeft,
    Loader2,
    Video,
    ClipboardList,
    Inbox,
    UserX,
    CheckCircle,
    HelpCircle,
    FolderOpen,
    ListTree,
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { refreshCourseContent, fetchCourseContent, removeLectureLocal, removeResourceLocal } from '@/lib/store/features/courseSlice';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/api/errorMessage';

import { CourseInfoCard } from '@/components/courses/CourseInfoCard';
import { StudentsTab, EnrollmentRosterVariant } from '@/components/courses/StudentsTab';
import { GenericContentTab } from '@/components/courses/GenericContentTab';
import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

import {
    createSectionAPI, deleteLectureAPI, deleteResourceAPI,
    createAssignmentAPI, createQuizAPI, updateQuizAPI, getSpecificQuizAPI,
    updateLectureAPI, updateResourceAPI, createRecordedLectureAPI,
    createLiveLectureAPI, createResourceAPI, enrollStudentAPI,
    dismissStudentAPI, deleteAssignmentAPI, deleteQuizAPI,
    updateEnrollmentStatusAPI,
    getEnrolledStudentsAPI,
    AdminEnrollmentItem,
    AdminEnrollmentsListStats,
} from '@/lib/api/apiService';

import { resolveGoogleConnected } from '@/lib/googleCalendar';

const TAB_TO_TYPE_MAP: any = { students: 'student', lectures: 'lecture', quizzes: 'quiz', assignments: 'assignment', resources: 'resource' };

const normalizeRosterItem = (item: any) => {
    if (!item) return item;
    const studentName =
        item.studentName ||
        `${item.student?.firstName || ''} ${item.student?.lastName || ''}`.trim();
    return {
        ...item,
        studentId: item.studentId ?? item.student?.id,
        studentName,
        studentEmail: item.studentEmail || item.student?.email,
    };
};

const UnifiedCourseDetail = ({ courseId, role, data, isLoading, availableStudents, backUrl }: any) => {
    const dispatch = useAppDispatch();
    const { showToast } = useToast();
    const user = useAppSelector((state) => state.auth.user);
    const isCalendarConnected = resolveGoogleConnected(user);

    const [activeTab, setActiveTab] = useState(role === 'student' ? 'lectures' : 'students');
    const [enrollmentSubTab, setEnrollmentSubTab] = useState<EnrollmentRosterVariant>('enrolled');
    const [courseEnrollmentRows, setCourseEnrollmentRows] = useState<AdminEnrollmentItem[] | null>(null);
    const [courseEnrollmentStats, setCourseEnrollmentStats] = useState<AdminEnrollmentsListStats | null>(null);
    const [courseEnrollmentsLoading, setCourseEnrollmentsLoading] = useState(false);
    const [activeLectureSubTab, setActiveLectureSubTab] = useState<'recorded' | 'online'>('recorded');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalType, setModalType] = useState<any>('lecture');
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
    const [itemToEdit, setItemToEdit] = useState<any>(null);
    const [itemToDelete, setItemToDelete] = useState<any>(null);

    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectItem, setRejectItem] = useState<any | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [enrollmentActionLoading, setEnrollmentActionLoading] = useState(false);

    const formatModalTitle = (type: string) =>
        type.charAt(0).toUpperCase() + type.slice(1);

    // Admin-only: GET /admin/enrollments/course/:id (enriched roster + stats).
    // Teachers use enrollments from course with-content — do not call admin APIs.
    const loadCourseEnrollments = useCallback(async () => {
        if (role !== 'admin') return;
        setCourseEnrollmentsLoading(true);
        try {
            const res = await getEnrolledStudentsAPI(courseId);
            setCourseEnrollmentRows(res.data || []);
            setCourseEnrollmentStats(res.stats || null);
        } catch {
            // Fall back to with-content enrollment arrays
            setCourseEnrollmentRows(null);
            setCourseEnrollmentStats(null);
        } finally {
            setCourseEnrollmentsLoading(false);
        }
    }, [courseId, role]);

    useEffect(() => {
        loadCourseEnrollments();
    }, [loadCourseEnrollments]);

    const refreshContent = () => {
        dispatch(refreshCourseContent(courseId));
        dispatch(fetchCourseContent(courseId));
        loadCourseEnrollments();
    };

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
            ] : [
                { name: 'title', label: 'Lecture Title', type: 'text', required: true },
                { name: 'description', label: 'Description', type: 'textarea' },
                { name: 'video', label: 'Video URL', type: 'text', required: !itemToEdit },
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
                { name: 'start_time', label: 'Start Time', type: 'datetime-local' },
                { name: 'end_time', label: 'End Time', type: 'datetime-local' },
                {
                    name: 'is_Published',
                    label: 'Availability',
                    type: 'select',
                    options: [
                        { label: 'Published (Live)', value: 'true' },
                        { label: 'Draft', value: 'false' },
                    ],
                },
                {
                    name: 'questions',
                    label: 'Manage Questions',
                    type: 'quiz-builder',
                    required: true,
                },
            ],
        };
        return configs[modalType] || [];
    }, [modalType, activeLectureSubTab, availableStudents, itemToEdit]);

    const formatQuizInitialData = (quiz: any) => {
        if (!quiz) return quiz;
        const start = quiz.start_time || quiz.startTime;
        const end = quiz.end_time || quiz.endTime;
        return {
            ...quiz,
            start_time: start ? new Date(start).toISOString().slice(0, 16) : '',
            end_time: end ? new Date(end).toISOString().slice(0, 16) : '',
            is_Published: String(quiz.is_Published ?? quiz.isPublished ?? false),
            questions: quiz.questions || [],
        };
    };

    const handleEditItem = async (item: any, sectionId: number) => {
        const type = TAB_TO_TYPE_MAP[activeTab];
        setSelectedSectionId(sectionId);
        setModalType(type);

        if (type === 'quiz') {
            setModalLoading(true);
            try {
                const fullQuiz = await getSpecificQuizAPI(item.id);
                setItemToEdit(formatQuizInitialData(fullQuiz));
                setIsModalOpen(true);
            } catch (err) {
                showToast(getErrorMessage(err, 'Failed to load quiz for editing'), 'error');
            } finally {
                setModalLoading(false);
            }
            return;
        }

        setItemToEdit(item);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (formData: FormData) => {
        setModalLoading(true);
        try {
            const rawData = Object.fromEntries(formData);

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
                if (modalType === 'quiz') {
                    const questions = JSON.parse(rawData.questions as string);
                    const total_marks =
                        Number(rawData.total_marks) ||
                        questions.reduce((sum: number, q: any) => sum + (Number(q?.marks) || 0), 0);
                    await updateQuizAPI(itemToEdit.id, {
                        ...rawData,
                        questions,
                        total_marks,
                        is_Published: rawData.is_Published === 'true',
                    });
                }
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
                else if (modalType === 'quiz') {
                    const questions = JSON.parse(rawData.questions as string);
                    const total_marks =
                        Number(rawData.total_marks) ||
                        questions.reduce((sum: number, q: any) => sum + (Number(q?.marks) || 0), 0);
                    await createQuizAPI({
                        ...rawData,
                        course_id: courseId,
                        section_id: selectedSectionId,
                        total_marks,
                        is_Published: rawData.is_Published === 'true',
                        questions,
                    });
                }
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
            refreshContent();
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
                refreshContent();
            }
            setIsDeleteModalOpen(false);
            showToast('Deleted successfully', 'success');
        } catch (err: any) {
            showToast(getErrorMessage(err, 'Delete failed. Please try again.'), 'error');
        } finally {
            setModalLoading(false); setItemToDelete(null);
        }
    };

    const handleApproveEnrollment = async (item: any) => {
        if (!item?.id) return;
        setEnrollmentActionLoading(true);
        try {
            await updateEnrollmentStatusAPI(item.id, { action: 'approve' });
            showToast('Enrollment approved', 'success');
            refreshContent();
        } catch (err) {
            showToast(getErrorMessage(err, 'Failed to approve enrollment'), 'error');
        } finally {
            setEnrollmentActionLoading(false);
        }
    };

    const openRejectEnrollment = (item: any) => {
        setRejectItem(item);
        setRejectionReason('');
        setRejectOpen(true);
    };

    const handleRejectEnrollment = async () => {
        if (!rejectItem?.id) return;
        const reason = rejectionReason.trim();
        if (!reason) {
            showToast('Please enter a rejection reason', 'error');
            return;
        }
        setEnrollmentActionLoading(true);
        try {
            await updateEnrollmentStatusAPI(rejectItem.id, {
                action: 'reject',
                rejectionReason: reason,
            });
            showToast('Enrollment rejected', 'success');
            setRejectOpen(false);
            setRejectItem(null);
            setRejectionReason('');
            refreshContent();
        } catch (err) {
            showToast(getErrorMessage(err, 'Failed to reject enrollment'), 'error');
        } finally {
            setEnrollmentActionLoading(false);
        }
    };

    if (isLoading && !data) return (
        <div className="h-[80vh] flex flex-col items-center justify-center bg-app-bg">
            <Loader2 className="animate-spin text-accent-blue mb-4" size={36} />
            <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading Content...</p>
        </div>
    );

    const allTabs = [
        { id: 'students', label: role === 'admin' ? 'Enrollments' : 'Students', icon: Users },
        { id: 'lectures', label: 'Lectures', icon: Video },
        { id: 'quizzes', label: 'Quizzes', icon: FileText },
        { id: 'assignments', label: 'Assignments', icon: ClipboardList },
        { id: 'resources', label: 'Resources', icon: Layers }
    ];
    const tabs = role === 'student' ? allTabs.filter(t => t.id !== 'students') : allTabs;

    const stats = data?.stats;
    const showAdminStats = role === 'admin' && stats;

    const adminStatCards = showAdminStats
        ? [
            { label: 'Enrolled', value: stats.enrolledCount ?? 0, icon: Users, accent: 'text-emerald-500 bg-emerald-500/10' },
            { label: 'Pending', value: stats.pendingCount ?? 0, icon: Inbox, accent: 'text-amber-500 bg-amber-500/10' },
            { label: 'Rejected', value: stats.rejectedCount ?? 0, icon: UserX, accent: 'text-rose-500 bg-rose-500/10' },
            { label: 'Total Enrollments', value: stats.totalEnrollments ?? 0, icon: CheckCircle, accent: 'text-sky-400 bg-sky-500/10' },
            { label: 'Sections', value: stats.sectionCount ?? 0, icon: ListTree, accent: 'text-violet-400 bg-violet-500/10' },
            { label: 'Lectures', value: stats.lectureCount ?? 0, icon: Video, accent: 'text-accent-blue bg-accent-blue/10' },
            { label: 'Assignments', value: stats.assignmentCount ?? 0, icon: ClipboardList, accent: 'text-orange-400 bg-orange-500/10' },
            { label: 'Quizzes', value: stats.quizCount ?? 0, icon: HelpCircle, accent: 'text-fuchsia-400 bg-fuchsia-500/10' },
            { label: 'Resources', value: stats.resourceCount ?? 0, icon: FolderOpen, accent: 'text-teal-400 bg-teal-500/10' },
          ]
        : [];

    const byCourseBuckets = useMemo(() => {
        if (!courseEnrollmentRows) return null;
        const enrolled: any[] = [];
        const pending: any[] = [];
        const rejected: any[] = [];
        for (const row of courseEnrollmentRows) {
            const normalized = normalizeRosterItem(row);
            const status = (row.status || '').toLowerCase();
            if (status === 'pending') pending.push(normalized);
            else if (status === 'rejected') rejected.push(normalized);
            else if (status === 'enrolled') enrolled.push(normalized);
        }
        return { enrolled, pending, rejected };
    }, [courseEnrollmentRows]);

    const enrollmentRoster = (() => {
        if (byCourseBuckets) {
            if (enrollmentSubTab === 'pending') return byCourseBuckets.pending;
            if (enrollmentSubTab === 'rejected') return byCourseBuckets.rejected;
            return byCourseBuckets.enrolled;
        }
        if (enrollmentSubTab === 'pending') return data?.pendingEnrollments || [];
        if (enrollmentSubTab === 'rejected') return data?.rejectedEnrollments || [];
        return data?.enrollments || [];
    })();

    const enrollmentSubTabs: { id: EnrollmentRosterVariant; label: string; count: number }[] = [
        {
            id: 'enrolled',
            label: 'Enrolled',
            count:
                courseEnrollmentStats?.enrolled ??
                byCourseBuckets?.enrolled.length ??
                data?.enrollments?.length ??
                stats?.enrolledCount ??
                0,
        },
        {
            id: 'pending',
            label: 'Pending',
            count:
                courseEnrollmentStats?.pending ??
                byCourseBuckets?.pending.length ??
                data?.pendingEnrollments?.length ??
                stats?.pendingCount ??
                0,
        },
        {
            id: 'rejected',
            label: 'Rejected',
            count:
                courseEnrollmentStats?.rejected ??
                byCourseBuckets?.rejected.length ??
                data?.rejectedEnrollments?.length ??
                stats?.rejectedCount ??
                0,
        },
    ];

    return (
        <div className="w-full bg-app-bg min-h-screen font-sans text-text-main pb-16">
            
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-4">
                <Link href={backUrl} className="inline-flex items-center gap-2 text-text-muted hover:text-text-main font-bold text-xs uppercase tracking-wider transition-colors">
                    <ArrowLeft size={16} /> Back to Courses
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                
                <CourseInfoCard data={data?.course} />

                {showAdminStats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-9 gap-3 mb-2 -mt-2">
                        {adminStatCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <div
                                    key={card.label}
                                    className="bg-card-bg border border-border-subtle rounded-2xl p-3 shadow-sm flex items-center gap-2.5"
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${card.accent}`}>
                                        <Icon size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-widest truncate">
                                            {card.label}
                                        </p>
                                        <p className="text-base font-black tabular-nums">{card.value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

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

                <div className="bg-card-bg rounded-xl border border-border-subtle p-5 md:p-8 min-h-[350px]">
                    {activeTab === 'students' && role !== 'student' ? (
                        <div className="space-y-6">
                            {role === 'admin' && (
                                <div className="flex flex-wrap gap-2">
                                    {enrollmentSubTabs.map((sub) => (
                                        <button
                                            key={sub.id}
                                            type="button"
                                            onClick={() => setEnrollmentSubTab(sub.id)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                enrollmentSubTab === sub.id
                                                    ? 'bg-accent-blue text-white border-accent-blue'
                                                    : 'bg-app-bg text-text-muted border-border-subtle hover:text-text-main'
                                            }`}
                                        >
                                            {sub.label}
                                            <span className="ml-2 tabular-nums opacity-80">{sub.count}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <StudentsTab
                                data={
                                    role === 'admin'
                                        ? enrollmentRoster
                                        : byCourseBuckets?.enrolled || data?.enrollments || []
                                }
                                role={role}
                                variant={role === 'admin' ? enrollmentSubTab : 'enrolled'}
                                loading={courseEnrollmentsLoading}
                                onDelete={(id: number, name: string) => {
                                    const enrollment =
                                        (byCourseBuckets?.enrolled || data?.enrollments || []).find(
                                            (e: any) => e.id === id
                                        );
                                    setItemToDelete({
                                        id,
                                        title: name,
                                        type: 'enrollment',
                                        studentId: enrollment?.studentId ?? enrollment?.student?.id,
                                    });
                                    setIsDeleteModalOpen(true);
                                }}
                                onAdd={() => { setModalType('student'); setItemToEdit(null); setIsModalOpen(true); }}
                                onApprove={handleApproveEnrollment}
                                onReject={openRejectEnrollment}
                                actionLoading={enrollmentActionLoading}
                            />
                        </div>
                    ) : (
                        <GenericContentTab
                            title={activeTab}
                            type={TAB_TO_TYPE_MAP[activeTab]}
                            data={activeTabData}
                            role={role}
                            onAddSection={() => { setModalType('section'); setItemToEdit(null); setIsModalOpen(true); }}
                            onSubTabChange={(tab: any) => setActiveLectureSubTab(tab)}
                            onAddItem={(sectionId: number) => { setSelectedSectionId(sectionId); setModalType(TAB_TO_TYPE_MAP[activeTab]); setItemToEdit(null); setIsModalOpen(true); }}
                            onEditItem={handleEditItem}
                            onDeleteItem={(item: any, sectionId: number) => { setItemToDelete({ ...item, type: TAB_TO_TYPE_MAP[activeTab], sectionId }); setIsDeleteModalOpen(true); }}
                        />
                    )}
                </div>
            </div>

            <GenericFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setItemToEdit(null); }}
                title={
                    modalType === 'quiz'
                        ? itemToEdit
                            ? 'Edit quiz'
                            : 'Add New Quiz'
                        : itemToEdit
                          ? `Edit ${formatModalTitle(modalType)}`
                          : `Add New ${formatModalTitle(modalType)}`
                }
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

            {rejectOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="w-full max-w-md bg-card-bg border border-border-subtle rounded-2xl p-6 shadow-2xl space-y-4">
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight">Reject Enrollment</h3>
                            <p className="text-xs text-text-muted font-medium mt-1">
                                {rejectItem?.studentName
                                    ? `Provide a reason for rejecting ${rejectItem.studentName}.`
                                    : 'A rejection reason is required.'}
                            </p>
                        </div>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                            placeholder="Rejection reason..."
                            className="w-full rounded-xl border border-border-subtle bg-app-bg px-3 py-2 text-sm text-text-main outline-none focus:border-accent-blue resize-none"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                disabled={enrollmentActionLoading}
                                onClick={() => {
                                    setRejectOpen(false);
                                    setRejectItem(null);
                                    setRejectionReason('');
                                }}
                                className="px-4 py-2 rounded-xl border border-border-subtle text-[10px] font-black uppercase tracking-widest text-text-muted"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={enrollmentActionLoading}
                                onClick={handleRejectEnrollment}
                                className="px-4 py-2 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                            >
                                {enrollmentActionLoading ? 'Rejecting…' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnifiedCourseDetail;
