// app/available-courses/[courseId]/page.tsx

'use client'; 

// 1. 'use' ko hata kar 'useParams' (next/navigation se) import karein
import React, { useState } from 'react';
import { useParams } from 'next/navigation'; 
import { Star, Bell, ChevronRight, AlertCircle, Book, Download, Youtube, Check, CheckSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { mockCourses } from '@/data/courses';
import CourseAccordion from '@/components/courses/CourseAccordion'; 

// 2. Component se 'params' prop ko hata dein
const AvailableCourseDetail = () => {
  
  // 3. 'useParams()' hook ko call karein
  const params = useParams(); 
  
  // 4. 'params.courseId' se ID nikaalein (ise string mein type cast karein)
  const courseId = parseInt(params.courseId as string, 10);
  
  const course = mockCourses.find(c => c.id === courseId);

  // Accordion ke liye state (Yeh Client Component ke liye zaroori hai)
  const [openSection, setOpenSection] = useState<string | null>(null);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
        {/* Ab yeh ID sahi dikhayega */}
        <p className="text-gray-600">Course ID &apos;{params.courseId}&apos; not found.</p> 
      </div>
    );
  }

  // Course content ko sections mein combine karein
  const sections = [
    { id: 'getting-started', title: 'Recorded Lectures', lectures: course.recordedLectures.length, time: '20mins', content: course.recordedLectures },
    { id: 'online-classes', title: 'Online Classes', lectures: course.onlineClasses.length, time: '1hr', content: course.onlineClasses },
  ];

  return (
    <div className="w-full p-4 md:p-8 text-gray-900">
      
      {/* ... (Header / Bell Icon) ... */}
       <div className="flex justify-end items-center mb-6 gap-4">
        <Bell size={24} className="text-gray-600" />
        <Image 
          src={course.authorImageUrl} 
          alt={course.author}
          width={40}
          height={40}
          className="rounded-full"
        />
      </div>

      {/* ... (Breadcrumbs) ... */}
      <nav className="flex items-center text-sm text-gray-500 mb-4 flex-wrap">
        <Link href="/available-courses" className="hover:underline">Available Courses</Link>
        <ChevronRight size={16} className="mx-1" />
        <span className="font-medium text-gray-700">{course.title}</span>
      </nav>

      {/* Page Layout (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side (Content) */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          {/* ... (Rating/Author) ... */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mb-2">
             <div className="flex items-center gap-1 text-sm text-gray-700">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{course.rating}</span>
              <span className="text-gray-500">{course.totalRatings}</span>
            </div>
            <p className="text-sm">Created by: <span className="text-blue-600 font-semibold">{course.author}</span></p>
          </div>

          {/* ... (Course Content Stats) ... */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
             <span>{sections.length} Sections</span>
            <span>•</span>
            <span>{course.recordedLectures.length} Lectures</span>
            <span>•</span>
            <span>2hrs 33mins total length</span>
          </div>


          {/* Course Content Accordion */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Course Content</h2>
            <div className="space-y-3">
              {sections.map((section) => (
                <CourseAccordion 
                  key={section.id}
                  title={section.title}
                  lectures={section.lectures}
                  time={section.time}
                  isOpen={openSection === section.id}
                  setIsOpen={() => setOpenSection(openSection === section.id ? null : section.id)}
                >
                  {/* Children ke zariye content pass karein */}
                  <ul className="space-y-3 pt-4">
                    {section.id === 'getting-started' && course.recordedLectures.map((item) => (
                      <li key={item.id} className="flex items-center gap-3 text-sm text-gray-700">
                        <CheckSquare size={16} className="text-gray-400" />
                        <span>{item.title}</span>
                      </li>
                    ))}
                    {section.id === 'online-classes' && course.onlineClasses.map((item) => (
                      <li key={item.id} className="flex items-center gap-3 text-sm text-gray-700">
                        <Youtube size={16} className="text-red-600" />
                        <span>{item.title} (Live)</span>
                      </li>
                    ))}
                  </ul>
                </CourseAccordion>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Description</h2>
            <p className="text-gray-600 text-sm whitespace-pre-line">
              {course.longDescription}
            </p>
          </div>
        </div>

        {/* Right Side (Purchase Card) */}
        <div className="lg:col-span-1 h-fit lg:sticky top-8">
          <div className="border border-gray-200 rounded-lg shadow-lg bg-white">
            <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
              <Image src={course.imageUrl} alt={course.title} layout="fill" objectFit="cover" />
            </div>
            <div className="p-6">
              <span className="text-3xl font-bold">${course.price}</span>
              
              <Link href={`/available-courses/${course.id}/payment`} className="block w-full text-center bg-blue-600 text-white font-bold py-3 rounded-lg mt-4 hover:bg-blue-700 transition-colors">
                Get Enrolled
              </Link>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-3">This Course Includes:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><Book size={16} /> {course.recordedLectures.length} Recorded Lectures</li>
                  <li className="flex items-center gap-2"><Download size={16} /> {course.resources.length} Downloadable Resources</li>
                  <li className="flex items-center gap-2"><Youtube size={16} /> {course.onlineClasses.length} Live Session(s)</li>
                  <li className="flex items-center gap-2"><Check size={16} /> English Language</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AvailableCourseDetail;