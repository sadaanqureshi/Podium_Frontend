'use client';

import React, { useState, useEffect } from 'react'; 
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Framer Motion imports
import { motion, AnimatePresence, Variants } from 'framer-motion'; 
import { FaBox } from 'react-icons/fa';
import {
  LayoutDashboard,
  BookOpen,
  NotepadText,
  ChevronDown,
  ChevronRight,
  NotebookPen,
  BookCopy,
  X, // <-- 1. 'X' icon ko import karein
} from 'lucide-react';

// 1. Naya interface banayein taaki component prop le sake
interface WebSidebarProps {
  onLinkClick?: () => void; // Yeh function mobile drawer ko band karega
}

const WebSidebar: React.FC<WebSidebarProps> = ({ onLinkClick }) => {
  
  const pathname = usePathname();
  
  const isEnrolledActive = pathname.startsWith('/enroll-courses') || pathname.startsWith('/courses/');
  const isAvailableActive = pathname.startsWith('/available-courses');
  const isCoursesActive = isEnrolledActive || isAvailableActive;
  
  const [isCoursesOpen, setIsCoursesOpen] = useState(isCoursesActive);

  useEffect(() => {
    if (isCoursesActive) {
      setIsCoursesOpen(true);
    }
  }, [pathname, isCoursesActive]);

  const toggleCourses = () => {
    setIsCoursesOpen(!isCoursesOpen);
  };

  const baseNavItemClasses =
    'flex items-center gap-[15px] py-3 px-[10px] text-[#0F172A] rounded-md transition-colors duration-200 hover:bg-[#0F172A] hover:text-white';
  const baseSubNavItemClasses =
    'block py-2 px-[10px] mb-1 rounded-md text-[#0F172A] text-sm transition-colors duration-200 hover:bg-[#0F172A] hover:text-white';
  
  // 'Variants' type ka istemaal karein
  const subMenuVariants: Variants = {
    hidden: { opacity: 0, height: 0 },
    show: { opacity: 1, height: 'auto', transition: { duration: 0.2, ease: 'easeIn' } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  };

  return (
    <aside className="w-[260px] h-screen bg-gradient-to-b from-white to-blue-100 text-gray-200 py-5 px-[15px] font-sans block shadow-lg overflow-y-auto">
      
      {/* Header */}
      {/* 2. Header ko 'justify-between' karein taaki button right par chala jaaye */}
      <div className="flex items-center justify-between gap-3 p-[10px] pb-[30px] text-base font-bold text-[#0F172A]">
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <FaBox size={28} />
          <span>Podium Professional</span>
        </div>
        
        {/* 3. Naya Close Button (sirf tab dikhega jab 'onLinkClick' maujood ho) */}
        {onLinkClick && (
          <button
            onClick={onLinkClick} // 'onLinkClick' function (jo drawer band karta hai) yahaan call karein
            className="text-[#0F172A] p-1 bg-white/50 rounded-full"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav>
        <ul className="list-none p-0 m-0">
          
          {/* Dashboard Link */}
          <li className="mb-2">
            <Link
              href="/dashboard"
              onClick={onLinkClick} // <-- 'onClick' prop add karein
              className={`${baseNavItemClasses} ${
                pathname.startsWith('/dashboard') ? 'bg-[#0F172A] text-white' : ''
              }`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
          </li>

          {/* Courses Dropdown Section */}
          <li className="mb-2">
            <button
              onClick={toggleCourses}
              className={`${baseNavItemClasses} w-full justify-between ${
                isCoursesActive ? 'bg-[#0F172A] text-white' : ''
              }`}
            >
              <div className="flex items-center gap-[15px] ">
                <BookOpen size={20} />
                <span>Courses</span>
              </div>
              {isCoursesOpen ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>

            {/* Animated Sub-menu */}
            <AnimatePresence>
              {isCoursesOpen && (
                <motion.ul
                  className="list-none p-0 mt-2 pl-12 overflow-hidden"
                  variants={subMenuVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <li>
                    <Link
                      href="/enroll-courses"
                      onClick={onLinkClick} // <-- 'onClick' prop add karein
                      className={`${baseSubNavItemClasses} ${
                        isEnrolledActive ? 'bg-[#0F172A] text-white' : ''
                      }`}
                    >
                      Enrolled Courses
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/available-courses"
                      onClick={onLinkClick} // <-- 'onClick' prop add karein
                      className={`${baseSubNavItemClasses} ${
                        isAvailableActive ? 'bg-[#0F172A] text-white' : ''
                      }`}
                    >
                      Available Courses
                    </Link>
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </li>

          {/* Baaki ke Navigation Links */}
          <li className="mb-2">
            <Link
              href="/quizzes"
              onClick={onLinkClick} // <-- 'onClick' prop add karein
              className={`${baseNavItemClasses} ${
                pathname.startsWith('/quizzes') ? 'bg-[#0F172A] text-white' : ''
              }`}
            >
              <NotepadText size={20} />
              <span>Quizzes/Assessments</span>
            </Link>
          </li>

          <li className="mb-2">
            <Link
              href="/assignments"
              onClick={onLinkClick} // <-- 'onClick' prop add karein
              className={`${baseNavItemClasses} ${
                pathname.startsWith('/assignments') ? 'bg-[#0F172A] text-white' : ''
              }`}
            >
              <NotebookPen size={20} />
              <span>Assignments</span>
            </Link>
          </li>

          <li className="mb-2">
            <Link
              href="/notes"
              onClick={onLinkClick} // <-- 'onClick' prop add karein
              className={`${baseNavItemClasses} ${
                pathname.startsWith('/notes') ? 'bg-[#0F172A] text-white' : ''
              }`}
            >
              <BookCopy size={20} />
              <span>Notes & Resources</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default WebSidebar;

