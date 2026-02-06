'use client';
import React, { use, useEffect } from 'react'; // React import for use
import UnifiedCourseDetail from '@/components/courses/UnifiedCourseDetail';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchCourseContent } from '@/lib/store/features/courseSlice';

export default function StudentCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
    // 1. Properly resolve params
    const resolvedParams = use(params);
    const idStr = resolvedParams?.courseId;
    
    // 2. Safely parse courseId
    const courseId = idStr ? parseInt(idStr, 10) : NaN;
    
    const dispatch = useAppDispatch();
    const { courseContent, loading } = useAppSelector((state) => state.course);

    useEffect(() => {
        // Only dispatch if courseId is a valid number
        if (!isNaN(courseId)) {
            dispatch(fetchCourseContent(courseId));
        }
    }, [courseId, dispatch]);

    // Debugging logs (Inhe production se pehle hata saktay hain)
    console.log('Target Course ID:', courseId);
    console.log('Available Data:', courseContent[courseId]);

    // Agar ID galat hai to error UI
    if (isNaN(courseId)) {
        return <div className="p-20 text-text-main">Error: Invalid Course Protocol ID.</div>;
    }

    return (
        <UnifiedCourseDetail 
            courseId={courseId}
            role="student" 
            data={courseContent[courseId]}
            isLoading={loading.courseContent[courseId]}
            availableStudents={[]} 
            backUrl="/student/enrolled-courses"
        />
    );
}