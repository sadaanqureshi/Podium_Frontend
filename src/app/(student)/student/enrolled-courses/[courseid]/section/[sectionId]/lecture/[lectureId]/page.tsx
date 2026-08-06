// 'use client';

// import React, { useEffect, use, useMemo } from 'react';
// import { Loader2, PlayCircle, ArrowLeft, AlertCircle, Info, Globe, Calendar, Clock, Video } from 'lucide-react';
// import Link from 'next/link';
// import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

// // Redux Action
// import { fetchCourseContent } from '@/lib/store/features/courseSlice';

// // 👉 Helper Function: YouTube link ko embed link mein convert karne ke liye
// const getYouTubeEmbedUrl = (url: string) => {
//     if (!url) return null;
//     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//     const match = url.match(regExp);

//     if (match && match[2].length === 11) {
//         return `https://www.youtube.com/embed/${match[2]}`;
//     }
//     return null; 
// };

// const LectureDetailPage = ({ params }: { params: Promise<any> }) => {
//     const resolvedParams = use(params);
//     const courseId = Number(resolvedParams?.courseId || resolvedParams?.courseid);
//     const sectionId = Number(resolvedParams?.sectionId || resolvedParams?.sectionid);
//     const lectureId = Number(resolvedParams?.lectureId || resolvedParams?.lectureid || resolvedParams?.id);
//     const dispatch = useAppDispatch();

//     const { courseContent, loading } = useAppSelector((state) => state.course);
//     const fullData = courseContent[Number(courseId)];

//     const lecture = useMemo(() => {
//         if (!fullData?.sections) return null;
//         const section = fullData.sections.find((s: any) => s.id === Number(sectionId));
//         return section?.lectures?.find((l: any) => l.id === Number(lectureId));
//     }, [fullData, sectionId, lectureId]);

//     useEffect(() => {
//         if (!fullData && courseId) {
//             dispatch(fetchCourseContent(Number(courseId)));
//         }
//     }, [courseId, fullData, dispatch]);

//     const isCourseLoading = loading.courseContent[Number(courseId)];

//     if (!lecture && isCourseLoading) return (
//         <div className="h-[80vh] flex flex-col items-center justify-center bg-app-bg">
//             <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
//             <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading Class...</p>
//         </div>
//     );

//     if (!lecture && !isCourseLoading) return (
//         <div className="h-[80vh] flex flex-col items-center justify-center text-center px-4">
//             <AlertCircle className="text-red-500 mb-4" size={40} />
//             <h2 className="font-black uppercase tracking-widest text-sm mb-2">Lecture Not Found</h2>
//             <p className="text-text-muted text-[11px] font-medium mb-6">This lecture is unavailable or the link is invalid.</p>
//             <Link href={`/student/enrolled-courses/${courseId}`} className="text-accent-blue text-xs font-bold hover:underline transition-all">Return to Course</Link>
//         </div>
//     );

//     // YouTube check
//     const youtubeEmbedUrl = getYouTubeEmbedUrl(lecture?.videoUrl || '');

//     return (
//         <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in pb-20 bg-app-bg h-full text-text-main">
            
//             <Link href={`/student/enrolled-courses/${courseId}`} className="inline-flex items-center gap-2 text-text-muted hover:text-text-main font-bold text-xs uppercase tracking-wider transition-colors mb-2">
//                 <ArrowLeft size={16} /> Back to Course
//             </Link>

//             {/* Video Player / Meeting Area */}
//             <div className="bg-card-bg rounded-2xl overflow-hidden shadow-sm border border-border-subtle aspect-video relative flex items-center justify-center">
//                 {lecture.lectureType === 'recorded' && lecture.videoUrl ? (
//                     youtubeEmbedUrl ? (
//                         // 👉 Agar YouTube link hai toh Iframe use karo
//                         <iframe
//                             key={youtubeEmbedUrl}
//                             className="w-full h-full object-contain bg-black"
//                             src={youtubeEmbedUrl}
//                             title={lecture.title}
//                             frameBorder="0"
//                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//                             referrerPolicy="strict-origin-when-cross-origin"
//                             allowFullScreen
//                         ></iframe>
//                     ) : (
//                         // 👉 Agar Cloudinary/MP4 hai toh purana video tag use karo
//                         <video key={lecture.videoUrl} controls className="w-full h-full object-contain bg-black">
//                             <source src={lecture.videoUrl} type="video/mp4" />
//                             Your browser does not support the video tag.
//                         </video>
//                     )
//                 ) : lecture.lectureType === 'online' ? (
//                     <div className="text-center p-6 w-full h-full flex flex-col items-center justify-center relative bg-app-bg">
//                         <div className="w-16 h-16 bg-accent-blue/10 rounded-2xl flex items-center justify-center mb-6 border border-accent-blue/20">
//                             <Globe size={32} className="text-accent-blue" />
//                         </div>
//                         <h3 className="text-text-main text-2xl font-black tracking-tight mb-6 uppercase">Live Session Room</h3>
                        
//                         <div className="flex gap-4 mb-8">
//                             <div className="flex items-center gap-2 text-text-muted text-xs font-bold bg-card-bg px-3 py-1.5 rounded-lg border border-border-subtle">
//                                 <Calendar size={14} /> {new Date(lecture.liveStart).toLocaleDateString('en-GB')}
//                             </div>
//                             <div className="flex items-center gap-2 text-text-muted text-xs font-bold bg-card-bg px-3 py-1.5 rounded-lg border border-border-subtle">
//                                 <Clock size={14} /> {new Date(lecture.liveStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                             </div>
//                         </div>

//                         <a
//                             href={lecture.meetingLink}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-blue text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md"
//                         >
//                             <Video size={16} /> Join Live Class
//                         </a>
//                     </div>
//                 ) : (
//                     <div className="text-center space-y-3">
//                         <Loader2 size={32} className="text-text-muted/30 mx-auto animate-spin" />
//                         <p className="text-text-muted font-bold tracking-wider uppercase text-[10px]">Processing Media...</p>
//                     </div>
//                 )}
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
//                 <div className="lg:col-span-2">
//                     <div className="pb-6 border-b border-border-subtle">
//                         <div className="flex items-center gap-3 mb-2">
//                             <span className="text-[10px] font-bold uppercase tracking-widest text-accent-blue bg-accent-blue/10 px-2.5 py-0.5 rounded-md">
//                                 {lecture.lectureType === 'online' ? 'Live Session' : 'Recorded'}
//                             </span>
//                             <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
//                                 Lesson {lecture.lectureOrder || '1'}
//                             </span>
//                         </div>
//                         <h1 className="text-xl md:text-2xl font-black text-text-main tracking-tight">{lecture.title}</h1>
//                     </div>

//                     <div className="pt-6">
//                         <h3 className="text-[11px] font-black uppercase tracking-wider text-text-main mb-3 flex items-center gap-2">
//                             <Info size={14} className="text-text-muted"/> About this lesson
//                         </h3>
//                         <p className="text-text-muted leading-relaxed font-medium text-sm">
//                             {lecture.description || "No description provided for this lesson."}
//                         </p>
//                     </div>
//                 </div>

//                 {/* Right Metadata Sidebar */}
//                 {/* <div className="space-y-6">
//                     <div className="bg-card-bg rounded-2xl p-6 border border-border-subtle shadow-sm sticky top-8">
//                         <h4 className="font-black text-sm mb-4 uppercase tracking-widest text-text-main border-b border-border-subtle pb-3">Class Info</h4>
//                         <div className="space-y-4">
//                             <div className="flex justify-between items-center">
//                                 <span className="text-xs text-text-muted font-medium">Duration</span>
//                                 <span className="text-xs font-bold text-text-main">{lecture.duration || '00'} Mins</span>
//                             </div>
//                             <div className="flex justify-between items-center">
//                                 <span className="text-xs text-text-muted font-medium">Format</span>
//                                 <span className="text-[10px] font-bold uppercase bg-app-bg border border-border-subtle text-text-main px-2 py-1 rounded-md">{lecture.lectureType}</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div> */}
//             </div>
//         </div>
//     );
// };

// export default LectureDetailPage;

'use client';

import React, { useEffect, use, useMemo, useState } from 'react';
import { Loader2, PlayCircle, ArrowLeft, AlertCircle, Info, Globe, Calendar, Clock, Video, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

// Redux Action & API
import { fetchCourseContent } from '@/lib/store/features/courseSlice';
import { markLectureCompleteAPI } from '@/lib/api/apiService'; // Nayi API import kar li

// 👉 Window interface for YouTube API 
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

// 👉 Helper Function: YouTube link ko embed link mein convert karne ke liye (With enablejsapi=1)
const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        // enablejsapi=1 lagana lazmi hai tracking ke liye
        return `https://www.youtube.com/embed/${match[2]}?enablejsapi=1`;
    }
    return null; 
};

// Formatter for seconds to MM:SS
const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

const LectureDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const courseId = Number(resolvedParams?.courseId || resolvedParams?.courseid);
    const sectionId = Number(resolvedParams?.sectionId || resolvedParams?.sectionid);
    const lectureId = Number(resolvedParams?.lectureId || resolvedParams?.lectureid || resolvedParams?.id);
    const dispatch = useAppDispatch();

    const { courseContent, loading } = useAppSelector((state) => state.course);
    const fullData = courseContent[Number(courseId)];

    const [videoDuration, setVideoDuration] = useState<number | null>(null);
    const [isCompletedLocal, setIsCompletedLocal] = useState(false);

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

    // 🚀 VIDEO COMPLETION LOGIC
    const handleVideoComplete = async () => {
        if (lecture?.isCompleted || isCompletedLocal) return; // Pehle se complete hai toh API call na karay

        try {
            await markLectureCompleteAPI(lectureId);
            setIsCompletedLocal(true);
            
            // Progress update karne ke liye background mein course dobara fetch kar lein
            dispatch(fetchCourseContent(Number(courseId))); 
        } catch (error) {
            console.error("Failed to mark complete", error);
        }
    };

    // YouTube check
    const youtubeEmbedUrl = getYouTubeEmbedUrl(lecture?.videoUrl || '');

    // 🎥 YOUTUBE API LISTENER EFFECT
    useEffect(() => {
        if (!youtubeEmbedUrl || lecture?.lectureType !== 'recorded') return;

        const initYTPlayer = () => {
            new window.YT.Player('yt-player', {
                events: {
                    onReady: (event: any) => {
                        // Jab video load ho jaye toh total time nikal lo
                        setVideoDuration(event.target.getDuration());
                    },
                    onStateChange: (event: any) => {
                        // State 0 ka matlab "ENDED" hota hai
                        if (event.data === 0) {
                            handleVideoComplete();
                        }
                    }
                }
            });
        };

        if (!window.YT) {
            // Agar YouTube Script pehle se load nahi hai toh dynamic load kardo
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
            
            window.onYouTubeIframeAPIReady = initYTPlayer;
        } else {
            // React strict mode delay fallback
            setTimeout(initYTPlayer, 300);
        }
    }, [youtubeEmbedUrl, lecture]);

    const isCourseLoading = loading.courseContent[Number(courseId)];

    if (!lecture && isCourseLoading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center bg-app-bg">
            <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
            <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading Class...</p>
        </div>
    );

    if (!lecture && !isCourseLoading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-app-bg">
            <AlertCircle className="text-red-500 mb-4" size={40} />
            <h2 className="font-black uppercase tracking-widest text-sm mb-2 text-text-main">Lecture Not Found</h2>
            <p className="text-text-muted text-[11px] font-medium mb-6">This lecture is unavailable or the link is invalid.</p>
            <Link href={`/student/enrolled-courses/${courseId}`} className="text-accent-blue text-xs font-bold hover:underline transition-all">Return to Course</Link>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in pb-20 bg-app-bg min-h-screen text-text-main slide-in-from-top-4">
            
            <Link href={`/student/enrolled-courses/${courseId}`} className="inline-flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold text-xs uppercase tracking-wider transition-colors mb-2">
                <ArrowLeft size={16} /> Back to Course
            </Link>

            {/* Video Player / Meeting Area */}
            <div className="bg-card-bg rounded-2xl overflow-hidden shadow-sm border border-border-subtle aspect-video relative flex items-center justify-center z-10">
                {lecture.lectureType === 'recorded' && lecture.videoUrl ? (
                    youtubeEmbedUrl ? (
                        // 👉 YouTube Embed (Important: id="yt-player" is required for tracking)
                        <iframe
                            id="yt-player"
                            key={youtubeEmbedUrl}
                            className="w-full h-full object-contain bg-black"
                            src={youtubeEmbedUrl}
                            title={lecture.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        // 👉 Native Video MP4 tracking logic
                        <video 
                            key={lecture.videoUrl} 
                            controls 
                            className="w-full h-full object-contain bg-black outline-none"
                            onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
                            onEnded={handleVideoComplete} // Native MP4 Finish Tracker
                        >
                            <source src={lecture.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    )
                ) : lecture.lectureType === 'online' ? (
                    // Live Session UI
                    <div className="text-center p-6 w-full h-full flex flex-col items-center justify-center relative bg-app-bg overflow-hidden">
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

                        <a
                            href={lecture.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-blue text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-hover-blue transition-colors shadow-md relative z-10"
                        >
                            <Video size={18} /> Join Live Class
                        </a>
                    </div>
                ) : (
                    <div className="text-center space-y-3 flex flex-col items-center justify-center h-full w-full bg-app-bg">
                        <Loader2 size={32} className="text-accent-blue mx-auto animate-spin" />
                        <p className="text-text-muted font-bold tracking-widest uppercase text-[10px]">Processing Media...</p>
                    </div>
                )}
            </div>

            {/* Lecture Details & Description */}
            <div className="pt-4 space-y-6">
                
                {/* Clean Info Header with Completion Indicator */}
                <div className="bg-card-bg rounded-2xl p-6 md:p-8 border border-border-subtle shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-accent-blue bg-accent-blue/10 px-2.5 py-1 rounded-md">
                                {lecture.lectureType === 'online' ? 'Live Session' : 'Recorded Lesson'}
                            </span>
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest border border-border-subtle px-2.5 py-1 rounded-md">
                                Lesson {lecture.lectureOrder || '1'}
                            </span>
                            
                            {/* 👉 COMPLETED STATUS INDICATOR */}
                            {(lecture.isCompleted || isCompletedLocal) && (
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 rounded-md flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Completed
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight capitalize leading-tight">
                            {lecture.title}
                        </h1>
                    </div>
                    
                    {/* 👉 DURATION INDICATOR */}
                    {lecture.lectureType === 'recorded' && videoDuration && (
                        <div className="shrink-0 flex items-center gap-2 bg-app-bg px-4 py-2 border border-border-subtle rounded-xl shadow-sm">
                            <PlayCircle size={18} className="text-accent-blue" />
                            <span className="text-xs font-bold text-text-main uppercase tracking-wider">{formatTime(videoDuration)} Runtime</span>
                        </div>
                    )}
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