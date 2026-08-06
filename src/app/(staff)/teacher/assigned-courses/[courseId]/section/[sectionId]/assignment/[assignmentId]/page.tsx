// 'use client';

// import React, { useState, useEffect, use, useMemo } from 'react';
// import {
//     Calendar, ClipboardList, Download, CheckCircle2,
//     Loader2, ArrowLeft, AlertCircle, X
// } from 'lucide-react';
// import Link from 'next/link';
// import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

// // Redux Actions
// import { fetchCourseContent } from '@/lib/store/features/courseSlice';
// import { fetchSubmissions, submitGrade } from '@/lib/store/features/assignmentSlice';

// // UI Components
// import UserManagementTable from '@/components/ui/UserManagementTable';

// const AssignmentDetailPage = ({ params }: { params: Promise<any> }) => {
//     const resolvedParams = use(params);
//     const assignmentId = Number(resolvedParams.assignmentId || resolvedParams.id);
//     const courseId = Number(resolvedParams.courseId);

//     const dispatch = useAppDispatch();

//     // # 1. REDUX STATE ACCESS
//     const { courseContent, loading: reduxCourseLoading } = useAppSelector((state) => state.course);
//     const { submissionsCache, loading: reduxSubLoading } = useAppSelector((state) => state.assignment);

//     const fullData = courseContent[courseId];
//     const assignment = useMemo(() => {
//         if (!fullData?.sections) return null;
//         return fullData.sections
//             .flatMap((s: any) => s.assignments || [])
//             .find((a: any) => a.id === assignmentId);
//     }, [fullData, assignmentId]);

//     const submissions = submissionsCache[assignmentId] || [];
//     const isTableLoading = reduxSubLoading[assignmentId];

//     const [showSubmissions, setShowSubmissions] = useState(false);

//     const [selectedSub, setSelectedSub] = useState<any>(null);
//     const [gradeData, setGradeData] = useState({ marksObtained: '', comments: '' });
//     const [gradeLoading, setGradeLoading] = useState(false);

//     useEffect(() => {
//         if (!fullData && courseId) {
//             dispatch(fetchCourseContent(courseId));
//         }
//     }, [courseId, fullData, dispatch]);

//     const handleViewSubmissions = () => {
//         setShowSubmissions(!showSubmissions);
//         if (!submissionsCache[assignmentId]) {
//             dispatch(fetchSubmissions(assignmentId));
//         }
//     };

//     const handleGradeSubmit = async () => {
//         if (!gradeData.marksObtained) return;
//         setGradeLoading(true);
//         try {
//             await dispatch(submitGrade({
//                 assignmentId,
//                 studentId: selectedSub.studentId,
//                 gradeData: {
//                     marksObtained: Number(gradeData.marksObtained),
//                     comments: gradeData.comments
//                 }
//             })).unwrap();
//             setSelectedSub(null);
//         } catch (err) {
//             console.error("Grading failed");
//         } finally {
//             setGradeLoading(false);
//         }
//     };

//     // --- TABLE COLUMN CONFIGURATION ---
//     const columnConfig = [
//         {
//             header: 'Student', key: 'firstName',
//             render: (item: any) => (
//                 <div className="flex items-center gap-4">
//                     <div className="w-10 h-10 rounded-2xl bg-app-bg border border-border-subtle text-accent-blue flex items-center justify-center font-black text-xs shadow-sm uppercase">
//                         {item.firstName?.[0] || 'S'}
//                     </div>
//                     <div>
//                         <p className="font-black text-sm text-text-main uppercase tracking-tight">{item.firstName} {item.lastName}</p>
//                         <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{item.email}</p>
//                     </div>
//                 </div>
//             )
//         },
//         {
//             header: 'Submitted', key: 'submittedAt',
//             render: (item: any) => (
//                 <span className="text-xs font-black text-text-muted">
//                     {new Date(item.submittedAt).toLocaleString('en-GB')}
//                 </span>
//             )
//         },
//         {
//             header: 'Files', key: 'submissionFiles', align: 'center' as const,
//             render: (item: any) => (
//                 <div className="flex justify-center gap-2">
//                     {item.submissionFiles?.map((f: string, i: number) => (
//                         <a key={i} href={f} target="_blank" className="p-2.5 bg-app-bg rounded-xl text-text-muted hover:text-accent-blue border border-border-subtle transition-all shadow-sm">
//                             <Download size={14} />
//                         </a>
//                     ))}
//                 </div>
//             )
//         },
//         {
//             header: 'Marks', key: 'marksObtained', align: 'center' as const,
//             render: (item: any) => {
//                 const score = item.marksObtained ?? item.grade ?? item.score;
//                 const total = assignment?.totalMarks || 0;
//                 const isGraded = score !== null && score !== undefined && score !== "";
//                 return (
//                     <span className={`text-xs font-black ${isGraded ? 'text-accent-blue' : 'text-text-muted opacity-30'}`}>
//                         {isGraded ? `${score} / ${total}` : '-'}
//                     </span>
//                 );
//             }
//         },
//         {
//             header: 'Action', key: 'action', align: 'right' as const,
//             render: (item: any) => {
//                 const isGraded = item.marksObtained !== null && item.marksObtained !== undefined;
//                 return (
//                     <button
//                         onClick={() => {
//                             setSelectedSub(item);
//                             setGradeData({ marksObtained: item.marksObtained?.toString() || '', comments: item.comments || '' });
//                         }}
//                         className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${isGraded
//                                 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
//                                 : 'bg-accent-blue text-white'
//                             }`}
//                     >
//                         {isGraded ? 'Graded' : 'Mark Grade'}
//                     </button>
//                 );
//             }
//         }
//     ];

//     if (!assignment && reduxCourseLoading.courseContent[courseId]) return (
//         <div className="h-screen flex items-center justify-center bg-app-bg">
//             <Loader2 className="animate-spin text-accent-blue" size={48} />
//         </div>
//     );

//     if (!assignment) return (
//         <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-app-bg">
//             <AlertCircle className="text-red-500 mb-4" size={48} />
//             <h2 className="text-xl font-black text-text-main uppercase tracking-tight">Assignment Data Missing</h2>
//             <Link href={`/teacher/assigned-courses/${courseId}`} className="mt-4 text-accent-blue font-black uppercase text-xs underline decoration-accent-blue/30 underline-offset-8">Return to Dashboard</Link>
//         </div>
//     );

//     return (
//         <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in pb-20 bg-app-bg min-h-screen text-text-main">

//             <Link href={`/teacher/assigned-courses/${courseId}`} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-black text-xs uppercase tracking-widest transition-all">
//                 <ArrowLeft size={16} /> Back to Dashboard
//             </Link>

//             {/* Header Card: Now using hero-registry-card for Light Blue (Light) / Navy (Dark) */}
//             <div className="hero-registry-card rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
//                 <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
//                 <div className="relative z-10">
//                     <span className="px-4 py-1.5 bg-accent-blue/10 text-accent-blue rounded-full text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">Evaluation Registry</span>
//                     <h1 className="text-3xl md:text-5xl font-black mt-4 tracking-tighter uppercase leading-none">{assignment.title}</h1>
//                     <div className="flex flex-wrap gap-6 mt-8">
//                         <div className="flex items-center gap-3 bg-app-bg/40 backdrop-blur-sm px-5 py-3 rounded-2xl border border-border-subtle">
//                             <Calendar size={20} className="text-accent-blue" />
//                             <div><p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Target Date</p><p className="text-sm font-bold">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-GB') : 'N/A'}</p></div>
//                         </div>
//                         <div className="flex items-center gap-3 bg-app-bg/40 backdrop-blur-sm px-5 py-3 rounded-2xl border border-border-subtle">
//                             <ClipboardList size={20} className="text-purple-500" />
//                             <div><p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Weightage</p><p className="text-sm font-bold">{assignment.totalMarks || 0} pts</p></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                 <div className="lg:col-span-2 space-y-6">
//                     <section className="bg-card-bg rounded-[2rem] p-8 border border-border-subtle shadow-sm">
//                         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent-blue mb-4">Objective</h3>
//                         <p className="text-text-muted font-medium leading-relaxed">{assignment.objective || 'No objective data provided.'}</p>
//                         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-500 mt-8 mb-4">Requirements</h3>
//                         <p className="text-text-muted font-medium leading-relaxed">{assignment.deliverable || 'No deliverable data provided.'}</p>
//                     </section>
//                 </div>

//                 <div className="space-y-6">
//                     <div className="bg-card-bg rounded-[2rem] p-8 border border-border-subtle shadow-sm text-center">
//                         <h4 className="font-black text-lg mb-2 uppercase tracking-tighter text-text-main">Audit Control</h4>
//                         <p className="text-text-muted text-xs font-medium mb-6">Manage student work and grading history.</p>
//                         <button onClick={handleViewSubmissions} className="w-full py-4 bg-text-main text-card-bg rounded-2xl font-black text-xs uppercase shadow-xl hover:opacity-90 active:scale-95">
//                             {showSubmissions ? 'Re-Sync Intel' : 'Fetch Submissions'}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {showSubmissions && (
//                 <div className="bg-card-bg rounded-[2.5rem] border border-border-subtle shadow-2xl overflow-hidden p-4 animate-in slide-in-from-bottom-5">
//                     <div className="px-8 py-6 border-b border-border-subtle mb-4">
//                         <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-text-muted">Class Effort Log</h3>
//                     </div>
//                     <UserManagementTable data={submissions} loading={isTableLoading} columnConfig={columnConfig} type="Submission" />
//                 </div>
//             )}

//             {/* Grading Modal: Fully tokenize logic for Dark/Light transition */}
//             {selectedSub && (
//                 <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
//                     <div className="bg-card-bg w-full max-w-lg rounded-[3rem] shadow-2xl animate-in zoom-in-95 border border-border-subtle overflow-hidden">

//                         {/* Modal Header: Uses .form-modal-header for Light Blue/Pitch Black switch */}
//                         <div className="flex justify-between items-center px-10 py-8 form-modal-header transition-colors">
//                             <div className="space-y-1">
//                                 <h3 className="text-2xl font-black tracking-tight uppercase">Manual Audit</h3>
//                                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{selectedSub.firstName} {selectedSub.lastName}</p>
//                             </div>
//                             <button onClick={() => setSelectedSub(null)} className="p-3 hover:bg-white/10 dark:hover:bg-card-bg/20 rounded-2xl transition-all"><X size={22} /></button>
//                         </div>

//                         <div className="p-10 space-y-8">
//                             <div>
//                                 <label className="block text-[10px] font-black uppercase text-text-muted mb-3 ml-2 tracking-[0.2em]">Award Score (Max: {assignment.totalMarks})</label>
//                                 <input
//                                     type="number"
//                                     value={gradeData.marksObtained}
//                                     onChange={(e) => setGradeData({ ...gradeData, marksObtained: e.target.value })}
//                                     className="w-full p-5 bg-app-bg text-text-main rounded-2xl border border-border-subtle outline-none focus:border-accent-blue font-black transition-all shadow-inner"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-[10px] font-black uppercase text-text-muted mb-3 ml-2 tracking-[0.2em]">Feedback Intel</label>
//                                 <textarea
//                                     rows={4}
//                                     value={gradeData.comments}
//                                     onChange={(e) => setGradeData({ ...gradeData, comments: e.target.value })}
//                                     className="w-full p-5 bg-app-bg text-text-main rounded-2xl border border-border-subtle outline-none focus:border-accent-blue font-medium transition-all shadow-inner"
//                                     placeholder="Type assessment notes..."
//                                 />
//                             </div>
//                             <button
//                                 onClick={handleGradeSubmit}
//                                 disabled={gradeLoading}
//                                 className="w-full py-5 bg-accent-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-accent-blue/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
//                             >
//                                 {gradeLoading ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Deploy Grade</>}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AssignmentDetailPage;



'use client';
import React, { useState, useEffect, use, useMemo } from 'react';
import {
    Calendar, ClipboardList, Download, CheckCircle2,
    Loader2, ArrowLeft, AlertCircle, X, ChevronRight
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

    const fullData = courseContent[courseId];
    const assignment = useMemo(() => {
        if (!fullData?.sections) return null;
        return fullData.sections
            .flatMap((s: any) => s.assignments || [])
            .find((a: any) => a.id === assignmentId);
    }, [fullData, assignmentId]);

    const submissions = submissionsCache[assignmentId] || [];
    const isTableLoading = reduxSubLoading[assignmentId];

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

    // --- TABLE COLUMN CONFIGURATION ---
    const columnConfig = [
        {
            header: 'Student', key: 'firstName',
            render: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {item.firstName?.[0] || 'S'}
                    </div>
                    <div>
                        <p className="font-bold text-sm text-text-main capitalize">{item.firstName} {item.lastName}</p>
                        <p className="text-[10px] text-text-muted font-medium lowercase tracking-wide">{item.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Submitted', key: 'submittedAt',
            render: (item: any) => (
                <span className="text-xs font-bold text-text-muted">
                    {new Date(item.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
            )
        },
        {
            header: 'Files', key: 'submissionFiles', align: 'center' as const,
            render: (item: any) => (
                <div className="flex justify-center gap-2">
                    {item.submissionFiles?.map((f: string, i: number) => (
                        <a key={i} href={f} target="_blank" title="Download File" className="p-2 bg-app-bg rounded-lg text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 border border-border-subtle transition-colors">
                            <Download size={16} />
                        </a>
                    ))}
                </div>
            )
        },
        {
            header: 'Score', key: 'marksObtained', align: 'center' as const,
            render: (item: any) => {
                const score = item.marksObtained ?? item.grade ?? item.score;
                const total = assignment?.totalMarks || 0;
                const isGraded = score !== null && score !== undefined && score !== "";
                return (
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${isGraded ? 'bg-emerald-500/10 text-emerald-600' : 'bg-app-bg text-text-muted'}`}>
                        {isGraded ? `${score}/${total}` : 'Ungraded'}
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
                        className={`px-4 py-2 rounded-lg text-[11px] font-bold tracking-wide transition-colors ${
                            isGraded
                                ? 'bg-card-bg text-text-main border border-border-subtle hover:border-accent-blue'
                                : 'bg-accent-blue text-white hover:bg-accent-blue/90'
                        }`}
                    >
                        {isGraded ? 'Update Grade' : 'Grade Submission'}
                    </button>
                );
            }
        }
    ];

    // 👉 THE FIX: Agar fullData nahi hai toh bhi usay loading maano
    const isPageLoading = reduxCourseLoading.courseContent[courseId] || !fullData;

    if (isPageLoading) return (
        <div className="h-full min-h-[80vh] flex flex-col items-center justify-center bg-app-bg">
            <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
            <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading Assignment...</p>
        </div>
    );

    if (!assignment && !isPageLoading) return (
        <div className="h-full min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-app-bg">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-extrabold text-text-main tracking-tight mb-2">Assignment Not Found</h2>
            <p className="text-text-muted text-sm mb-6">The requested assignment data is missing or unavailable.</p>
            <Link href={`/teacher/assigned-courses/${courseId}`} className="text-accent-blue font-bold text-sm hover:underline">Return to Dashboard</Link>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-top-4 pb-20 bg-app-bg h-full text-text-main">

            <Link href={`/teacher/assigned-courses/${courseId}`} className="inline-flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold text-xs uppercase tracking-wider transition-colors mb-2">
                <ArrowLeft size={16} /> Back to Course
            </Link>

            {/* Header Card: Minimal and Clean */}
            <div className="bg-card-bg rounded-2xl p-6 md:p-10 shadow-sm border border-border-subtle relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Subtle background blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
                
                <div className="relative z-10 space-y-3">
                    <span className="inline-block px-2.5 py-1 bg-accent-blue/10 text-accent-blue rounded-md text-[10px] font-bold uppercase tracking-widest">
                        Assignment Details
                    </span>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-main leading-tight capitalize">
                        {assignment.title}
                    </h1>
                </div>

                <div className="relative z-10 flex flex-row md:flex-col gap-4">
                    <div className="flex items-center gap-3 bg-app-bg border border-border-subtle px-4 py-2.5 rounded-xl">
                        <Calendar size={18} className="text-accent-blue" />
                        <div>
                            <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Due Date</p>
                            <p className="text-sm font-bold text-text-main">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-app-bg border border-border-subtle px-4 py-2.5 rounded-xl">
                        <ClipboardList size={18} className="text-purple-500" />
                        <div>
                            <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Total Marks</p>
                            <p className="text-sm font-bold text-text-main">{assignment.totalMarks || 0} pts</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Content Section */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-card-bg rounded-2xl p-6 md:p-8 border border-border-subtle shadow-sm">
                        <div className="mb-8">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-blue"></span> Objective
                            </h3>
                            <p className="text-text-main text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                {assignment.objective || 'No objective provided.'}
                            </p>
                        </div>
                        
                        <div className="pt-6 border-t border-border-subtle">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Deliverables
                            </h3>
                            <p className="text-text-main text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                {assignment.deliverable || 'No requirements provided.'}
                            </p>
                        </div>
                    </section>
                </div>

                {/* Submissions Control Sidebar */}
                <div className="space-y-6">
                    <div className="bg-card-bg rounded-2xl p-6 border border-border-subtle shadow-sm sticky top-8">
                        <h4 className="font-extrabold text-lg mb-2 tracking-tight text-text-main">Submissions</h4>
                        <p className="text-text-muted text-xs font-medium mb-6 leading-relaxed">
                            Review and grade student assignments for this module.
                        </p>
                        <button 
                            onClick={handleViewSubmissions} 
                            className="w-full py-3 bg-text-main text-card-bg rounded-xl font-bold text-xs uppercase tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                            {showSubmissions ? 'Hide Submissions' : 'View Submissions'} <ChevronRight size={16} className={showSubmissions ? 'rotate-90 transition-transform' : 'transition-transform'}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Submissions Table Area */}
            {showSubmissions && (
                <div className="bg-card-bg rounded-2xl border border-border-subtle shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 mt-8">
                    <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-app-bg/50">
                        <h3 className="font-bold uppercase tracking-wider text-xs text-text-main">Student Submissions</h3>
                        <span className="text-xs font-bold text-text-muted px-2 py-1 bg-card-bg border border-border-subtle rounded-md">{submissions.length} Total</span>
                    </div>
                    <div className="p-2">
                        <UserManagementTable data={submissions} loading={isTableLoading} columnConfig={columnConfig} type="Submission" />
                    </div>
                </div>
            )}

            {/* Grading Modal - Clean & Minimal */}
            {selectedSub && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card-bg w-full max-w-md rounded-2xl shadow-xl animate-in zoom-in-95 border border-border-subtle overflow-hidden flex flex-col">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-5 border-b border-border-subtle bg-app-bg/50">
                            <div>
                                <h3 className="text-lg font-extrabold tracking-tight text-text-main">Grade Assignment</h3>
                                <p className="text-xs text-text-muted font-medium mt-0.5 capitalize">{selectedSub.firstName} {selectedSub.lastName}</p>
                            </div>
                            <button onClick={() => setSelectedSub(null)} className="p-2 text-text-muted hover:text-text-main hover:bg-card-bg rounded-lg transition-colors"><X size={20} /></button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-text-muted mb-2 tracking-wider">Score (Max: {assignment.totalMarks})</label>
                                <input
                                    type="number"
                                    value={gradeData.marksObtained}
                                    onChange={(e) => setGradeData({ ...gradeData, marksObtained: e.target.value })}
                                    className="w-full p-3.5 bg-app-bg text-text-main rounded-xl border border-border-subtle outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20 font-bold transition-all"
                                    placeholder="Enter marks"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-text-muted mb-2 tracking-wider">Feedback Comments</label>
                                <textarea
                                    rows={4}
                                    value={gradeData.comments}
                                    onChange={(e) => setGradeData({ ...gradeData, comments: e.target.value })}
                                    className="w-full p-3.5 bg-app-bg text-text-main rounded-xl border border-border-subtle outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20 font-medium transition-all resize-none"
                                    placeholder="Add feedback for the student..."
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 pt-0 mt-auto">
                            <button
                                onClick={handleGradeSubmit}
                                disabled={gradeLoading || !gradeData.marksObtained}
                                className="w-full py-3.5 bg-accent-blue text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 hover:bg-accent-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {gradeLoading ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle2 size={18} /> Submit Grade</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentDetailPage;