// 'use client';

// import React, { useEffect, use, useMemo } from 'react';
// import { Loader2, PlayCircle, ArrowLeft, AlertCircle, Info, Globe, Calendar, Clock, Video } from 'lucide-react';
// import Link from 'next/link';
// import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

// // Redux Action
// import { fetchCourseContent } from '@/lib/store/features/courseSlice';

// const AdminLectureDetailPage = ({ params }: { params: Promise<any> }) => {
//     const resolvedParams = use(params);

//     const { id, sectionId, lectureId } = resolvedParams;
//     const courseIdNum = Number(id);
//     const dispatch = useAppDispatch();

//     // # 1. REDUX CACHE ACCESS
//     const { courseContent, loading } = useAppSelector((state) => state.course);
//     const fullData = courseContent[courseIdNum];

//     // # 2. FIND LECTURE FROM CACHE
//     const lecture = useMemo(() => {
//         if (!fullData?.sections) return null;
//         const section = fullData.sections.find((s: any) => s.id === Number(sectionId));
//         return section?.lectures?.find((l: any) => l.id === Number(lectureId));
//     }, [fullData, sectionId, lectureId]);

//     // # 3. HYDRATION
//     useEffect(() => {
//         if (!fullData && courseIdNum) {
//             dispatch(fetchCourseContent(courseIdNum));
//         }
//     }, [courseIdNum, fullData, dispatch]);

//     const isCourseLoading = loading.courseContent[courseIdNum];

//     if (!lecture && isCourseLoading) return (
//         <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
//             <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
//             <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">Initialising Secure Stream...</p>
//         </div>
//     );

//     if (!lecture && !isCourseLoading) return (
//         <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-app-bg">
//             <AlertCircle className="text-red-500 mb-4" size={48} />
//             <h2 className="text-xl font-black text-text-main uppercase tracking-tight">Lecture Metadata Missing</h2>
//             <p className="text-text-muted mt-2 mb-6 max-w-md font-medium text-sm">Terminal Note: Is lecture ka data Redux store mein nahi mil saka.</p>
//             <Link href={`/admin/courses/${id}`} className="px-8 py-3 bg-accent-blue text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-accent-blue/20 hover:bg-hover-blue">Back to Course</Link>
//         </div>
//     );

//     return (
//         <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in pb-20 bg-app-bg min-h-screen text-text-main">

//             <Link href={`/admin/courses/${id}`} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-black text-xs uppercase tracking-widest group">
//                 <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Course Details
//             </Link>

//             {/* # PREMIUM VIDEO PLAYER / MEETING UI: Uses card-bg and hero-registry-card logic */}
//             <div className="bg-black rounded-[3rem] overflow-hidden shadow-2xl border-4 border-card-bg aspect-video relative flex items-center justify-center ring-1 ring-border-subtle">
//                 {lecture.lectureType === 'recorded' && lecture.videoUrl ? (
//                     <video key={lecture.videoUrl} controls className="w-full h-full object-contain">
//                         <source src={lecture.videoUrl} type="video/mp4" />
//                         Your browser does not support the video tag.
//                     </video>
//                 ) : lecture.lectureType === 'online' ? (
//                     <div className="text-center p-10 w-full h-full hero-registry-card flex flex-col items-center justify-center relative overflow-hidden">
//                         {/* Background Glow */}
//                         <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>

//                         <div className="w-24 h-24 bg-card-bg/5 rounded-[2.5rem] flex items-center justify-center mb-10 border border-card-bg/10 shadow-inner relative z-10">
//                             <Globe size={48} className="text-accent-blue animate-pulse" />
//                         </div>

//                         <h3 className="text-text-main text-3xl md:text-4xl font-black tracking-tight mb-4 relative z-10 uppercase">Admin Session Room</h3>

//                         <div className="flex gap-6 mb-12 relative z-10">
//                             <div className="flex items-center gap-2 text-text-main/60 text-xs font-bold uppercase tracking-widest bg-card-bg/5 px-4 py-2 rounded-xl border border-card-bg/5">
//                                 <Calendar size={14} className="text-accent-blue" />
//                                 {lecture.liveStart ? new Date(lecture.liveStart).toLocaleDateString('en-GB') : 'N/A'}
//                             </div>
//                             <div className="flex items-center gap-2 text-text-main/60 text-xs font-bold uppercase tracking-widest bg-card-bg/5 px-4 py-2 rounded-xl border border-card-bg/5">
//                                 <Clock size={14} className="text-accent-blue" />
//                                 {lecture.liveStart ? new Date(lecture.liveStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
//                             </div>
//                         </div>

//                         <a
//                             href={lecture.meetingLink}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="group relative inline-flex items-center gap-4 px-14 py-6 bg-accent-blue text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-hover-blue shadow-[0_20px_50px_rgba(37,99,235,0.3)] active:scale-95 z-10"
//                         >
//                             <Video size={24} className="group-hover:rotate-12 transition-transform" />
//                             <span>Preview Live Link</span>
//                         </a>
//                     </div>
//                 ) : (
//                     <div className="text-center space-y-4">
//                         <AlertCircle size={48} className="text-text-muted opacity-30 mx-auto" />
//                         <p className="text-text-muted font-bold tracking-widest uppercase text-xs text-center">Processing Admin Content...</p>
//                     </div>
//                 )}
//             </div>

//             {/* Lecture Content Details Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                 <div className="lg:col-span-2 space-y-6">
//                     {/* Main Desc Card: White box replaced with bg-card-bg */}
//                     <div className="bg-card-bg rounded-[2.5rem] p-8 md:p-10 border border-border-subtle shadow-sm relative overflow-hidden">
//                         <div className="flex items-center gap-4 mb-8">
//                             <div className="w-14 h-14 bg-accent-blue/10 rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-accent-blue/20">
//                                 <PlayCircle size={32} className="text-accent-blue" />
//                             </div>
//                             <div>
//                                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-blue">Asset Overview</span>
//                                 <h1 className="text-2xl md:text-3xl font-black text-text-main tracking-tight leading-none mt-1 uppercase">{lecture.title}</h1>
//                             </div>
//                         </div>

//                         <div className="space-y-4 pt-6 border-t border-border-subtle">
//                             <h3 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
//                                 <Info size={14} /> Description
//                             </h3>
//                             <p className="text-text-muted leading-relaxed font-medium text-base">
//                                 {lecture.description || "Is lecture ke liye koi tafseel faraham nahi ki gayi."}
//                             </p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Metadata Sidebar: Now using the premium hero-registry-card look */}
//                 <div className="space-y-6">
//                     <div className="hero-registry-card rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
//                         <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-blue/5 rounded-full blur-3xl -ml-16 -mb-16"></div>
//                         <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-accent-blue mb-8 border-b border-border-subtle pb-4">Lecture Metadata</h4>
//                         <div className="space-y-6 relative z-10">
//                             <div className="flex justify-between items-center border-b border-border-subtle pb-3">
//                                 <span className="text-xs text-text-muted font-bold uppercase tracking-tighter">Runtime</span>
//                                 <span className="text-xs font-black bg-app-bg px-3 py-1.5 rounded-lg text-text-main border border-border-subtle">{lecture.duration || '00'} Mins</span>
//                             </div>
//                             <div className="flex justify-between items-center border-b border-border-subtle pb-3">
//                                 <span className="text-xs text-text-muted font-bold uppercase tracking-tighter">Sequence</span>
//                                 <span className="text-xs font-black text-accent-blue"># {lecture.lectureOrder || '1'}</span>
//                             </div>
//                             <div className="flex justify-between items-center">
//                                 <span className="text-xs text-text-muted font-bold uppercase tracking-tighter">Modality</span>
//                                 <span className="text-[9px] font-black uppercase bg-accent-blue text-white px-3 py-1.5 rounded-lg shadow-lg shadow-accent-blue/20">{lecture.lectureType}</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AdminLectureDetailPage;


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

const AdminLectureDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);

    const { id, sectionId, lectureId } = resolvedParams;
    const courseIdNum = Number(id);
    const dispatch = useAppDispatch();

    // # 1. REDUX CACHE ACCESS
    const { courseContent, loading } = useAppSelector((state) => state.course);
    const fullData = courseContent[courseIdNum];

    // # 2. FIND LECTURE FROM CACHE
    const lecture = useMemo(() => {
        if (!fullData?.sections) return null;
        const section = fullData.sections.find((s: any) => s.id === Number(sectionId));
        return section?.lectures?.find((l: any) => l.id === Number(lectureId));
    }, [fullData, sectionId, lectureId]);

    // # 3. HYDRATION
    useEffect(() => {
        if (!fullData && courseIdNum) {
            dispatch(fetchCourseContent(courseIdNum));
        }
    }, [courseIdNum, fullData, dispatch]);

    // 👉 THE BULLETPROOF LOADING FIX
    const isFetchingFromAPI = loading.courseContent[courseIdNum] === true;
    
    // Agar API abhi chal rahi hai, ya API khatam ho gai par data nahi aaya (edge case delay)
    if (isFetchingFromAPI || (!fullData && loading.courseContent[courseIdNum] === undefined)) {
        return (
            <div className="h-full min-h-[80vh] flex flex-col items-center justify-center bg-app-bg">
                <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
                <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading Content...</p>
            </div>
        );
    }

    if (!lecture) {
        return (
            <div className="h-full min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-app-bg">
                <AlertCircle className="text-red-500 mb-4" size={40} />
                <h2 className="font-extrabold text-text-main tracking-tight text-xl mb-2">Lecture Metadata Missing</h2>
                <p className="text-text-muted text-sm font-medium mb-6">Terminal Note: Is lecture ka data system mein nahi mil saka.</p>
                <Link href={`/admin/courses/${id}`} className="text-accent-blue text-sm font-bold hover:underline transition-all">Return to Course</Link>
            </div>
        );
    }

    // YouTube check
    const youtubeEmbedUrl = getYouTubeEmbedUrl(lecture?.videoUrl || '');

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in pb-20 bg-app-bg min-h-screen text-text-main slide-in-from-top-4">
            
            {/* Top Navigation */}
            <Link href={`/admin/courses/${id}`} className="inline-flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold text-xs uppercase tracking-wider transition-colors mb-2">
                <ArrowLeft size={16} /> Course Terminal
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
                            This lecture has no video URL yet. Attach a video to make it playable.
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
                        
                        <h3 className="text-text-main text-2xl md:text-3xl font-extrabold tracking-tight mb-6 capitalize relative z-10">Admin Session Room</h3>
                        
                        <div className="flex flex-wrap justify-center gap-4 mb-8 relative z-10">
                            <div className="flex items-center gap-2 text-text-main text-xs font-bold bg-card-bg px-4 py-2 rounded-xl border border-border-subtle shadow-sm">
                                <Calendar size={16} className="text-accent-blue" /> 
                                {lecture.liveStart ? new Date(lecture.liveStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 text-text-main text-xs font-bold bg-card-bg px-4 py-2 rounded-xl border border-border-subtle shadow-sm">
                                <Clock size={16} className="text-accent-blue" /> 
                                {lecture.liveStart ? new Date(lecture.liveStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </div>
                        </div>

                        {lecture.meetingLink ? (
                            <a
                                href={lecture.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-blue text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-hover-blue transition-colors shadow-md relative z-10"
                            >
                                <Video size={18} /> Preview Live Link
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
                        {lecture.description || "Is lecture ke liye koi tafseel faraham nahi ki gayi."}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AdminLectureDetailPage;