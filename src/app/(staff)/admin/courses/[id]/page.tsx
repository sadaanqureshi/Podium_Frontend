'use client';
import { use, useEffect, useState } from 'react';
import UnifiedCourseDetail from '@/components/courses/UnifiedCourseDetail';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchCourseContent, refreshCourseContent } from '@/lib/store/features/courseSlice';
import { getStudentsAPI } from '@/lib/api/apiService';

export default function AdminCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const courseId = Number(id);
    const dispatch = useAppDispatch();

    // Redux State
    const { courseContent, loading } = useAppSelector((state) => state.course);
    const [allStudents, setAllStudents] = useState<any[]>([]);

    useEffect(() => {
        if (courseId) {
            // Always refetch so admin gets stats + pending/rejected arrays
            dispatch(refreshCourseContent(courseId));
            dispatch(fetchCourseContent(courseId));
            getStudentsAPI().then(res => {
                const list = Array.isArray(res) ? res : res?.data || [];
                setAllStudents(list.map((s: any) => ({
                    label: `${s.firstName} ${s.lastName} (${s.email})`,
                    value: s.id
                })));
            });
        }
    }, [courseId, dispatch]);

    return (
        <UnifiedCourseDetail 
            courseId={courseId}
            role="admin"
            data={courseContent[courseId]}
            isLoading={loading.courseContent[courseId]}
            availableStudents={allStudents}
            backUrl="/admin/courses"
        />
    );
}