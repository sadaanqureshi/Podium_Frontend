'use client';
import React, { useEffect, useState } from 'react';
import CoursePageTemplate from '@/components/courses/CoursePageTemplate';
import { Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchAssignedCourses } from '@/lib/store/features/courseSlice';

export default function TeacherPage() {
    // 1. MOUNTED STATE: Hydration error aur white flash se bachne ke liye
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const dispatch = useAppDispatch();
    const { assignedCourses, loading } = useAppSelector((state) => state.course);
    const isPageLoading = loading.assignedCourses;

    useEffect(() => {
        dispatch(fetchAssignedCourses());
    }, [dispatch]);

    // 2. INITIAL GUARD: Jab tak client side confirm na ho jaye, sirf dark background dikhao
    if (!mounted) {
        return <div className="h-screen bg-app-bg transition-none" />;
    }

    // 3. UI LOADER FIX: Hardcoded colors hata kar theme variables lagaye hain
    if (isPageLoading && assignedCourses.length === 0) return (
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
                courses={assignedCourses}
                basePath="/teacher/assigned-courses"
                showProgress={false} 
            />
        </div>
    );
}