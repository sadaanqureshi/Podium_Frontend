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

const AdminAssignmentDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const courseId = Number(resolvedParams.id); 
    const assignmentId = Number(resolvedParams.assignmentId);

    const dispatch = useAppDispatch();

    const { courseContent, loading: reduxCourseLoading } = useAppSelector((state) => state.course);
    const { submissionsCache = {}, loading: reduxSubLoading = {} } = useAppSelector(
        (state) => state.assignment || {} 
    );
    
    const fullData = courseContent[courseId];
    const assignment = useMemo(() => {
        if (!fullData?.sections) return null;
        return fullData.sections
            .flatMap((s: any) => s.assignments || [])
            .find((a: any) => a.id === assignmentId);
    }, [fullData, assignmentId]);

    const submissions = submissionsCache[assignmentId] || [];
    const isTableLoading = reduxSubLoading[assignmentId] || false;

    const [showSubmissions, setShowSubmissions] = useState(false);
    const [selectedSub, setSelectedSub] = useState<any>(null);
    const [gradeData, setGradeData] = useState({ marksObtained: '', comments: '' });
    const [gradeLoading, setGradeLoading] = useState(false);

    useEffect(() => {
        if (!fullData && courseId) {
            dispatch(fetchCourseContent(courseId));
        }
    }, [courseId, fullData, dispatch]);

    const handleViewSubmissions = () => {
        setShowSubmissions(!showSubmissions);
        if (!submissionsCache[assignmentId]) {
            dispatch(fetchSubmissions(assignmentId));
        }
    };

    const handleGradeSubmit = async () => {
        if (!gradeData.marksObtained) return;
        setGradeLoading(true);
        try {
            await dispatch(submitGrade({
                assignmentId,
                studentId: selectedSub.studentId,
                gradeData: { 
                    marksObtained: Number(gradeData.marksObtained), 
                    comments: gradeData.comments 
                }
            })).unwrap();
            setSelectedSub(null);
        } catch (err) {
            console.error("Grading failed");
        } finally {
            setGradeLoading(false);
        }
    };

    // --- TABLE COLUMN CONFIGURATION (Themed) ---
    const columnConfig = [
        {
            header: 'Student', key: 'firstName',
            render: (item: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-app-bg border border-border-subtle text-accent-blue flex items-center justify-center font-black text-xs shadow-sm uppercase">
                        {item.firstName?.[0] || 'S'}
                    </div>
                    <div>
                        <p className="font-black text-sm text-text-main uppercase tracking-tight">{item.firstName} {item.lastName}</p>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{item.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Submitted', key: 'submittedAt',
            render: (item: any) => (
                <span className="text-xs font-black text-text-muted">
                    {item.submittedAt ? new Date(item.submittedAt).toLocaleString('en-GB') : 'N/A'}
                </span>
            )
        },
        {
            header: 'Attachment', key: 'submissionFiles', align: 'center' as const,
            render: (item: any) => (
                <div className="flex justify-center gap-2">
                    {item.submissionFiles?.map((f: string, i: number) => (
                        <a key={i} href={f} target="_blank" className="p-2.5 bg-app-bg rounded-xl text-text-muted hover:text-accent-blue border border-border-subtle transition-all shadow-sm">
                            <Download size={14} />
                        </a>
                    ))}
                </div>
            )
        },
        {
            header: 'Admin Score', key: 'marksObtained', align: 'center' as const,
            render: (item: any) => {
                const score = item.marksObtained ?? item.grade ?? item.score;
                const total = assignment?.totalMarks || 0;
                const isGraded = score !== null && score !== undefined && score !== "";
                return (
                    <span className={`text-xs font-black ${isGraded ? 'text-accent-blue' : 'text-text-muted opacity-30'}`}>
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
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                            isGraded 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-accent-blue text-white'
                        }`}
                    >
                        {isGraded ? 'Evaluated' : 'Mark Grade'}
                    </button>
                );
            }
        }
    ];

    if (!assignment && reduxCourseLoading.courseContent[courseId]) return <div className="h-screen flex items-center justify-center bg-app-bg"><Loader2 className="animate-spin text-accent-blue" size={48} /></div>;
    
    if (!assignment) return (
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-app-bg">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-black text-text-main uppercase tracking-tight">Assignment Metadata Missing</h2>
            <Link href={`/admin/courses/${courseId}`} className="mt-4 text-accent-blue font-black uppercase text-xs underline decoration-accent-blue/30 underline-offset-8">Return to Dashboard</Link>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 bg-app-bg min-h-screen text-text-main transition-colors duration-300">
            
            <Link href={`/admin/courses/${courseId}`} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-black text-xs uppercase tracking-widest transition-all">
                <ArrowLeft size={16} /> Course Terminal
            </Link>

            {/* Hero Header Card (Fixed Dark Gradient for Premium Feel) */}
            <div className="hero-registry-card rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <span className="px-4 py-1.5 bg-card-bg/10 text-accent-blue rounded-full text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">Assessment Intel</span>
                    <h1 className="text-3xl md:text-5xl font-black mt-4 tracking-tight leading-tight uppercase">{assignment.title}</h1>
                    <div className="flex flex-wrap gap-6 mt-8">
                        <div className="flex items-center gap-3 bg-card-bg/5 px-5 py-3 rounded-2xl border border-card-bg/10">
                            <Calendar size={20} className="text-accent-blue" />
                            <div><p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Target Date</p><p className="text-sm font-bold">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-GB') : 'N/A'}</p></div>
                        </div>
                        <div className="flex items-center gap-3 bg-card-bg/5 px-5 py-3 rounded-2xl border border-card-bg/10">
                            <ClipboardList size={20} className="text-purple-400" />
                            <div><p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Weightage</p><p className="text-sm font-bold">{assignment.totalMarks || 0} pts</p></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-card-bg rounded-[2rem] p-8 border border-border-subtle shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-accent-blue mb-4">Strategic Objective</h3>
                        <p className="text-text-muted font-medium leading-relaxed">{assignment.objective || 'No mission objective defined.'}</p>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-purple-500 mt-8 mb-4">Required Deliverable</h3>
                        <p className="text-text-muted font-medium leading-relaxed">{assignment.deliverable || 'No deliverable data available.'}</p>
                    </section>
                </div>

                <div className="space-y-6">
                    <div className="bg-card-bg rounded-[2rem] p-8 border border-border-subtle shadow-sm text-center transition-all">
                        <h4 className="font-black text-lg mb-2 uppercase tracking-tighter text-text-main">Audit Control</h4>
                        <p className="text-text-muted text-xs font-medium mb-6 underline decoration-accent-blue/10">Monitor and evaluate student submissions.</p>
                        <button 
                            onClick={handleViewSubmissions} 
                            className="w-full py-4 bg-text-main text-card-bg rounded-2xl font-black text-xs uppercase shadow-xl hover:opacity-90 transition-all active:scale-95"
                        >
                            {showSubmissions ? 'Re-Sync Intel' : 'Fetch Submissions'}
                        </button>
                    </div>
                </div>
            </div>

            {showSubmissions && (
                <div className="bg-card-bg rounded-[2.5rem] border border-border-subtle shadow-2xl overflow-hidden p-2 animate-in slide-in-from-bottom-5">
                    <div className="px-10 py-6 flex justify-between items-center border-b border-border-subtle">
                        <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-text-muted">Submission Log: {assignment.title}</h3>
                    </div>
                    <UserManagementTable data={submissions} loading={isTableLoading} columnConfig={columnConfig} type="Submission" />
                </div>
            )}

            {/* Grading Modal (Themed Overlay & Card) */}
            {selectedSub && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-card-bg w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 border border-border-subtle">
                        <div className="mb-8 flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black tracking-tight uppercase text-text-main">Grade Override</h3>
                                <p className="text-sm font-black text-accent-blue uppercase">{selectedSub.firstName} {selectedSub.lastName}</p>
                            </div>
                            <button onClick={() => setSelectedSub(null)} className="p-2 text-text-muted hover:bg-app-bg rounded-full transition-all"><X size={22} /></button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-text-muted mb-2 ml-1 tracking-widest">Award Points (Max: {assignment.totalMarks})</label>
                                <input 
                                    type="number" 
                                    value={gradeData.marksObtained} 
                                    onChange={(e) => setGradeData({ ...gradeData, marksObtained: e.target.value })} 
                                    className="w-full p-4 bg-app-bg text-text-main rounded-2xl border border-border-subtle outline-none focus:ring-4 focus:ring-accent-blue/10 font-black transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-text-muted mb-2 ml-1 tracking-widest">Feedback Intel</label>
                                <textarea 
                                    rows={4} 
                                    value={gradeData.comments} 
                                    onChange={(e) => setGradeData({ ...gradeData, comments: e.target.value })} 
                                    className="w-full p-4 bg-app-bg text-text-main rounded-2xl border border-border-subtle outline-none focus:ring-4 focus:ring-accent-blue/10 font-medium transition-all" 
                                    placeholder="Reviewer notes..." 
                                />
                            </div>
                            <button 
                                onClick={handleGradeSubmit} 
                                disabled={gradeLoading} 
                                className="w-full py-5 bg-accent-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-accent-blue/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {gradeLoading ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Deploy Grade</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAssignmentDetailPage;