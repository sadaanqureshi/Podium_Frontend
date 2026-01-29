'use client';

import React, { useState, useEffect, use } from 'react';
import { Loader2, FileText, ExternalLink, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getSpecificResourceAPI } from '@/lib/api/apiService';

const ResourceDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    
    // Check karein ke kya aapke folder structure mein [sectionId] mojud hai?
    const { courseId, sectionId, id: resourceId } = resolvedParams;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchAndRedirect = async () => {
            // DEBUGGING: Console mein check karein koi param undefined toh nahi
            console.log("Params Received:", { courseId, sectionId, resourceId });

            if (!courseId || !sectionId || !resourceId) {
                setError("URL parameters missing (Course, Section ya Resource ID nahi mili)");
                setLoading(false); // Loading stop karein
                return;
            }

            try {
                // API Call
                console.log("Fetching resource with:", { courseId, sectionId, resourceId });
                const response = await getSpecificResourceAPI(Number(courseId), Number(sectionId), Number(resourceId));
                const resourceData = response.data || response;

                if (resourceData?.fileUrl) {
                    setFileUrl(resourceData.fileUrl);
                    
                    // REDIRECT FIX: Naye tab ke bajaye usi window mein redirect karein
                    // Is se popup blocker trigger nahi hoga
                    window.location.replace(resourceData.fileUrl);
                }    else {
                    throw new Error("Cloudinary link (fileUrl) response mein nahi mila.");
                }
            } catch (err: any) {
                console.error("Fetch Error:", err);
                setError(err.message || "Resource fetch karne mein masla hua.");
            } finally {
                setLoading(false); // Har haal mein loading khatam karein
            }
        };

        fetchAndRedirect();
    }, [courseId, sectionId, resourceId]);

    // Baqi UI logic (Loading, Error, Success) same rahegi...
    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Cloudinary Link...</p>
        </div>
    );

    if (error) return (
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-black text-slate-800">Redirect Fail Ho Gaya</h2>
            <p className="text-slate-500 mt-2 mb-6 max-w-md">{error}</p>
            <Link href={`/teacher/assigned-courses/${courseId}`} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl">Wapas Jayein</Link>
        </div>
    );

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <Link href={`/teacher/assigned-courses/${courseId}`} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all">
                <ArrowLeft size={16} /> Back to Course
            </Link>

            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto">
                    <FileText size={40} className="text-blue-600" />
                </div>
                <h1 className="text-3xl font-black text-[#0F172A]">Resource Ready</h1>
                <p className="text-slate-500">Cloudinary file naye tab mein khul rahi hai. Agar nahi khuli, toh button dabayein:</p>
                <div className="pt-4">
                    <a href={fileUrl || '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-10 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl active:scale-95">
                        <ExternalLink size={18} /> Open Manually
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ResourceDetailPage;