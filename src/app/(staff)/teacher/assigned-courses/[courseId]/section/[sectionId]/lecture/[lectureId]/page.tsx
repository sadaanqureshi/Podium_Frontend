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

    // # 2. FIND LECTURE FROM CACHE
    const lecture = useMemo(() => {
        if (!fullData?.sections) return null;
        const section = fullData.sections.find((s: any) => s.id === Number(sectionId));
        return section?.lectures?.find((l: any) => l.id === Number(lectureId));
    }, [fullData, sectionId, lectureId]);

    // # 3. HYDRATION
    useEffect(() => {
        if (!fullData && courseId) {
            dispatch(fetchCourseContent(Number(courseId)));
        }
    }, [courseId, fullData, dispatch]);

    const isCourseLoading = loading.courseContent[Number(courseId)];

    if (!lecture && isCourseLoading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
            <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
            <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">Opening Secure Stream...</p>
        </div>
    );

    if (!lecture && !isCourseLoading) return (
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-app-bg">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-black text-text-main uppercase tracking-tight">Lecture Not Found</h2>
            <p className="text-text-muted mt-2 mb-6 max-w-md font-medium text-sm">Yeh content abhi available nahi hai ya link expire ho chuka hai.</p>
            <Link href={`/teacher/assigned-courses/${courseId}`} className="px-8 py-3 bg-accent-blue text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-accent-blue/20 hover:bg-hover-blue transition-all">Back to Course Details</Link>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in pb-20 bg-app-bg min-h-screen text-text-main ">
            {/* Navigation */}
            <Link href={`/teacher/assigned-courses/${courseId}`} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-black text-xs uppercase tracking-widest transition-all group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Course Details
            </Link>

            {/* # VIDEO PLAYER / MEETING UI: Uses card-bg for dark mode layering */}
            <div className="bg-black rounded-[3rem] overflow-hidden shadow-2xl border-4 border-card-bg aspect-video relative flex items-center justify-center ring-1 ring-border-subtle">
                {lecture.lectureType === 'recorded' && lecture.videoUrl ? (
                    <video key={lecture.videoUrl} controls className="w-full h-full object-contain">
                        <source src={lecture.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : lecture.lectureType === 'online' ? (
                    <div className="text-center p-10 w-full h-full hero-registry-card flex flex-col items-center justify-center relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                        <div className="w-24 h-24 bg-card-bg/10 rounded-[2.5rem] flex items-center justify-center mb-10 border border-card-bg/20 shadow-inner relative z-10">
                            <Globe size={48} className="text-accent-blue animate-pulse" />
                        </div>

                        <h3 className="text-text-main text-3xl md:text-4xl font-black tracking-tight mb-4 relative z-10 uppercase leading-none">Live Session Room</h3>

                        <div className="flex gap-6 mb-12 relative z-10">
                            <div className="flex items-center gap-2 text-text-main/60 text-xs font-bold uppercase tracking-widest bg-card-bg/20 px-4 py-2 rounded-xl border border-border-subtle">
                                <Calendar size={14} className="text-accent-blue" />
                                {new Date(lecture.liveStart).toLocaleDateString('en-GB')}
                            </div>
                            <div className="flex items-center gap-2 text-text-main/60 text-xs font-bold uppercase tracking-widest bg-card-bg/20 px-4 py-2 rounded-xl border border-border-subtle">
                                <Clock size={14} className="text-accent-blue" />
                                {new Date(lecture.liveStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        <a
                            href={lecture.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex items-center gap-4 px-14 py-6 bg-accent-blue text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-hover-blue shadow-xl active:scale-95 z-10"
                        >
                            <Video size={24} className="group-hover:rotate-12 transition-transform" />
                            <span>Launch Google Meet</span>
                        </a>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <AlertCircle size={48} className="text-text-muted opacity-30 mx-auto" />
                        <p className="text-text-muted font-bold tracking-widest uppercase text-xs">Processing Content...</p>
                    </div>
                )}
            </div>

            {/* Lecture Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Description Card: White box replaced with bg-card-bg */}
                    <div className="bg-card-bg rounded-[2.5rem] p-8 md:p-10 border border-border-subtle shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-accent-blue/10 rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-accent-blue/20">
                                <PlayCircle size={32} className="text-accent-blue" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-blue">Class Session</span>
                                <h1 className="text-2xl md:text-3xl font-black text-text-main tracking-tight leading-none mt-1 uppercase">{lecture.title}</h1>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-border-subtle">
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                                <Info size={14} /> Lesson Info
                            </h3>
                            <p className="text-text-muted leading-relaxed font-medium text-base md:text-lg">
                                {lecture.description || "Is lecture ke liye koi description available nahi hai."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info Card: Uses hero-registry-card look */}
                <div className="space-y-6">
                    <div className="hero-registry-card rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-blue/5 rounded-full blur-3xl -ml-16 -mb-16"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-accent-blue mb-8 border-b border-border-subtle pb-4">Lecture Intel</h4>
                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
                                <span className="text-xs text-text-muted font-bold uppercase tracking-tighter">Time</span>
                                <span className="text-xs font-black bg-app-bg px-3 py-1.5 rounded-lg text-text-main border border-border-subtle">{lecture.duration || '00'} Mins</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
                                <span className="text-xs text-text-muted font-bold uppercase tracking-tighter">Order</span>
                                <span className="text-xs font-black text-accent-blue"># {lecture.lectureOrder || '1'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-text-muted font-bold uppercase tracking-tighter">Type</span>
                                <span className="text-[9px] font-black uppercase bg-accent-blue text-white px-3 py-1.5 rounded-lg shadow-lg shadow-accent-blue/20">{lecture.lectureType}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LectureDetailPage;