'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Loader2, BookOpen, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchEnrolledCourses } from '@/lib/store/features/courseSlice';

export default function StudentMyGradesPage() {
    const dispatch = useAppDispatch();
    const { enrolledCourses = [], loading } = useAppSelector((state) => state.course);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        dispatch(fetchEnrolledCourses());
    }, [dispatch]);

    const courses = useMemo(() => {
        return (enrolledCourses || []).map((item: any) => ({
            id: item?.course?.id,
            courseName: item?.course?.courseName || 'Untitled course',
            coverImg: item?.course?.coverImg || '/blankcover.jpg',
            shortDescription:
                item?.course?.shortDescription || 'Open your marksheet for this course.',
            teacher: item?.course?.teacher
                ? `${item.course.teacher.firstName || ''} ${item.course.teacher.lastName || ''}`.trim()
                : 'Instructor',
        })).filter((c: { id: number }) => Number.isFinite(c.id) && c.id > 0);
    }, [enrolledCourses]);

    if (!mounted || (loading.enrolledCourses && courses.length === 0)) {
        return (
            <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-accent-blue" size={36} />
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    Loading your courses…
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-app-bg text-text-main pb-20 relative overflow-x-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.10),_transparent_50%)]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 md:pt-10 space-y-8">
                <section className="rounded-[1.75rem] border border-border-subtle bg-card-bg p-6 md:p-8 shadow-xl overflow-hidden relative">
                    <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent-blue/10 blur-3xl" />
                    <div className="relative z-10 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 text-accent-blue border border-accent-blue/20 flex items-center justify-center shrink-0">
                            <Award size={22} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent-blue">
                                Academic record
                            </p>
                            <h1 className="text-2xl md:text-4xl font-black tracking-tight mt-1">
                                My Grades
                            </h1>
                            <p className="text-sm text-text-muted font-medium mt-2 max-w-xl">
                                Select a course to open its marksheet — assignments, quizzes, and
                                overall score.
                            </p>
                        </div>
                    </div>
                </section>

                {!courses.length ? (
                    <div className="rounded-2xl border border-dashed border-border-subtle bg-card-bg px-6 py-16 text-center space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center">
                            <BookOpen size={22} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-text-main">No enrolled courses yet</p>
                            <p className="text-[12px] text-text-muted mt-1">
                                Enroll in a course to view your grades and marksheet.
                            </p>
                        </div>
                        <Link
                            href="/student/available-courses"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest hover:bg-hover-blue"
                        >
                            Browse courses <ArrowRight size={14} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {courses.map((course: any) => (
                            <article
                                key={course.id}
                                className="rounded-2xl border border-border-subtle bg-card-bg overflow-hidden flex flex-col shadow-sm hover:border-accent-blue/30 transition-colors"
                            >
                                <div className="relative w-full h-36 bg-app-bg border-b border-border-subtle">
                                    <Image
                                        src={course.coverImg}
                                        alt={course.courseName}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div className="p-5 flex flex-col flex-1 gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-accent-blue">
                                            {course.teacher}
                                        </p>
                                        <h2 className="text-lg font-black text-text-main mt-1 leading-snug line-clamp-2">
                                            {course.courseName}
                                        </h2>
                                        <p className="text-[12px] text-text-muted mt-1.5 line-clamp-2">
                                            {course.shortDescription}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/student/courses/${course.id}/marksheet`}
                                        className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest hover:bg-hover-blue transition-colors"
                                    >
                                        <Award size={14} /> View Marksheet
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
