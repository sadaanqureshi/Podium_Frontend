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

    // # 1. REDUX STATE ACCESS
    const { courseContent, loading: reduxLoading } = useAppSelector((state) => state.course);
    const fullData = courseContent[Number(courseId)];

    // # 2. FIND RESOURCE FROM CACHE
    const resource = useMemo(() => {
        if (!fullData?.sections) return null;
        const section = fullData.sections.find((s: any) => s.id === Number(sectionId));
        return section?.resources?.find((r: any) => r.id === Number(resourceId));
    }, [fullData, sectionId, resourceId]);

    // # 3. HYDRATION
    useEffect(() => {
        if (!fullData && courseId) {
            dispatch(fetchCourseContent(Number(courseId)));
        }
    }, [courseId, fullData, dispatch]);

    const isPageLoading = reduxLoading.courseContent[Number(courseId)];

    if (!resource && isPageLoading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
            <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
            <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">Loading Resource...</p>
        </div>
    );

    if (!resource && !isPageLoading) return (
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-app-bg">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-black text-text-main uppercase tracking-tight">Material Not Found</h2>
            <p className="text-text-muted mt-2 mb-6 max-w-md font-medium text-sm">Yeh content abhi available nahi hai ya link expire ho chuka hai.</p>
            <Link href={`/student/enrolled-courses/${courseId}`} className="px-8 py-3 bg-accent-blue text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-accent-blue/20 hover:bg-hover-blue transition-all">Back to Course</Link>
        </div>
    );

    return (
        <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-8 animate-in fade-in pb-20 bg-app-bg min-h-screen text-text-main">

            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <Link href={`/student/enrolled-courses/${courseId}`} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-black text-xs uppercase tracking-widest group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Course Details
                </Link>
            </div>

            {/* Main Resource Card: bg-card-bg logic */}
            <div className="bg-card-bg rounded-[2.5rem] border border-border-subtle shadow-2xl overflow-hidden animate-in zoom-in-95">

                {/* Header: Now using the hero-registry-card for Light Blue / Navy switch */}
                <div className="hero-registry-card p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl -mr-32 -mt-32"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="w-24 h-24 bg-card-bg/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-card-bg/20 shadow-inner">
                            <FileText size={48} className="text-accent-blue" />
                        </div>
                        <div>
                            <span className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-accent-blue/30">Material Details</span>
                            <h1 className="text-3xl md:text-4xl font-black mt-3 tracking-tight leading-tight uppercase leading-none">{resource.title}</h1>
                            <p className="text-text-muted/70 text-sm mt-2 font-medium tracking-wide uppercase">{resource.resourceType || 'PDF File'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-12 space-y-12">
                    {/* File Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue border-b-2 border-border-subtle pb-2 w-fit">Overview</h3>
                            <p className="text-text-muted font-medium leading-relaxed text-lg">
                                {resource.description || "Is resource ke liye koi description available nahi hai."}
                            </p>
                        </div>

                        {/* Metadata Box: Using bg-app-bg for layered depth */}
                        <div className="bg-app-bg rounded-3xl p-8 border border-border-subtle space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">File Info</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                                    <span className="text-xs text-text-muted font-bold uppercase tracking-tighter">Filename</span>
                                    <span className="text-xs text-text-main font-black truncate max-w-[200px]">{resource.fileName || 'Material_Asset'}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                                    <span className="text-xs text-text-muted font-bold uppercase tracking-tighter">Format</span>
                                    <span className="text-xs text-accent-blue font-black uppercase">{resource.resourceType || 'PDF'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-text-muted font-bold uppercase tracking-tighter">Size</span>
                                    <span className="text-xs text-text-main font-black">
                                        {resource.fileSize ? `${(resource.fileSize / 1048576).toFixed(2)} MB` : 'Secure Storage'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Download Action Section */}
                    <div className="pt-8 border-t border-border-subtle flex flex-col items-center space-y-4">
                        <a
                            href={resource.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex items-center gap-4 px-16 py-6 bg-accent-blue text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-hover-blue transition-all shadow-xl shadow-accent-blue/20 active:scale-95"
                        >
                            <Download size={24} className="group-hover:translate-y-1 transition-transform" />
                            <span>Retrieve File</span>
                            <div className="absolute inset-0 rounded-3xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </a>
                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.2em]">
                            Secure Connection Active
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceDetailPage;