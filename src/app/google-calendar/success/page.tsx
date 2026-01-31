'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, Calendar } from 'lucide-react';

const GoogleCalendarSuccessPage = () => {
    const router = useRouter();

    useEffect(() => {
        // # 2 seconds ka delay taaki user ko "Success" confirm ho jaye
        const timer = setTimeout(() => {
            // # Hamesha teacher profile par redirect karega
            router.push('/teacher/profile');
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
            {/* Success Icon Animation */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-green-200 rounded-[2.5rem] blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center border border-green-50">
                    <CheckCircle size={48} className="text-green-500 animate-in zoom-in duration-500" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#0F172A] rounded-2xl flex items-center justify-center border-4 border-gray-50 shadow-lg">
                    <Calendar size={18} className="text-white" />
                </div>
            </div>

            {/* Content Section */}
            <div className="space-y-3">
                <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
                    Calendar Connected!
                </h1>
                <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                    Aapka Google Calendar Podium ke sath kamyabi se sync ho gaya hai.
                </p>
            </div>

            {/* Redirect Indicator */}
            <div className="mt-12 flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-blue-600" size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Redirecting to Profile
                    </span>
                </div>
                
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                    Please do not refresh this page
                </p>
            </div>
        </div>
    );
};

export default GoogleCalendarSuccessPage;