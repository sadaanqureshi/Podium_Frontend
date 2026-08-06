

'use client';

import React, { useEffect, use, useMemo } from 'react';
import { Loader2, PlayCircle, ArrowLeft, AlertCircle, Info, Globe, Calendar, Clock, Video, VideoOff } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

// Redux Action
import { fetchCourseContent } from '@/lib/store/features/courseSlice';

// Helper Function: YouTube link ko embed link mein convert karne ke liye
const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null; 
};

const LectureDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const courseId = Number(resolvedParams?.courseId || resolvedParams?.courseid);
    const sectionId = Number(resolvedParams?.sectionId || resolvedParams?.sectionid);
    const lectureId = Number(resolvedParams?.lectureId || resolvedParams?.lectureid || resolvedParams?.id);
    const dispatch = useAppDispatch();

    const { courseContent, loading } = useAppSelector((state) => state.course);
    const fullData = courseContent[Number(courseId)];

    const lecture = useMemo(() => {
        if (!fullData?.sections) return null;
        const section = fullData.sections.find((s: any) => s.id === Number(sectionId));
        return section?.lectures?.find((l: any) => l.id === Number(lectureId));
    }, [fullData, sectionId, lectureId]);

    useEffect(() => {
        if (!fullData && courseId) {
            dispatch(fetchCourseContent(Number(courseId)));
        }
    }, [courseId, fullData, dispatch]);


    // if (!lecture && isCourseLoading) return (
    //     <div className="h-full min-h-[80vh] flex flex-col items-center justify-center bg-app-bg">
    //         <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
    //         <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading Class...</p>
    //     </div>
    // );
    const isPageLoading = loading.courseContent[Number(courseId)] || !fullData;

if (isPageLoading) return (
    <div className="h-full min-h-[80vh] flex flex-col items-center justify-center bg-app-bg">
        <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
        <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading Content...</p>
    </div>
);

    if (!lecture && !isPageLoading) return (
        <div className="h-full min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-app-bg">
            <AlertCircle className="text-red-500 mb-4" size={40} />
            <h2 className="font-extrabold text-text-main tracking-tight text-xl mb-2">Lecture Not Found</h2>
            <p className="text-text-muted text-sm font-medium mb-6">This lecture is unavailable or the link is invalid.</p>
            <Link href={`/student/enrolled-courses/${courseId}`} className="text-accent-blue text-sm font-bold hover:underline transition-all">Return to Course</Link>
        </div>
    );

    // YouTube check
    const youtubeEmbedUrl = getYouTubeEmbedUrl(lecture?.videoUrl || '');

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in pb-20 bg-app-bg min-h-screen text-text-main slide-in-from-top-4">
            
            {/* Top Navigation */}
            <Link href={`/teacher/assigned-courses/${courseId}`} className="inline-flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold text-xs uppercase tracking-wider transition-colors mb-2">
                <ArrowLeft size={16} /> Back to Course
            </Link>

            {/* Video Player / Meeting Area */}
            <div className="bg-card-bg rounded-2xl overflow-hidden shadow-sm border border-border-subtle aspect-video relative flex items-center justify-center z-10">
                {lecture.lectureType === 'recorded' && lecture.videoUrl ? (
                    youtubeEmbedUrl ? (
                        // YouTube Embed
                        <iframe
                            key={youtubeEmbedUrl}
                            className="w-full h-full object-cover bg-black"
                            src={youtubeEmbedUrl}
                            title={lecture.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        // Native Video
                        <video key={lecture.videoUrl} controls className="w-full h-full object-contain bg-black outline-none">
                            <source src={lecture.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    )
                ) : lecture.lectureType === 'recorded' ? (
                    <div className="text-center space-y-3 flex flex-col items-center justify-center h-full w-full bg-app-bg px-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                            <VideoOff size={28} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-main">
                            Video not available
                        </h3>
                        <p className="text-text-muted text-xs font-medium max-w-sm leading-relaxed">
                            This lecture has no video URL yet. Upload or attach a video to make it playable.
                        </p>
                    </div>
                ) : lecture.lectureType === 'online' ? (
                    // Live Session UI
                    <div className="text-center p-6 w-full h-full flex flex-col items-center justify-center relative bg-app-bg overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="w-16 h-16 bg-card-bg rounded-2xl flex items-center justify-center mb-6 border border-border-subtle shadow-sm relative z-10">
                            <Globe size={32} className="text-accent-blue" />
                        </div>
                        
                        <h3 className="text-text-main text-2xl md:text-3xl font-extrabold tracking-tight mb-6 capitalize relative z-10">Live Session Room</h3>
                        
                        <div className="flex flex-wrap justify-center gap-4 mb-8 relative z-10">
                            <div className="flex items-center gap-2 text-text-main text-xs font-bold bg-card-bg px-4 py-2 rounded-xl border border-border-subtle shadow-sm">
                                <Calendar size={16} className="text-accent-blue" /> 
                                {new Date(lecture.liveStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2 text-text-main text-xs font-bold bg-card-bg px-4 py-2 rounded-xl border border-border-subtle shadow-sm">
                                <Clock size={16} className="text-accent-blue" /> 
                                {new Date(lecture.liveStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        {lecture.meetingLink ? (
                            <a
                                href={lecture.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-blue text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-hover-blue transition-colors shadow-md relative z-10"
                            >
                                <Video size={18} /> Join Live Class
                            </a>
                        ) : (
                            <p className="text-text-muted text-xs font-medium relative z-10">
                                Meeting link is not available yet.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="text-center space-y-3 flex flex-col items-center justify-center h-full w-full bg-app-bg px-6">
                        <AlertCircle size={32} className="text-amber-500 mx-auto" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-main">
                            Content unavailable
                        </h3>
                        <p className="text-text-muted text-xs font-medium max-w-sm leading-relaxed">
                            This lecture cannot be played right now.
                        </p>
                    </div>
                )}
            </div>

            {/* Lecture Details & Description */}
            <div className="pt-4 space-y-6">
                
                {/* Clean Info Header */}
                <div className="bg-card-bg rounded-2xl p-6 md:p-8 border border-border-subtle shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-accent-blue bg-accent-blue/10 px-2.5 py-1 rounded-md">
                                {lecture.lectureType === 'online' ? 'Live Session' : 'Recorded Lesson'}
                            </span>
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest border border-border-subtle px-2.5 py-1 rounded-md">
                                Lesson {lecture.lectureOrder || '1'}
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight capitalize leading-tight">
                            {lecture.title}
                        </h1>
                    </div>
                    
                    {/* Duration Info (Shifted from Sidebar to Header) */}
                    {/* {lecture.lectureType === 'recorded' && (
                        <div className="shrink-0 flex items-center gap-2 bg-app-bg px-4 py-2 border border-border-subtle rounded-xl shadow-sm">
                            <PlayCircle size={18} className="text-accent-blue" />
                            <span className="text-xs font-bold text-text-main uppercase tracking-wider">{lecture.duration || '00'} Mins</span>
                        </div>
                    )} */}
                </div>

                {/* About Section */}
                <div className="bg-card-bg rounded-2xl p-6 md:p-8 border border-border-subtle shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-text-main mb-4 flex items-center gap-2 border-b border-border-subtle pb-3">
                        <Info size={16} className="text-accent-blue"/> About this lesson
                    </h3>
                    <p className="text-text-muted leading-relaxed font-medium text-sm whitespace-pre-wrap">
                        {lecture.description || "No detailed description provided for this lesson."}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default LectureDetailPage;