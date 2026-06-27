// 'use client';
// import React, { useState } from 'react';
// import { motion, AnimatePresence, Variants } from 'framer-motion';
// import CourseList from '@/components/courses/CourseList';
// import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
// import SearchBar from '@/components/ui/SearchBar';
// import { Course } from '@/data/courses';

// const COURSES_PER_PAGE = 6;

// interface TemplateProps {
//   title: string;
//   description: string;
//   courses: Course[];
//   basePath: string;
//   placeholder?: string;
//   extraHeaderContent?: React.ReactNode;
//   showProgress?: boolean;
// }

// const CoursePageTemplate: React.FC<TemplateProps> = ({
//   title, description, courses, basePath, placeholder, extraHeaderContent, showProgress
// }) => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [direction, setDirection] = useState(0);

//   const totalPages = Math.ceil(courses.length / COURSES_PER_PAGE);
//   const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
//   const endIndex = startIndex + COURSES_PER_PAGE;
//   const coursesToShow = courses.slice(startIndex, endIndex);

//   const variants: Variants = {
//     enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
//     center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
//     exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }),
//   };

//   const paginate = (newPage: number) => {
//     if (newPage === currentPage) return;
//     setDirection(newPage > currentPage ? 1 : -1);
//     setCurrentPage(newPage);
//   };

//   return (
//     <div className="w-full md:p-8 transition-colors duration-300">
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
//         <div>
//           <h1 className="text-2xl md:text-4xl font-black text-text-main mb-1 uppercase tracking-tight">{title}</h1>
//           <p className="text-text-muted font-medium text-sm">{description}</p>
//         </div>
//         {extraHeaderContent}
//       </div>

//       {/* Toolbar */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//         <SearchBar placeholder={placeholder || "Search course..."} />
//         <button className="flex items-center gap-2 px-6 py-2.5 bg-card-bg border border-border-subtle rounded-xl text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-sidebar-to/10 shadow-sm">
//           <Filter size={16} className="text-accent-blue" />
//           <span>Filter</span>
//         </button>
//       </div>

//       {/* Animated Course Grid */}
//       <div className="relative mb-12">
//         <AnimatePresence initial={false} custom={direction} mode="wait">
//           <motion.div key={currentPage} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="w-full">
//             <CourseList courses={coursesToShow} basePath={basePath} showProgress={showProgress} />
//           </motion.div>
//         </AnimatePresence>
//       </div>

//       {/* Pagination: Themed with Accent Blue */}
//       <nav className="flex items-center justify-center sm:justify-start gap-3 text-[10px] font-black uppercase tracking-[0.15em]">
//         <button 
//           onClick={() => paginate(currentPage - 1)} 
//           disabled={currentPage === 1} 
//           className="flex items-center gap-2 px-4 py-2 text-text-muted hover:text-accent-blue disabled:opacity-30 transition-all"
//         >
//           <ChevronLeft size={16} /> <span>Prev</span>
//         </button>
        
//         <div className="flex items-center gap-2">
//             {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
//             <button 
//                 key={number} 
//                 onClick={() => paginate(number)} 
//                 className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all border ${
//                     currentPage === number 
//                     ? 'bg-accent-blue text-white border-accent-blue shadow-lg shadow-accent-blue/20 scale-110' 
//                     : 'bg-card-bg text-text-muted border-border-subtle hover:border-accent-blue/30'
//                 }`}
//             >
//                 {number}
//             </button>
//             ))}
//         </div>

//         <button 
//           onClick={() => paginate(currentPage + 1)} 
//           disabled={currentPage === totalPages} 
//           className="flex items-center gap-2 px-4 py-2 text-text-muted hover:text-accent-blue disabled:opacity-30 transition-all"
//         >
//           <span>Next</span> <ChevronRight size={16} />
//         </button>
//       </nav>
//     </div>
//   );
// };

// export default CoursePageTemplate;

// 'use client';
// import React, { useState, useMemo } from 'react';
// import { motion, AnimatePresence, Variants } from 'framer-motion';
// import CourseList from '@/components/courses/CourseList';
// import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
// import SearchBar from '@/components/ui/SearchBar';
// import CourseFilterDropdown from '@/components/ui/CourseFilterDropdown'; // Naya component import karein
// import { Course } from '@/data/courses';

// const COURSES_PER_PAGE = 6;

// interface TemplateProps {
//   title: string;
//   description: string;
//   courses: Course[];
//   basePath: string;
//   placeholder?: string;
//   extraHeaderContent?: React.ReactNode;
//   showProgress?: boolean;
// }

// const CoursePageTemplate: React.FC<TemplateProps> = ({
//   title, description, courses, basePath, placeholder, extraHeaderContent, showProgress
// }) => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [direction, setDirection] = useState(0);

//     // if (courses.length === 0) {
//     //     return (
//     //         <div className="min-h-screen flex flex-col items-center justify-center bg-app-bg text-text-main pb-20">
//     //             <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">No Enrolled Courses</p>
//     //         </div>
//     //     )
//     // }
//   // Nayi States Search aur Filter ke liye
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isFilterOpen, setIsFilterOpen] = useState(false);
//   const [filters, setFilters] = useState({ teacher: '', type: '' });

//   // 1. Unique Teachers aur Types Extract karna Dropdown ke liye
//   const uniqueTeachers = useMemo(() => {
//     const authors = courses.map(c => c.author).filter(Boolean) as string[];
//     return Array.from(new Set(authors));
//   }, [courses]);

//   // Agar aapke course object mein type ya category ho toh usay map karein, abhi main dummy 'Type A', 'Type B' le raha hun
//   // const uniqueTypes = Array.from(new Set(courses.map(c => c.category))); 
//   const uniqueTypes = ['Programming', 'Design', 'Business']; // Isay apne actual data se replace kar lijiye ga

//   // 2. Search aur Filter Logic Apply karna
//   const filteredCourses = useMemo(() => {
//     return courses.filter(course => {
//       const titleMatch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
//       const teacherMatch = filters.teacher ? course.author === filters.teacher : true;
      
//       // Agar type property backend se aa rahi hai toh usay match karein
//       // const typeMatch = filters.type ? course.category === filters.type : true;
//       const typeMatch = true; // Abhi ke liye true rakha hai jab tak aap asli category property na de dein

//       return titleMatch && teacherMatch && typeMatch;
//     });
//   }, [courses, searchQuery, filters]);

//   // 3. Pagination Logic (Ab 'filteredCourses' par apply hogi)
//   const totalPages = Math.max(1, Math.ceil(filteredCourses.length / COURSES_PER_PAGE));
//   const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
//   const endIndex = startIndex + COURSES_PER_PAGE;
//   const coursesToShow = filteredCourses.slice(startIndex, endIndex);

//   // Agar user filter karta hai aur elements kam ho jatay hain toh wapas page 1 par le aao
//   React.useEffect(() => {
//     setCurrentPage(1);
//   }, [searchQuery, filters]);

//   const variants: Variants = {
//     enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
//     center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
//     exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }),
//   };

//   const paginate = (newPage: number) => {
//     if (newPage === currentPage || newPage < 1 || newPage > totalPages) return;
//     setDirection(newPage > currentPage ? 1 : -1);
//     setCurrentPage(newPage);
//   };

//   const clearFilters = () => {
//     setFilters({ teacher: '', type: '' });
//   };

//   return (
//     // FIX: mobile screen ke liye 'px-4' add kiya hai taake card chupke nahi
//     <div className="w-full px-4 md:px-8 py-6 md:py-8 transition-colors duration-300">
      
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
//         <div>
//           <h1 className="text-2xl md:text-4xl font-black text-text-main mb-1 uppercase tracking-tight">{title}</h1>
//           <p className="text-text-muted font-medium text-sm">{description}</p>
//         </div>
//         {extraHeaderContent}
//       </div>

//       {/* Toolbar (Relative position add ki taake dropdown yahan show ho) */}
//       <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
//         <div className="w-full sm:w-1/2 md:w-1/3">
//           {/* Ensure your SearchBar component accepts these props */}
//           <SearchBar 
//             placeholder={placeholder || "Search course..."} 
//             value={searchQuery}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
//           />
//         </div>
        
//         <div className="relative w-full sm:w-auto">
//             <button 
//                 onClick={() => setIsFilterOpen(!isFilterOpen)}
//                 className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 border rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm ${
//                     filters.teacher || filters.type 
//                     ? 'bg-accent-blue/10 border-accent-blue text-accent-blue' 
//                     : 'bg-card-bg border-border-subtle text-text-main hover:bg-sidebar-to/10'
//                 }`}
//             >
//                 <Filter size={16} className={filters.teacher || filters.type ? "text-accent-blue" : "text-text-muted"} />
//                 <span>{filters.teacher || filters.type ? 'Filtered' : 'Filter'}</span>
//             </button>

//             {/* Render Custom Dropdown Modal */}
//             <CourseFilterDropdown 
//                 isOpen={isFilterOpen}
//                 onClose={() => setIsFilterOpen(false)}
//                 teachers={uniqueTeachers}
//                 types={uniqueTypes}
//                 filters={filters}
//                 setFilters={setFilters}
//                 onClear={clearFilters}
//             />
//         </div>
//       </div>

//       {/* No Results Message */}
//       {filteredCourses.length === 0 && (
//           <div className="w-full py-20 flex flex-col items-center justify-center text-center">
//               <p className="text-text-muted font-black uppercase tracking-widest text-sm mb-2">No courses found</p>
//               <p className="text-text-muted/60 text-xs">Try adjusting your search or filters.</p>
//           </div>
//       )}

//       {/* Animated Course Grid */}
//       {filteredCourses.length > 0 && (
//         <div className="relative mb-12">
//             <AnimatePresence initial={false} custom={direction} mode="wait">
//             <motion.div key={currentPage} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="w-full">
//                 <CourseList courses={coursesToShow} basePath={basePath} showProgress={showProgress} />
//             </motion.div>
//             </AnimatePresence>
//         </div>
//       )}

//       {/* Pagination (Hide if 1 page or empty) */}
//       {totalPages > 1 && (
//         <nav className="flex items-center justify-center sm:justify-start gap-3 text-[10px] font-black uppercase tracking-[0.15em]">
//             <button 
//             onClick={() => paginate(currentPage - 1)} 
//             disabled={currentPage === 1} 
//             className="flex items-center gap-2 px-4 py-2 text-text-muted hover:text-accent-blue disabled:opacity-30 transition-all"
//             >
//             <ChevronLeft size={16} /> <span>Prev</span>
//             </button>
            
//             <div className="flex items-center gap-2">
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
//                 <button 
//                     key={number} 
//                     onClick={() => paginate(number)} 
//                     className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all border ${
//                         currentPage === number 
//                         ? 'bg-accent-blue text-white border-accent-blue shadow-lg shadow-accent-blue/20 scale-110' 
//                         : 'bg-card-bg text-text-muted border-border-subtle hover:border-accent-blue/30'
//                     }`}
//                 >
//                     {number}
//                 </button>
//                 ))}
//             </div>

//             <button 
//             onClick={() => paginate(currentPage + 1)} 
//             disabled={currentPage === totalPages} 
//             className="flex items-center gap-2 px-4 py-2 text-text-muted hover:text-accent-blue disabled:opacity-30 transition-all"
//             >
//             <span>Next</span> <ChevronRight size={16} />
//             </button>
//         </nav>
//       )}
//     </div>
//   );
// };

// export default CoursePageTemplate;

'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import CourseList from '@/components/courses/CourseList';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import CourseFilterDropdown from '@/components/ui/CourseFilterDropdown';
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

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / COURSES_PER_PAGE));
  const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
  const endIndex = startIndex + COURSES_PER_PAGE;
  const coursesToShow = filteredCourses.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const variants: Variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }),
  };

  const paginate = (newPage: number) => {
    if (newPage === currentPage || newPage < 1 || newPage > totalPages) return;
    setDirection(newPage > currentPage ? 1 : -1);
    setCurrentPage(newPage);
  };

  const clearFilters = () => {
    setFilters({ teacher: '', type: '' });
  };

  return (
    // FIX: Spacing tightened by using py-4 instead of py-6/py-8
    <div className="w-full px-4 md:px-8 py-4 transition-colors duration-300">
      
      {/* Header Section: Reduced mb-10 to mb-6 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-text-main mb-1 uppercase tracking-tight">{title}</h1>
          <p className="text-text-muted font-medium text-xs">{description}</p>
        </div>
        {extraHeaderContent}
      </div>

      {/* Toolbar: Reduced mb-8 to mb-5 */}
      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
        <div className="w-full sm:w-1/2 md:w-1/3">
          <SearchBar 
            placeholder={placeholder || "Search course..."} 
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="relative w-full sm:w-auto">
            <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
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
            <motion.div key={currentPage} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="w-full">
                <CourseList courses={coursesToShow} basePath={basePath} showProgress={showProgress} />
            </motion.div>
            </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center sm:justify-start gap-2 text-[10px] font-black uppercase tracking-[0.15em]">
            <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1} 
            className="flex items-center gap-1.5 px-3 py-1.5 text-text-muted hover:text-accent-blue disabled:opacity-30 transition-all"
            >
            <ChevronLeft size={14} /> <span>Prev</span>
            </button>
            
            <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button 
                    key={number} 
                    onClick={() => paginate(number)} 
                    className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all border ${
                        currentPage === number 
                        ? 'bg-accent-blue text-white border-accent-blue shadow-lg shadow-accent-blue/20 scale-105' 
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-text-muted hover:text-accent-blue disabled:opacity-30 transition-all"
            >
            <span>Next</span> <ChevronRight size={14} />
            </button>
        </nav>
      )}
    </div>
  );
};

export default CoursePageTemplate;