// components/courses/CoursePageTemplate.tsx
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import CourseList from '@/components/courses/CourseList';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import { Course } from '@/data/courses';

const COURSES_PER_PAGE = 6;

interface TemplateProps {
  title: string;
  description: string;
  courses: Course[];
  basePath: string;
  placeholder?: string;
  extraHeaderContent?: React.ReactNode; // Teacher ke blue button ke liye slot
  showProgress?: boolean; // Progress bar dikhane ke liye
}

const CoursePageTemplate: React.FC<TemplateProps> = ({
  title, description, courses, basePath, placeholder, extraHeaderContent, showProgress
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);

  const totalPages = Math.ceil(courses.length / COURSES_PER_PAGE);
  const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
  const endIndex = startIndex + COURSES_PER_PAGE;
  const coursesToShow = courses.slice(startIndex, endIndex);

  const variants: Variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }),
  };

  const paginate = (newPage: number) => {
    if (newPage === currentPage) return;
    setDirection(newPage > currentPage ? 1 : -1);
    setCurrentPage(newPage);
  };

  return (
    <div className="w-full p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        {extraHeaderContent} {/* Blue button yahan show hoga agar pass kiya gaya */}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <SearchBar placeholder={placeholder || "Search..."} />
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
          <Filter size={16} />
          <span>Filter</span>
        </button>
      </div>

      <div className="relative mb-8">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div key={currentPage} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="w-full">
            <CourseList courses={coursesToShow} basePath={basePath} showProgress={showProgress} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination (Aapka purana logic) */}
      <nav className="flex items-center gap-2 text-sm">
        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="flex items-center gap-2 px-3 py-1 rounded-md disabled:opacity-50">
          <ChevronLeft size={16} /> <span>Previous</span>
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button key={number} onClick={() => paginate(number)} className={`px-3 py-1 rounded-md ${currentPage === number ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>
            {number}
          </button>
        ))}
        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center gap-2 px-3 py-1 rounded-md disabled:opacity-50">
          <span>Next</span> <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
};

export default CoursePageTemplate;