'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import CourseList from '@/components/courses/CourseList';
import { Filter } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import CourseFilterDropdown from '@/components/ui/CourseFilterDropdown';
import Pagination from '@/components/ui/Pagination';
import { Course } from '@/data/courses';

const COURSES_PER_PAGE = 6;

type ServerPagination = {
  page: number;
  totalPages: number;
  totalItems?: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

interface TemplateProps {
  title: string;
  description: string;
  courses: Course[];
  basePath: string;
  placeholder?: string;
  extraHeaderContent?: React.ReactNode;
  showProgress?: boolean;
  /** When set, pagination is driven by the API (current `courses` = one page). */
  serverPagination?: ServerPagination;
}

const CoursePageTemplate: React.FC<TemplateProps> = ({
  title, description, courses, basePath, placeholder, extraHeaderContent, showProgress, serverPagination
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ teacher: '', type: '' });

  const uniqueTeachers = useMemo(() => {
    const authors = courses.map(c => c.author).filter(Boolean) as string[];
    return Array.from(new Set(authors));
  }, [courses]);

  const uniqueTypes = ['Programming', 'Design', 'Business'];
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const titleMatch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const teacherMatch = filters.teacher ? course.author === filters.teacher : true;
      const typeMatch = true;
      return titleMatch && teacherMatch && typeMatch;
    });
  }, [courses, searchQuery, filters]);

  const isServerPaged = Boolean(serverPagination);
  const activePage = isServerPaged ? serverPagination!.page : currentPage;
  const totalPages = isServerPaged
    ? Math.max(1, serverPagination!.totalPages || 1)
    : Math.max(1, Math.ceil(filteredCourses.length / COURSES_PER_PAGE));
  const coursesToShow = isServerPaged
    ? filteredCourses
    : filteredCourses.slice(
        (currentPage - 1) * COURSES_PER_PAGE,
        currentPage * COURSES_PER_PAGE
      );
  const totalItems = isServerPaged
    ? (serverPagination!.totalItems ?? filteredCourses.length)
    : filteredCourses.length;

  React.useEffect(() => {
    if (!isServerPaged) setCurrentPage(1);
  }, [searchQuery, filters, isServerPaged]);

  const variants: Variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }),
  };

  const paginate = (newPage: number) => {
    if (newPage === activePage || newPage < 1 || newPage > totalPages) return;
    setDirection(newPage > activePage ? 1 : -1);
    if (isServerPaged) {
      serverPagination!.onPageChange(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  const clearFilters = () => {
    setFilters({ teacher: '', type: '' });
  };

  return (
    // FIX: Spacing tightened by using py-4 instead of py-6/py-8
    <div className="w-full px-4 md:px-8 py-4">
      
      {/* Header Section: Reduced mb-10 to mb-6 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-text-main mb-1 uppercase tracking-tight">{title} </h1>
          <p className="text-text-muted font-medium text-xs">{description}</p>
        </div>
        {extraHeaderContent}
      </div>

      {/* Toolbar: Reduced mb-8 to mb-5 */}
      <div className="relative flex flex-col sm:flex-row sm:items-center mb-6 gap-3">
        <div className="w-full sm:flex-1 sm:max-w-xl">
          <SearchBar 
            placeholder={placeholder || "Search course..."} 
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="relative w-full sm:w-auto shrink-0">
            <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full sm:w-auto h-11 flex items-center justify-center gap-2 px-5 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                    filters.teacher || filters.type 
                    ? 'bg-accent-blue/10 border-accent-blue text-accent-blue' 
                    : 'bg-card-bg border-border-subtle text-text-main hover:bg-sidebar-to/10'
                }`}
            >
                <Filter size={14} className={filters.teacher || filters.type ? "text-accent-blue" : "text-text-muted"} />
                <span>{filters.teacher || filters.type ? 'Filtered' : 'Filter'}</span>
            </button>

            <CourseFilterDropdown 
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                teachers={uniqueTeachers}
                types={uniqueTypes}
                filters={filters}
                setFilters={setFilters}
                onClear={clearFilters}
            />
        </div>
      </div>

      {/* No Results Message */}
      {filteredCourses.length === 0 && (
          <div className="w-full py-16 flex flex-col items-center justify-center text-center">
              <p className="text-text-muted font-black uppercase tracking-widest text-xs mb-1">No courses found</p>
              <p className="text-text-muted/60 text-[11px]">Try adjusting your search or filters.</p>
          </div>
      )}

      {/* Animated Course Grid: Reduced mb-12 to mb-6 to bring pagination up */}
      {filteredCourses.length > 0 && (
        <div className="relative mb-6">
            <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div key={activePage} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="w-full">
                <CourseList
                  courses={coursesToShow}
                  basePath={basePath}
                  showProgress={showProgress}
                />
            </motion.div>
            </AnimatePresence>
        </div>
      )}

      <Pagination
        variant="numbered"
        page={activePage}
        totalPages={totalPages}
        totalItems={totalItems}
        loading={serverPagination?.loading}
        onPageChange={paginate}
        hideWhenSinglePage
        align="start"
        className="pt-2"
      />
    </div>
  );
};

export default CoursePageTemplate;