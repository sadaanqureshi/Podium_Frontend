'use client';

import React, { useEffect, use, useMemo } from 'react';
import { Loader2, ArrowLeft, AlertCircle, FileText, Download } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

// Redux Action
import { fetchCourseContent } from '@/lib/store/features/courseSlice';

const ResourceDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const { courseId, sectionId, resourceId } = resolvedParams;
    const dispatch = useAppDispatch();

    // # 1. REDUX STATE ACCESS (Cache Logic)
    const { courseContent, loading: reduxLoading } = useAppSelector((state) => state.course);
    const fullData = courseContent[Number(courseId)];

    // # 2. FIND RESOURCE FROM REDUX CACHE
    // Hum nested sections mein se sahi resource dhoond rahe hain
    const resource = useMemo(() => {
        if (!fullData?.sections) return null;
        const section = fullData.sections.find((s: any) => s.id === Number(sectionId));
        return section?.resources?.find((r: any) => r.id === Number(resourceId));
    }, [fullData, sectionId, resourceId]);

    // # 3. HYDRATION: Agar refresh ho ya direct link ho toh fetch karein
    useEffect(() => {
        if (!fullData && courseId) {
            dispatch(fetchCourseContent(Number(courseId)));
        }
    }, [courseId, fullData, dispatch]);

    // Loading State from Redux
    const isPageLoading = reduxLoading.courseContent[Number(courseId)];

    if (!resource && isPageLoading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Fetching Secure Link...</p>
        </div>
    );

    if (!resource && !isPageLoading) return (
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-black text-[#0F172A]">Material Not Found</h2>
            <p className="text-slate-500 mt-2 mb-6 max-w-md italic text-sm">Yeh material shayad delete ho chuka hai ya iska link expire ho gaya hai.</p>
            <Link href={`/teacher/assigned-courses/${courseId}`} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-700 transition-all">Back to Course</Link>
        </div>
    );

    return (
        <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 text-[#0F172A]">
            
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <Link href={`/teacher/assigned-courses/${courseId}`} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Materials
                </Link>
            </div>

            {/* Resource Preview Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-700">
                
                {/* Header strictly Dark Blue */}
                <div className="bg-[#0F172A] p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-inner">
                            <FileText size={48} className="text-blue-400" />
                        </div>
                        <div>
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/30">Downloadable Material</span>
                            <h1 className="text-3xl md:text-4xl font-black mt-3 tracking-tight leading-tight">{resource.title}</h1>
                            <p className="text-slate-400 text-sm mt-2 font-medium tracking-wide uppercase">{resource.resourceType || 'PDF Document'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-12 space-y-12">
                    {/* File Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 border-b-2 border-blue-50 pb-2 w-fit">Overview</h3>
                            <p className="text-slate-600 font-medium leading-relaxed text-lg italic">
                                "{resource.description || "Is resource ke liye koi description faraham nahi ki gayi."}"
                            </p>
                        </div>

                        <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">File Specification</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">System Filename</span>
                                    <span className="text-xs text-[#0F172A] font-black truncate max-w-[200px]">{resource.fileName || 'Material_Asset'}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Asset Format</span>
                                    <span className="text-xs text-blue-600 font-black uppercase">{resource.resourceType || 'PDF'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Memory Size</span>
                                    <span className="text-xs text-[#0F172A] font-black">
                                        {resource.fileSize ? `${(resource.fileSize / 1048576).toFixed(2)} MB` : 'Secure Cloud Storage'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Download Action Section */}
                    <div className="pt-8 border-t border-slate-50 flex flex-col items-center space-y-4">
                        <a
                            href={resource.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex items-center gap-4 px-16 py-6 bg-[#0F172A] text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl active:scale-95"
                        >
                            <Download size={24} className="group-hover:translate-y-1 transition-transform" />
                            <span>Retrieve Material</span>
                            <div className="absolute inset-0 rounded-3xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </a>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                            End-to-End Encrypted Transfer Active
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceDetailPage;