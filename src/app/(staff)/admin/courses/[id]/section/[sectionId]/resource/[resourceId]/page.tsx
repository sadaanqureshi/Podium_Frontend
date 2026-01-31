'use client';

import React, { useState, useEffect, use } from 'react';
import { Loader2, ArrowLeft, AlertCircle, FileText, Download, FileJson, Globe } from 'lucide-react';
import Link from 'next/link';
// # Ab specific API use kar rahe hain
import { getSpecificResourceAPI } from '@/lib/api/apiService';

const ResourceDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    // # Folder structure ke mutabiq params extraction
    const { courseId, sectionId, resourceId } = resolvedParams;

    const [resource, setResource] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResourceData = async () => {
            if (!courseId || !sectionId || !resourceId) return;

            setLoading(true);
            try {
                // # 1. Specific Resource API Call
                const response = await getSpecificResourceAPI(
                    Number(courseId),
                    Number(sectionId),
                    Number(resourceId)
                );

                // # Data handling as per your API response structure
                const resourceData = response.data || response;
                setResource(resourceData);

                // # Note: Redirect logic ko user ki request par hata diya gaya hai
            } catch (err: any) {
                console.error("Resource Fetch Error:", err);
                setError(err.message || "Resource load karne mein masla hua.");
            } finally {
                setLoading(false);
            }
        };

        fetchResourceData();
    }, [courseId, sectionId, resourceId]);

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Resource Details...</p>
        </div>
    );

    if (error || !resource) return (
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-black text-[#0F172A]">Masla Aa Gaya</h2>
            <p className="text-slate-500 mt-2 mb-6 max-w-md">{error || "Data load nahi ho saka."}</p>
            <Link href={`/teacher/assigned-courses/${courseId}`} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl">Back to Course</Link>
        </div>
    );

    return (
        <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <Link href={`/teacher/assigned-courses/${courseId}`} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all">
                    <ArrowLeft size={16} /> Back to Course
                </Link>
            </div>

            {/* Resource Preview Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
                <div className="bg-[#0F172A] p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-inner">
                            <FileText size={48} className="text-blue-400" />
                        </div>
                        <div className="text-center md:text-left">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/30">Resource Material</span>
                            <h1 className="text-3xl md:text-4xl font-black mt-3 tracking-tight">{resource.title}</h1>
                            <p className="text-slate-400 text-sm mt-2 font-medium">Course ID: {courseId} • Section ID: {sectionId}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-12 space-y-10">
                    {/* File Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-2">Description</h3>
                            <p className="text-slate-600 font-medium leading-relaxed">
                                {resource.description || "Is resource ke liye koi description faraham nahi ki gayi."}
                            </p>
                        </div>

                        <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">File Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <span className="text-xs text-slate-400 font-bold">File Name</span>
                                    {/* # Filename dikhane ka requirement */}
                                    <span className="text-xs text-[#0F172A] font-black truncate max-w-[200px]">{resource.fileName || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <span className="text-xs text-slate-400 font-bold">Format</span>
                                    <span className="text-xs text-blue-600 font-black uppercase">{resource.resourceType || 'PDF'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400 font-bold">Size</span>
                                    <span className="text-xs text-[#0F172A] font-black">
                                        {resource.fileSize ? `${(resource.fileSize / 1048576).toFixed(2)} MB` : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Download Action Section */}
                    <div className="pt-6 border-t border-slate-50 flex flex-col items-center">
                        {/* # Link jo click karne par naye tab mein file download ya open karega */}
                        <a
                            href={resource.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex items-center gap-4 px-12 py-5 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl active:scale-95"
                        >
                            <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                            <span>Download Resource</span>
                            <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </a>
                        <p className="text-[10px] text-slate-400 mt-4 font-bold italic text-center">
                            Note: Yeh file Cloudinary secure storage se open hogi.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceDetailPage;