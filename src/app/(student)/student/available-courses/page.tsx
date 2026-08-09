'use client';
import React, { useEffect, useState, useMemo } from 'react';
import CoursePageTemplate from '@/components/courses/CoursePageTemplate';
import { Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchAllCourses } from '@/lib/store/features/courseSlice';

const PAGE_LIMIT = 6;

export default function AvailableCoursesPage() {
    const [mounted, setMounted] = useState(false);
    const [page, setPage] = useState(1);
    useEffect(() => {
        setMounted(true);
    }, []);

    const dispatch = useAppDispatch();
    const { availableCourses, loading } = useAppSelector((state) => state.course);
    const isPageLoading = loading.availableCourses;
    const meta = availableCourses?.meta;
    const totalPages = Math.max(1, meta?.totalPages || 1);

    useEffect(() => {
        dispatch(fetchAllCourses({ page, limit: PAGE_LIMIT }));
    }, [dispatch, page]);

    const mappedCourses = useMemo(() => {
        const actualData =
            (availableCourses as any)?.data ||
            (Array.isArray(availableCourses) ? availableCourses : []);

        return actualData.map((item: any) => ({
            id: item.id,
            title: item.courseName || 'Untitled Course',
            courseName: item.courseName,
            thumbnail: item.coverImg || '',
            coverImg: item.coverImg || '',
            description: item.shortDescription || 'No description provided.',
            shortDescription: item.shortDescription || 'No description provided.',
            author: item.teacher
                ? `${item.teacher.firstName} ${item.teacher.lastName}`
                : 'Academy Faculty',
            teacher: item.teacher,
            rating: item.avgRating || 0,
            avgRating: item.avgRating || 0,
            totalLectures: item.totalLectures || 0,
        }));
    }, [availableCourses]);

    if (!mounted) return <div className="h-screen bg-app-bg transition-none" />;

    if (isPageLoading && mappedCourses.length === 0)
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-app-bg transition-colors duration-300">
                <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
                <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">
                    Loading Courses
                </p>
            </div>
        );

    return (
        <div className="bg-app-bg h-full">
            <CoursePageTemplate
                title="Available Courses"
                description="Browse and enroll in our available training modules."
                courses={mappedCourses}
                basePath="/student/available-courses"
                showProgress={false}
                serverPagination={{
                    page: meta?.currentPage || page,
                    totalPages,
                    totalItems: meta?.totalItems ?? 0,
                    loading: isPageLoading,
                    onPageChange: setPage,
                }}
            />
        </div>
    );
}
