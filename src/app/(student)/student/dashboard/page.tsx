'use client';
import React from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { Trophy, Star, Bell, UserCircle, ShieldCheck, Activity } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
    const { user } = useAppSelector((state) => state.auth); //

    return (
        <div className="min-h-screen bg-app-bg text-text-main pb-20 transition-all duration-300">
            <div className="max-w-6xl mx-auto px-6 pt-12 space-y-10">
                
                {/* Professional Welcome Hero */}
                <div className="hero-registry-card rounded-[3rem] p-10 md:p-16 border border-border-subtle relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-accent-blue/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                    <div className="relative z-10 space-y-4 text-center md:text-left">
                        <span className="text-[10px] font-black text-accent-blue uppercase tracking-[0.3em]">Student Terminal</span>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                            Welcome to Podium Professional, {user?.firstName} {user?.lastName}
                        </h1>
                        <p className="text-text-muted text-sm font-medium max-w-xl leading-relaxed uppercase tracking-wider">
                            Your learning record is safe and up to date. Explore your achievements and stay updated with campus news.
                        </p>
                    </div>
                </div>

                {/* Dashboard Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card-bg p-8 rounded-[2.5rem] border border-border-subtle flex items-center gap-6 shadow-lg">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500"><Trophy /></div>
                        <div>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Professional Level</p>
                            <p className="text-2xl font-black">Level 04</p>
                        </div>
                    </div>
                    <div className="bg-card-bg p-8 rounded-[2.5rem] border border-border-subtle flex items-center gap-6 shadow-lg">
                        <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500"><Star /></div>
                        <div>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Points Earned</p>
                            <p className="text-2xl font-black">2,450</p>
                        </div>
                    </div>
                    <div className="bg-card-bg p-8 rounded-[2.5rem] border border-border-subtle flex items-center gap-6 shadow-lg">
                        <div className="w-14 h-14 bg-accent-blue/10 rounded-2xl flex items-center justify-center text-accent-blue"><ShieldCheck /></div>
                        <div>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Status</p>
                            <p className="text-2xl font-black text-emerald-500">Verified</p>
                        </div>
                    </div>
                </div>

                {/* Updates and News */}
                <div className="bg-card-bg rounded-[2.5rem] border border-border-subtle p-10 space-y-8 shadow-xl">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-3">
                            <Bell size={18} className="text-accent-blue" /> Latest Announcements
                        </h3>
                    </div>
                    <div className="space-y-4">
                        <div className="p-6 bg-app-bg rounded-2xl border border-border-subtle flex items-center gap-4">
                            <Activity size={16} className="text-emerald-500" />
                            <p className="text-sm font-medium text-text-muted uppercase tracking-wide">New learning materials will be released next week.</p>
                        </div>
                        <div className="p-6 bg-app-bg rounded-2xl border border-border-subtle flex items-center gap-4">
                            <Activity size={16} className="text-accent-blue" />
                            <p className="text-sm font-medium text-text-muted uppercase tracking-wide">System maintenance is scheduled for Sunday at 12:00 AM.</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Link href="/student/profile" className="flex items-center gap-3 px-10 py-5 bg-text-main text-card-bg rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
                        <UserCircle size={18} /> Profile Details
                    </Link>
                </div>
            </div>
        </div>
    );
}