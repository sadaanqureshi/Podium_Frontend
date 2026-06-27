'use client';
import React, { use, useEffect } from 'react'; 
import UnifiedCourseDetail from '@/components/courses/UnifiedCourseDetail';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchCourseContent } from '@/lib/store/features/courseSlice';

export default function StudentCoursePage({ params }: { params: Promise<{ courseId: any }> }) {
    // 1. Properly resolve params
    const resolvedParams = use(params);
    // const idStr = resolvedParams?.courseId;
    const idStr = resolvedParams?.courseId;
    
    // 2. Safely parse courseId
    const courseId = idStr ? parseInt(idStr, 10) : NaN;
    
    const dispatch = useAppDispatch();
    const { courseContent, loading } = useAppSelector((state) => state.course);

    useEffect(() => {
        if (!isNaN(courseId)) {
            dispatch(fetchCourseContent(courseId));
        }
    }, [courseId, dispatch]);

    // Humanized & Centered Error UI
    if (isNaN(courseId)) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center text-center px-6">
                <p className="text-text-muted font-black tracking-widest uppercase text-sm mb-2">Oops! Course Not Found</p>
                <p className="text-text-muted/60 text-xs font-medium">The link might be broken or the course is no longer available.</p>
            </div>
        );
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