'use client';
import React, { useEffect, useState, useMemo } from 'react';
import CoursePageTemplate from '@/components/courses/CoursePageTemplate';
import { Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchAssignedCourses } from '@/lib/store/features/courseSlice';

export default function TeacherPage() {
    // 1. MOUNTED STATE
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const dispatch = useAppDispatch();
    const { assignedCourses, loading } = useAppSelector((state) => state.course);
    const isPageLoading = loading.assignedCourses;

    useEffect(() => {
        dispatch(fetchAssignedCourses());
    }, [dispatch]);

    
    const mappedCourses = useMemo(() => {
        // Redux state se array nikalna
        let coursesList = [];
        if (Array.isArray(assignedCourses)) {
            coursesList = assignedCourses;
        } else if (assignedCourses && Array.isArray((assignedCourses as any).data)) {
            coursesList = (assignedCourses as any).data;
        }

        return coursesList.map((item: any) => {
            // Teacher ke data mein direct details hain
            return {
                id: item?.id, // 👉 Course ka asli ID
                title: item?.courseName || 'Untitled Course',
                description: item?.shortDescription || 'No description available.',
                author: item?.teacher ? `${item.teacher.firstName} ${item.teacher.lastName}` : 'Expert Faculty',
                imageUrl: item?.coverImg || '/blankcover.jpg',
                rating: item?.avgRating || 0,
                totalLessons: item?.totalLectures || 0,
                progress: 0, // Teacher ko progress bar dekhne ki zaroorat nahi
            };
        }) as any[]; 
    }, [assignedCourses]);


    // 2. INITIAL GUARD
    if (!mounted) {
        return <div className="h-screen bg-app-bg transition-none" />;
    }

    // 3. UI LOADER FIX
    if (isPageLoading && mappedCourses.length === 0) return (
        <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
            <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
            <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">
                Loading Assets...
            </p>
        </div>
    );

    console.log('mappedCoursesadawwdawda',mappedCourses);
    return (
        <div className="bg-app-bg min-h-screen">
            <CoursePageTemplate
                title="Assigned Courses"
                description="Manage and update your assigned courses."
                courses={mappedCourses} // 👉 Passed the mapped array here
                basePath="/teacher/assigned-courses"
                showProgress={false} 
            />
        </div>
    );
}