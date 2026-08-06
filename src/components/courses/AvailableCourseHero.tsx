'use client';
import React, { useEffect, use, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchCourseContent } from '@/lib/store/features/courseSlice';
import { 
    Loader2, BookOpen, Clock, ArrowLeft, 
    CheckCircle, Star, Info, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// 👉 NAYA COMPONENT (AvailableCourseHero)
// Design inspired by the CourseInfoCard you provided
const AvailableCourseHero = ({ course }: { course: any }) => {
    return (
        <div className="bg-card-bg rounded-2xl border border-border-subtle shadow-sm p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start gap-8 animate-in fade-in slide-in-from-top-4">
            
            {/* Subtle background blob for modern feel */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>

            <div className="flex-1 space-y-6 relative z-10">
                {/* Header Section: Rating, Instructor, Language */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-400/10 text-yellow-500 rounded-md">
                        <Star size={14} className="fill-yellow-500" />
                        <span>{course?.avgRating || "0.0"}</span>
                    </div>
                    
                    <p className="text-text-muted tracking-wide">
                        Lead Instructor: <span className="text-accent-blue font-extrabold ml-1">
                            {course?.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : "Expert Agent"}
                        </span>
                    </p>
                    
                    <span className="px-2 py-0.5 border border-border-subtle bg-app-bg rounded-md text-[10px] text-text-muted uppercase tracking-widest">
                        {course?.languages || 'English'}
                    </span>
                </div>

                <div>
                    {/* Course Name */}
                    <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-text-main leading-snug uppercase">
                        {course?.courseName || "Untitled Course"}
                    </h1>
                </div>

                {/* Introduction Section */}
                <div className="pt-2">
                    <h3 className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-3">
                        Course Summary
                    </h3>
                    <p className="text-text-muted text-sm leading-relaxed max-w-2xl font-medium">
                        {course?.shortDescription || "No short description provided."}
                    </p>
                </div>
            </div>

            {/* Cover Image Container */}
            <div className="relative w-full md:w-[320px] aspect-video md:h-48 rounded-xl overflow-hidden shadow-sm border border-border-subtle group flex-shrink-0 bg-app-bg z-10">
                {course?.coverImg ? (
                    <img 
                        src={course.coverImg} 
                        alt="Course Visual" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={40} className="text-text-muted/30" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
};
export default AvailableCourseHero