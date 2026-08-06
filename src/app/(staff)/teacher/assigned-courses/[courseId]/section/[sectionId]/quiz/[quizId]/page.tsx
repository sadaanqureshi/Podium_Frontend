'use client';
import React, { useState, useEffect, use } from 'react';
import { Loader2, ArrowLeft, ClipboardList, AlertCircle, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchCourseContent, refreshCourseContent } from '@/lib/store/features/courseSlice';
import { getSpecificQuizAPI, updateQuizAPI } from '@/lib/api/apiService';
import GenericFormModal from '@/components/ui/GenericFormModal';

const QuizDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const courseId = Number(resolvedParams.courseId);
    const quizId = Number(resolvedParams.quizId);
    const dispatch = useAppDispatch();

    const { courseContent } = useAppSelector((state) => state.course);
    const fullData = courseContent[courseId];

    const [localQuiz, setLocalQuiz] = useState<any>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        const getFullQuizData = async () => {
            if (!courseId || !quizId) return;
            setIsInitialLoading(true);
            try {
                if (!fullData) await dispatch(fetchCourseContent(courseId)).unwrap();
                const specificQuiz = await getSpecificQuizAPI(quizId);
                setLocalQuiz(specificQuiz);
            } catch (err) { console.error("Quiz load failed"); }
            finally { setIsInitialLoading(false); }
        };
        getFullQuizData();
    }, [courseId, quizId, dispatch, fullData]);

    const displayQuiz = localQuiz || fullData?.sections?.flatMap((s: any) => s.quizzes || [])?.find((q: any) => q.id === quizId);

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

    if (isInitialLoading) return <div className="h-screen flex flex-col items-center justify-center bg-app-bg"><Loader2 className="animate-spin text-accent-blue mb-4" size={40} /><p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading Data...</p></div>;

    if (!displayQuiz) return <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-app-bg"><AlertCircle className="text-red-500 mb-4" size={48} /><h2 className="text-xl font-extrabold tracking-tight text-text-main mb-2">Quiz Not Found</h2><Link href={`/teacher/assigned-courses/${courseId}`} className="text-accent-blue font-bold text-sm hover:underline">Return to Course</Link></div>;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-20 bg-app-bg h-full text-text-main animate-in fade-in slide-in-from-top-4">
            
            {/* Header / Navigation */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <Link href={`/teacher/assigned-courses/${courseId}`} className="inline-flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold text-xs uppercase tracking-wider transition-colors">
                    <ArrowLeft size={16} /> Back to Course
                </Link>
                <div className="flex flex-wrap gap-3">
                    <Link href={`/teacher/assigned-courses/${courseId}/section/${resolvedParams.sectionId}/quiz/${quizId}/submissions`} className="px-5 py-2.5 bg-accent-blue text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-accent-blue/90 transition-all active:scale-95">
                        Submissions
                    </Link>
                    <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2.5 bg-card-bg border border-border-subtle text-text-main rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 hover:border-accent-blue transition-colors">
                        <Settings2 size={16} /> Structure
                    </button>
                </div>
            </div>

            {/* Hero Card - Minimalized */}
            <div className="bg-card-bg rounded-2xl p-6 md:p-10 shadow-sm border border-border-subtle relative overflow-hidden flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
                
                <div className="w-16 h-16 bg-app-bg rounded-xl flex items-center justify-center border border-border-subtle shadow-sm relative z-10 shrink-0">
                    <ClipboardList size={32} className="text-accent-blue" />
                </div>
                
                <div className="relative z-10 space-y-2">
                    <span className="inline-block px-2.5 py-1 bg-accent-blue/10 text-accent-blue rounded-md text-[10px] font-bold uppercase tracking-widest">
                        Assessment Node
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-main leading-tight capitalize">
                        {displayQuiz.title}
                    </h1>
                    <p className="text-text-muted text-sm font-medium leading-relaxed max-w-2xl">
                        {displayQuiz.description}
                    </p>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6 pt-4">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-text-main border-b border-border-subtle pb-3">Questions Configuration</h3>
                
                {displayQuiz.questions?.map((q: any, index: number) => (
                    <div key={index} className="p-6 md:p-8 bg-card-bg border border-border-subtle rounded-2xl shadow-sm">
                        <div className="flex justify-between items-start mb-6 gap-4 border-b border-border-subtle/50 pb-4">
                            <div>
                                <p className="text-[10px] font-bold text-accent-blue uppercase tracking-widest mb-2">Question {index + 1}</p>
                                <p className="font-extrabold text-lg text-text-main leading-snug">{q.question_text}</p>
                            </div>
                            <span className="px-3 py-1 bg-app-bg text-text-muted rounded-lg text-[10px] font-bold border border-border-subtle uppercase tracking-widest shrink-0">
                                {q.marks} PTS
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options?.map((opt: any, i: number) => (
                                <div key={i} className={`p-4 rounded-xl border text-[13px] font-bold flex items-center gap-3 transition-colors ${opt.is_correct ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-app-bg border-border-subtle text-text-muted'}`}>
                                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.is_correct ? 'bg-emerald-500' : 'bg-border-subtle'}`}></div>
                                    <span className="leading-snug">{opt.option_text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal (Untouched Logic) */}
            <GenericFormModal
                isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}
                title="Modify Assessment"
                fields={[
                    { name: 'title', label: 'Quiz Title', type: 'text', required: true },
                    { name: 'description', label: 'Quiz Description', type: 'textarea' },
                    { name: 'total_marks', label: 'Total Points', type: 'number', required: true },
                    { name: 'start_time', label: 'Start Time', type: 'datetime-local' },
                    { name: 'end_time', label: 'End Time', type: 'datetime-local' },
                    { name: 'is_Published', label: 'Availability', type: 'select', options: [{ label: 'Live', value: 'true' }, { label: 'Draft', value: 'false' }] },
                    { name: 'questions', label: 'Manage Questions', type: 'quiz-builder', required: true }
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

export default QuizDetailPage;