'use client';
import React from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { Users, Settings, HeartPulse, Send, LayoutGrid, Award } from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboard() {
    const { user } = useAppSelector((state) => state.auth); //

    return (
        <div className="min-h-screen bg-app-bg text-text-main pb-20 transition-all duration-300">
            <div className="max-w-6xl mx-auto px-6 pt-12 space-y-10">
                
                {/* Teacher Welcome Hero */}
                <div className="hero-registry-card rounded-[3rem] p-10 md:p-16 border border-border-subtle shadow-xl flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <span className="text-[10px] font-black text-accent-blue uppercase tracking-[0.3em]">Instructor Hub</span>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                            Welcome to Podium Professional, Prof. {user?.firstName} {user?.lastName}
                        </h1>
                        <p className="text-text-muted text-sm font-medium uppercase tracking-widest">Manage your workspace and monitor student performance nodes.</p>
                    </div>
                </div>

                {/* Metrics for Teachers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card-bg p-8 rounded-[2.5rem] border border-border-subtle flex items-center justify-between shadow-lg">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Active Students</p>
                            <p className="text-3xl font-black">10</p>
                        </div>
                        <Users size={32} className="text-accent-blue opacity-50" />
                    </div>
                    <div className="bg-card-bg p-8 rounded-[2.5rem] border border-border-subtle flex items-center justify-between shadow-lg">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Class Performance</p>
                            <p className="text-3xl font-black text-emerald-500">94%</p>
                        </div>
                        <Award size={32} className="text-emerald-500 opacity-50" />
                    </div>
                </div>

                {/* Instructor Action Tools */}
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button className="p-8 bg-card-bg border border-border-subtle rounded-[2rem] flex flex-col items-center gap-4 hover:border-accent-blue transition-all group">
                        <Users className="text-accent-blue group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Manage Students</span>
                    </button>
                    <button className="p-8 bg-card-bg border border-border-subtle rounded-[2rem] flex flex-col items-center gap-4 hover:border-accent-blue transition-all group">
                        <Settings className="text-accent-blue group-hover:rotate-45 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Tool Settings</span>
                    </button>
                    <button className="p-8 bg-card-bg border border-border-subtle rounded-[2rem] flex flex-col items-center gap-4 hover:border-accent-blue transition-all group">
                        <Send className="text-accent-blue group-hover:translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Post Updates</span>
                    </button>
                </div> */}
            </div>
        </div>
    );
}