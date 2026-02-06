'use client';
import React, { useEffect, useState, useMemo } from 'react';
import CoursePageTemplate from '@/components/courses/CoursePageTemplate';
import { Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchEnrolledCourses } from '@/lib/store/features/courseSlice';
import { useToast } from '@/context/ToastContext';

export default function EnrolledCoursesPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const { showToast } = useToast();
    const dispatch = useAppDispatch();
    const { enrolledCourses = [], loading } = useAppSelector((state) => state.course);

    useEffect(() => {
        dispatch(fetchEnrolledCourses());
    }, [dispatch]);

    // # FIX: Mapping keys to match exactly what 'Course[]' type expects
    // # FIX: Dual Mapping - Dono keys bhejo takay UI aur TS dono chalein
const mappedCourses = useMemo(() => {
    return enrolledCourses.map((item: any) => ({
        // 1. Common ID
        id: item.course.id,

        // 2. Title Logic (Dono keys bhejo takay undefined na ho)
        courseName: item.course.courseName, 
        title: item.course.courseName,

        // 3. Description Logic
        shortDescription: item.course.shortDescription || "Specialized training module.",
        description: item.course.shortDescription || "Specialized training module.",

        // 4. Image Logic
        coverImg: item.course.coverImg || '',
        thumbnail: item.course.coverImg || '',

        // 5. Teacher/Author Logic
        teacher: item.course.teacher || { firstName: 'Academy', lastName: 'Faculty' },
        author: `${item.course.teacher?.firstName || 'Academy'} ${item.course.teacher?.lastName || 'Faculty'}`,
        authorImageUrl: item.course.teacher?.profileImg || '',

        // 6. Stats
        avgRating: item.course.avgRating || 0,
        rating: item.course.avgRating || 0,
        progress: Math.min(Math.round((item.lectureViewed / (item.course.totalLectures || 10)) * 100), 100),
        totalLectures: item.course.totalLectures || 0,
    })) as any[]; // 'as any[]' se 14 properties wala error khatam ho jayega
}, [enrolledCourses]);

    if (!mounted) return <div className="h-screen bg-app-bg transition-none" />;

    if (loading.enrolledCourses && enrolledCourses.length === 0) return (
        <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
            <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
            <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">Syncing Registry...</p>
        </div>
    );

    return (
        <div className="bg-app-bg min-h-screen">
            <CoursePageTemplate
                title="Enrolled Courses"
                description="Manage and track your active training modules."
                courses={mappedCourses} // Error should be gone now
                basePath="/student/enrolled-courses"
                showProgress={true} 
            />
        </div>
    );
}