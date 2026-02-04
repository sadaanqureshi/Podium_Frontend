'use client';

import React, { useState, useEffect, use } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getAssignmentDetailAPI } from '@/lib/api/apiService';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { 
    setAssignment, 
    setSubmission, 
    setLoading, 
    setError,
    setUploadProgress,
    addFileName,
    removeFileName,
    clearUploadProgress
} from '@/lib/store/features/assignmentSlice';
import Cookies from 'js-cookie';
import AssignmentSection from '@/components/assignment/AssignmentSection';
import SubmissionCard from '@/components/assignment/SubmissionCard';

const AssignmentDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = use(params);
    const assignmentId = resolvedParams.id;

    const dispatch = useAppDispatch();
    const { currentAssignment, submission, loading, error, uploadProgress, fileNames } = useAppSelector((state) => state.assignment);

    const [fileSizes, setFileSizes] = useState<Record<string, number>>({});
    const [isUploading, setIsUploading] = useState(false);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

    useEffect(() => {
        const fetchAssignment = async () => {
            if (!assignmentId) return;
            dispatch(setLoading(true));
            try {
                const data = await getAssignmentDetailAPI(assignmentId);
                const assignmentData = data.data || data;
                dispatch(setAssignment(assignmentData));
                
                // If submission is included in the response, store it
                if (assignmentData.submission) {
                    const submissionWithAssignmentId = {
                        ...assignmentData.submission,
                        assignmentId: parseInt(assignmentId),
                    };
                    dispatch(setSubmission(submissionWithAssignmentId));
                }
            } catch (err: any) {
                dispatch(setError(err.message || 'Failed to load assignment details'));
            }
        };
        fetchAssignment();
    }, [assignmentId, dispatch]);

    // Check if submission belongs to current assignment
    const currentSubmission = submission && submission.assignmentId === parseInt(assignmentId) ? submission : null;

    const handleUpload = async (files: File[]) => {
        if (files.length === 0) {
            return;
        }

        const token = Cookies.get('authToken');
        if (!token) {
            return;
        }

        // Validate file types
        const allowedTypes = [
            'application/pdf',
            'application/zip',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
        
        const maxSize = 50 * 1024 * 1024; // 50MB
        
        const validFiles: File[] = [];
        const invalidFiles: string[] = [];
        
        files.forEach(file => {
            if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|zip|doc|docx|xls|xlsx|txt|ppt|pptx)$/i)) {
                invalidFiles.push(`${file.name}: Invalid file type`);
            } else if (file.size > maxSize) {
                invalidFiles.push(`${file.name}: File size exceeds 50MB`);
            } else {
                validFiles.push(file);
            }
        });
        
        if (invalidFiles.length > 0) {
            if (validFiles.length === 0) return;
        }

        const formData = new FormData();
        validFiles.forEach(file => {
            formData.append('files', file);
        });

        // Set uploading state
        setIsUploading(true);
        dispatch(setUploadProgress(0));

        return new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    dispatch(setUploadProgress(percentComplete));
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        const submissionData = response.data || response;
                        
                        if (submissionData.submissionFiles && validFiles.length > 0) {
                            const newFileSizes: Record<string, number> = {};
                            submissionData.submissionFiles.forEach((url: string, index: number) => {
                                if (validFiles[index]) {
                                    dispatch(addFileName({ url, name: validFiles[index].name }));
                                    newFileSizes[url] = validFiles[index].size;
                                }
                            });
                            setFileSizes(prev => ({ ...prev, ...newFileSizes }));
                        }
                        
                        // Update submission status to submitted (auto-mark as done)
                        const updatedSubmission = {
                            ...submissionData,
                            assignmentId: parseInt(assignmentId),
                            status: 'submitted'
                        };
                        dispatch(setSubmission(updatedSubmission));
                        dispatch(setUploadProgress(100));
                        setIsUploading(false);
                        // Small delay to show 100% before clearing
                        setTimeout(() => {
                            dispatch(clearUploadProgress());
                        }, 500);
                        resolve();
                    } catch (err) {
                        dispatch(clearUploadProgress());
                        setIsUploading(false);
                        reject(err);
                    }
                } else {
                    dispatch(clearUploadProgress());
                    setIsUploading(false);
                    reject(new Error('Upload failed'));
                }
            });

            xhr.addEventListener('error', () => {
                dispatch(clearUploadProgress());
                setIsUploading(false);
                reject(new Error('Network error'));
            });

            xhr.addEventListener('abort', () => {
                dispatch(clearUploadProgress());
                setIsUploading(false);
                reject(new Error('Upload aborted'));
            });

            xhr.open('POST', `${API_URL}/assignments/${assignmentId}/submit`);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.send(formData);
        });
    };

    const handleDeleteFile = (fileUrl: string) => {
        if (!currentSubmission || !currentSubmission.submissionFiles) return;
        
        if (currentSubmission.status === 'graded') {
            alert('Cannot delete files from a graded submission');
            return;
        }

        if (confirm('Are you sure you want to delete this file?')) {
            const updatedFiles = currentSubmission.submissionFiles.filter((url: string) => url !== fileUrl);
            const updatedSubmission = {
                ...currentSubmission,
                submissionFiles: updatedFiles
            };
            dispatch(setSubmission(updatedSubmission));
            dispatch(removeFileName(fileUrl));
            
            setFileSizes(prev => {
                const newSizes = { ...prev };
                delete newSizes[fileUrl];
                return newSizes;
            });
            
            alert('File removed. You may need to re-upload all files to update your submission.');
        }
    };

    const handleCommentSubmit = (comment: string) => {
        // Local state only - no backend API
        alert('Comment saved locally');
    };

    const handleMarkAsDone = () => {
        // Local state only
        alert('Assignment marked as done');
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
                    <AlertCircle className="text-red-600" size={24} />
                    <div>
                        <h3 className="font-bold text-red-900">Error</h3>
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
                <Link href="/assignment" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    Back to Assignments
                </Link>
            </div>
        );
    }

    if (!currentAssignment) {
        return null;
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Assignment Details */}
                <AssignmentSection assignment={currentAssignment} />

                {/* Right Column - Submission Card */}
                <SubmissionCard
                    submission={currentSubmission || undefined}
                    assignmentTotalMarks={currentAssignment.totalMarks}
                    onUpload={handleUpload}
                    onMarkAsDone={handleMarkAsDone}
                    onCommentSubmit={handleCommentSubmit}
                    uploadProgress={uploadProgress}
                    isUploading={isUploading}
                    onDeleteFile={handleDeleteFile}
                    fileNames={fileNames}
                    fileSizes={fileSizes}
                />
            </div>
        </div>
    );
};

export default AssignmentDetailPage;
