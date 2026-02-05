'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import {
    Calendar, ClipboardList, Download, CheckCircle2, 
    Loader2, ArrowLeft, AlertCircle, X
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

// Redux Actions
import { fetchCourseContent } from '@/lib/store/features/courseSlice';
import { fetchSubmissions, submitGrade } from '@/lib/store/features/assignmentSlice';

// UI Components
import UserManagementTable from '@/components/ui/UserManagementTable';

const AssignmentDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const assignmentId = Number(resolvedParams.assignmentId || resolvedParams.id);
    const courseId = Number(resolvedParams.courseId);

    const dispatch = useAppDispatch();

    // # 1. REDUX STATE ACCESS
    const { courseContent, loading: reduxCourseLoading } = useAppSelector((state) => state.course);
    const { submissionsCache, loading: reduxSubLoading } = useAppSelector((state) => state.assignment);
    
    // Assignment Metadata from Course Cache
    const fullData = courseContent[courseId];
    const assignment = useMemo(() => {
        if (!fullData?.sections) return null;
        return fullData.sections
            .flatMap((s: any) => s.assignments || [])
            .find((a: any) => a.id === assignmentId);
    }, [fullData, assignmentId]);

    // Submissions from Assignment Cache
    const submissions = submissionsCache[assignmentId] || [];
    const isTableLoading = reduxSubLoading[assignmentId];

    const [showSubmissions, setShowSubmissions] = useState(false);
    
    // Grading Modal States
    const [selectedSub, setSelectedSub] = useState<any>(null);
    const [gradeData, setGradeData] = useState({ marksObtained: '', comments: '' });
    const [gradeLoading, setGradeLoading] = useState(false);

    // # 2. HYDRATION: Cache sync for reload/direct access
    useEffect(() => {
        if (!fullData && courseId) {
            dispatch(fetchCourseContent(courseId));
        }
    }, [courseId, fullData, dispatch]);

    const handleViewSubmissions = () => {
        setShowSubmissions(!showSubmissions);
        // Only fetch if not already in cache
        if (!submissionsCache[assignmentId]) {
            dispatch(fetchSubmissions(assignmentId));
        }
    };

    const handleGradeSubmit = async () => {
        if (!gradeData.marksObtained) return console.log("ALERT: Marks are mandatory");
        setGradeLoading(true);
        try {
            // # 3. DISPATCH REDUX THUNK: Redux will auto-update the table list
            await dispatch(submitGrade({
                assignmentId,
                studentId: selectedSub.studentId,
                gradeData: { 
                    marksObtained: Number(gradeData.marksObtained), 
                    comments: gradeData.comments 
                }
            })).unwrap();

            console.log("ALERT: Grade successfully updated in Redux!");
            setSelectedSub(null);
        } catch (err) {
            console.log("ALERT: Grading failed - " + err);
        } finally {
            setGradeLoading(false);
        }
    };

    // --- TABLE COLUMN CONFIGURATION ---
    const columnConfig = [
        {
            header: 'Student', key: 'firstName',
            render: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-[10px] uppercase">
                        {item.firstName?.[0] || 'S'}
                    </div>
                    <div>
                        <p className="font-bold text-sm text-[#0F172A]">{item.firstName} {item.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{item.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Submitted', key: 'submittedAt',
            render: (item: any) => (
                <span className="text-xs font-bold text-slate-500">
                    {new Date(item.submittedAt).toLocaleString('en-GB')}
                </span>
            )
        },
        {
            header: 'Files', key: 'submissionFiles', align: 'center' as const,
            render: (item: any) => (
                <div className="flex justify-center gap-2">
                    {item.submissionFiles?.map((f: string, i: number) => (
                        <a key={i} href={f} target="_blank" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 border border-slate-100">
                            <Download size={14} />
                        </a>
                    ))}
                </div>
            )
        },
        {
            header: 'Obtained Marks', key: 'marksObtained', align: 'center' as const,
            render: (item: any) => {
                const score = item.marksObtained ?? item.grade ?? item.score;
                const total = assignment?.totalMarks || 0;
                const isGraded = score !== null && score !== undefined && score !== "";
                return (
                    <span className={`text-xs font-black ${isGraded ? 'text-blue-600' : 'text-slate-300'}`}>
                        {isGraded ? `${score} / ${total}` : '-'}
                    </span>
                );
            }
        },
        {
            header: 'Action', key: 'action', align: 'right' as const,
            render: (item: any) => {
                const isGraded = item.marksObtained !== null && item.marksObtained !== undefined;
                return (
                    <button
                        onClick={() => {
                            setSelectedSub(item);
                            setGradeData({ marksObtained: item.marksObtained?.toString() || '', comments: item.comments || '' });
                        }}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all ${isGraded ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-blue-600 text-white shadow-blue-100'}`}
                    >
                        {isGraded ? 'Graded' : 'Grade'}
                    </button>
                );
            }
        }
    ];

    if (!assignment && reduxCourseLoading.courseContent[courseId]) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
    
    if (!assignment) return (
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-black text-[#0F172A]">Assignment Missing</h2>
            <Link href={`/teacher/assigned-courses/${courseId}`} className="mt-4 text-blue-600 font-bold underline">Back to Course</Link>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 text-[#0F172A] font-sans">
            <Link href={`/teacher/assigned-courses/${courseId}`} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            {/* Header Card */}
            <div className="bg-[#0F172A] rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <span className="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">Review Material</span>
                    <h1 className="text-3xl md:text-5xl font-black mt-4 tracking-tight leading-tight uppercase">{assignment.title}</h1>
                    <div className="flex flex-wrap gap-6 mt-8">
                        <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/10">
                            <Calendar size={20} className="text-blue-400" />
                            <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Submission Deadline</p><p className="text-sm font-bold">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-GB') : 'N/A'}</p></div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/10">
                            <ClipboardList size={20} className="text-purple-400" />
                            <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Max Score</p><p className="text-sm font-bold">{assignment.totalMarks || 0} pts</p></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-blue-600 mb-4">Objective</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">{assignment.objective || 'Objective not specified.'}</p>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-purple-600 mt-8 mb-4">Deliverable</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">{assignment.deliverable || 'No deliverable details provided.'}</p>
                    </section>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm text-center">
                        <h4 className="font-black text-lg mb-2 uppercase tracking-tighter">Student Work</h4>
                        <p className="text-slate-400 text-xs font-medium mb-6 italic">Manage all received submissions and grade them.</p>
                        <button onClick={handleViewSubmissions} className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-black transition-all active:scale-95">
                            {showSubmissions ? 'Refresh & Sync List' : 'Access Submissions'}
                        </button>
                    </div>
                </div>
            </div>

            {showSubmissions && (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-2 animate-in slide-in-from-bottom-5">
                    <div className="px-10 py-6 flex justify-between items-center border-b border-slate-50">
                        <h3 className="font-black uppercase tracking-widest text-xs text-[#0F172A]">Class Effort History</h3>
                    </div>
                    <UserManagementTable data={submissions} loading={isTableLoading} columnConfig={columnConfig} type="Submission" />
                </div>
            )}

            {/* Grading Modal */}
            {selectedSub && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-md">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
                        <div className="mb-8 flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black tracking-tight uppercase">Award Score</h3>
                                <p className="text-sm font-bold text-blue-600">{selectedSub.firstName} {selectedSub.lastName}</p>
                            </div>
                            <button onClick={() => setSelectedSub(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X size={20} /></button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Score (Max: {assignment.totalMarks})</label>
                                <input type="number" value={gradeData.marksObtained} onChange={(e) => setGradeData({ ...gradeData, marksObtained: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-blue-50 font-black text-slate-700" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Feedback Comment</label>
                                <textarea rows={4} value={gradeData.comments} onChange={(e) => setGradeData({ ...gradeData, comments: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-blue-50 font-medium text-slate-700" placeholder="Type feedback..." />
                            </div>
                            <button onClick={handleGradeSubmit} disabled={gradeLoading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50">
                                {gradeLoading ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Complete Grading</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentDetailPage;