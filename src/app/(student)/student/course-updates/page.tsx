'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Loader2,
    Sparkles,
    BookOpen,
    NotebookPen,
    NotepadText,
    BookCopy,
    Video,
    Calendar,
    ChevronRight,
    Layers,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
    fetchEnrolledCourses,
    fetchMyCourseUpdates,
    clearMyCourseUpdates,
} from '@/lib/store/features/courseSlice';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { useToast } from '@/context/ToastContext';
import type {
    CourseUpdateItem,
    CourseUpdateType,
} from '@/lib/api/apiService';

const TYPE_FILTERS: { label: string; value: CourseUpdateType | '' }[] = [
    { label: 'All', value: '' },
    { label: 'Lectures', value: 'lecture' },
    { label: 'Assignments', value: 'assignment' },
    { label: 'Quizzes', value: 'quiz' },
    { label: 'Resources', value: 'resource' },
];

const typeMeta = (type: CourseUpdateType) => {
    switch (type) {
        case 'lecture':
            return {
                label: 'Lecture',
                className: 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue',
                Icon: Video,
            };
        case 'assignment':
            return {
                label: 'Assignment',
                className: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
                Icon: NotebookPen,
            };
        case 'quiz':
            return {
                label: 'Quiz',
                className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
                Icon: NotepadText,
            };
        case 'resource':
        default:
            return {
                label: 'Resource',
                className: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
                Icon: BookCopy,
            };
    }
};

const formatOccurredAt = (value: string | null) => {
    if (!value) return 'Recently';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60_000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/** Deep-link into existing enrolled-course content routes when possible */
export const getCourseUpdateHref = (item: CourseUpdateItem): string => {
    const courseId = item.course?.id;
    if (!courseId) return '/student/enrolled-courses';

    const sectionId = item.section?.id;
    if (!sectionId) return `/student/enrolled-courses/${courseId}`;

    switch (item.type) {
        case 'lecture':
            return `/student/enrolled-courses/${courseId}/section/${sectionId}/lecture/${item.id}`;
        case 'assignment':
            return `/student/enrolled-courses/${courseId}/section/${sectionId}/assignment/${item.id}`;
        case 'quiz':
            return `/student/enrolled-courses/${courseId}/section/${sectionId}/quiz/${item.id}`;
        case 'resource':
            return `/student/enrolled-courses/${courseId}/section/${sectionId}/resource/${item.id}`;
        default:
            return `/student/enrolled-courses/${courseId}`;
    }
};

function UpdateCard({ item }: { item: CourseUpdateItem }) {
    const meta = typeMeta(item.type);
    const Icon = meta.Icon;
    const href = getCourseUpdateHref(item);

    return (
        <Link
            href={href}
            className="bg-card-bg border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 hover:border-accent-blue/40 transition-colors group"
        >
            <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${meta.className}`}
            >
                <Icon size={20} />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${meta.className}`}
                    >
                        {meta.label}
                    </span>
                    {item.type === 'lecture' && item.lectureType && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            {item.lectureType}
                        </span>
                    )}
                    {item.type === 'resource' && item.resourceType && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            {item.resourceType}
                        </span>
                    )}
                </div>

                <h3 className="text-sm md:text-base font-black text-text-main uppercase tracking-tight truncate group-hover:text-accent-blue transition-colors">
                    {item.title}
                </h3>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1.5 text-accent-blue">
                        <BookOpen size={11} />
                        {item.course?.courseName || 'Course'}
                    </span>
                    {item.section?.title && (
                        <span className="inline-flex items-center gap-1.5">
                            <Layers size={11} />
                            {item.section.title}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                        <Calendar size={11} className="text-accent-blue" />
                        {formatOccurredAt(item.occurredAt)}
                    </span>
                </div>
            </div>

            <ChevronRight
                size={18}
                className="text-text-muted group-hover:text-accent-blue shrink-0 self-end sm:self-center transition-colors"
            />
        </Link>
    );
}

export default function CourseUpdatesPage() {
    const dispatch = useAppDispatch();
    const { showToast } = useToast();

    const [mounted, setMounted] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
    const [typeFilter, setTypeFilter] = useState<CourseUpdateType | ''>('');
    const [limit, setLimit] = useState(20);

    const { enrolledCourses = [], loading: courseLoading } = useAppSelector(
        (state) => state.course
    );
    const {
        myCourseUpdates,
        myCourseUpdatesMeta,
        myCourseUpdatesLoading,
        myCourseUpdatesError,
    } = useAppSelector((state) => state.course);

    const loadUpdates = useCallback(() => {
        const params: {
            limit: number;
            courseId?: number;
            types?: CourseUpdateType;
        } = { limit };
        if (selectedCourseId !== '') params.courseId = selectedCourseId;
        if (typeFilter !== '') params.types = typeFilter;
        dispatch(fetchMyCourseUpdates(params));
    }, [dispatch, limit, selectedCourseId, typeFilter]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        dispatch(fetchEnrolledCourses());
        return () => {
            dispatch(clearMyCourseUpdates());
        };
    }, [dispatch]);

    useEffect(() => {
        loadUpdates();
    }, [loadUpdates]);

    useEffect(() => {
        const onFocus = () => loadUpdates();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [loadUpdates]);

    useEffect(() => {
        if (myCourseUpdatesError) {
            showToast(myCourseUpdatesError, 'error');
        }
    }, [myCourseUpdatesError, showToast]);

    const courseOptions = useMemo(() => {
        return enrolledCourses
            .map((item: any) => {
                const course = item.course || item;
                return {
                    label: course.courseName || course.title || `Course ${course.id}`,
                    value: course.id as number,
                };
            })
            .filter((opt: { value: number }) => opt.value != null);
    }, [enrolledCourses]);

    const hasActiveFilter = selectedCourseId !== '' || typeFilter !== '';

    if (!mounted) return <div className="h-screen bg-app-bg transition-none" />;

    if (courseLoading.enrolledCourses && enrolledCourses.length === 0) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
                <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
                <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">
                    Loading...
                </p>
            </div>
        );
    }

    return (
        <div className="bg-app-bg min-h-screen text-text-main pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-12 space-y-8">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-blue/10 text-accent-blue rounded-md text-[10px] font-bold uppercase tracking-widest">
                        <Sparkles size={12} /> Course Updates
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
                        Course Updates
                    </h1>
                    <p className="text-text-muted text-sm font-medium max-w-xl leading-relaxed">
                        Newest lectures, assignments, quizzes, and resources from your enrolled
                        courses.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-card-bg border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                    <div className="space-y-2 max-w-md">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                            <BookOpen size={12} className="text-accent-blue" /> Course
                        </label>
                        <CustomDropdown
                            options={[
                                { label: 'All courses', value: '' },
                                ...courseOptions,
                            ]}
                            value={selectedCourseId}
                            onChange={(value) =>
                                setSelectedCourseId(value === '' ? '' : Number(value))
                            }
                            placeholder="All courses"
                            className="w-full"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {TYPE_FILTERS.map((tab) => {
                            const active = typeFilter === tab.value;
                            return (
                                <button
                                    key={tab.label}
                                    type="button"
                                    onClick={() => setTypeFilter(tab.value)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                        active
                                            ? 'bg-text-main text-card-bg border-text-main'
                                            : 'bg-card-bg text-text-muted border-border-subtle hover:border-accent-blue/40 hover:text-accent-blue'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* List */}
                {myCourseUpdatesLoading && myCourseUpdates.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                            Loading updates
                        </p>
                    </div>
                ) : myCourseUpdates.length === 0 ? (
                    <div className="bg-card-bg border border-border-subtle rounded-2xl p-12 text-center shadow-sm">
                        <Sparkles size={40} className="mx-auto mb-4 text-accent-blue/40" />
                        <p className="text-sm font-bold text-text-muted uppercase tracking-wider">
                            {hasActiveFilter
                                ? 'No updates for this filter'
                                : 'No course updates yet'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 relative">
                        {myCourseUpdatesLoading && (
                            <div className="absolute inset-0 bg-app-bg/40 z-10 flex items-start justify-center pt-8 pointer-events-none">
                                <Loader2 className="animate-spin text-accent-blue" size={28} />
                            </div>
                        )}
                        {myCourseUpdates.map((item) => (
                            <UpdateCard
                                key={`${item.type}-${item.id}-${item.course?.id}`}
                                item={item}
                            />
                        ))}

                        {myCourseUpdatesMeta && myCourseUpdatesMeta.returned >= limit && limit < 50 && (
                            <div className="pt-2 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setLimit((n) => Math.min(n + 10, 50))}
                                    className="px-5 py-2.5 rounded-xl border border-border-subtle bg-card-bg text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent-blue hover:border-accent-blue/40 transition-colors"
                                >
                                    Load more
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
