'use client'; 

import React, { useState, useEffect, use } from 'react';
import { Star, Bell, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// Components
import CourseTabs from '@/components/courses/CourseTabs';
import LecturesContent from '@/components/courses/LecturesContent';
import QuizzesContent from '@/components/courses/QuizzesContent';
import AssignmentsContent from '@/components/courses/AssignmentsContent';
import ResourcesContent from '@/components/courses/ResourcesContent';
import { Assignment, RecordedLecture, OnlineClass, Resource } from '@/data/courses';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchCourseContent } from '@/lib/store/features/courseSlice';

// Params interface
const CourseDetailPage = ({ params }: { params: Promise<{ courseid: string }> }) => {
  const actualParams = use(params);
  const courseid = parseInt(actualParams.courseid, 10);
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [activeTab, setActiveTab] = useState('lectures');

  // Get course content from Redux
  const courseData = useAppSelector((state) => state.course.courseContent[courseid]);
  const courseLoading = useAppSelector((state) => state.course.loading.courseContent[courseid] || false);
  const error = useAppSelector((state) => state.course.error);

  useEffect(() => {
    // Check authentication
    const token = Cookies.get('authToken');
    if (!token) {
      router.push('/signin');
      return;
    }

    // Only fetch if we don't have cached data
    // The thunk's condition will prevent dispatch and API call if data exists in cache
    if (courseid && !courseData) {
      dispatch(fetchCourseContent(courseid));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseid]); // Only depend on courseid - courseData will trigger re-render when it changes

  // Loading state (only show if not in cache)
  if (courseLoading && !courseData) {
    return (
      <div className="w-full p-4 md:p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !courseData) {
    return (
      <div className="w-full p-4 md:p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Error Loading Course</h1>
        <p className="text-gray-600 mb-4">{error || 'Course not found'}</p>
        <Link href="/enroll-courses" className="text-blue-600 hover:underline font-medium">
          Back to Enrolled Courses
        </Link>
      </div>
    );
  }

  // If no course data available yet, show loading
  if (!courseData) {
    return (
      <div className="w-full p-4 md:p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  const course = courseData.course;
  const sections = courseData.sections || [];

  // Extract and flatten assignments from all sections
  const allAssignments: Assignment[] = sections.flatMap((section: any, sectionIndex: number) => 
    (section.assignments || []).map((assignment: any, assignmentIndex: number) => ({
      id: assignment.id,
      title: assignment.title || `Assignment ${assignmentIndex + 1}`,
      lastDate: assignment.dueDate 
        ? new Date(assignment.dueDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })
        : 'No deadline',
      objective: assignment.objective || '',
      deliverable: assignment.deliverable || '',
      format: assignment.format || '',
    }))
  );

  // Extract and separate recorded lectures from online classes
  const allLectures: RecordedLecture[] = sections.flatMap((section: any) => 
    (section.lectures || [])
      .filter((lecture: any) => lecture.lectureType === 'recorded')
      .map((lecture: any) => ({
        id: lecture.id,
        title: lecture.title || 'Untitled Lecture',
        completed: false, // Can be enhanced with user progress tracking
      }))
  );

  // Extract online classes from sections
  const onlineClasses: OnlineClass[] = sections.flatMap((section: any) => 
    (section.lectures || [])
      .filter((lecture: any) => lecture.lectureType === 'online')
      .map((lecture: any) => {
        // Format the schedule from liveStart date
        const scheduleDate = lecture.liveStart 
          ? new Date(lecture.liveStart).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })
          : 'TBD';
        
        return {
          id: lecture.id,
          title: lecture.title || 'Untitled Online Class',
          description: lecture.description || '',
          schedule: `Scheduled on: ${scheduleDate}`,
        };
      })
  );

  // Extract and flatten resources
  const allResources: Resource[] = sections.flatMap((section: any) => 
    (section.resources || []).map((resource: any) => ({
      id: resource.id,
      title: resource.title || 'Untitled Resource',
      description: resource.description || '',
      uploadDate: resource.createdAt 
        ? new Date(resource.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })
        : 'N/A',
    }))
  );

  // Extract and flatten quizzes from all sections
  const allQuizzes = sections.flatMap((section: any) => 
    (section.quizzes || []).map((quiz: any) => ({
      id: quiz.id,
      title: quiz.title || 'Untitled Quiz',
      status: 'pending' as const, // Default to pending, can be enhanced with user attempt tracking
      lastDate: quiz.endTime 
        ? new Date(quiz.endTime).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        : undefined,
      attemptedDate: undefined, // Can be populated from user attempt data
      marksScored: undefined, // Can be populated from user attempt data
      sampleQuestion: undefined, // Not available in API response
    }))
  );

  // Extract teacher information
  const teacher = course.teacher || {};
  const teacherName = teacher.firstName && teacher.lastName
    ? `${teacher.firstName} ${teacher.lastName}`.trim()
    : teacher.firstName || teacher.lastName || 'Instructor';
  const teacherImage = teacher.profilePicture || 'https://picsum.photos/seed/instructor/40/40';
  
  // Calculate average rating from courseRatings if available
  const avgRating = course.courseRatings && course.courseRatings.length > 0
    ? course.courseRatings.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / course.courseRatings.length
    : 0;

  const tabContent = {
    lectures: <LecturesContent 
                recordedLectures={allLectures} 
                onlineClasses={onlineClasses}
                videoPreviewUrl={course.coverImg || 'https://picsum.photos/id/1060/800/450'} 
              />,
    quizzes: <QuizzesContent quizzes={allQuizzes} />,
    assignments: <AssignmentsContent assignments={allAssignments} />,
    resources: <ResourcesContent resources={allResources} />,
  };

  return (
    <div className="w-full p-4 md:p-8 text-gray-900">
      {/* 1. Header Area with Breadcrumbs */}
      <div className="flex justify-between items-center mb-6 gap-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 flex-wrap">
          <Link href="/enroll-courses" className="hover:underline">Enrolled Courses</Link>
          <ChevronRight size={16} className="mx-1" />
          <span className="font-medium text-gray-700">{course.courseName || 'Course'}</span>
        </nav>
        
        {/* Icons */}
        <div className="flex items-center gap-4">
          <Bell size={24} className="text-gray-600" />
          <Image 
            src={teacherImage} 
            alt={`${teacherName}'s Avatar`}
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
      </div>

      {/* 3. Title & Info Area */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-1 md:gap-2">
          <h1 className="text-2xl md:text-3xl font-bold">{course.courseName || 'Untitled Course'}</h1>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{avgRating.toFixed(1)}</span>
            <span className="text-gray-500">
              ({course.courseRatings?.length || 0} ratings)
            </span>
          </div>
          <p className="text-blue-600 text-sm font-semibold">
            {teacherName}
          </p>
        </div>
      </div>

      {/* 4. Description */}
      <div className="mb-8 max-w-4xl space-y-2">
        {course.shortDescription && (
          <p className="text-gray-600 text-sm">
            {course.shortDescription}
          </p>
        )}
        {course.longDescription && course.longDescription !== course.shortDescription && (
          <p className="text-gray-600 text-sm">
            {course.longDescription}
          </p>
        )}
        {!course.shortDescription && !course.longDescription && (
          <p className="text-gray-600 text-sm">No description available.</p>
        )}
      </div>

      {/* 5. Tabs Navigation */}
      <div className="border-b border-gray-200">
        <CourseTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* 6. Dynamic Content */}
      <div className="mt-6 md:mt-8">
        {tabContent[activeTab as keyof typeof tabContent]}
      </div>
    </div>
  );
};

export default CourseDetailPage;