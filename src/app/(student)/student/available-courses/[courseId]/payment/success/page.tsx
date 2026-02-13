'use client';
import React from 'react';
import { CheckCircle2, LayoutDashboard, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const EnrollmentSuccessPage = () => {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-app-bg p-6 text-center">

            {/* Main Success Container */}
            <div className="bg-card-bg border border-emerald-500/20 rounded-[3rem] p-10 md:p-16 max-w-2xl space-y-8 shadow-2xl animate-in zoom-in-95">

                {/* Animated Icon */}
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle2 size={50} className="text-emerald-500" />
                    </div>
                </div>

                {/* Text Content in Easy English */}
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-text-main">
                        Payment Sent!
                    </h1>
                    <div className="h-1 w-20 bg-emerald-500/30 mx-auto rounded-full"></div>
                    <p className="text-text-muted text-sm md:text-base font-medium leading-relaxed max-w-md mx-auto">
                        We have received your payment screenshot. <br />
                        Now, please wait for our **Admin Team** to check it.
                    </p>
                </div>

                {/* Status Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-3 p-4 bg-app-bg rounded-2xl border border-border-subtle">
                        <Clock size={20} className="text-accent-blue" />
                        <p className="text-[10px] font-black uppercase text-left">
                            Takes 2-4 Hours <br />
                            <span className="text-text-muted font-bold tracking-normal">Verification Time</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-app-bg rounded-2xl border border-border-subtle">
                        <ShieldCheck size={20} className="text-emerald-500" />
                        <p className="text-[10px] font-black uppercase text-left">
                            Secure Registry <br />
                            <span className="text-text-muted font-bold tracking-normal">Data Protected</span>
                        </p>
                    </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-6">
                    <Link
                        href="/student/dashboard"
                        className="group flex items-center justify-center gap-3 w-full py-5 bg-text-main text-card-bg rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95"
                    >
                        <LayoutDashboard size={18} className="group-hover:rotate-12 transition-transform" />
                        Go to My Dashboard
                    </Link>
                    <p className="mt-6 text-[9px] text-text-muted font-black uppercase tracking-widest opacity-50">
                        You will be enrolled automatically after approval.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EnrollmentSuccessPage;