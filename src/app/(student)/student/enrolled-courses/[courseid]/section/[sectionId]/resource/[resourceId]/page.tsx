// 'use client';

// import React, { useEffect, use, useMemo } from 'react';
// import { Loader2, ArrowLeft, AlertCircle, FileText, Download } from 'lucide-react';
// import Link from 'next/link';
// import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

// // Redux Action
// import { fetchCourseContent } from '@/lib/store/features/courseSlice';

// const ResourceDetailPage = ({ params }: { params: Promise<any> }) => {
//     const resolvedParams = use(params);
//     const { courseId, sectionId, resourceId } = resolvedParams;
//     const dispatch = useAppDispatch();

//     // # 1. REDUX STATE ACCESS
//     const { courseContent, loading: reduxLoading } = useAppSelector((state) => state.course);
//     const fullData = courseContent[Number(courseId)];

//     // # 2. FIND RESOURCE FROM CACHE
//     const resource = useMemo(() => {
//         if (!fullData?.sections) return null;
//         const section = fullData.sections.find((s: any) => s.id === Number(sectionId));
//         return section?.resources?.find((r: any) => r.id === Number(resourceId));
//     }, [fullData, sectionId, resourceId]);

//     // # 3. HYDRATION
//     useEffect(() => {
//         if (!fullData && courseId) {
//             dispatch(fetchCourseContent(Number(courseId)));
//         }
//     }, [courseId, fullData, dispatch]);

//     const isPageLoading = reduxLoading.courseContent[Number(courseId)];

//     if (!resource && isPageLoading) return (
//         <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
//             <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
//             <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">Loading Resource...</p>
//         </div>
//     );

//     if (!resource && !isPageLoading) return (
//         <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-app-bg">
//             <AlertCircle className="text-red-500 mb-4" size={48} />
//             <h2 className="text-xl font-black text-text-main uppercase tracking-tight">Material Not Found</h2>
//             <p className="text-text-muted mt-2 mb-6 max-w-md font-medium text-sm">Yeh content abhi available nahi hai ya link expire ho chuka hai.</p>
//             <Link href={`/student/enrolled-courses/${courseId}`} className="px-8 py-3 bg-accent-blue text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-accent-blue/20 hover:bg-hover-blue transition-all">Back to Course</Link>
//         </div>
//     );

//     return (
//         <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-8 animate-in fade-in pb-20 bg-app-bg min-h-screen text-text-main">

//             {/* Navigation Header */}
//             <div className="flex items-center justify-between">
//                 <Link href={`/student/enrolled-courses/${courseId}`} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-black text-xs uppercase tracking-widest group">
//                     <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Course Details
//                 </Link>
//             </div>

//             {/* Main Resource Card: bg-card-bg logic */}
//             <div className="bg-card-bg rounded-[2.5rem] border border-border-subtle shadow-2xl overflow-hidden animate-in zoom-in-95">

//                 {/* Header: Now using the hero-registry-card for Light Blue / Navy switch */}
//                 <div className="hero-registry-card p-10 relative overflow-hidden">
//                     <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl -mr-32 -mt-32"></div>

//                     <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
//                         <div className="w-24 h-24 bg-card-bg/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-card-bg/20 shadow-inner">
//                             <FileText size={48} className="text-accent-blue" />
//                         </div>
//                         <div>
//                             <span className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-accent-blue/30">Material Details</span>
//                             <h1 className="text-3xl md:text-4xl font-black mt-3 tracking-tight leading-tight uppercase leading-none">{resource.title}</h1>
//                             <p className="text-text-muted/70 text-sm mt-2 font-medium tracking-wide uppercase">{resource.resourceType || 'PDF File'}</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="p-8 md:p-12 space-y-12">
//                     {/* File Info Section */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
//                         <div className="space-y-6">
//                             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue border-b-2 border-border-subtle pb-2 w-fit">Overview</h3>
//                             <p className="text-text-muted font-medium leading-relaxed text-lg">
//                                 {resource.description || "Is resource ke liye koi description available nahi hai."}
//                             </p>
//                         </div>

//                         {/* Metadata Box: Using bg-app-bg for layered depth */}
//                         <div className="bg-app-bg rounded-3xl p-8 border border-border-subtle space-y-6">
//                             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">File Info</h3>
//                             <div className="space-y-4">
//                                 <div className="flex items-center justify-between border-b border-border-subtle pb-3">
//                                     <span className="text-xs text-text-muted font-bold uppercase tracking-tighter">Filename</span>
//                                     <span className="text-xs text-text-main font-black truncate max-w-[200px]">{resource.fileName || 'Material_Asset'}</span>
//                                 </div>
//                                 <div className="flex items-center justify-between border-b border-border-subtle pb-3">
//                                     <span className="text-xs text-text-muted font-bold uppercase tracking-tighter">Format</span>
//                                     <span className="text-xs text-accent-blue font-black uppercase">{resource.resourceType || 'PDF'}</span>
//                                 </div>
//                                 <div className="flex items-center justify-between">
//                                     <span className="text-xs text-text-muted font-bold uppercase tracking-tighter">Size</span>
//                                     <span className="text-xs text-text-main font-black">
//                                         {resource.fileSize ? `${(resource.fileSize / 1048576).toFixed(2)} MB` : 'Secure Storage'}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Download Action Section */}
//                     <div className="pt-8 border-t border-border-subtle flex flex-col items-center space-y-4">
//                         <a
//                             href={resource.fileUrl}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="group relative inline-flex items-center gap-4 px-16 py-6 bg-accent-blue text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-hover-blue transition-all shadow-xl shadow-accent-blue/20 active:scale-95"
//                         >
//                             <Download size={24} className="group-hover:translate-y-1 transition-transform" />
//                             <span>Retrieve File</span>
//                             <div className="absolute inset-0 rounded-3xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
//                         </a>
//                         <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.2em]">
//                             Secure Connection Active
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ResourceDetailPage;

'use client';

import React, { useEffect, use, useMemo } from 'react';
import { Loader2, ArrowLeft, AlertCircle, FileText, Download } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

// Redux Action
import { fetchCourseContent } from '@/lib/store/features/courseSlice';

const ResourceDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const courseId = resolvedParams?.courseId || resolvedParams?.courseid;
    const sectionId = resolvedParams?.sectionId || resolvedParams?.sectionid;
    const resourceId = resolvedParams?.resourceId || resolvedParams?.resourceid;
    // const { courseId, sectionId, resourceId } = resolvedParams;
    const dispatch = useAppDispatch();

    const { courseContent, loading: reduxLoading } = useAppSelector((state) => state.course);
    const fullData = courseContent[Number(courseId)];

    const resource = useMemo(() => {
        if (!fullData?.sections) return null;
        const section = fullData.sections.find((s: any) => s.id === Number(sectionId));
        return section?.resources?.find((r: any) => r.id === Number(resourceId));
    }, [fullData, sectionId, resourceId]);

    useEffect(() => {
        if (!fullData && courseId) {
            dispatch(fetchCourseContent(Number(courseId)));
        }
    }, [courseId, fullData, dispatch]);

    const isPageLoading = reduxLoading.courseContent[Number(courseId)];

    if (!resource && isPageLoading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center bg-app-bg">
            <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
            <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading Resource...</p>
        </div>
    );

    if (!resource && !isPageLoading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center p-4 text-center bg-app-bg">
            <AlertCircle className="text-red-500 mb-4" size={40} />
            <h2 className="text-sm font-black text-text-main uppercase tracking-widest mb-2">Resource Not Found</h2>
            <p className="text-text-muted text-[11px] font-medium mb-6">This material is unavailable or the link is invalid.</p>
            <Link href={`/student/enrolled-courses/${courseId}`} className="text-accent-blue font-bold text-xs hover:underline transition-all">Return to Course</Link>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in pb-20 bg-app-bg h-full text-text-main">

            <Link href={`/student/enrolled-courses/${courseId}`} className="inline-flex items-center gap-2 text-text-muted hover:text-text-main font-bold text-xs uppercase tracking-wider transition-colors mb-2">
                <ArrowLeft size={16} /> Back to Course
            </Link>

            {/* Flat Minimalist Header */}
            <div className="border-b border-border-subtle pb-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-1.5 bg-accent-blue/10 text-accent-blue rounded-md"><FileText size={16} /></div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">{resource.resourceType || 'Document'}</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-text-main">{resource.title}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
                
                {/* Overview Section */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-text-main">Overview</h3>
                    <p className="text-text-muted font-medium leading-relaxed text-sm">
                        {resource.description || "No specific details provided for this resource."}
                    </p>
                </div>

                {/* File Information Sidebar */}
                <div className="space-y-6">
                    <div className="bg-card-bg rounded-2xl p-6 border border-border-subtle shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-main border-b border-border-subtle pb-3 mb-5">File Info</h3>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-muted font-medium">Name</span>
                                <span className="text-xs font-bold text-text-main truncate max-w-[140px]">{resource.fileName || 'Unknown File'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-muted font-medium">Format</span>
                                <span className="text-[10px] font-bold bg-app-bg px-2 py-1 rounded-md border border-border-subtle uppercase text-text-main">{resource.resourceType || 'PDF'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-muted font-medium">Size</span>
                                <span className="text-xs font-bold text-text-main">
                                    {resource.fileSize ? `${(resource.fileSize / 1048576).toFixed(2)} MB` : 'Unknown Size'}
                                </span>
                            </div>
                        </div>

                        <a
                            href={resource.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 bg-text-main text-card-bg rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
                        >
                            <Download size={16} /> Download File
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceDetailPage;