'use client';

import React, { useState, useEffect, use } from 'react';
import {
    Calendar, ClipboardList, Download, FileText,
    CheckCircle2, Loader2, ArrowLeft, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import {
    getAssignmentDetailAPI,
    getAssignmentSubmissionsAPI,
    gradeSubmissionAPI
} from '@/lib/api/apiService';

// Aapka component call ho raha hai yahan
import UserManagementTable from '@/components/ui/UserManagementTable';

const AssignmentDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const assignmentId = resolvedParams.assignmentId || resolvedParams.id;
    const courseId = resolvedParams.courseId;

    const [assignment, setAssignment] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSubmissions, setShowSubmissions] = useState(false);

    // Grading Modal States
    const [selectedSub, setSelectedSub] = useState<any>(null);
    const [gradeData, setGradeData] = useState({ marksObtained: '', comments: '' });
    const [gradeLoading, setGradeLoading] = useState(false);

    useEffect(() => {
        const fetchAssignment = async () => {
            if (!assignmentId) return;
            setLoading(true);
            try {
                const data = await getAssignmentDetailAPI(assignmentId);
                setAssignment(data.data || data);
            } catch (err: any) {
                setError(err.message || "Assignment detail load nahi ho saki");
            } finally {
                setLoading(false);
            }
        };
        fetchAssignment();
    }, [assignmentId]);

    const handleViewSubmissions = async () => {
        setTableLoading(true);
        try {
            const res = await getAssignmentSubmissionsAPI(assignmentId);
            setSubmissions(res.data || []);
            setShowSubmissions(true);
        } catch (err) {
            alert("Submissions load nahi ho sakeen");
        } finally {
            setTableLoading(false);
        }
    };

    const handleGradeSubmit = async () => {
    if (!gradeData.marksObtained) return alert("Marks likhna zaroori hain");
    setGradeLoading(true);
    try {
        // 1. API Call
        const response = await gradeSubmissionAPI(assignmentId, selectedSub.studentId, {
            marksObtained: Number(gradeData.marksObtained),
            comments: gradeData.comments
        });

        // 2. Response extraction (Jo JSON aapne mujhe dikhaya)
        const updatedItem = response.data || response; 

        // 3. LOCAL STATE UPDATE: Bina fetch kiye table ko update karein
        // Hum purani list mein se us student ko dhoond kar uska data naye data se badal denge
        setSubmissions((prevSubmissions) => 
            prevSubmissions.map((sub) => 
                sub.studentId === updatedItem.studentId 
                ? { ...sub, marksObtained: updatedItem.marksObtained, comments: updatedItem.comments } 
                : sub
            )
        );

        alert("Grade kamyabi se update ho gaya!");
        setSelectedSub(null);

    } catch (err) { 
        alert("Grading failed"); 
    } finally { 
        setGradeLoading(false); 
    }
};

    // --- TABLE COLUMN CONFIGURATION ---
    const columnConfig = [
        {
            header: 'Student',
            key: 'firstName',
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
            header: 'Submitted Date',
            key: 'submittedAt',
            render: (item: any) => (
                <span className="text-xs font-bold text-slate-500">
                    {new Date(item.submittedAt).toLocaleString('en-GB')}
                </span>
            )
        },
        {
            header: 'Files',
            key: 'submissionFiles',
            align: 'center' as const,
            render: (item: any) => (
                <div className="flex justify-center gap-2">
                    {item.submissionFiles?.map((f: string, i: number) => (
                        <a key={i} href={f} target="_blank" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors border border-slate-100">
                            <Download size={14} />
                        </a>
                    ))}
                </div>
            )
        },
        {
            header: 'Obtained Marks',
            key: 'marksObtained',
            align: 'center' as const,
            render: (item: any) => {
                // 1. Backend key check (kabhi kabhi grade ya score hota hai)
                const score = item.marksObtained ?? item.grade ?? item.score;

                // 2. Total marks safe access
                const total = assignment?.totalMarks || 0;

                // 3. Condition handling (0 ko bhi valid score maanna hai)
                const isActuallyGraded = score !== null && score !== undefined && score !== "";

                return (
                    <span className={`text-xs font-black ${isActuallyGraded ? 'text-blue-600' : 'text-slate-300'}`}>
                        {isActuallyGraded ? `${score} / ${total}` : '-'}
                    </span>
                );
            }
        },
        {
            header: 'Action',
            key: 'action',
            align: 'right' as const,
            render: (item: any) => {
                const isGraded = item.marksObtained !== null && item.marksObtained !== undefined;
                return (
                    <button
                        onClick={() => {
                            setSelectedSub(item);
                            setGradeData({
                                marksObtained: item.marksObtained?.toString() || '',
                                comments: item.comments || ''
                            });
                        }}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${isGraded
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                            }`}
                    >
                        {isGraded ? 'Graded' : 'Grade'}
                    </button>
                );
            }
        }
    ];

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 text-[#0F172A]">

            <Link href={`/teacher/assigned-courses/${courseId}`} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all">
                <ArrowLeft size={16} /> Back to Course
            </Link>

            <div className="bg-[#0F172A] rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <span className="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">Assignment Details</span>
                    <h1 className="text-3xl md:text-5xl font-black mt-4 tracking-tight leading-tight">{assignment?.title}</h1>
                    <div className="flex flex-wrap gap-6 mt-8">
                        <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/10">
                            <Calendar size={20} className="text-blue-400" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Due Date</p>
                                <p className="text-sm font-bold">{assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/10">
                            <ClipboardList size={20} className="text-purple-400" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Max Marks</p>
                                <p className="text-sm font-bold">{assignment?.totalMarks || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-blue-600 mb-4">Objective</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">{assignment?.objective || 'No objective provided.'}</p>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-purple-600 mt-8 mb-4">Deliverable</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">{assignment?.deliverable || 'No deliverable details.'}</p>
                    </section>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm text-center">
                        <h4 className="font-black text-lg mb-2">Submissions</h4>
                        <p className="text-slate-400 text-xs font-medium mb-6">Review student work and grade them accordingly.</p>
                        <button
                            onClick={handleViewSubmissions}
                            className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                        >
                            View All Submissions
                        </button>
                    </div>
                </div>
            </div>

            {/* INTEGRATING YOUR USERMANAGEMENTTABLE */}
            {showSubmissions && (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-bottom-10 duration-700 p-2">
                    <div className="px-10 py-6 flex justify-between items-center border-b border-slate-50">
                        <h3 className="font-black uppercase tracking-widest text-xs">Student Work List</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black">{submissions.length} Total</span>
                    </div>
                    {/* Component Call */}
                    <UserManagementTable
                        data={submissions}
                        loading={tableLoading}
                        columnConfig={columnConfig}
                        type="Submission"
                    />
                </div>
            )}

            {/* Grading Modal */}
            {selectedSub && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-md">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black">Grade Submission</h3>
                                <p className="text-sm font-bold text-blue-600">{selectedSub.firstName} {selectedSub.lastName}</p>
                            </div>
                            <button onClick={() => setSelectedSub(null)} className="text-slate-300 hover:text-slate-600 transition-colors font-bold">Close</button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Marks Obtained (Max: {assignment?.totalMarks})</label>
                                <input type="number" value={gradeData.marksObtained} onChange={(e) => setGradeData({ ...gradeData, marksObtained: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-blue-50 font-bold text-sm text-slate-700" placeholder="e.g. 85" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Feedback Comments</label>
                                <textarea rows={4} value={gradeData.comments} onChange={(e) => setGradeData({ ...gradeData, comments: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-blue-50 font-bold text-sm text-slate-700" placeholder="Excellent work, keep it up!" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setSelectedSub(null)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                                <button onClick={handleGradeSubmit} disabled={gradeLoading} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50">
                                    {gradeLoading ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle2 size={18} /> Save Grade</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentDetailPage;