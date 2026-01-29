'use client'; 

import React, { useState, use } from 'react';
import { Star, Bell, ChevronRight, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Data aur components
import { mockCourses } from '@/data/courses'; 
import CourseTabs from '@/components/courses/CourseTabs';
import LecturesContent from '@/components/courses/LecturesContent';
import QuizzesContent from '@/components/courses/QuizzesContent';
import AssignmentsContent from '@/components/courses/AssignmentsContent';
import ResourcesContent from '@/components/courses/ResourcesContent';

// 1. Params interface mein 'courseid' lowercase rakha hai
const CourseDetailPage = ({ params }: { params: Promise<{ courseid: string }> }) => {
  
  const actualParams = use(params);
  
  // 2. actualParams se 'courseid' (lowercase) access kiya hai
  const courseid = parseInt(actualParams.courseid, 10);
  
  // 3. Data find karne ka logic
  const course = mockCourses.find(c => c.id === courseid); 

  const [activeTab, setActiveTab] = useState('lectures'); 

  // Error handling agar course na mile
  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
        <p className="text-gray-600 mb-4">
          ID checked: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{actualParams.courseid}</span>
        </p>
        <Link href="/enroll-courses" className="text-blue-600 hover:underline font-medium">
          Back to Courses
        </Link>
      </div>
    );
  }

  const tabContent = {
    lectures: <LecturesContent 
                recordedLectures={course.recordedLectures} 
                onlineClasses={course.onlineClasses}
                videoPreviewUrl={course.videoPreviewUrl} 
              />,
    quizzes: <QuizzesContent quizzes={course.quizzes} />,
    assignments: <AssignmentsContent assignments={course.assignments} />,
    resources: <ResourcesContent resources={course.resources} />,
  };

  return (
    <div className="w-full p-4 md:p-8 text-gray-900">
      
      {/* 1. Header Area */}
      <div className="flex justify-end items-center mb-6 gap-4">
        <Bell size={24} className="text-gray-600" />
        <Image 
          src={course.authorImageUrl} 
          alt={`${course.author}'s Avatar`}
          width={40}
          height={40}
          className="rounded-full"
        />
      </div>

      {/* 2. Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500 mb-4 flex-wrap">
        <Link href="/enroll-courses" className="hover:underline">Enrolled Courses</Link>
        <ChevronRight size={16} className="mx-1" />
        <span className="font-medium text-gray-700">{course.title}</span>
      </nav>

      {/* 3. Title & Info Area */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-1 md:gap-2">
          <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
          <span className="text-sm text-gray-600 flex-shrink-0">Enrollment Date: {course.enrollmentDate}</span>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{course.rating}</span>
            <span className="text-gray-500">{course.totalRatings}</span>
          </div>
          <p className="text-blue-600 text-sm font-semibold">
            {course.author}
          </p>
        </div>
      </div>

      {/* 4. Description */}
      <p className="text-gray-600 text-sm mb-8 max-w-4xl">
        {course.longDescription}
      </p>

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