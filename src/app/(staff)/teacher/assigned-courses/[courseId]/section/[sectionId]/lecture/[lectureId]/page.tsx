'use client';

import React, { useEffect, use, useMemo } from 'react';
import { Loader2, PlayCircle, ArrowLeft, AlertCircle, Info, Globe, Calendar, Clock, Video } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

// Redux Action
import { fetchCourseContent } from '@/lib/store/features/courseSlice';

const LectureDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const { courseId, sectionId, lectureId } = resolvedParams;
    const dispatch = useAppDispatch();

    // # 1. REDUX CACHE ACCESS
    const { courseContent, loading } = useAppSelector((state) => state.course);
    const fullData = courseContent[Number(courseId)];

    // # 2. FIND LECTURE FROM CACHE (Logic Optimization)
    // Hum nested sections mein se sahi section aur phir sahi lecture dhoond rahe hain
    const lecture = useMemo(() => {
        if (!fullData?.sections) return null;
        const section = fullData.sections.find((s: any) => s.id === Number(sectionId));
        return section?.lectures?.find((l: any) => l.id === Number(lectureId));
    }, [fullData, sectionId, lectureId]);

    // # 3. HYDRATION: Agar refresh karein ya direct URL kholen toh fetch karein
    useEffect(() => {
        if (!fullData && courseId) {
            dispatch(fetchCourseContent(Number(courseId)));
        }
    }, [courseId, fullData, dispatch]);

    // UI Loading State (Specific to this course)
    const isCourseLoading = loading.courseContent[Number(courseId)];

    if (!lecture && isCourseLoading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Initialising Secure Stream...</p>
        </div>
    );

    if (!lecture && !isCourseLoading) return (
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-black text-[#0F172A]">Lecture Unavailable</h2>
            <p className="text-slate-500 mt-2 mb-6 max-w-md italic text-sm">Yeh content ya toh delete ho chuka hai ya aapke pas iska access nahi hai.</p>
            <Link href={`/teacher/assigned-courses/${courseId}`} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-700 transition-all">Back to Dashboard</Link>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 text-[#0F172A]">
            {/* Navigation */}
            <Link href={`/teacher/assigned-courses/${courseId}`} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Course Material
            </Link>

            {/* # PREMIUM VIDEO PLAYER / MEETING UI */}
            <div className="bg-black rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white aspect-video relative flex items-center justify-center ring-1 ring-slate-200">
                {lecture.lectureType === 'recorded' && lecture.videoUrl ? (
                    <video key={lecture.videoUrl} controls className="w-full h-full object-contain">
                        <source src={lecture.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : lecture.lectureType === 'online' ? (
                    <div className="text-center p-10 w-full h-full bg-[#0F172A] flex flex-col items-center justify-center relative overflow-hidden">
                        {/* Animated Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                        
                        <div className="w-24 h-24 bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center mb-10 border border-blue-500/20 shadow-inner relative z-10">
                            <Globe size={48} className="text-blue-400 animate-pulse" />
                        </div>

                        <h3 className="text-white text-3xl md:text-4xl font-black tracking-tight mb-4 relative z-10 uppercase">Live Session Room</h3>

                        <div className="flex gap-6 mb-12 relative z-10">
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">
                                <Calendar size={14} className="text-blue-500" />
                                {new Date(lecture.liveStart).toLocaleDateString('en-GB')}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">
                                <Clock size={14} className="text-blue-500" />
                                {new Date(lecture.liveStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        <a
                            href={lecture.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex items-center gap-4 px-14 py-6 bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] active:scale-95 z-10"
                        >
                            <Video size={24} className="group-hover:rotate-12 transition-transform" />
                            <span>Launch Google Meet</span>
                        </a>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <AlertCircle size={48} className="text-slate-600 mx-auto" />
                        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Processing Content...</p>
                    </div>
                )}
            </div>

            {/* Lecture Info Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner">
                                <PlayCircle size={32} className="text-blue-600" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Currently Streaming</span>
                                <h1 className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tight leading-none mt-1">{lecture.title}</h1>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-50">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Info size={14} /> Lesson Overview
                            </h3>
                            <p className="text-slate-600 leading-relaxed font-medium text-base md:text-lg italic">
                                "{lecture.description || "Is lecture ke liye koi tafseel faraham nahi ki gayi."}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Metadata Sidebar */}
                <div className="space-y-6">
                    <div className="bg-[#0F172A] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden border border-white/5">
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -ml-16 -mb-16"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 mb-8 border-b border-white/5 pb-4">Lecture Intel</h4>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Duration</span>
                                <span className="text-xs font-black bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">{lecture.duration || '00'} Mins</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Sequence</span>
                                <span className="text-xs font-black text-blue-400"># {lecture.lectureOrder || '1'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Delivery</span>
                                <span className="text-[9px] font-black uppercase bg-blue-600 px-3 py-1.5 rounded-lg shadow-lg shadow-blue-900/20">{lecture.lectureType}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LectureDetailPage;