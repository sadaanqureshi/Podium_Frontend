'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Award } from 'lucide-react';

const teacherAssignmentLabel = (status: string | undefined) => {
    const s = (status || '').toLowerCase();
    if (s === 'accepted') return { text: 'Teacher accepted', className: 'text-emerald-500' };
    if (s === 'pending') return { text: 'Awaiting teacher response', className: 'text-amber-500' };
    if (s === 'rejected') return { text: 'Teacher declined', className: 'text-rose-500' };
    return null;
};

export const CourseInfoCard = ({
    data,
    marksheetHref,
}: {
    data: any;
    /** Student marksheet entry — e.g. /student/courses/:id/marksheet */
    marksheetHref?: string | null;
}) => {
    const instructor = data?.teacher
        ? `${data.teacher.firstName} ${data.teacher.lastName}`
        : 'Unassigned';
    const assignment = teacherAssignmentLabel(data?.teacherStatus);
    const rating = data?.averageRating ?? data?.avgRating;
    const hasRating = rating != null && rating !== '';

    return (
        <div className="bg-card-bg rounded-2xl border border-border-subtle shadow-sm p-4 md:p-8 mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-stretch gap-5 md:gap-8">
            <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">
                        {data?.courseCategory?.name && <span>{data.courseCategory.name}</span>}
                        {data?.courseCategory?.name && typeof data?.isActive === 'boolean' && (
                            <span className="text-border-subtle">·</span>
                        )}
                        {typeof data?.isActive === 'boolean' && (
                            <span className={data.isActive ? 'text-emerald-500' : 'text-text-muted'}>
                                {data.isActive ? 'Live' : 'Inactive'}
                            </span>
                        )}
                    </div>

                    {data?.price != null && data?.price !== '' && (
                        <p className="text-xl font-black text-text-main tabular-nums tracking-tight">
                            ${data.price}
                        </p>
                    )}
                </div>

                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-text-main leading-snug">
                    {data?.courseName || 'Loading Asset...'}
                </h1>

                <p className="mt-4 text-text-muted text-sm leading-relaxed max-w-2xl font-medium">
                    {data?.shortDescription ||
                        'Analyzing core fundamentals with expert-led curriculum and hands-on simulation projects.'}
                </p>

                <div className="mt-auto pt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-t border-border-subtle/80">
                    <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
                        {hasRating && (
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1.5">
                                    Rating
                                </p>
                                <div className="flex items-center gap-1.5 text-sm font-bold text-text-main">
                                    <Star size={14} className="fill-yellow-500 text-yellow-500" />
                                    <span>{rating}</span>
                                    {data?.ratingCount != null && (
                                        <span className="text-text-muted font-medium text-xs">
                                            ({data.ratingCount})
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1.5">
                                Instructor
                            </p>
                            <p className="text-sm font-extrabold text-accent-blue truncate">
                                {instructor}
                            </p>
                            {assignment && (
                                <p className={`text-[11px] font-semibold mt-0.5 ${assignment.className}`}>
                                    {assignment.text}
                                </p>
                            )}
                        </div>
                    </div>

                    {marksheetHref && (
                        <Link
                            href={marksheetHref}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest hover:bg-hover-blue transition-colors"
                        >
                            <Award size={14} /> View Marksheet
                        </Link>
                    )}
                </div>
            </div>

            <div className="relative w-full md:w-[320px] aspect-video md:h-auto md:min-h-[200px] rounded-xl overflow-hidden shadow-sm border border-border-subtle group flex-shrink-0 bg-app-bg self-stretch">
                <Image
                    src={data?.coverImg || '/blankcover.jpg'}
                    alt="Course Visual"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
            </div>
        </div>
    );
};
