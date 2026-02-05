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

const QuizDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const courseId = Number(resolvedParams.courseId);
    const quizId = Number(resolvedParams.quizId);
    const dispatch = useAppDispatch();

    // Redux State
    const { courseContent, loading: reduxLoading } = useAppSelector((state) => state.course);
    const fullData = courseContent[courseId];

    // Local state for specific quiz (taaki reload par flicker na ho)
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

    // # 1. FETCH LOGIC: Reload aur Missing Questions ka ilaj
    useEffect(() => {
        const getFullQuizData = async () => {
            setIsInitialLoading(true);
            try {
                // Pehle Redux fetch karein agar cache khali hai
                if (!fullData) {
                    await dispatch(fetchCourseContent(courseId)).unwrap();
                }

                // Ab specific quiz fetch karein taaki QUESTIONS lazmi milen
                const specificQuiz = await getSpecificQuizAPI(quizId);
                setLocalQuiz(specificQuiz);
            } catch (err) {
                console.log("ALERT: Quiz load karne mein masla hua");
            } finally {
                setIsInitialLoading(false);
            }
        };

        if (courseId && quizId) {
            getFullQuizData();
        }
    }, [courseId, quizId, dispatch, fullData]);

    // UI ke liye quiz object (Pehle local state, phir cache)
    const displayQuiz = localQuiz || fullData?.sections?.flatMap((s: any) => s.quizzes || [])?.find((q: any) => q.id === quizId);

    const handleViewSubmissions = async () => {
        setTableLoading(true);
        setShowSubmissions(!showSubmissions);
        try {
            const res = await getQuizSubmissionsAPI(quizId);
            setSubmissions(res.data || res || []);
        } catch (err) { console.log("ALERT: Submissions failed"); }
        finally { setTableLoading(false); }
    };

    const handleReviewAttempt = async (attemptId: number) => {
        setTableLoading(true);
        try {
            const data = await getQuizAttemptDetailAPI(attemptId);
            const attempt = data.data || data;
            setSelectedAttempt(attempt);
            setGradeData({ marks: (attempt.totalMarksObtained ?? '').toString(), comments: attempt.comments || '' });
        } catch (err) { console.log("ALERT: Review load fail"); }
        finally { setTableLoading(false); }
    };

    const handleGradeSubmit = async () => {
        if (!gradeData.marks) return console.log("ALERT: Marks required");
        setGradeLoading(true);
        try {
            await gradeQuizAttemptAPI(selectedAttempt.attemptId || selectedAttempt.id, { marksObtained: Number(gradeData.marks), comments: gradeData.comments });
            console.log("ALERT: Grade saved!");
            setSelectedAttempt(null);
            handleViewSubmissions();
        } catch (err) { console.log("ALERT: Grade update fail"); }
        finally { setGradeLoading(false); }
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
            console.log("ALERT: Quiz updated!");
            setIsEditModalOpen(false);
            
            // Refresh Both
            const updated = await getSpecificQuizAPI(quizId);
            setLocalQuiz(updated);
            dispatch(refreshCourseContent(courseId));
            dispatch(fetchCourseContent(courseId));
        } catch (err: any) { console.log("ALERT: Update failed"); }
        finally { setModalLoading(false); }
    };

    const formatSafeDate = (dateStr: any) => {
        if (!dateStr) return "Not Scheduled";
        return new Date(dateStr).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // # 2. LOADING GUARD: Reload par flicker khatam
    if (isInitialLoading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Syncing Quiz Data...</p>
        </div>
    );

    if (!displayQuiz) return (
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-black">Quiz Details Not Found</h2>
            <Link href={`/teacher/assigned-courses/${courseId}`} className="mt-4 text-blue-600 font-bold underline">Return to Course</Link>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20 text-[#0F172A]">
            {/* Header */}
            <div className="flex justify-between items-center">
                <Link href={`/teacher/assigned-courses/${courseId}`} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all"><ArrowLeft size={16} /> Back</Link>
                <div className="flex gap-4">
                    <button onClick={handleViewSubmissions} className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg hover:bg-blue-700 transition-all">Submissions</button>
                    <button onClick={() => setIsEditModalOpen(true)} className="px-6 py-2.5 bg-[#0F172A] text-white rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-black transition-all"><Settings2 size={14} /> Edit Quiz</button>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-[#0F172A] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="relative z-10 flex items-center gap-8">
                    <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center border border-blue-500/30"><ClipboardList size={40} className="text-blue-400" /></div>
                    <div>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest">Teacher Control</span>
                        <h1 className="text-4xl font-black mt-2">{displayQuiz.title}</h1>
                        <p className="text-slate-400 mt-1 max-w-xl line-clamp-2">{displayQuiz.description}</p>
                    </div>
                </div>
            </div>

            {/* Questions Rendering (Fix) */}
            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-2">Questions List ({displayQuiz.questions?.length || 0})</h3>
                {displayQuiz.questions?.map((q: any, index: number) => (
                    <div key={index} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-blue-500 uppercase">Question {index + 1} ({q.question_type})</p>
                                <p className="font-bold text-lg text-slate-800 leading-tight">{q.question_text}</p>
                            </div>
                            <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black border uppercase">{q.marks} pts</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options?.map((opt: any, i: number) => (
                                <div key={i} className={`p-4 rounded-2xl border text-sm font-bold flex items-center gap-3 ${opt.is_correct ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                    <div className={`w-2 h-2 rounded-full ${opt.is_correct ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                                    {opt.option_text}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Submissions table area... (Same as before) */}
            {showSubmissions && (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-6 animate-in slide-in-from-bottom-5">
                    <UserManagementTable data={submissions} loading={tableLoading} columnConfig={[]} type="Submission" />
                </div>
            )}

            {/* Grading Modal... (Logic remains same) */}
            
            <GenericFormModal
                isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}
                title="Update Quiz Structure" submitText="Update Quiz"
                fields={[
                    { name: 'title', label: 'Quiz Title', type: 'text', required: true },
                    { name: 'description', label: 'Quiz Description', type: 'textarea' },
                    { name: 'total_marks', label: 'Total Marks', type: 'number', required: true },
                    { name: 'start_time', label: 'Start Time', type: 'datetime-local' },
                    { name: 'end_time', label: 'End Time', type: 'datetime-local' },
                    { name: 'is_Published', label: 'Status', type: 'select', options: [{ label: 'Published', value: 'true' }, { label: 'Draft', value: 'false' }] },
                    { name: 'questions', label: 'Quiz Questions', type: 'quiz-builder', required: true }
                ]} 
                onSubmit={handleUpdateSubmit}
                loading={modalLoading}
                initialData={{
                    ...displayQuiz,
                    start_time: (displayQuiz.start_time || displayQuiz.startTime) ? new Date(displayQuiz.start_time || displayQuiz.startTime).toISOString().slice(0, 16) : '',
                    end_time: (displayQuiz.end_time || displayQuiz.endTime) ? new Date(displayQuiz.end_time || displayQuiz.endTime).toISOString().slice(0, 16) : '',
                    total_marks: displayQuiz.total_marks || displayQuiz.totalMarks,
                    is_Published: String(displayQuiz.is_Published)
                }}
            />
        </div>
    );
};

export default QuizDetailPage;