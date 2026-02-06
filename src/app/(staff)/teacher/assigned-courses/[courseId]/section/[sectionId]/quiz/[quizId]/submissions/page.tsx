'use client';
import React, { useState, useEffect, use } from 'react';
import { Loader2, ArrowLeft, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getQuizSubmissionsAPI } from '@/lib/api/apiService';
import UserManagementTable from '@/components/ui/UserManagementTable';

const QuizSubmissionsPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const quizId = Number(resolvedParams.quizId);
    const courseId = Number(resolvedParams.courseId);
    
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttempts = async () => {
            setLoading(true);
            try {
                const res = await getQuizSubmissionsAPI(quizId);
                setSubmissions(res.data || res || []);
            } catch (err) { console.error("Submissions load failed"); }
            finally { setLoading(false); }
        };
        fetchAttempts();
    }, [quizId]);

    const columnConfig = [
        {
            header: 'Student Profile', key: 'studentName',
            render: (item: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center font-black text-xs border border-accent-blue/20 uppercase">{item.studentName?.[0]}</div>
                    <p className="font-black text-sm text-text-main uppercase tracking-tight">{item.studentName}</p>
                </div>
            )
        },
        {
            header: 'Timestamp', key: 'submittedAt',
            render: (item: any) => <span className="text-[11px] font-black text-text-muted">{new Date(item.submittedAt).toLocaleString('en-GB')}</span>
        },
        {
            header: 'Score', key: 'totalMarks', align: 'center' as const,
            render: (item: any) => (
                <div className={`px-4 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${item.isGraded ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                    {item.isGraded ? `${item.totalMarks} Marks` : 'Pending Review'}
                </div>
            )
        },
        {
            header: 'Action', key: 'action', align: 'right' as const,
            render: (item: any) => (
                <Link 
                    href={`/teacher/assigned-courses/${courseId}/section/${resolvedParams.sectionId}/quiz/${quizId}/submissions/${item.id || item.attemptId}`}
                    className="px-6 py-2.5 bg-text-main text-card-bg rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                    {item.isGraded ? 'Review Grade' : 'Initialize Audit'}
                </Link>
            )
        }
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-app-bg min-h-screen">
            <Link href={`/teacher/assigned-courses/${courseId}/section/${resolvedParams.sectionId}/quiz/${quizId}`} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-black text-xs uppercase tracking-widest transition-all">
                <ArrowLeft size={16} /> Exit Registry
            </Link>

            <div className="hero-registry-card rounded-[2.5rem] p-8 shadow-xl border border-border-subtle">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-text-main flex items-center gap-4">
                    <UserCheck className="text-accent-blue" size={32} /> Submission Ledger
                </h1>
                <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-2">Manage and evaluate student performance registry.</p>
            </div>

            <div className="bg-card-bg rounded-[2.5rem] border border-border-subtle shadow-2xl p-4 overflow-hidden">
                <UserManagementTable data={submissions} loading={loading} columnConfig={columnConfig} type="Attempt" />
            </div>
        </div>
    );
};

export default QuizSubmissionsPage;