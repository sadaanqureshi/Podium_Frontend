'use client';
import React, { useState, useEffect } from 'react';
import CoursePageTemplate from '@/components/courses/CoursePageTemplate';
import { getAssignedCoursesAPI } from '@/lib/api/apiService';
import { Loader2 } from 'lucide-react';

export default function TeacherPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssigned = async () => {
            try {
                const res = await getAssignedCoursesAPI();
                setCourses(res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssigned();
    }, []);

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );

    return (
        <CoursePageTemplate
            title="Assigned Courses"
            description="Manage and update your assigned courses."
            courses={courses}
            basePath="/teacher/assigned-courses"
            showProgress={false} // Teacher ke liye progress band
        />
    );
}