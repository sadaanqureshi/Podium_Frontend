'use client';
import React, { useEffect } from 'react';
import CoursePageTemplate from '@/components/courses/CoursePageTemplate';
import { Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
// # THUNK IMPORT: Jo cache aur API logic khud handle karta hai
import { fetchAssignedCourses } from '@/lib/store/features/courseSlice';

export default function TeacherPage() {
    const dispatch = useAppDispatch();
    
    // # 1. REDUX STATE ACCESS (Updated for Object structure)
    const { assignedCourses, loading } = useAppSelector((state) => state.course);

    // # 2. LOADING CHECK FIX: loading ab object hai toh specific key check karein
    const isPageLoading = loading.assignedCourses;

    useEffect(() => {
        // # 3. CLEAN DISPATCH: Thunk khud try/catch aur setLoading handle karega
        dispatch(fetchAssignedCourses());
    }, [dispatch]);

    // # 4. UI LOADER: Specific boolean key use ho rahi hai
    if (isPageLoading && assignedCourses.length === 0) return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );

    return (
        <CoursePageTemplate
            title="Assigned Courses"
            description="Manage and update your assigned courses."
            courses={assignedCourses}
            basePath="/teacher/assigned-courses"
            showProgress={false} 
        />
    );
}