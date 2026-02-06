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

    if (isInitialLoading) return <div className="h-screen flex flex-col items-center justify-center bg-app-bg"><Loader2 className="animate-spin text-accent-blue mb-4" size={48} /><p className="text-text-muted font-black uppercase tracking-widest text-[10px]">Syncing Data...</p></div>;

    if (!displayQuiz) return <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-app-bg"><AlertCircle className="text-red-500 mb-4" size={48} /><h2 className="text-xl font-black uppercase tracking-tight">Quiz Not Found</h2><Link href={`/teacher/assigned-courses/${courseId}`} className="mt-4 text-accent-blue font-black uppercase text-xs underline decoration-accent-blue/30 underline-offset-8">Return to Course</Link></div>;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20 bg-app-bg min-h-screen text-text-main">
            <div className="flex justify-between items-center">
                <Link href={`/teacher/assigned-courses/${courseId}`} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-black text-xs uppercase tracking-widest transition-all">
                    <ArrowLeft size={16} /> Back to Course
                </Link>
                <div className="flex gap-4">
                    {/* NEW: Link to Submissions Page */}
                    <Link href={`/teacher/assigned-courses/${courseId}/section/${resolvedParams.sectionId}/quiz/${quizId}/submissions`} className="px-6 py-2.5 bg-accent-blue text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-accent-blue/20 transition-all active:scale-95">Submissions</Link>
                    <button onClick={() => setIsEditModalOpen(true)} className="px-6 py-2.5 bg-text-main text-card-bg rounded-2xl font-black text-[10px] uppercase shadow-xl flex items-center gap-2">
                        <Settings2 size={14} /> Structure
                    </button>
                </div>
            </div>

            <div className="hero-registry-card rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-border-subtle relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-accent-blue/20 rounded-3xl flex items-center justify-center border border-accent-blue/30"><ClipboardList size={40} className="text-accent-blue" /></div>
                    <div>
                        <span className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-full text-[9px] font-black uppercase tracking-widest border border-accent-blue/20">Quiz Node</span>
                        <h1 className="text-3xl md:text-5xl font-black mt-2 uppercase tracking-tighter">{displayQuiz.title}</h1>
                        <p className="text-text-muted mt-2 max-w-xl font-medium uppercase text-[10px] tracking-wide">{displayQuiz.description}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {displayQuiz.questions?.map((q: any, index: number) => (
                    <div key={index} className="p-8 bg-card-bg border border-border-subtle rounded-[2.5rem] group">
                        <div className="flex justify-between items-start mb-8 gap-4">
                            <div>
                                <p className="text-[10px] font-black text-accent-blue uppercase tracking-widest">Question {index + 1}</p>
                                <p className="font-black text-xl text-text-main uppercase tracking-tight">{q.question_text}</p>
                            </div>
                            <span className="px-5 py-2 bg-app-bg text-text-muted rounded-2xl text-[10px] font-black border border-border-subtle uppercase tracking-widest">{q.marks} PTS</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options?.map((opt: any, i: number) => (
                                <div key={i} className={`p-5 rounded-3xl border-2 text-[11px] font-black uppercase tracking-widest flex items-center gap-4 ${opt.is_correct ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-app-bg border-border-subtle text-text-muted'}`}>
                                    <div className={`w-2.5 h-2.5 rounded-full ${opt.is_correct ? 'bg-emerald-500' : 'bg-text-muted/20'}`}></div>
                                    {opt.option_text}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <GenericFormModal
                isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}
                title="Modify Assessment"
                fields={[
                    { name: 'title', label: 'Quiz Title', type: 'text', required: true },
                    { name: 'description', label: 'Quiz Description', type: 'textarea' },
                    { name: 'total_marks', label: 'Point Volume', type: 'number', required: true },
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