// 'use client';

// import React, { useState, useEffect, use, useMemo } from 'react';
// import {
//     Calendar, ClipboardList, Download, CheckCircle2,
//     Loader2, ArrowLeft, AlertCircle, FileText, UploadCloud, Clock
// } from 'lucide-react';
// import Link from 'next/link';
// import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
// import { useToast } from '@/context/ToastContext';

// // Redux Actions
// import { fetchCourseContent } from '@/lib/store/features/courseSlice';
// import { submitAssignment } from '@/lib/store/features/assignmentSlice';

// // UI Components
// import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';

// const StudentAssignmentPage = ({ params }: { params: Promise<any> }) => {
//     const resolvedParams = use(params);

//     // # 1. CASE-SENSITIVE FIX
//     // Folder name [courseid] hai toh yahan lowercase use hoga
//     const courseId = Number(resolvedParams.courseId);
//     const assignmentId = Number(resolvedParams.assignmentId || resolvedParams.id);


//     const dispatch = useAppDispatch();
//     const { showToast } = useToast();

//     const { courseContent, loading } = useAppSelector((state) => state.course);
//     const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     // Data fetching logic
//     useEffect(() => {
//         if (!isNaN(courseId) && !courseContent[courseId]) {
//             dispatch(fetchCourseContent(courseId));
//         }
//     }, [courseId, dispatch, courseContent]);

//     // Find assignment in the retrieved content
//     const assignment = useMemo(() => {
//         const fullData = courseContent[courseId];
//         if (!fullData?.sections) return null;

//         for (const section of fullData.sections) {
//             const found = section.assignments?.find((a: any) => Number(a.id) === assignmentId);
//             if (found) return found;
//         }
//         return null;
//     }, [courseContent, courseId, assignmentId]);

//     const isLoading = loading.courseContent[courseId];

//     // Submission logic using the fetch-based API
//     const handleSubmitAction = async (formData: FormData) => {
//         setIsSubmitting(true);
//         try {
//             // assignmentSlice mein submitAssignment action call ho raha hai
//             await dispatch(submitAssignment({ id: assignmentId, formData })).unwrap();
//             showToast("Protocol Successful: Assignment Logged", "success");
//             setIsSubmitModalOpen(false);
//         } catch (err: any) {
//             showToast(err || "Upload Interrupted", "error");
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     if (isLoading || (courseId && !courseContent[courseId])) {
//         return (
//             <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
//                 <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
//                 <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">Accessing Registry...</p>
//             </div>
//         );
//     }

//     if (!assignment) {
//         return (
//             <div className="h-screen flex flex-col items-center justify-center bg-app-bg text-text-main p-6 text-center">
//                 <AlertCircle className="text-red-500 mb-4" size={48} />
//                 <h2 className="font-black uppercase tracking-widest text-sm mb-2">Data Fragment Missing</h2>
//                 <p className="text-text-muted text-[10px] font-bold uppercase mb-6 tracking-tight">Assignment ID: {assignmentId} | Course ID: {courseId}</p>
//                 <Link href={`/student/enrolled-courses/${courseId}`} className="text-accent-blue text-[10px] font-black uppercase underline underline-offset-8">Return to Dashboard</Link>
//             </div>
//         );
//     }

//     return (
//         <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in pb-20 bg-app-bg min-h-screen text-text-main">

//             <Link href={`/student/enrolled-courses/${courseId}`} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-black text-[10px] uppercase tracking-widest transition-all">
//                 <ArrowLeft size={16} /> Back to Course Details
//             </Link>

//             {/* Content Display */}
//             <div className="hero-registry-card rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-border-subtle relative overflow-hidden">
//                 <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
//                 <div className="relative z-10">
//                     <span className="px-4 py-1.5 bg-accent-blue/10 text-accent-blue rounded-full text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">Mission File</span>
//                     <h1 className="text-3xl md:text-5xl font-black mt-6 tracking-tighter uppercase leading-tight">{assignment.title}</h1>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                 <div className="lg:col-span-2 space-y-6">
//                     <div className="bg-card-bg rounded-[2.5rem] p-8 md:p-10 border border-border-subtle shadow-sm">
//                         <div className="space-y-8">
//                             <div>
//                                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue mb-3">Objective</h3>
//                                 <p className="text-text-muted font-medium leading-relaxed">{assignment.objective || 'No instructions provided.'}</p>
//                             </div>
//                             <div>
//                                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 mb-3">Deliverables</h3>
//                                 <p className="text-text-muted font-medium leading-relaxed">{assignment.deliverable || 'Standard submission protocol.'}</p>
//                             </div>
//                         </div>

//                         {assignment.file && (
//                             <div className="mt-10 p-6 bg-app-bg rounded-2xl border border-dashed border-border-subtle flex items-center justify-between">
//                                 <div className="flex items-center gap-4">
//                                     <div className="p-3 bg-accent-blue/10 text-accent-blue rounded-xl"><Download size={20} /></div>
//                                     <p className="text-xs font-black uppercase">Technical Briefing.pdf</p>
//                                 </div>
//                                 <a href={assignment.file} target="_blank" className="px-6 py-2.5 bg-text-main text-card-bg rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Download</a>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <div className="space-y-6">
//                     <div className="bg-card-bg rounded-[2.5rem] p-8 border border-border-subtle shadow-sm">
//                         <h4 className="font-black text-lg mb-6 uppercase tracking-tighter text-center">Status</h4>
//                         <div className="space-y-3 mb-8">
//                             <div className="flex justify-between items-center p-4 bg-app-bg rounded-2xl border border-border-subtle">
//                                 <Clock size={16} className="text-text-muted" />
//                                 <span className="text-xs font-bold">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-GB') : 'N/A'}</span>
//                             </div>
//                             <div className="flex justify-between items-center p-4 bg-app-bg rounded-2xl border border-border-subtle">
//                                 <ClipboardList size={16} className="text-text-muted" />
//                                 <span className="text-xs font-bold text-accent-blue">{assignment.totalMarks || 0} Pts</span>
//                             </div>
//                         </div>

//                         <button
//                             onClick={() => setIsSubmitModalOpen(true)}
//                             className="w-full py-5 bg-accent-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-accent-blue/20 flex items-center justify-center gap-3"
//                         >
//                             <UploadCloud size={20} /> Deploy Submission
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <GenericFormModal
//                 isOpen={isSubmitModalOpen}
//                 onClose={() => setIsSubmitModalOpen(false)}
//                 title="Initialize Upload"
//                 fields={[{ name: 'files', label: 'Select Assets', type: 'files', required: true }]}
//                 onSubmit={handleSubmitAction}
//                 loading={isSubmitting}
//                 submitText="Confirm Submission"
//             />
//         </div>
//     );
// };

// export default StudentAssignmentPage;

'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import {
    Calendar, ClipboardList, Download, CheckCircle2,
    Loader2, ArrowLeft, AlertCircle, FileText, UploadCloud, Clock
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useToast } from '@/context/ToastContext';

// Redux Actions
import { fetchCourseContent } from '@/lib/store/features/courseSlice';
import { submitAssignment } from '@/lib/store/features/assignmentSlice';

// UI Components
import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';

const StudentAssignmentPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);

    const courseId = Number(resolvedParams.courseId);
    const assignmentId = Number(resolvedParams.assignmentId || resolvedParams.id);

    const dispatch = useAppDispatch();
    const { showToast } = useToast();

    const { courseContent, loading } = useAppSelector((state) => state.course);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isNaN(courseId) && !courseContent[courseId]) {
            dispatch(fetchCourseContent(courseId));
        }
    }, [courseId, dispatch, courseContent]);

    const assignment = useMemo(() => {
        const fullData = courseContent[courseId];
        if (!fullData?.sections) return null;

        for (const section of fullData.sections) {
            const found = section.assignments?.find((a: any) => Number(a.id) === assignmentId);
            if (found) return found;
        }
        return null;
    }, [courseContent, courseId, assignmentId]);

    const isLoading = loading.courseContent[courseId];

    const handleSubmitAction = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            await dispatch(submitAssignment({ id: assignmentId, formData })).unwrap();
            showToast("Assignment submitted successfully!", "success");
            setIsSubmitModalOpen(false);
        } catch (err: any) {
            showToast(err || "Failed to upload submission.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || (courseId && !courseContent[courseId])) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center bg-app-bg">
                <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
                <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading Assignment...</p>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center text-center px-4">
                <AlertCircle className="text-red-500 mb-4" size={40} />
                <h2 className="font-black uppercase tracking-widest text-sm mb-2">Assignment Not Found</h2>
                <p className="text-text-muted text-[11px] font-medium mb-6">This assignment may have been removed or the link is invalid.</p>
                <Link href={`/student/enrolled-courses/${courseId}`} className="text-accent-blue text-xs font-bold hover:underline transition-all">Return to Course</Link>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in pb-20 bg-app-bg h-full text-text-main">

            <Link href={`/student/enrolled-courses/${courseId}`} className="inline-flex items-center gap-2 text-text-muted hover:text-text-main font-bold text-xs uppercase tracking-wider transition-colors mb-2">
                <ArrowLeft size={16} /> Back to Course
            </Link>

            {/* Clean Flat Header */}
            <div className="border-b border-border-subtle pb-6">
                <span className="text-accent-blue font-bold text-[10px] uppercase tracking-widest bg-accent-blue/10 px-3 py-1 rounded-md">Assignment</span>
                <h1 className="text-2xl md:text-4xl font-black mt-4 tracking-tight text-text-main">{assignment.title}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
                {/* Main Details (Left Side) */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-text-main mb-3">Objective</h3>
                        <p className="text-text-muted text-sm leading-relaxed">{assignment.objective || 'No specific objective provided.'}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-text-main mb-3">Deliverables</h3>
                        <p className="text-text-muted text-sm leading-relaxed">{assignment.deliverable || 'Please follow the standard submission guidelines.'}</p>
                    </div>

                    {assignment.file && (
                        <div className="mt-8 p-4 bg-card-bg rounded-xl border border-border-subtle flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-app-bg text-accent-blue rounded-lg border border-border-subtle"><FileText size={18} /></div>
                                <p className="text-xs font-bold text-text-main">Attached Resources</p>
                            </div>
                            <a href={assignment.file} target="_blank" className="px-5 py-2 hover:bg-border-subtle/30 text-text-main rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-border-subtle">Download</a>
                        </div>
                    )}
                </div>

                {/* Submission & Status Sidebar (Right Side) */}
                <div className="space-y-6">
                    <div className="bg-card-bg rounded-2xl p-6 border border-border-subtle shadow-sm sticky top-8">
                        <h4 className="font-black text-sm mb-5 uppercase tracking-widest text-text-main border-b border-border-subtle pb-3">Submission Details</h4>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-text-muted">
                                    <Clock size={14} />
                                    <span className="text-xs font-medium">Due Date</span>
                                </div>
                                <span className="text-xs font-bold text-text-main">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-GB') : 'No Due Date'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-text-muted">
                                    <ClipboardList size={14} />
                                    <span className="text-xs font-medium">Points</span>
                                </div>
                                <span className="text-xs font-bold text-text-main">{assignment.totalMarks || 0}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsSubmitModalOpen(true)}
                            className="w-full py-3 bg-text-main text-card-bg rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
                        >
                            <UploadCloud size={16} /> Submit Work
                        </button>
                    </div>
                </div>
            </div>

            <GenericFormModal
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                title="Submit Assignment"
                fields={[{ name: 'files', label: 'Upload your work', type: 'files', required: true }]}
                onSubmit={handleSubmitAction}
                loading={isSubmitting}
                submitText="Submit"
            />
        </div>
    );
};

export default StudentAssignmentPage;