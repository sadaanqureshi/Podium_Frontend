'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import CoursePageTemplate from '@/components/courses/CoursePageTemplate';
import { Course } from '@/data/courses';
import Cookies from 'js-cookie';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchEnrolledCourses } from '@/lib/store/features/courseSlice';

export default function StudentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Get enrolled courses and loading state from Redux
  const enrolledCourses = useAppSelector((state) => state.course.enrolledCourses);
  const loading = useAppSelector((state) => state.course.loading.enrolledCourses);
  const error = useAppSelector((state) => state.course.error);
  const lastFetched = useAppSelector((state) => state.course.lastFetched);

  useEffect(() => {
    // Check authentication
    const token = Cookies.get('authToken');
    if (!token) {
      router.push('/signin');
      return;
    }

    // Only fetch if we don't have enrolled courses in cache
    // or if cache is older than 5 minutes (optional: refresh stale data)
    const shouldFetch = enrolledCourses.length === 0 || 
                       !lastFetched || 
                       (Date.now() - lastFetched > 5 * 60 * 1000); // 5 minutes

    if (shouldFetch && !loading) {
      dispatch(fetchEnrolledCourses());
    }
  }, [dispatch, router, enrolledCourses.length, lastFetched, loading]);

  // Map backend response to Course interface
  const courses: Course[] = useMemo(() => {
    return enrolledCourses.map((enrollment: any) => {
      const course = enrollment.course || enrollment;
      
      // Extract teacher information
      const teacher = course.teacher || {};
      const teacherName = teacher.firstName && teacher.lastName
        ? `${teacher.firstName} ${teacher.lastName}`.trim()
        : teacher.firstName || teacher.lastName || 'Instructor';
      
      // Calculate progress percentage if totalLectures is available
      const totalLessons = course.totalLectures || 0;
      const currentLesson = enrollment.lectureViewed || 0;
      const progress = totalLessons > 0 
        ? Math.round((currentLesson / totalLessons) * 100) 
        : 0;
      
      // Parse price
      const price = course.price ? parseFloat(course.price) : 0;
      
      // Parse rating
      const avgRating = course.avgRating ? parseFloat(course.avgRating) : 0;
      
      return {
        id: course.id,
        title: course.courseName || 'Untitled Course',
        author: teacherName,
        authorImageUrl: teacher.profilePicture || 'https://picsum.photos/seed/instructor/40/40',
        description: course.shortDescription || course.longDescription || '',
        longDescription: course.longDescription || course.shortDescription || '',
        rating: avgRating,
        totalRatings: '(0 ratings)',
        enrollmentDate: enrollment.createdAt 
          ? new Date(enrollment.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })
          : 'N/A',
        progress: progress,
        currentLesson: currentLesson,
        totalLessons: totalLessons,
        imageUrl: course.coverImg || 'https://picsum.photos/id/1060/400/200',
        videoPreviewUrl: course.coverImg || 'https://picsum.photos/id/1060/800/450',
        price: price,
        recordedLectures: [],
        onlineClasses: [],
        quizzes: [],
        assignments: [],
        resources: [],
      };
    });
  }, [enrolledCourses]);

  if (loading) {
    return (
      <div className="w-full p-4 md:p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading enrolled courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 md:p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">Error Loading Courses</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <CoursePageTemplate
      title="Enrolled Courses"
      description="Continue your learning journey."
      courses={courses}
      basePath="/enroll-courses"
      showProgress={true}
    />
  );
}