'use client';
import React, { useState, useEffect, use, useMemo } from 'react';
import {
    Loader2, ArrowLeft, ClipboardList, HelpCircle,
    AlertCircle, Clock, Edit3, Settings2, CheckCircle2, X, Eye, Award
} from 'lucide-react';
import Link from 'next/link';
import {
    getSpecificQuizAPI, updateQuizAPI,
    getQuizSubmissionsAPI, getQuizAttemptDetailAPI, gradeQuizAttemptAPI
} from '@/lib/api/apiService';
import GenericFormModal, { FormField } from '@/components/ui/GenericFormModal';
import UserManagementTable from '@/components/ui/UserManagementTable';

const QuizDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const { courseId, quizId } = resolvedParams;

    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [showSubmissions, setShowSubmissions] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // Grading Modal States
    const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
    const [gradeData, setGradeData] = useState({ marks: '', comments: '' });
    const [gradeLoading, setGradeLoading] = useState(false);

    // # 1. FETCH DATA FUNCTION
    const fetchQuiz = async () => {
        try {
            const data = await getSpecificQuizAPI(Number(quizId));
            setQuiz(data);
        } catch (err) {
            console.error("Quiz Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    // # 2. FETCH SUBMISSIONS (Students List)
    const handleViewSubmissions = async () => {
        setTableLoading(true);
        setShowSubmissions(!showSubmissions); // Toggle behavior
        try {
            const res = await getQuizSubmissionsAPI(Number(quizId));
            setSubmissions(res.data || res || []);
        } catch (err) {
            alert("Submissions load nahi ho sakeen");
        } finally {
            setTableLoading(false);
        }
    };

    // # 3. FETCH ATTEMPT DETAIL (For Reviewing student answers)
    const handleReviewAttempt = async (attemptId: number) => {
        setLoading(true);
        try {
            const data = await getQuizAttemptDetailAPI(attemptId);
            const attempt = data.data || data;
            setSelectedAttempt(attempt);
            // Pre-fill placeholder from totalMarksObtained
            setGradeData({
                marks: (attempt.totalMarksObtained || attempt.totalMarks || '').toString(),
                comments: attempt.comments || ''
            });
        } catch (err) {
            alert("Attempt details load nahi ho sakin");
        } finally {
            setLoading(false);
        }
    };

    const handleGradeSubmit = async () => {
        if (!gradeData.marks) return alert("Marks obtained likhna zaroori hain");
        setGradeLoading(true);
        try {
            await gradeQuizAttemptAPI(selectedAttempt.attemptId || selectedAttempt.id, {
                marksObtained: Number(gradeData.marks),
                comments: gradeData.comments
            });
            alert("Grading completed!");
            setSelectedAttempt(null);
            await handleViewSubmissions(); // Table sync
        } catch (err) {
            alert("Grading failed");
        } finally {
            setGradeLoading(false);
        }
    };

    // # 4. DATE FORMATTER HELPER
    const formatSafeDate = (dateStr: any) => {
        if (!dateStr) return "Not Scheduled";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "Invalid Date Format";
        return d.toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    // # 5. TABLE COLUMN CONFIGURATION
    const columnConfig = [
        {
            header: 'Student Name',
            key: 'studentName',
            render: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-[10px] uppercase">
                        {item.studentName?.[0] || 'S'}
                    </div>
                    <span className="font-bold text-sm text-[#0F172A]">{item.studentName}</span>
                </div>
            )
        },
        { header: 'Submission Date', key: 'submittedAt', render: (item: any) => formatSafeDate(item.submittedAt) },
        {
            header: 'Score',
            key: 'totalMarks',
            align: 'center' as const,
            render: (item: any) => (
                <span className="font-black text-blue-600">{item.totalMarks} / {quiz?.total_marks || quiz?.totalMarks}</span>
            )
        },
        {
            header: 'Action',
            key: 'action',
            align: 'right' as const,
            render: (item: any) => (
                <button
                    onClick={() => handleReviewAttempt(item.id)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${item.isGraded ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-blue-600 text-white shadow-blue-100'}`}
                >
                    {item.isGraded ? 'Graded' : 'Review & Grade'}
                </button>
            )
        }
    ];

    const formFields: FormField[] = useMemo(() => [
        { name: 'title', label: 'Quiz Title', type: 'text', required: true },
        { name: 'description', label: 'Quiz Description', type: 'textarea' },
        { name: 'total_marks', label: 'Total Marks', type: 'number', required: true },
        { name: 'start_time', label: 'Start Time', type: 'datetime-local', required: true },
        { name: 'end_time', label: 'End Time', type: 'datetime-local', required: true },
        { name: 'is_Published', label: 'Publish Status', type: 'select', options: [{ label: 'Published', value: 'true' }, { label: 'Draft', value: 'false' }] },
        { name: 'questions', label: 'Manage Questions', type: 'quiz-builder', required: true }
    ], []);

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
            await updateQuizAPI(Number(quizId), payload);
            alert("Quiz & Questions updated successfully!");
            setIsEditModalOpen(false);
            await fetchQuiz();
        } catch (err: any) { alert(err.message || "Update failed"); }
        finally { setModalLoading(false); }
    };

    if (loading && !quiz) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
    if (!quiz) return <div className="text-center p-20 flex flex-col items-center"><AlertCircle size={48} className="text-red-500 mb-4" /><p className="font-bold text-slate-800">Quiz details not found.</p></div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Navigation */}
            <div className="flex justify-between items-center">
                <Link href={`/teacher/assigned-courses/${courseId}`} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all"><ArrowLeft size={16} /> Back to Section</Link>
                <div className="flex gap-4">
                    <button onClick={handleViewSubmissions} className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700">Submissions List</button>
                    <button onClick={() => setIsEditModalOpen(true)} className="px-6 py-2.5 bg-[#0F172A] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"><Settings2 size={14} /> Edit Quiz & Builder</button>
                </div>
            </div>

            {/* Quiz Info Card */}
            <div className="bg-[#0F172A] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="flex items-center gap-8 relative z-10">
                    <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center border border-blue-500/30 shadow-inner"><ClipboardList size={40} className="text-blue-400" /></div>
                    <div className="space-y-2">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest">Assessment Detail</span>
                        <h1 className="text-4xl font-black tracking-tight">{quiz.title}</h1>
                        <p className="text-slate-400 font-medium max-w-xl">{quiz.description}</p>
                    </div>
                </div>
            </div>

            <div className="p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-slate-50 p-7 rounded-[2rem] border border-slate-100 flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600"><Clock size={20} /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Time Window</p>
                            <p className="font-bold text-xs text-slate-700 leading-relaxed">
                                {formatSafeDate(quiz.start_time || quiz.startTime)} <br />
                                <span className="text-blue-400">to</span> {formatSafeDate(quiz.end_time || quiz.endTime)}
                            </p>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-7 rounded-[2rem] border border-slate-100 flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600"><HelpCircle size={20} /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Marks</p>
                            <p className="font-black text-2xl text-[#0F172A]">{quiz.total_marks || quiz.totalMarks} <span className="text-xs text-slate-400 font-bold ml-1 uppercase">Marks</span></p>
                        </div>
                    </div>
                </div>

                {/* # NEW: SUBMISSIONS TABLE */}
                {showSubmissions && (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-6 animate-in slide-in-from-bottom-5 mb-10">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#0F172A] mb-6 px-4">Class Attempt History</h3>
                        <UserManagementTable data={submissions} loading={tableLoading} columnConfig={columnConfig} type="Submission" />
                    </div>
                )}

                {/* # PRESERVED: Original Questions List rendering */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-2">Questions List ({quiz.questions?.length || 0})</h3>
                    {quiz.questions?.map((q: any, index: number) => (
                        <div key={index} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Question {index + 1} ({q.question_type})</p>
                                    <p className="font-bold text-lg text-slate-800 leading-tight">{q.question_text}</p>
                                </div>
                                <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100">
                                    {q.question_type} • {q.marks} pts
                                </span>
                            </div>
                            {q.options && q.options.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {q.options.map((opt: any, i: number) => (
                                        <div key={i} className={`p-4 rounded-2xl border text-sm font-bold flex items-center gap-3 transition-all ${opt.is_correct ? 'bg-green-50/50 border-green-200 text-green-700 shadow-sm shadow-green-100' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                            <div className={`w-2 h-2 rounded-full ${opt.is_correct ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                                            {opt.option_text}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ATTEMPT REVIEW MODAL */}
            {selectedAttempt && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-md">
                    <div className="bg-white w-full max-w-5xl rounded-[3.5rem] overflow-hidden flex flex-col max-h-[92vh] border border-slate-800 shadow-2xl">
                        {/* Header strictly Dark Blue */}
                        <div className="bg-[#0F172A] p-10 text-white flex justify-between items-center border-b border-slate-700">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black tracking-tight">{selectedAttempt.studentName}</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Total Scored: {selectedAttempt.totalMarksObtained} pts</p>
                            </div>
                            <button onClick={() => setSelectedAttempt(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={28} /></button>
                        </div>

                        <div className="p-12 overflow-y-auto space-y-10 bg-white no-scrollbar">
                            {selectedAttempt.answers.map((ans: any, idx: number) => (
                                <div key={idx} className="p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100 space-y-8 relative overflow-hidden group">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">Question {idx + 1} ({ans.questionType})</p>
                                            <p className="font-bold text-[#0F172A] text-xl leading-tight">{ans.questionText}</p>
                                        </div>
                                        <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${ans.isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                            {ans.isCorrect ? 'Correct' : 'Incorrect'}
                                        </span>
                                    </div>

                                    {/* MCQ/BCQ Options Display */}
                                    {ans.allOptions.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {ans.allOptions.map((opt: any) => {
                                                const isSelected = ans.studentSelectedOptions.includes(opt.id);
                                                return (
                                                    <div key={opt.id} className={`p-5 rounded-[1.5rem] border-2 text-sm font-bold flex items-center gap-4 transition-all ${opt.isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' :
                                                            isSelected ? 'border-red-400 bg-red-50 text-red-700' : 'bg-white border-slate-100'
                                                        }`}>
                                                        <div className={`w-3 h-3 rounded-full ${opt.isCorrect ? 'bg-emerald-500' : isSelected ? 'bg-red-500' : 'bg-slate-200'}`}></div>
                                                        {opt.text}
                                                        {isSelected && <span className="ml-auto text-[8px] font-black uppercase bg-red-100 text-red-600 px-2 py-1 rounded-lg">Choice</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* SHORT ANSWER logic */}
                                    {ans.questionType === 'SHORT' && (
                                        <div className="p-6 bg-white rounded-[2rem] border-2 border-dashed border-blue-100">
                                            <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Student Response:</p>
                                            <p className="text-sm font-bold text-[#0F172A] leading-relaxed italic">"{ans.studentAnswerText || 'No response provided.'}"</p>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 text-[11px] font-black uppercase text-blue-600 bg-blue-50 py-3 px-6 rounded-2xl w-fit ml-auto shadow-sm">
                                        Weightage: {ans.marksObtained} / {ans.marksAllocated}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Grading Action Section */}
                        <div className="p-12 border-t bg-slate-50/50">
                            <div className="flex flex-col md:flex-row gap-8 items-end">
                                <div className="flex-1 space-y-3">
                                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Award Final Score</label>
                                    <input
                                        type="number"
                                        className="w-full p-6 bg-white border-2 border-slate-100 rounded-[1.5rem] font-black text-lg outline-none focus:border-blue-600 shadow-sm text-blue-600"
                                        value={gradeData.marks}
                                        placeholder={`${selectedAttempt.totalMarksObtained}`}
                                        onChange={(e) => setGradeData({ ...gradeData, marks: e.target.value })}
                                    />
                                </div>
                                <div className="flex-[2] space-y-3">
                                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Final Comments</label>
                                    <input
                                        type="text"
                                        className="w-full p-6 bg-white border-2 border-slate-100 rounded-[1.5rem] font-bold outline-none focus:border-blue-600 shadow-sm"
                                        value={gradeData.comments}
                                        placeholder="Add comment..."
                                        onChange={(e) => setGradeData({ ...gradeData, comments: e.target.value })}
                                    />
                                </div>
                                <button
                                    onClick={handleGradeSubmit}
                                    disabled={gradeLoading}
                                    className="h-[72px] px-16 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-blue-700 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                                >
                                    {gradeLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Complete Grading'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PRE-FILLED EDIT MODAL */}
            <GenericFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Assessment Structure"
                submitText="Update Quiz"
                fields={formFields}
                onSubmit={handleUpdateSubmit}
                loading={modalLoading}
                initialData={{
                    ...quiz,
                    start_time: (quiz?.start_time || quiz?.startTime) ? new Date(quiz?.start_time || quiz?.startTime).toISOString().slice(0, 16) : '',
                    end_time: (quiz?.end_time || quiz?.endTime) ? new Date(quiz?.end_time || quiz?.endTime).toISOString().slice(0, 16) : '',
                    total_marks: quiz?.total_marks || quiz?.totalMarks,
                    is_Published: String(quiz?.is_Published)
                }}
            />
        </div>
    );
};
export default QuizDetailPage;