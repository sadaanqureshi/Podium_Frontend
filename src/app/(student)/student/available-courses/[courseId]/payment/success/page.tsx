'use client';
import React from 'react';
import { CheckCircle2, LayoutDashboard, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const EnrollmentSuccessPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-app-bg p-4">

            {/* Clean & Minimal Success Card */}
            <div className="bg-card-bg border border-border-subtle rounded-2xl p-8 md:p-12 w-full max-w-lg space-y-8 shadow-sm animate-in zoom-in-95">

                {/* Flat Icon Design */}
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                </div>

                {/* Humanized Text */}
                <div className="space-y-3 text-center">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-text-main">
                        Screenshot Received
                    </h1>
                    <p className="text-text-muted text-sm font-medium leading-relaxed max-w-sm mx-auto">
                        Your payment proof has been successfully submitted. Our team will review the transaction shortly.
                    </p>
                </div>

                {/* Flat Status Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-3 p-4 bg-app-bg rounded-xl border border-border-subtle">
                        <Clock size={18} className="text-accent-blue shrink-0" />
                        <div className="text-left">
                            <p className="text-xs font-bold text-text-main">Under Review</p>
                            <p className="text-[10px] text-text-muted font-semibold uppercase tracking-widest mt-0.5">Takes 2-4 Hours</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-app-bg rounded-xl border border-border-subtle">
                        <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                        <div className="text-left">
                            <p className="text-xs font-bold text-text-main">Secured</p>
                            <p className="text-[10px] text-text-muted font-semibold uppercase tracking-widest mt-0.5">Data Protected</p>
                        </div>
                    </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-4">
                    <Link
                        href="/student/dashboard"
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-text-main text-card-bg rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md"
                    >
                        <LayoutDashboard size={16} />
                        Return to Dashboard
                    </Link>
                    <p className="mt-4 text-[10px] text-center text-text-muted font-bold uppercase tracking-widest">
                        You will be automatically enrolled upon approval.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EnrollmentSuccessPage;