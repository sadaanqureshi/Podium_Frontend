'use client';
import React, { useState, useEffect, use } from 'react';
import { Loader2, ArrowLeft, UserCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getQuizSubmissionsAPI } from '@/lib/api/apiService';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/api/errorMessage';
import UserManagementTable from '@/components/ui/UserManagementTable';

const QuizSubmissionsPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const quizId = Number(resolvedParams.quizId);
    const courseId = Number(resolvedParams.courseId);
    const { showToast } = useToast();

    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const fetchAttempts = async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const res = await getQuizSubmissionsAPI(quizId);
            setSubmissions(res.data || res || []);
        } catch (err) {
            const msg = getErrorMessage(err, 'Failed to load submissions');
            setLoadError(msg);
            showToast(msg, 'error');
            setSubmissions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttempts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizId]);

    const columnConfig = [
        {
            header: 'Student Profile',
            key: 'studentName',
            render: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-blue/10 text-accent-blue flex items-center justify-center font-bold text-xs border border-accent-blue/20 uppercase shrink-0">
                        {item.studentName?.[0] || 'S'}
                    </div>
                    <p className="font-bold text-sm text-text-main capitalize tracking-tight">
                        {item.studentName}
                    </p>
                </div>
            ),
        },
        {
            header: 'Timestamp',
            key: 'submittedAt',
            render: (item: any) => (
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
            ),
        },
        {
            header: 'Score',
            key: 'totalMarks',
            align: 'center' as const,
            render: (item: any) => (
                <div className="flex justify-center">
                    <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${
                            item.isGraded
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-amber-500/10 text-amber-600'
                        }`}
                    >
                        {item.isGraded
                            ? `${item.totalMarks ?? item.totalMarksObtained ?? 0} Marks`
                            : 'Pending Review'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Action',
            key: 'action',
            align: 'right' as const,
            render: (item: any) => (
                <Link
                    href={`/teacher/assigned-courses/${courseId}/section/${resolvedParams.sectionId}/quiz/${quizId}/submissions/${item.id || item.attemptId}`}
                    className={`inline-block px-4 py-2 rounded-lg text-[11px] font-bold tracking-wide transition-colors ${
                        item.isGraded
                            ? 'bg-card-bg text-text-main border border-border-subtle hover:border-accent-blue'
                            : 'bg-accent-blue text-white hover:bg-accent-blue/90'
                    }`}
                >
                    {item.isGraded ? 'Review Grade' : 'Grade Audit'}
                </Link>
            ),
        },
    ];

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 bg-app-bg min-h-screen text-text-main animate-in fade-in slide-in-from-top-4">
            <Link
                href={`/teacher/assigned-courses/${courseId}/section/${resolvedParams.sectionId}/quiz/${quizId}`}
                className="inline-flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold text-xs uppercase tracking-wider transition-colors mb-2"
            >
                <ArrowLeft size={16} /> Back to Quiz
            </Link>

            <div className="bg-card-bg rounded-2xl p-6 md:p-8 shadow-sm border border-border-subtle relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-app-bg rounded-xl flex items-center justify-center border border-border-subtle shrink-0 shadow-sm">
                        <UserCheck className="text-accent-blue" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-text-main capitalize">
                            Submissions
                        </h1>
                        <p className="text-text-muted text-xs font-medium mt-1">
                            Review and evaluate student quiz attempts.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 bg-app-bg border border-border-subtle px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-text-main uppercase tracking-wider">
                        {submissions.length} Total
                    </span>
                </div>
            </div>

            {loadError && !loading ? (
                <div className="bg-card-bg rounded-2xl border border-border-subtle p-10 text-center space-y-4">
                    <AlertCircle className="mx-auto text-red-500" size={32} />
                    <p className="text-sm font-bold text-text-main">{loadError}</p>
                    <button
                        type="button"
                        onClick={fetchAttempts}
                        className="px-5 py-2.5 rounded-xl bg-accent-blue text-white text-xs font-bold uppercase tracking-wider"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <div className="bg-card-bg rounded-2xl border border-border-subtle shadow-sm p-4 md:p-6 overflow-hidden">
                    <UserManagementTable
                        data={submissions}
                        loading={loading}
                        columnConfig={columnConfig}
                        type="Attempt"
                    />
                </div>
            )}
        </div>
    );
};

export default QuizSubmissionsPage;
