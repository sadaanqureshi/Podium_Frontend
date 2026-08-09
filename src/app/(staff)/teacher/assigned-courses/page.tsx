'use client';
import React, { useEffect, useState, useMemo } from 'react';
import CoursePageTemplate from '@/components/courses/CoursePageTemplate';
import { Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchAssignedCourses } from '@/lib/store/features/courseSlice';

const PAGE_LIMIT = 6;

export default function TeacherPage() {
    const [mounted, setMounted] = useState(false);
    const [page, setPage] = useState(1);
    useEffect(() => {
        setMounted(true);
    }, []);

    const dispatch = useAppDispatch();
    const { assignedCourses, loading } = useAppSelector((state) => state.course);
    const isPageLoading = loading.assignedCourses;
    const meta = assignedCourses?.meta;
    const totalPages = Math.max(1, meta?.totalPages || 1);

    useEffect(() => {
        dispatch(fetchAssignedCourses({ page, limit: PAGE_LIMIT }));
    }, [dispatch, page]);

    const mappedCourses = useMemo(() => {
        const coursesList = Array.isArray(assignedCourses?.data)
            ? assignedCourses.data
            : Array.isArray(assignedCourses)
              ? assignedCourses
              : [];

        return coursesList.map((item: any) => ({
            id: item?.id,
            title: item?.courseName || 'Untitled Course',
            description: item?.shortDescription || 'No description available.',
            author: item?.teacher
                ? `${item.teacher.firstName} ${item.teacher.lastName}`
                : 'Expert Faculty',
            imageUrl: item?.coverImg || '/blankcover.jpg',
            rating: item?.avgRating || 0,
            totalLessons: item?.totalLectures || 0,
            progress: 0,
        })) as any[];
    }, [assignedCourses]);

    if (!mounted) {
        return <div className="h-screen bg-app-bg transition-none" />;
    }

    if (isPageLoading && mappedCourses.length === 0)
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
                <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
                <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">
                    Loading Assets...
                </p>
            </div>
        );

    return (
        <div className="bg-app-bg min-h-screen">
            <CoursePageTemplate
                title="Assigned Courses"
                description="Manage and update your assigned courses."
                courses={mappedCourses}
                basePath="/teacher/assigned-courses"
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
