'use client';
import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

export const CourseInfoCard = ({ data }: { data: any }) => (
    // Container: bg-card-bg aur border-border-subtle automatic theme sync handle karenge
    <div className="bg-card-bg rounded-[2.5rem] border border-border-subtle shadow-sm md:p-8 p-6 mb-8 flex flex-col md:flex-row justify-between items-start gap-8 animate-in fade-in slide-in-from-top-4 duration-700 transition-colors">
        
        <div className="flex-1 space-y-5">
            {/* Rating Section: Using text-text-main aur text-text-muted */}
            <div className="flex items-center gap-1.5 text-sm font-black uppercase tracking-widest">
                <Star size={18} className="text-yellow-400 fill-yellow-400" />
                <span className="text-text-main">{data?.averageRating || "4.7"}</span>
                <span className="text-text-muted opacity-60">({data?.ratingCount || "2,345"} Registry)</span>
            </div>

            <div>
                {/* Course Name: text-text-main for high contrast */}
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-text-main mb-2 uppercase leading-tight">
                    {data?.courseName || "Loading Asset..."}
                </h1>
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider">
                    Lead Instructor: <span className="text-accent-blue cursor-pointer hover:underline underline-offset-4 decoration-accent-blue/30">
                        {data?.teacher ? `${data.teacher.firstName} ${data.teacher.lastName}` : "Expert Agent"}
                    </span>
                </p>
            </div>

            {/* Introduction Section */}
            <div className="pt-2 border-l-4 border-accent-blue/20 pl-6">
                <h3 className="text-sm font-black text-text-main uppercase tracking-[0.2em] mb-2">Description</h3>
                <p className="text-text-muted text-sm leading-relaxed max-w-2xl font-medium">
                    {data?.shortDescription || "Analyzing core fundamentals with expert-led curriculum and hands-on simulation projects."}
                </p>
            </div>
        </div>

        {/* Cover Image Container: border-card-bg taaki dark mode mein border background se match kare */}
        <div className="relative w-full md:w-72 h-48 rounded-[2rem] overflow-hidden shadow-2xl flex-shrink-0 border-[6px] border-app-bg bg-app-bg group transition-all">
            <Image 
                src={data?.coverImg || "/blankcover.jpg"} 
                alt="Course Visual" 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-700" 
                unoptimized 
            />
            {/* Overlay for subtle depth in dark mode */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>
    </div>
);