// app/available-courses/page.tsx

'use client'; 

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion'; 
import {  Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockCourses } from '@/data/courses'; 
import SearchBar from '@/components/ui/SearchBar';
import PriceCardList from '@/components/courses/PriceCardList';

const COURSES_PER_PAGE = 6;

const AvailableCourses = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);

  const totalPages = Math.ceil(mockCourses.length / COURSES_PER_PAGE);
  const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
  const endIndex = startIndex + COURSES_PER_PAGE;
  const coursesToShow = mockCourses.slice(startIndex, endIndex);

  const variants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' }, 
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' },
    }),
  };
  
  const paginate = (newPage: number) => {
    if (newPage === currentPage) return;
    setDirection(newPage > currentPage ? 1 : -1);
    setCurrentPage(newPage);
  };
  const handleNext = () => { if (currentPage < totalPages) paginate(currentPage + 1); };
  const handlePrev = () => { if (currentPage > 1) paginate(currentPage - 1); };
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);


  return (
    <div className="w-full p-4 md:p-8">
      
      {/* 1. Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Available Courses
        </h1>
        <p className="text-gray-600">
          Browse all available courses and start learning today.
        </p>
      </div>

      {/* 2. Search aur Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <SearchBar placeholder="Search Available Courses..." />
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-50 shadow-sm transition-colors">
          <Filter size={16} />
          <span>Filter</span>
        </button>
      </div>

      {/* 3. Course Grid (Animation ke saath) */}
      
      {/* FIX YAHAN HAI: 
        Humne 'min-h-[...]' ki saari classes aur 'overflow-hidden' ko hata diya hai.
        'AnimatePresence' ko 'mode="wait"' diya hai taaki animations ek-ke-baad-ek chalein.
      */}
      <div className="relative mb-8"> 
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPage} 
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            // 'absolute' hata diya hai taaki container content ke hisaab se height le
            className="w-full" 
          >
            <PriceCardList courses={coursesToShow} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. Pagination */}
      <nav className="flex items-center gap-2 text-sm">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)} 
            className={`px-3 py-1 rounded-md ${
              currentPage === number
                ? 'bg-black text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
};

export default AvailableCourses;

