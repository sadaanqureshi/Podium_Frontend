'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import { Loader2, ArrowLeft, ClipboardList, HelpCircle, AlertCircle, Clock, Settings2, X } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

// Redux Actions
import { fetchCourseContent, refreshCourseContent } from '@/lib/store/features/courseSlice';

// API Imports
import {
    getSpecificQuizAPI, 
    updateQuizAPI,
    getQuizSubmissionsAPI, 
    getQuizAttemptDetailAPI, 
    gradeQuizAttemptAPI
} from '@/lib/api/apiService';

import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';
import UserManagementTable from '@/components/ui/UserManagementTable';

const AdminQuizDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    
    const courseId = Number(resolvedParams.id); 
    const quizId = Number(resolvedParams.quizId);
    const dispatch = useAppDispatch();

    // Redux State
    const { courseContent, loading: reduxLoading } = useAppSelector((state) => state.course);
    const fullData = courseContent[courseId];

    // Local states
    const [localQuiz, setLocalQuiz] = useState<any>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [showSubmissions, setShowSubmissions] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
    const [gradeData, setGradeData] = useState({ marks: '', comments: '' });
    const [gradeLoading, setGradeLoading] = useState(false);

    useEffect(() => {
        const getFullQuizData = async () => {
            if (!courseId || !quizId) return;
            setIsInitialLoading(true);
            try {
                if (!fullData) {
                    await dispatch(fetchCourseContent(courseId)).unwrap();
                }
                const specificQuiz = await getSpecificQuizAPI(quizId);
                setLocalQuiz(specificQuiz);
            } catch (err) {
                console.error("Quiz hydration failed");
            } finally {
                setIsInitialLoading(false);
            }
        };
        getFullQuizData();
    }, [courseId, quizId, dispatch, fullData]);

    const displayQuiz = localQuiz || fullData?.sections?.flatMap((s: any) => s.quizzes || [])?.find((q: any) => q.id === quizId);

    const handleViewSubmissions = async () => {
        setTableLoading(true);
        setShowSubmissions(!showSubmissions);
        try {
            const res = await getQuizSubmissionsAPI(quizId);
            setSubmissions(res.data || res || []);
        } catch (err) { console.error("Fetch submissions failed"); }
        finally { setTableLoading(false); }
    };

    const handleReviewAttempt = async (attemptId: number) => {
        setTableLoading(true);
        try {
            const data = await getQuizAttemptDetailAPI(attemptId);
            const attempt = data.data || data;
            setSelectedAttempt(attempt);
            setGradeData({ marks: (attempt.totalMarksObtained ?? '').toString(), comments: attempt.comments || '' });
        } catch (err) { console.error("Review failed"); }
        finally { setTableLoading(false); }
    };

    const handleGradeSubmit = async () => {
        if (!gradeData.marks) return;
        setGradeLoading(true);
        try {
            // API requirements ke mutabiq payload structure sahi kiya gaya hai
            await gradeQuizAttemptAPI(selectedAttempt.attemptId || selectedAttempt.id, { 
                comments: gradeData.comments,
                // TypeScript 'questions' maang raha hai, isliye attempt se questions pass kar diye
                questions: selectedAttempt.questions || [] 
            });
    
            setSelectedAttempt(null);
            const res = await getQuizSubmissionsAPI(quizId);
            setSubmissions(res.data || res || []);
        } catch (err) { 
            console.error("Grading failed"); 
        } finally { 
            setGradeLoading(false); 
        }
    };

    const handleUpdateSubmit = async (formData: FormData) => {
        setModalLoading(true);
        try {
            const rawData = Object.fromEntries(formData);
            const payload = {
                ...rawData,
                total_marks: Number(rawData.total_marks),
                is_Published: rawData.is_Published === 'true',
                questions: JSON.parse(rawData.questions as string)
            };
            await updateQuizAPI(quizId, payload);
            setIsEditModalOpen(false);
            const updated = await getSpecificQuizAPI(quizId);
            setLocalQuiz(updated);
            dispatch(refreshCourseContent(courseId));
            dispatch(fetchCourseContent(courseId));
        } catch (err: any) { console.error("Update failed"); }
        finally { setModalLoading(false); }
    };

    const columnConfig = [
        {
            header: 'Student', key: 'studentName',
            render: (item: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-app-bg border border-border-subtle text-accent-blue flex items-center justify-center font-black text-[10px] uppercase shadow-sm">
                        {item.studentName?.[0]}
                    </div>
                    <span className="font-black text-sm text-text-main uppercase tracking-tight">{item.studentName}</span>
                </div>
            )
        },
        { 
            header: 'Score Registry', key: 'totalMarks', align: 'center' as const, 
            render: (item: any) => <span className="font-black text-accent-blue tracking-tighter">{item.totalMarksObtained ?? 0} / {displayQuiz?.total_marks || displayQuiz?.totalMarks}</span> 
        },
        {
            header: 'Audit Action', key: 'action', align: 'right' as const,
            render: (item: any) => (
                <button 
                    onClick={() => handleReviewAttempt(item.id)} 
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                        item.isGraded 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-accent-blue text-white'
                    }`}
                >
                    {item.isGraded ? 'Evaluated' : 'Mark Grade'}
                </button>
            )
        }
    ];

    if (isInitialLoading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
            <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
            <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">Syncing Admin Data...</p>
        </div>
    );

    if (!displayQuiz) return (
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-app-bg">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-black text-text-main uppercase tracking-tight">Admin: Quiz Terminal Offline</h2>
            <Link href={`/admin/courses/${courseId}`} className="mt-4 text-accent-blue font-black uppercase text-xs underline decoration-accent-blue/30 underline-offset-8">Return to Dashboard</Link>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20 bg-app-bg min-h-screen text-text-main transition-colors duration-300">
            
            {/* Header Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <Link href={`/admin/courses/${courseId}`} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-black text-xs uppercase tracking-widest transition-all">
                    <ArrowLeft size={16} /> Back to Course
                </Link>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button onClick={handleViewSubmissions} className="flex-1 sm:flex-none px-8 py-3.5 bg-accent-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-accent-blue/20 active:scale-95 transition-all">
                        Attempt List
                    </button>
                    <button onClick={() => setIsEditModalOpen(true)} className="flex-1 sm:flex-none px-8 py-3.5 bg-text-main text-card-bg rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Settings2 size={14} strokeWidth={3} /> Modify Structure
                    </button>
                </div>
            </div>

            {/* Hero Info Card */}
           <div className="hero-registry-card rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                    <div className="w-24 h-24 bg-card-bg/5 rounded-[2.5rem] flex items-center justify-center border border-card-bg/10 shadow-inner">
                        <ClipboardList size={48} className="text-accent-blue" />
                    </div>
                    <div>
                        <span className="px-4 py-1.5 bg-card-bg/10 text-accent-blue rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-accent-blue/20">Assessment Protocol</span>
                        <h1 className="text-3xl md:text-5xl font-black mt-4 uppercase tracking-tighter leading-none">{displayQuiz.title}</h1>
                    </div>
                </div>
            </div>

            {/* Questions Rendering Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-4">
                    <div className="h-4 w-1 bg-accent-blue rounded-full"></div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted">Questions In Registry ({displayQuiz.questions?.length || 0})</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {displayQuiz.questions?.map((q: any, index: number) => (
                        <div key={index} className="p-8 bg-card-bg border border-border-subtle rounded-[2.5rem] shadow-sm transition-all hover:shadow-md">
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-accent-blue uppercase tracking-widest flex items-center gap-2">
                                        <HelpCircle size={12} /> Question {index + 1} ({q.question_type})
                                    </p>
                                    <p className="font-black text-xl text-text-main uppercase tracking-tight">{q.question_text}</p>
                                </div>
                                <span className="px-5 py-2 bg-app-bg text-text-muted rounded-2xl text-[10px] font-black border border-border-subtle uppercase tracking-widest shadow-inner">
                                    {q.marks} PTS
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {q.options?.map((opt: any, i: number) => (
                                    <div key={i} className={`p-5 rounded-3xl border-2 text-[11px] font-black uppercase tracking-widest flex items-center gap-4 transition-all ${
                                        opt.is_correct 
                                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500 shadow-sm shadow-emerald-500/5' 
                                        : 'bg-app-bg border-border-subtle text-text-muted'
                                    }`}>
                                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${opt.is_correct ? 'bg-emerald-500' : 'bg-text-muted/20'}`}></div>
                                        {opt.option_text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submissions List */}
            {showSubmissions && (
                <div className="bg-card-bg rounded-[3rem] border border-border-subtle shadow-2xl overflow-hidden p-4 animate-in slide-in-from-bottom-5">
                    <div className="px-8 py-6 border-b border-border-subtle mb-4">
                        <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-text-muted">Class Submission Log</h3>
                    </div>
                    <UserManagementTable data={submissions} loading={tableLoading} columnConfig={columnConfig} type="Submission" />
                </div>
            )}

            {/* Grading Modal */}
            {selectedAttempt && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-card-bg w-full max-w-5xl rounded-[3.5rem] overflow-hidden flex flex-col max-h-[92vh] border border-border-subtle shadow-2xl">
                        <div className="bg-text-main p-12 text-card-bg flex justify-between items-center transition-colors">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-blue mb-1">Manual Evaluation</p>
                                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">{selectedAttempt.studentName}</h3>
                            </div>
                            <button onClick={() => setSelectedAttempt(null)} className="p-3 hover:bg-card-bg/10 rounded-2xl transition-all"><X size={28} /></button>
                        </div>
                        
                        <div className="p-12 overflow-y-auto space-y-10 bg-card-bg no-scrollbar flex-1 text-center">
                            <AlertCircle size={40} className="mx-auto text-text-muted opacity-20 mb-4" />
                            <p className="font-black text-text-muted uppercase text-xs tracking-[0.3em]">Auditing Active Attempt Records...</p>
                        </div>

                        <div className="p-10 border-t border-border-subtle bg-app-bg flex flex-col md:flex-row gap-8 items-end">
                            <div className="flex-1 w-full space-y-3">
                                <label className="text-[11px] font-black uppercase text-text-muted ml-3 tracking-[0.2em]">Verified Score</label>
                                <input 
                                    type="number" 
                                    className="w-full p-6 bg-card-bg border-2 border-border-subtle rounded-[2rem] font-black text-xl text-text-main outline-none focus:border-accent-blue shadow-inner transition-all" 
                                    value={gradeData.marks} 
                                    onChange={(e) => setGradeData({ ...gradeData, marks: e.target.value })} 
                                />
                            </div>
                            <button 
                                onClick={handleGradeSubmit} 
                                disabled={gradeLoading} 
                                className="h-[76px] w-full md:w-auto px-16 bg-accent-blue text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-hover-blue active:scale-95 transition-all shadow-2xl shadow-accent-blue/20 disabled:opacity-50"
                            >
                                {gradeLoading ? <Loader2 className="animate-spin" /> : 'Deploy Grade'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Structure Edit Modal */}
            <GenericFormModal
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)}
                title="Modify Assessment Logic" 
                submitText="Synchronize Data"
                fields={[
                    { name: 'title', label: 'Quiz Title', type: 'text', required: true },
                    { name: 'description', label: 'Instruction Set', type: 'textarea' },
                    { name: 'total_marks', label: 'Point Volume', type: 'number', required: true },
                    { name: 'start_time', label: 'Protocol Start', type: 'datetime-local' },
                    { name: 'end_time', label: 'Protocol Terminate', type: 'datetime-local' },
                    { name: 'is_Published', label: 'Availability', type: 'select', options: [{ label: 'Live Registry', value: 'true' }, { label: 'Internal Draft', value: 'false' }] },
                    { name: 'questions', label: 'Architect Questions', type: 'quiz-builder', required: true }
                ]} 
                onSubmit={handleUpdateSubmit}
                loading={modalLoading}
                initialData={{
                    ...displayQuiz,
                    start_time: (displayQuiz?.start_time || displayQuiz?.startTime) ? new Date(displayQuiz?.start_time || displayQuiz?.startTime).toISOString().slice(0, 16) : '',
                    end_time: (displayQuiz?.end_time || displayQuiz?.endTime) ? new Date(displayQuiz?.end_time || displayQuiz?.endTime).toISOString().slice(0, 16) : '',
                    total_marks: displayQuiz?.total_marks || displayQuiz?.totalMarks,
                    is_Published: String(displayQuiz?.is_Published)
                }}
            />
        </div>
    );
};

export default AdminQuizDetailPage;