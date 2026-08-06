'use client';

import React, { useState, useEffect, use } from 'react';
import {
    ClipboardList, Download, CheckCircle2,
    Loader2, ArrowLeft, AlertCircle, FileText, UploadCloud, Clock
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch } from '@/lib/store/hooks';
import { useToast } from '@/context/ToastContext';

// Redux Actions & APIs
import { submitAssignment } from '@/lib/store/features/assignmentSlice';
import { getAssignmentDetailsAPI } from '@/lib/api/apiService'; 

// UI Components
import GenericFormModal from '@/components/ui/GenericFormModal';

const StudentAssignmentPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);

    const courseId = Number(resolvedParams?.courseId || resolvedParams?.courseid);
    const assignmentId = Number(resolvedParams?.assignmentId || resolvedParams?.assignmentid || resolvedParams?.id);

    const dispatch = useAppDispatch();
    const { showToast } = useToast();

    const [assignmentData, setAssignmentData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 👉 Fetch Assignment from New API
    useEffect(() => {
        const fetchAssignment = async () => {
            if (!assignmentId) return;
            setIsLoading(true);
            try {
                const data = await getAssignmentDetailsAPI(assignmentId);
                setAssignmentData(data);
            } catch (error) {
                console.error("Error fetching assignment:", error);
                showToast("Failed to load assignment details.", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssignment();
    }, [assignmentId, showToast]);

    const handleSubmitAction = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            await dispatch(submitAssignment({ id: assignmentId, formData })).unwrap();
            showToast("Assignment submitted successfully!", "success");
            setIsSubmitModalOpen(false);
            
            // Re-fetch data to update submission status on UI
            const updatedData = await getAssignmentDetailsAPI(assignmentId);
            setAssignmentData(updatedData);
        } catch (err: any) {
            showToast(err || "Failed to upload submission.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-full min-h-[80vh] flex flex-col items-center justify-center bg-app-bg">
                <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
                <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading Assignment...</p>
            </div>
        );
    }

    if (!assignmentData) {
        return (
            <div className="h-full min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
                <AlertCircle className="text-red-500 mb-4" size={40} />
                <h2 className="font-extrabold uppercase tracking-widest text-lg mb-2 text-text-main">Assignment Not Found</h2>
                <p className="text-text-muted text-sm font-medium mb-6">This assignment may have been removed or the link is invalid.</p>
                <Link href={`/student/enrolled-courses/${courseId}`} className="text-accent-blue text-sm font-bold hover:underline transition-all">Return to Course</Link>
            </div>
        );
    }

    const hasSubmitted = !!assignmentData.submission;
    const isGraded = assignmentData.submission?.status === 'graded';

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-top-4 pb-20 bg-app-bg h-full text-text-main">

            <Link href={`/student/enrolled-courses/${courseId}`} className="inline-flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold text-xs uppercase tracking-wider transition-colors mb-2">
                <ArrowLeft size={16} /> Back to Course
            </Link>

            {/* Clean Flat Header */}
            <div className="bg-card-bg rounded-2xl p-6 md:p-10 shadow-sm border border-border-subtle relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
                
                <div className="relative z-10 flex items-center gap-3">
                    <span className="text-accent-blue font-bold text-[10px] uppercase tracking-widest bg-accent-blue/10 px-2.5 py-1 rounded-md">Assignment</span>
                    {hasSubmitted && (
                        <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-md flex items-center gap-1">
                            <CheckCircle2 size={12} /> {isGraded ? 'Graded' : 'Submitted'}
                        </span>
                    )}
                </div>
                <h1 className="relative z-10 text-2xl md:text-3xl font-extrabold mt-3 tracking-tight text-text-main leading-tight capitalize">{assignmentData.title}</h1>
                {assignmentData.description && (
                    <p className="relative z-10 mt-3 text-text-muted font-medium text-sm max-w-3xl leading-relaxed whitespace-pre-wrap">{assignmentData.description}</p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                {/* Main Details (Left Side) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card-bg rounded-2xl p-6 md:p-8 border border-border-subtle shadow-sm">
                        <div className="mb-8">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-blue"></span> Objective
                            </h3>
                            <p className="text-text-main text-sm font-medium leading-relaxed whitespace-pre-wrap">{assignmentData.objective || 'No specific objective provided.'}</p>
                        </div>
                        <div className="pt-6 border-t border-border-subtle">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Deliverables
                            </h3>
                            <p className="text-text-main text-sm font-medium leading-relaxed whitespace-pre-wrap">{assignmentData.deliverable || 'Please follow the standard submission guidelines.'}</p>
                        </div>
                    </div>

                    {/* 👉 Attached Materials Rendering */}
                    {assignmentData.materials && assignmentData.materials.length > 0 && (
                        <div className="pt-2">
                            <h3 className="text-sm font-extrabold uppercase tracking-widest text-text-main mb-4">Attached Resources</h3>
                            <div className="space-y-3">
                                {assignmentData.materials.map((mat: any) => (
                                    <div key={mat.id} className="p-4 bg-card-bg rounded-xl border border-border-subtle flex items-center justify-between shadow-sm hover:border-accent-blue/40 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden pr-4">
                                            <div className="p-2.5 bg-app-bg text-accent-blue rounded-lg border border-border-subtle shrink-0">
                                                <FileText size={18} />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-xs font-bold text-text-main truncate">{mat.fileName || 'Document'}</p>
                                                <p className="text-[10px] font-medium text-text-muted mt-0.5 uppercase tracking-wider">
                                                    {(mat.fileSize / 1024 / 1024).toFixed(2)} MB • {mat.fileType?.split('/')[1] || 'File'}
                                                </p>
                                            </div>
                                        </div>
                                        <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 hover:bg-border-subtle/50 bg-app-bg text-text-main rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-border-subtle shrink-0 flex items-center gap-1.5">
                                            <Download size={14} /> <span className="hidden sm:inline-block">Download</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 👉 Student's Uploaded Submission Files Rendering */}
                    {hasSubmitted && assignmentData.submission.submissionFiles && assignmentData.submission.submissionFiles.length > 0 && (
                        <div className="pt-4">
                            <h3 className="text-sm font-extrabold uppercase tracking-widest text-text-main mb-4">Your Submissions</h3>
                            <div className="space-y-3">
                                {assignmentData.submission.submissionFiles.map((fileUrl: string, index: number) => {
                                    // Extract filename from URL, or fallback to generic name
                                    const fileName = fileUrl.split('/').pop() || `Submission_File_${index + 1}`;
                                    
                                    return (
                                        <div key={index} className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 flex items-center justify-between shadow-sm hover:bg-emerald-500/10 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden pr-4">
                                                <div className="p-2.5 bg-app-bg text-emerald-600 rounded-lg border border-emerald-500/20 shrink-0">
                                                    <CheckCircle2 size={18} />
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-xs font-bold text-text-main truncate">{fileName}</p>
                                                    <p className="text-[10px] font-medium text-text-muted mt-0.5 uppercase tracking-wider">Uploaded Work</p>
                                                </div>
                                            </div>
                                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 hover:bg-app-bg bg-card-bg text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-emerald-500/20 shrink-0 flex items-center gap-1.5">
                                                <Download size={14} /> <span className="hidden sm:inline-block">View</span>
                                            </a>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Submission & Status Sidebar (Right Side) */}
                <div className="space-y-6">
                    <div className="bg-card-bg rounded-2xl p-6 border border-border-subtle shadow-sm sticky top-8">
                        <h4 className="font-extrabold text-lg mb-2 tracking-tight text-text-main">Audit Control</h4>
                        <p className="text-text-muted text-xs font-medium mb-6 leading-relaxed">
                            Monitor and evaluate assignment requirements.
                        </p>
                        
                        <div className="space-y-4 mb-6 pt-6 border-t border-border-subtle">
                            <div className="flex justify-between items-center bg-app-bg px-3 py-2 rounded-lg border border-border-subtle">
                                <div className="flex items-center gap-2 text-text-muted">
                                    <Clock size={14} className="text-accent-blue" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Due Date</span>
                                </div>
                                <span className="text-xs font-extrabold text-text-main">{assignmentData.dueDate ? new Date(assignmentData.dueDate).toLocaleDateString('en-GB') : 'No Due Date'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-app-bg px-3 py-2 rounded-lg border border-border-subtle">
                                <div className="flex items-center gap-2 text-text-muted">
                                    <ClipboardList size={14} className="text-purple-500" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Points</span>
                                </div>
                                <span className="text-xs font-extrabold text-text-main">{assignmentData.totalMarks || 0} pts</span>
                            </div>
                        </div>

                        {/* 👉 Dynamic Submission UI */}
                        {hasSubmitted ? (
                            <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                                <div className="flex items-center justify-center gap-2 text-emerald-600 border-b border-emerald-500/10 pb-3">
                                    <CheckCircle2 size={18} />
                                    <span className="text-xs font-extrabold uppercase tracking-wider">Work Evaluated</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Submitted On</span>
                                    <span className="text-xs font-bold text-text-main bg-card-bg px-2 py-1 rounded border border-border-subtle">{new Date(assignmentData.submission.submittedAt).toLocaleDateString('en-GB')}</span>
                                </div>
                                
                                {isGraded && (
                                    <div className="pt-3 mt-3 border-t border-emerald-500/10 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Marks Obtained</span>
                                            <span className="text-sm font-black text-emerald-600 bg-card-bg px-2 py-1 rounded border border-emerald-500/20">{assignmentData.submission.marksObtained} / {assignmentData.totalMarks}</span>
                                        </div>
                                        {assignmentData.submission.comments && (
                                            <div className="bg-card-bg p-3 rounded-lg border border-emerald-500/20 mt-2">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 mb-1">Feedback Intel</p>
                                                <p className="text-xs font-medium text-text-main leading-relaxed">"{assignmentData.submission.comments}"</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsSubmitModalOpen(true)}
                                className="w-full py-3.5 bg-accent-blue text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-hover-blue transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                <UploadCloud size={16} /> Deploy Submission
                            </button>
                        )}
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
                submitText="Deploy Files"
            />
        </div>
    );
};

export default StudentAssignmentPage;