'use client';

import React, { useState, useEffect, use } from 'react';
import { Loader2, PlayCircle, ArrowLeft, AlertCircle, Info, Globe, Calendar, Clock, Video } from 'lucide-react';
import Link from 'next/link';
// # API import for section lectures
import { getLecturesBySectionAPI } from '@/lib/api/apiService';

const LectureDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const { courseId, sectionId, lectureId } = resolvedParams;

    const [lecture, setLecture] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAndFilterLecture = async () => {
            const cId = Number(courseId);
            const sId = Number(sectionId);
            const lId = Number(lectureId);

            if (isNaN(cId) || isNaN(sId) || isNaN(lId)) return;

            setLoading(true);
            try {
                const response = await getLecturesBySectionAPI(cId, sId);
                const lecturesList = response?.lectures || [];

                if (lecturesList.length === 0) {
                    throw new Error("Is section mein koi lectures nahi mile.");
                }

                const foundLecture = lecturesList.find((l: any) => l.id === lId);

                if (foundLecture) {
                    let finalUrl = foundLecture.videoUrl;
                    setLecture({ ...foundLecture, videoUrl: finalUrl });
                } else {
                    throw new Error("Lecture list mein nahi mila.");
                }
            } catch (err: any) {
                console.error("Fetch Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAndFilterLecture();
    }, [courseId, sectionId, lectureId]);

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Video Player...</p>
        </div>
    );

    if (error || !lecture) return (
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-black text-[#0F172A]">Lecture Nahi Mil Saka</h2>
            <p className="text-slate-500 mt-2 mb-6 max-w-md">{error}</p>
            <Link href={`/teacher/assigned-courses/${courseId}`} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl">Back to Course</Link>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Back Navigation */}
            <Link href={`/teacher/assigned-courses/${courseId}`} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all">
                <ArrowLeft size={16} /> Back to Course
            </Link>

            {/* # Video / Meeting UI Logic */}
            <div className="bg-black rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white aspect-video relative group flex items-center justify-center">
                {lecture.lectureType === 'recorded' && lecture.videoUrl ? (
                    <video key={lecture.videoUrl} controls className="w-full h-full object-contain">
                        <source src={lecture.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : lecture.lectureType === 'online' ? (
                    <div className="text-center p-10 w-full max-w-2xl bg-[#0F172A] h-full flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center mb-10 border border-blue-500/20 shadow-inner">
                            <Globe size={48} className="text-blue-400 animate-pulse" />
                        </div>

                        <h3 className="text-white text-3xl font-black tracking-tight mb-4">Google Meet Live Session</h3>

                        <div className="flex gap-6 mb-12">
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                <Calendar size={14} className="text-blue-500" />
                                {new Date(lecture.liveStart).toLocaleDateString('en-GB')}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                <Clock size={14} className="text-blue-500" />
                                {new Date(lecture.liveStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        {/* # PREMIUM JOIN BUTTON */}
                        <a
                            href={lecture.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex items-center gap-4 px-14 py-6 bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] active:scale-95"
                        >
                            <Video size={24} className="group-hover:rotate-12 transition-transform" />
                            <span>Join Meeting Now</span>
                            <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </a>
                    </div>
                ) : (
                    <div className="text-center">
                        <AlertCircle size={48} className="text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">No Content Available</p>
                    </div>
                )}
            </div>

            {/* Lecture Content Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <PlayCircle size={28} className="text-blue-600" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Currently Playing</span>
                                <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">{lecture.title}</h1>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Info size={14} /> Description
                            </h3>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                {lecture.description || "Is lecture ke liye koi tafseel faraham nahi ki gayi."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#0F172A] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6">Lecture Metadata</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                <span className="text-xs text-slate-400 font-bold">Duration</span>
                                <span className="text-xs font-black">{lecture.duration || 'N/A'} mins</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                <span className="text-xs text-slate-400 font-bold">Lecture Order</span>
                                <span className="text-xs font-black"># {lecture.lectureOrder}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400 font-bold">Type</span>
                                <span className="text-xs font-black uppercase bg-blue-600 px-2 py-1 rounded-md">{lecture.lectureType}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LectureDetailPage;