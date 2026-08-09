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

// const AdminAssignmentDetailPage = ({ params }: { params: Promise<any> }) => {
//     const resolvedParams = use(params);
//     const courseId = Number(resolvedParams.id);
//     const assignmentId = Number(resolvedParams.assignmentId);

//     const dispatch = useAppDispatch();

//     const { courseContent, loading: reduxCourseLoading } = useAppSelector((state) => state.course);
//     const { submissionsCache = {}, loading: reduxSubLoading = {} } = useAppSelector(
//         (state) => state.assignment || {}
//     );

//     const fullData = courseContent[courseId];
//     const assignment = useMemo(() => {
//         if (!fullData?.sections) return null;
//         return fullData.sections
//             .flatMap((s: any) => s.assignments || [])
//             .find((a: any) => a.id === assignmentId);
//     }, [fullData, assignmentId]);

//     const submissions = submissionsCache[assignmentId] || [];
//     const isTableLoading = reduxSubLoading[assignmentId] || false;

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

//     // --- TABLE COLUMN CONFIGURATION (Themed) ---
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
//                     {item.submittedAt ? new Date(item.submittedAt).toLocaleString('en-GB') : 'N/A'}
//                 </span>
//             )
//         },
//         {
//             header: 'Attachment', key: 'submissionFiles', align: 'center' as const,
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
//             header: 'Admin Score', key: 'marksObtained', align: 'center' as const,
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
//                         {isGraded ? 'Evaluated' : 'Mark Grade'}
//                     </button>
//                 );
//             }
//         }
//     ];

//     if (!assignment && reduxCourseLoading.courseContent[courseId]) return <div className="h-screen flex items-center justify-center bg-app-bg"><Loader2 className="animate-spin text-accent-blue" size={48} /></div>;

//     if (!assignment) return (
//         <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-app-bg">
//             <AlertCircle className="text-red-500 mb-4" size={48} />
//             <h2 className="text-xl font-black text-text-main uppercase tracking-tight">Assignment Metadata Missing</h2>
//             <Link href={`/admin/courses/${courseId}`} className="mt-4 text-accent-blue font-black uppercase text-xs underline decoration-accent-blue/30 underline-offset-8">Return to Dashboard</Link>
//         </div>
//     );

//     return (
//         <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in pb-20 bg-app-bg min-h-screen text-text-main">

//             <Link href={`/admin/courses/${courseId}`} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-black text-xs uppercase tracking-widest transition-all">
//                 <ArrowLeft size={16} /> Course Terminal
//             </Link>

//             {/* Hero Header Card (Fixed Dark Gradient for Premium Feel) */}
//             <div className="hero-registry-card rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
//                 <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
//                 <div className="relative z-10">
//                     <span className="px-4 py-1.5 bg-card-bg/10 text-accent-blue rounded-full text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">Assessment Intel</span>
//                     <h1 className="text-3xl md:text-5xl font-black mt-4 tracking-tight leading-tight uppercase">{assignment.title}</h1>
//                     <div className="flex flex-wrap gap-6 mt-8">
//                         <div className="flex items-center gap-3 bg-card-bg/5 px-5 py-3 rounded-2xl border border-card-bg/10">
//                             <Calendar size={20} className="text-accent-blue" />
//                             <div><p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Target Date</p><p className="text-sm font-bold">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-GB') : 'N/A'}</p></div>
//                         </div>
//                         <div className="flex items-center gap-3 bg-card-bg/5 px-5 py-3 rounded-2xl border border-card-bg/10">
//                             <ClipboardList size={20} className="text-purple-400" />
//                             <div><p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Weightage</p><p className="text-sm font-bold">{assignment.totalMarks || 0} pts</p></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                 <div className="lg:col-span-2 space-y-6">
//                     <section className="bg-card-bg rounded-[2rem] p-8 border border-border-subtle shadow-sm">
//                         <h3 className="text-sm font-black uppercase tracking-[0.2em] text-accent-blue mb-4">Strategic Objective</h3>
//                         <p className="text-text-muted font-medium leading-relaxed">{assignment.objective || 'No mission objective defined.'}</p>
//                         <h3 className="text-sm font-black uppercase tracking-[0.2em] text-purple-500 mt-8 mb-4">Required Deliverable</h3>
//                         <p className="text-text-muted font-medium leading-relaxed">{assignment.deliverable || 'No deliverable data available.'}</p>
//                     </section>
//                 </div>

//                 <div className="space-y-6">
//                     <div className="bg-card-bg rounded-[2rem] p-8 border border-border-subtle shadow-sm text-center">
//                         <h4 className="font-black text-lg mb-2 uppercase tracking-tighter text-text-main">Audit Control</h4>
//                         <p className="text-text-muted text-xs font-medium mb-6 underline decoration-accent-blue/10">Monitor and evaluate student submissions.</p>
//                         <button
//                             onClick={handleViewSubmissions}
//                             className="w-full py-4 bg-text-main text-card-bg rounded-2xl font-black text-xs uppercase shadow-xl hover:opacity-90 active:scale-95"
//                         >
//                             {showSubmissions ? 'Re-Sync Intel' : 'Fetch Submissions'}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {showSubmissions && (
//                 <div className="bg-card-bg rounded-[2.5rem] border border-border-subtle shadow-2xl overflow-hidden p-2 animate-in slide-in-from-bottom-5">
//                     <div className="px-10 py-6 flex justify-between items-center border-b border-border-subtle">
//                         <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-text-muted">Submission Log: {assignment.title}</h3>
//                     </div>
//                     <UserManagementTable data={submissions} loading={isTableLoading} columnConfig={columnConfig} type="Submission" />
//                 </div>
//             )}

//             {/* Grading Modal (Themed Overlay & Card) */}
//             {selectedSub && (
//                 <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
//                     <div className="bg-card-bg w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 border border-border-subtle">
//                         <div className="mb-8 flex justify-between items-start">
//                             <div className="space-y-1">
//                                 <h3 className="text-2xl font-black tracking-tight uppercase text-text-main">Grade Override</h3>
//                                 <p className="text-sm font-black text-accent-blue uppercase">{selectedSub.firstName} {selectedSub.lastName}</p>
//                             </div>
//                             <button onClick={() => setSelectedSub(null)} className="p-2 text-text-muted hover:bg-app-bg rounded-full transition-all"><X size={22} /></button>
//                         </div>
//                         <div className="space-y-6">
//                             <div>
//                                 <label className="block text-[10px] font-black uppercase text-text-muted mb-2 ml-1 tracking-widest">Award Points (Max: {assignment.totalMarks})</label>
//                                 <input
//                                     type="number"
//                                     value={gradeData.marksObtained}
//                                     onChange={(e) => setGradeData({ ...gradeData, marksObtained: e.target.value })}
//                                     className="w-full p-4 bg-app-bg text-text-main rounded-2xl border border-border-subtle outline-none focus:ring-4 focus:ring-accent-blue/10 font-black transition-all"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-[10px] font-black uppercase text-text-muted mb-2 ml-1 tracking-widest">Feedback Intel</label>
//                                 <textarea
//                                     rows={4}
//                                     value={gradeData.comments}
//                                     onChange={(e) => setGradeData({ ...gradeData, comments: e.target.value })}
//                                     className="w-full p-4 bg-app-bg text-text-main rounded-2xl border border-border-subtle outline-none focus:ring-4 focus:ring-accent-blue/10 font-medium transition-all"
//                                     placeholder="Reviewer notes..."
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

// export default AdminAssignmentDetailPage;
'use client';
import React, { useState, useEffect, use, useMemo } from 'react';
import {
    Calendar, ClipboardList, Download, CheckCircle2,
    Loader2, ArrowLeft, AlertCircle, X, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
    formatSubmissionScore,
    formatSubmissionStatus,
    getSubmissionMarks,
    hasSubmissionStatus,
    isSubmissionGraded,
    isSubmissionLate,
} from '@/lib/assignmentSubmissions';

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

    const submissions = useMemo(
        () => (submissionsCache[assignmentId] || []).filter(hasSubmissionStatus),
        [submissionsCache, assignmentId]
    );
    const isTableLoading = reduxSubLoading[assignmentId] || false;

    const [showSubmissions, setShowSubmissions] = useState(false);
    const [selectedSub, setSelectedSub] = useState<any>(null);
    const [gradeData, setGradeData] = useState({ marksObtained: '', comments: '' });
    const [gradeLoading, setGradeLoading] = useState(false);
    const [marksError, setMarksError] = useState<string | null>(null);

    const totalMarks = Number(assignment?.totalMarks ?? assignment?.total_marks ?? 0);
    const dueDate = assignment?.dueDate ?? assignment?.due_date ?? null;

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

    const validateMarks = (raw: string): string | null => {
        if (raw === '' || raw == null) return 'Enter marks obtained.';
        const value = Number(raw);
        if (Number.isNaN(value)) return 'Enter a valid number.';
        if (value < 0) return 'Marks cannot be negative.';
        if (totalMarks > 0 && value > totalMarks) {
            return `Marks cannot exceed total marks (${totalMarks}).`;
        }
        return null;
    };

    const handleMarksChange = (raw: string) => {
        setGradeData((prev) => ({ ...prev, marksObtained: raw }));
        setMarksError(validateMarks(raw));
    };

    const handleGradeSubmit = async () => {
        const error = validateMarks(gradeData.marksObtained);
        if (error) {
            setMarksError(error);
            return;
        }
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
            setMarksError(null);
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
            render: (item: any) => {
                const late = isSubmissionLate(item.submittedAt, dueDate);
                return (
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-text-muted">
                            {item.submittedAt
                                ? new Date(item.submittedAt).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  })
                                : '—'}
                        </span>
                        {late && (
                            <span className="inline-flex w-fit px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border bg-rose-500/10 text-rose-500 border-rose-500/25">
                                Late
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Status', key: 'status', align: 'center' as const,
            render: (item: any) => {
                const status = formatSubmissionStatus(item);
                const graded = isSubmissionGraded(item);
                const late = isSubmissionLate(item.submittedAt, dueDate);
                const className = graded
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                    : late
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/25'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/25';
                return (
                    <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${className}`}
                    >
                        {status}
                    </span>
                );
            }
        },
        {
            header: 'Attachment', key: 'submissionFiles', align: 'center' as const,
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
                const graded = isSubmissionGraded(item);
                const label = formatSubmissionScore(item, totalMarks);
                return (
                    <span
                        className={`text-xs font-bold px-2 py-1 rounded-md ${
                            graded
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-app-bg text-text-muted'
                        }`}
                    >
                        {label}
                    </span>
                );
            }
        },
        {
            header: 'Action', key: 'action', align: 'right' as const,
            render: (item: any) => {
                const graded = isSubmissionGraded(item);
                const marks = getSubmissionMarks(item);
                return (
                    <button
                        onClick={() => {
                            setSelectedSub(item);
                            const initialMarks = marks != null ? String(marks) : '';
                            setGradeData({
                                marksObtained: initialMarks,
                                comments: item.comments || '',
                            });
                            setMarksError(initialMarks ? validateMarks(initialMarks) : null);
                        }}
                        className={`px-4 py-2 rounded-lg text-[11px] font-bold tracking-wide transition-colors ${
                            graded
                                ? 'bg-card-bg text-text-main border border-border-subtle hover:border-accent-blue'
                                : 'bg-accent-blue text-white hover:bg-accent-blue/90'
                        }`}
                    >
                        {graded ? 'Update Grade' : 'Mark Grade'}
                    </button>
                );
            }
        }
    ];

    if (!assignment && reduxCourseLoading.courseContent[courseId]) return (
        <div className="h-full min-h-[80vh] flex flex-col items-center justify-center bg-app-bg">
            <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
            <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading Assignment...</p>
        </div>
    );

    if (!assignment) return (
        <div className="h-full min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-app-bg">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-extrabold text-text-main tracking-tight mb-2">Assignment Metadata Missing</h2>
            <p className="text-text-muted text-sm mb-6">The requested assignment data is missing or unavailable.</p>
            <Link href={`/admin/courses/${courseId}`} className="text-accent-blue font-bold text-sm hover:underline">Return to Dashboard</Link>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-top-4 pb-20 bg-app-bg h-full text-text-main">

            <Link href={`/admin/courses/${courseId}`} className="inline-flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold text-xs uppercase tracking-wider transition-colors mb-2">
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
                        {assignment?.title || 'Unknown Assignment'}
                    </h1>
                </div>

                <div className="relative z-10 flex flex-row md:flex-col gap-4">
                    <div className="flex items-center gap-3 bg-app-bg border border-border-subtle px-4 py-2.5 rounded-xl">
                        <Calendar size={18} className="text-accent-blue" />
                        <div>
                            <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Target Date</p>
                            <p className="text-sm font-bold text-text-main">{assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-app-bg border border-border-subtle px-4 py-2.5 rounded-xl">
                        <ClipboardList size={18} className="text-purple-500" />
                        <div>
                            <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Weightage</p>
                            <p className="text-sm font-bold text-text-main">{assignment?.totalMarks || 0} pts</p>
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
                                {assignment?.objective || 'No mission objective defined.'}
                            </p>
                        </div>
                        
                        <div className="pt-6 border-t border-border-subtle">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Deliverables
                            </h3>
                            <p className="text-text-main text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                {assignment?.deliverable || 'No deliverable data available.'}
                            </p>
                        </div>
                    </section>
                </div>

                {/* Submissions Control Sidebar */}
                <div className="space-y-6">
                    <div className="bg-card-bg rounded-2xl p-6 border border-border-subtle shadow-sm sticky top-8">
                        <h4 className="font-extrabold text-lg mb-2 tracking-tight text-text-main">Submissions</h4>
                        <p className="text-text-muted text-xs font-medium mb-6 leading-relaxed">
                            Monitor and evaluate student submissions.
                        </p>
                        <button 
                            onClick={handleViewSubmissions} 
                            className="w-full py-3 bg-text-main text-card-bg rounded-xl font-bold text-xs uppercase tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                            {showSubmissions ? 'Hide Submissions' : 'Fetch Submissions'} <ChevronRight size={16} className={showSubmissions ? 'rotate-90 transition-transform' : 'transition-transform'}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Submissions Table Area */}
            {showSubmissions && (
                <div className="bg-card-bg rounded-2xl border border-border-subtle shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 mt-8">
                    <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-app-bg/50">
                        <h3 className="font-bold uppercase tracking-wider text-xs text-text-main">Submission Log: {assignment?.title}</h3>
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
                                <h3 className="text-lg font-extrabold tracking-tight text-text-main">Add Grade</h3>
                                <p className="text-xs text-text-muted font-medium mt-0.5 capitalize">{selectedSub.firstName} {selectedSub.lastName}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedSub(null);
                                    setMarksError(null);
                                }}
                                className="p-2 text-text-muted hover:text-text-main hover:bg-card-bg rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-text-muted mb-2 tracking-wider">
                                    Marks Obtained (Max: {totalMarks || assignment?.totalMarks || 0})
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={totalMarks || undefined}
                                    step="any"
                                    value={gradeData.marksObtained}
                                    onChange={(e) => handleMarksChange(e.target.value)}
                                    className={`w-full p-3.5 bg-app-bg text-text-main rounded-xl border outline-none focus:ring-1 font-bold transition-all ${
                                        marksError
                                            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                                            : 'border-border-subtle focus:border-accent-blue focus:ring-accent-blue/20'
                                    }`}
                                    placeholder="Enter marks"
                                />
                                {marksError ? (
                                    <p className="mt-2 text-[11px] font-bold text-rose-500">{marksError}</p>
                                ) : (
                                    <p className="mt-2 text-[11px] font-medium text-text-muted">
                                        Marks must be between 0 and {totalMarks || assignment?.totalMarks || 0}.
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-text-muted mb-2 tracking-wider">Feedback</label>
                                <textarea
                                    rows={4}
                                    value={gradeData.comments}
                                    onChange={(e) => setGradeData({ ...gradeData, comments: e.target.value })}
                                    className="w-full p-3.5 bg-app-bg text-text-main rounded-xl border border-border-subtle outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20 font-medium transition-all resize-none"
                                    placeholder="Reviewer notes..."
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 pt-0 mt-auto">
                            <button
                                onClick={handleGradeSubmit}
                                disabled={
                                    gradeLoading ||
                                    !gradeData.marksObtained ||
                                    !!marksError
                                }
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

export default AdminAssignmentDetailPage;