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
  extraHeaderContent?: React.ReactNode;
  showProgress?: boolean;
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
    <div className="w-full md:p-8 transition-colors duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-text-main mb-1 uppercase tracking-tight">{title}</h1>
          <p className="text-text-muted font-medium text-sm">{description}</p>
        </div>
        {extraHeaderContent}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <SearchBar placeholder={placeholder || "Search Protocol..."} />
        <button className="flex items-center gap-2 px-6 py-2.5 bg-card-bg border border-border-subtle rounded-xl text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-sidebar-to/10 shadow-sm">
          <Filter size={16} className="text-accent-blue" />
          <span>Filter</span>
        </button>
      </div>

      {/* Animated Course Grid */}
      <div className="relative mb-12">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div key={currentPage} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="w-full">
            <CourseList courses={coursesToShow} basePath={basePath} showProgress={showProgress} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination: Themed with Accent Blue */}
      <nav className="flex items-center justify-center sm:justify-start gap-3 text-[10px] font-black uppercase tracking-[0.15em]">
        <button 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1} 
          className="flex items-center gap-2 px-4 py-2 text-text-muted hover:text-accent-blue disabled:opacity-30 transition-all"
        >
          <ChevronLeft size={16} /> <span>Prev</span>
        </button>
        
        <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button 
                key={number} 
                onClick={() => paginate(number)} 
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all border ${
                    currentPage === number 
                    ? 'bg-accent-blue text-white border-accent-blue shadow-lg shadow-accent-blue/20 scale-110' 
                    : 'bg-card-bg text-text-muted border-border-subtle hover:border-accent-blue/30'
                }`}
            >
                {number}
            </button>
            ))}
        </div>

        <button 
          onClick={() => paginate(currentPage + 1)} 
          disabled={currentPage === totalPages} 
          className="flex items-center gap-2 px-4 py-2 text-text-muted hover:text-accent-blue disabled:opacity-30 transition-all"
        >
          <span>Next</span> <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
};

export default CoursePageTemplate;