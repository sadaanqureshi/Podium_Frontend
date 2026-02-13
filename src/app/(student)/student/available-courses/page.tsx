'use client';
import React, { useEffect, useState, useMemo } from 'react';
import CoursePageTemplate from '@/components/courses/CoursePageTemplate';
import { Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchAllCourses } from '@/lib/store/features/courseSlice';

export default function AvailableCoursesPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const dispatch = useAppDispatch();
    const { availableCourses, loading } = useAppSelector((state) => state.course);
    const isPageLoading = loading.availableCourses;

    useEffect(() => {
        dispatch(fetchAllCourses({ page: 1, limit: 10 }));
    }, [dispatch]);

    // # 1. DATA MAPPING (Most Important Part)
    const mappedCourses = useMemo(() => {
        // Console mein check karein ke data kis shakal mein aa raha hai
        console.log("🔍 Raw Redux Data:", availableCourses);

        // Aapka response { data: [...] } bhej raha hai, usay extract karein
        const actualData = (availableCourses as any)?.data || (Array.isArray(availableCourses) ? availableCourses : []);
        
        console.log("✅ Extracted Array:", actualData);

        return actualData.map((item: any) => ({
            id: item.id,
            // Template 'title' mangta hai, API 'courseName' de rahi hai
            title: item.courseName || 'Untitled Course',
            courseName: item.courseName,
            
            // Template 'thumbnail' mangta hai, API 'coverImg' de rahi hai
            thumbnail: item.coverImg || '',
            coverImg: item.coverImg || '',
            
            // Description mapping
            description: item.shortDescription || "No description provided.",
            shortDescription: item.shortDescription || "No description provided.",
            
            // Teacher mapping
            author: item.teacher ? `${item.teacher.firstName} ${item.teacher.lastName}` : 'Academy Faculty',
            teacher: item.teacher,
            
            // Stats
            rating: item.avgRating || 0,
            avgRating: item.avgRating || 0,
            totalLectures: item.totalLectures || 0,
        }));
    }, [availableCourses]);

    if (!mounted) return <div className="h-screen bg-app-bg transition-none" />;

    // # 2. UI LOADING LOGIC
    if (isPageLoading && mappedCourses.length === 0) return (
        <div className="h-screen flex flex-col items-center justify-center bg-app-bg transition-colors duration-300">
            <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
            <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">
                Syncing Course Ledger...
            </p>
        </div>
    );

    return (
        <div className="bg-app-bg min-h-screen">
            <CoursePageTemplate
                title="Available Courses"
                description="Browse and enroll in our available training modules."
                // # 3. Mapped data pass karna lazmi hai
                courses={mappedCourses} 
                basePath="/student/available-courses"
                showProgress={false} 
            />
        </div>
    );
}