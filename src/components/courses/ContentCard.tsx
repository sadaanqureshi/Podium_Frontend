'use client';

import { Trash2, PlayCircle, FileText, BookOpen, Download, ArrowRight, Check, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ContentCardProps {
    id: number;
    title: string;
    subtitle?: string;
    type: 'quiz' | 'assignment' | 'resource' | 'lecture';
    role: 'admin' | 'teacher' | 'student';
    isCompleted?: boolean;
    /** Optional count badge (e.g. student submissions on assignments) */
    badgeCount?: number | null;
    badgeLabel?: string;
    onEdit?: () => void;
    onDelete?: () => void;
    sectionId?: number;
}

const iconMap = {
    quiz: <FileText size={16} className="text-amber-500" />,
    assignment: <BookOpen size={16} className="text-purple-500" />,
    resource: <Download size={16} className="text-accent-blue" />,
    lecture: <PlayCircle size={16} className="text-emerald-500" />,
};

const ContentCard = ({
    id,
    title,
    subtitle,
    type,
    role,
    isCompleted,
    badgeCount,
    badgeLabel = 'submissions',
    onEdit,
    onDelete,
    sectionId,
}: ContentCardProps) => {
    const params = useParams();
    const courseId = params.courseId || params.id || params.courseid;

    const basePath =
        role === 'student'
            ? '/student/enrolled-courses'
            : role === 'admin'
              ? '/admin/courses'
              : '/teacher/assigned-courses';

    const detailUrl = `${basePath}/${courseId}/section/${sectionId}/${type}/${id}`;
    const showBadge = typeof badgeCount === 'number' && badgeCount > 0;
    const isStaff = role === 'admin' || role === 'teacher';

    return (
        <div className="group flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl border border-transparent hover:border-border-subtle hover:bg-card-bg/80 transition-colors">
            <Link href={detailUrl} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-app-bg border border-border-subtle flex items-center justify-center shrink-0">
                    {iconMap[type]}
                </div>
                <div className="flex flex-col truncate min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <h4 className="font-bold text-[13px] text-text-main group-hover:text-accent-blue truncate transition-colors">
                            {title}
                        </h4>
                        {isCompleted && (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                <Check size={12} strokeWidth={3} /> Done
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-[10px] text-text-muted font-medium truncate mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
            </Link>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {showBadge && (
                    <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border tabular-nums bg-accent-blue/10 text-accent-blue border-accent-blue/25"
                        title={`${badgeCount} ${badgeLabel}`}
                    >
                        {badgeCount}
                        <span className="hidden sm:inline">{badgeLabel}</span>
                    </span>
                )}

                {isStaff && (
                    <>
                        {onEdit && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                title="Edit"
                                className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider text-text-muted border border-border-subtle bg-app-bg hover:text-text-main hover:border-accent-blue/40 transition-colors"
                            >
                                <Pencil size={13} />
                                <span className="hidden sm:inline">Edit</span>
                            </button>
                        )}
                        {onDelete && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                title="Delete"
                                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-text-muted border border-border-subtle bg-app-bg hover:text-rose-500 hover:border-rose-500/35 hover:bg-rose-500/10 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </>
                )}

                <Link
                    href={detailUrl}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest bg-accent-blue text-white hover:bg-hover-blue transition-colors"
                >
                    {showBadge && (
                        <span className="sm:hidden min-w-[1.1rem] h-4 px-1 rounded bg-white/20 text-[9px] tabular-nums flex items-center justify-center">
                            {badgeCount}
                        </span>
                    )}
                    <span>{role === 'student' ? 'Access' : 'View'}</span>
                    <ArrowRight size={13} />
                </Link>
            </div>
        </div>
    );
};

export default ContentCard;
