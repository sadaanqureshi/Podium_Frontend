'use client';
import { use, useEffect } from 'react';
import UnifiedCourseDetail from '@/components/courses/UnifiedCourseDetail';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchCourseContent } from '@/lib/store/features/courseSlice';

export default function TeacherCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId: id } = use(params);
    const courseId = Number(id);
    const dispatch = useAppDispatch();

    const { courseContent, loading } = useAppSelector((state) => state.course);

    useEffect(() => {
        if (courseId) {
            dispatch(fetchCourseContent(courseId));
        }
    }, [courseId, dispatch]);

    return (
        <UnifiedCourseDetail 
            courseId={courseId}
            role="teacher"
            data={courseContent[courseId]}
            isLoading={loading.courseContent[courseId]}
            availableStudents={[]} // Teacher cannot enroll new students globally
            backUrl="/teacher/assigned-courses"
        />
    );
}