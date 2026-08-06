'use client';
import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

export const CourseInfoCard = ({ data }: { data: any }) => (
    // Container: Reduced rounding to 2xl, subtle border and shadow for a minimal look
    <div className="bg-card-bg rounded-2xl border border-border-subtle shadow-sm p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-start gap-8 animate-in fade-in slide-in-from-top-4">
        
        <div className="flex-1 space-y-6">
            {/* Header Section: Rating & Instructor */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-400/10 text-yellow-500 rounded-md">
                    <Star size={14} className="fill-yellow-500" />
                    <span>{data?.averageRating || "4.7"}</span>
                </div>
                
                <p className="text-text-muted tracking-wide">
                    Lead Instructor: <span className="text-accent-blue font-extrabold cursor-pointer hover:underline underline-offset-4 decoration-accent-blue/30 ml-1">
                        {data?.teacher ? `${data.teacher.firstName} ${data.teacher.lastName}` : "Expert Agent"}
                    </span>
                </p>
            </div>

            <div>
                {/* Course Name: Clean and bold typography */}
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-text-main leading-snug">
                    {data?.courseName || "Loading Asset..."}
                </h1>
            </div>

            {/* Introduction Section: Minimalist without heavy borders */}
            <div className="pt-2">
                <h3 className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-3">
                    Course Description
                </h3>
                <p className="text-text-muted text-sm leading-relaxed max-w-2xl font-medium">
                    {data?.shortDescription || "Analyzing core fundamentals with expert-led curriculum and hands-on simulation projects."}
                </p>
            </div>
        </div>

        {/* Cover Image Container: Standard rounding (xl) with a clean subtle border */}
        <div className="relative w-full md:w-[320px] aspect-video md:h-48 rounded-xl overflow-hidden shadow-sm border border-border-subtle group flex-shrink-0 bg-app-bg">
            <Image 
                src={data?.coverImg || "/blankcover.jpg"} 
                alt="Course Visual" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                unoptimized 
            />
            {/* Very subtle gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
        </div>
    </div>
);