'use client';

import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ChevronDown, Check, Plus } from 'lucide-react';
import { mockCourses } from '@/data/courses';
import QuizCard from '@/components/quiz/QuizCard';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '@/components/ui/SearchBar';

interface TemplateProps {
  role: 'student' | 'teacher' | 'admin';
  pageTitle: string;
  subTitle: string;
}

const QuizPageTemplate: React.FC<TemplateProps> = ({ role, pageTitle, subTitle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCourseOpen, setIsCourseOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const isStaff = role === 'teacher' || role === 'admin';

  // Data logic
  const allQuizzes = useMemo(() => {
    const list: any[] = [];
    mockCourses.forEach(course => {
      course.quizzes.forEach(q => list.push({ ...q, courseTitle: course.title }));
    });
    return list;
  }, []);

  const filtered = useMemo(() => {
    return allQuizzes.filter(q => {
      const matchSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCourse = courseFilter === 'All' || q.courseTitle === courseFilter;
      const matchStatus = statusFilter === 'All' || q.status === statusFilter;
      return matchSearch && matchCourse && matchStatus;
    });
  }, [allQuizzes, searchTerm, courseFilter, statusFilter]);

  return (
    <div className="w-full p-4 md:p-8 max-w-7xl mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{pageTitle}</h1>
          <p className="text-gray-500 mt-1">{subTitle}</p>
        </div>
        {isStaff && (
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-xl shadow-blue-100 active:scale-95 transition-all w-full sm:w-auto justify-center">
            <Plus size={20} strokeWidth={3} />
            <span>Create New Quiz</span>
          </button>
        )}
      </div>

      {/* 2. Filters Section */}
      <div className="grid grid-cols-1 md:flex items-center gap-3 mb-8">
        <div className="flex-1">
          <SearchBar placeholder="Search by quiz or course name..." />
        </div>
        
        {/* Course Dropdown */}
        <div className="relative min-w-[180px]">
          <button onClick={() => setIsCourseOpen(!isCourseOpen)} className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium hover:border-gray-400 transition-all h-[44px]">
            <span className="truncate">Course: {courseFilter}</span>
            <ChevronDown size={16} className={`transition-transform ${isCourseOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isCourseOpen && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 max-h-60 overflow-y-auto">
                {['All', ...mockCourses.map(c => c.title)].map(opt => (
                  <div key={opt} onClick={() => { setCourseFilter(opt); setIsCourseOpen(false); }} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm flex justify-between items-center">
                    {opt} {courseFilter === opt && <Check size={14} className="text-blue-600" />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Dropdown */}
        <div className="relative min-w-[150px]">
          <button onClick={() => setIsStatusOpen(!isStatusOpen)} className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium hover:border-gray-400 transition-all h-[44px]">
            <span className="capitalize">Status: {statusFilter}</span>
            <ChevronDown size={16} className={`transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isStatusOpen && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 font-sans">
                {['All', 'pending', 'completed'].map(opt => (
                  <div key={opt} onClick={() => { setStatusFilter(opt); setIsStatusOpen(false); }} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm capitalize flex justify-between items-center">
                    {opt} {statusFilter === opt && <Check size={14} className="text-blue-600" />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 h-[44px] justify-center">
          <SlidersHorizontal size={16} /> Sort
        </button>
      </div>

      {/* 3. Quiz List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map(q => (
            <QuizCard key={`${q.courseTitle}-${q.id}`} quiz={q} courseTitle={q.courseTitle} role={role} />
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No quizzes found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPageTemplate;