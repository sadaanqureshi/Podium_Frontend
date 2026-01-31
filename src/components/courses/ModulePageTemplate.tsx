'use client';

import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ChevronDown, Check, Plus, Loader2, FilePlus, BookOpen, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '@/components/ui/SearchBar';
import ContentCard from '@/components/courses/ContentCard'; // Jo humne pehle banaya tha

interface ModulePageTemplateProps {
    role: 'student' | 'teacher' | 'admin';
    type: 'quiz' | 'assignment' | 'resource';
    pageTitle: string;
    subTitle: string;
    allData: any[];     // Saara raw data (Lectures/Quizzes/Assignments)
    courses: any[];     // Filters ke liye courses (Assigned or Enrolled)
    onAddClick?: () => void;
}

const ModulePageTemplate: React.FC<ModulePageTemplateProps> = ({
    role, type, pageTitle, subTitle, allData, courses, onAddClick
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [courseFilter, setCourseFilter] = useState('All');
    const [isCourseOpen, setIsCourseOpen] = useState(false);

    const isStaff = role === 'teacher' || role === 'admin';

    // 1. Dynamic Filtering Logic
    const filteredItems = useMemo(() => {
        return allData.filter(item => {
            const matchSearch = (item.title || item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.courseName || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchCourse = courseFilter === 'All' || item.courseName === courseFilter;
            return matchSearch && matchCourse;
        });
    }, [allData, searchTerm, courseFilter]);

    return (
        <div className="w-full p-4 md:p-8 max-w-7xl mx-auto font-sans">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">{pageTitle}</h1>
                    <p className="text-gray-500 mt-1 font-medium">{subTitle}</p>
                </div>
                {isStaff && (
                    <button
                        onClick={onAddClick}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-xl shadow-blue-100 active:scale-95 transition-all w-full sm:w-auto justify-center"
                    >
                        <Plus size={20} strokeWidth={3} />
                        <span>Create New {type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    </button>
                )}
            </div>

            {/* Filters Section */}
            <div className="grid grid-cols-1 md:flex items-center gap-4 mb-10">
                <div className="flex-1">
                    <SearchBar
                        placeholder={`Search ${type} or course...`}
                        onChange={(e: any) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Course Filter Dropdown */}
                <div className="relative min-w-[220px]">
                    <button
                        onClick={() => setIsCourseOpen(!isCourseOpen)}
                        className="w-full flex items-center justify-between px-5 py-3 border border-gray-100 rounded-xl bg-white text-sm font-bold text-gray-700 hover:border-blue-300 shadow-sm transition-all h-[52px]"
                    >
                        <span className="truncate">Course: {courseFilter}</span>
                        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isCourseOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isCourseOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute z-[60] w-full mt-2 bg-white border border-gray-50 rounded-2xl shadow-2xl py-3 max-h-72 overflow-y-auto"
                            >
                                <div
                                    onClick={() => { setCourseFilter('All'); setIsCourseOpen(false); }}
                                    className="px-5 py-2.5 hover:bg-blue-50 cursor-pointer text-sm font-semibold flex justify-between items-center"
                                >
                                    All Courses {courseFilter === 'All' && <Check size={16} className="text-blue-600" />}
                                </div>
                                {courses.map(course => (
                                    <div
                                        key={course.id}
                                        onClick={() => { setCourseFilter(course.courseName || course.title); setIsCourseOpen(false); }}
                                        className="px-5 py-2.5 hover:bg-blue-50 cursor-pointer text-sm font-semibold flex justify-between items-center"
                                    >
                                        {course.courseName || course.title}
                                        {courseFilter === (course.courseName || course.title) && <Check size={16} className="text-blue-600" />}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 shadow-sm h-[52px] transition-all">
                    <SlidersHorizontal size={18} /> Sort
                </button>
            </div>

            {/* Content List */}
            <div className="space-y-4">
                {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <ContentCard
                            key={item.id}
                            id={item.id}
                            title={item.title || item.name}
                            subtitle={item.courseName || 'General'}
                            type={type as any}
                            role={role}
                            onAction={() => alert(`${role} action on ${type}`)}
                            onEdit={() => alert(`Edit ${type}`)}
                            onDelete={() => alert(`Delete ${type}`)}
                        />
                    ))
                ) : (
                    <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 shadow-inner">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Layers size={40} className="text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-bold text-lg">No {type}s found.</p>
                        <p className="text-gray-300 text-sm">Try changing your filters or search term.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModulePageTemplate;