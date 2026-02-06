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
    
    // # 1. CASE-SENSITIVE FIX
    // Folder name [courseid] hai toh yahan lowercase use hoga
    const courseId = Number(resolvedParams.courseId); 
    const assignmentId = Number(resolvedParams.assignmentId || resolvedParams.id);


    const dispatch = useAppDispatch();
    const { showToast } = useToast();

    const { courseContent, loading } = useAppSelector((state) => state.course);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data fetching logic
    useEffect(() => {
        if (!isNaN(courseId) && !courseContent[courseId]) {
            dispatch(fetchCourseContent(courseId));
        }
    }, [courseId, dispatch, courseContent]);

    // Find assignment in the retrieved content
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

    // Submission logic using the fetch-based API
    const handleSubmitAction = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            // assignmentSlice mein submitAssignment action call ho raha hai
            await dispatch(submitAssignment({ id: assignmentId, formData })).unwrap();
            showToast("Protocol Successful: Assignment Logged", "success");
            setIsSubmitModalOpen(false);
        } catch (err: any) {
            showToast(err || "Upload Interrupted", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || (courseId && !courseContent[courseId])) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
                <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
                <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">Accessing Registry...</p>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-app-bg text-text-main p-6 text-center">
                <AlertCircle className="text-red-500 mb-4" size={48} />
                <h2 className="font-black uppercase tracking-widest text-sm mb-2">Data Fragment Missing</h2>
                <p className="text-text-muted text-[10px] font-bold uppercase mb-6 tracking-tight">Assignment ID: {assignmentId} | Course ID: {courseId}</p>
                <Link href={`/student/enrolled-courses/${courseId}`} className="text-accent-blue text-[10px] font-black uppercase underline underline-offset-8">Return to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 bg-app-bg min-h-screen text-text-main transition-colors duration-300">
            
            <Link href={`/student/enrolled-courses/${courseId}`} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-black text-[10px] uppercase tracking-widest transition-all">
                <ArrowLeft size={16} /> Back to Module
            </Link>

            {/* Content Display */}
            <div className="hero-registry-card rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-border-subtle relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <span className="px-4 py-1.5 bg-accent-blue/10 text-accent-blue rounded-full text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">Mission File</span>
                    <h1 className="text-3xl md:text-5xl font-black mt-6 tracking-tighter uppercase leading-tight">{assignment.title}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card-bg rounded-[2.5rem] p-8 md:p-10 border border-border-subtle shadow-sm">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue mb-3">Objective</h3>
                                <p className="text-text-muted font-medium leading-relaxed">{assignment.objective || 'No instructions provided.'}</p>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 mb-3">Deliverables</h3>
                                <p className="text-text-muted font-medium leading-relaxed">{assignment.deliverable || 'Standard submission protocol.'}</p>
                            </div>
                        </div>

                        {assignment.file && (
                            <div className="mt-10 p-6 bg-app-bg rounded-2xl border border-dashed border-border-subtle flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-accent-blue/10 text-accent-blue rounded-xl"><Download size={20} /></div>
                                    <p className="text-xs font-black uppercase">Technical Briefing.pdf</p>
                                </div>
                                <a href={assignment.file} target="_blank" className="px-6 py-2.5 bg-text-main text-card-bg rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Download</a>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card-bg rounded-[2.5rem] p-8 border border-border-subtle shadow-sm">
                        <h4 className="font-black text-lg mb-6 uppercase tracking-tighter text-center">Status</h4>
                        <div className="space-y-3 mb-8">
                            <div className="flex justify-between items-center p-4 bg-app-bg rounded-2xl border border-border-subtle">
                                <Clock size={16} className="text-text-muted" />
                                <span className="text-xs font-bold">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-GB') : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-app-bg rounded-2xl border border-border-subtle">
                                <ClipboardList size={16} className="text-text-muted" />
                                <span className="text-xs font-bold text-accent-blue">{assignment.totalMarks || 0} Pts</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsSubmitModalOpen(true)}
                            className="w-full py-5 bg-accent-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-accent-blue/20 flex items-center justify-center gap-3"
                        >
                            <UploadCloud size={20} /> Deploy Submission
                        </button>
                    </div>
                </div>
            </div>

            <GenericFormModal 
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                title="Initialize Upload"
                fields={[{ name: 'files', label: 'Select Assets', type: 'files', required: true }]}
                onSubmit={handleSubmitAction}
                loading={isSubmitting}
                submitText="Confirm Submission"
            />
        </div>
    );
};

export default StudentAssignmentPage;