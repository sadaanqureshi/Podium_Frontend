'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import CourseList from '@/components/courses/CourseList'; // Wahi generic list use ho rahi hai
import { Filter } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';

const COURSES_PER_PAGE = 6;

interface TemplateProps {
  title: string;
  description: string;
  courses: any[];
  basePath: string;
  placeholder?: string;
  extraHeaderContent?: React.ReactNode;
  showProgress?: boolean;
}

const StudentCoursePageTemplate: React.FC<TemplateProps> = ({
  title, description, courses, basePath, placeholder, extraHeaderContent, showProgress
}) => {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);
  console.log('title',title);

  useEffect(() => { setMounted(true); }, []);

  const totalPages = Math.ceil(courses.length / COURSES_PER_PAGE);
  const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
  const endIndex = startIndex + COURSES_PER_PAGE;
  const coursesToShow = courses.slice(startIndex, endIndex);
  console.log('coursesToShow',coursesToShow);

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

  if (!mounted) return <div className="w-full min-h-screen bg-app-bg transition-none" />;

  return (
    <div className="w-full p-4 md:p-8 transition-colors duration-300 bg-app-bg min-h-screen">
      
      {/* Header Section: Matched with Pro Template */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-text-main mb-1 uppercase tracking-tight leading-none">
            {title}
          </h1>
          <p className="text-text-muted font-medium text-sm md:text-base opacity-80">
            {description}
          </p>
        </div>
        {extraHeaderContent}
      </div>

      {/* Toolbar: Matched with Pro Template */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <SearchBar placeholder={placeholder || "Search Protocol..."} />
        <button className="flex items-center gap-2 px-6 py-2.5 bg-card-bg border border-border-subtle rounded-xl text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-accent-blue/10 hover:border-accent-blue/30 transition-all shadow-sm active:scale-95">
          <Filter size={16} className="text-accent-blue" />
          <span>Filter Registry</span>
        </button>
      </div>

      {/* Animated Course Grid: Uses the standard CourseList & Card system */}
      <div className="relative mb-12">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div 
            key={currentPage} 
            custom={direction} 
            variants={variants} 
            initial="enter" 
            animate="center" 
            exit="exit" 
            className="w-full"
          >
            <CourseList 
                courses={coursesToShow} 
                basePath={basePath} 
                showProgress={showProgress} 
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <Pagination
        variant="numbered"
        page={currentPage}
        totalPages={totalPages}
        totalItems={courses.length}
        onPageChange={paginate}
        hideWhenSinglePage
        align="start"
        className="pt-2"
      />
    </div>
  );
};

export default StudentCoursePageTemplate;