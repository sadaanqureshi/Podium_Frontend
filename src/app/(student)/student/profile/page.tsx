'use client';
import React, { useState, useEffect } from 'react';
import { 
    User, Mail, Shield, Calendar, 
    ArrowLeft, LayoutDashboard, Fingerprint 
} from 'lucide-react';
import Link from 'next/link';
import { useAppSelector } from '@/lib/store/hooks';

const StudentProfilePage = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // Redux se user ka data nikalna
    const { user } = useAppSelector((state) => state.auth);

    if (!mounted) return <div className="h-screen bg-app-bg" />;

    return (
        <div className="min-h-screen bg-app-bg text-text-main">
            <div className="max-w-4xl mx-auto px-6 pt-12 space-y-8">
                
                {/* Navigation Links */}
                <div className="flex justify-between items-center">
                    <Link href="/student/dashboard" className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-black text-[10px] uppercase tracking-widest transition-all">
                        <ArrowLeft size={16} /> Dashboard
                    </Link>
                    <span className="px-4 py-1.5 bg-accent-blue/10 text-accent-blue rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-accent-blue/20">
                        Student Node
                    </span>
                </div>

                {/* Profile Hero Card */}
                <div className="hero-registry-card rounded-[3rem] p-10 md:p-16 border border-border-subtle shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-accent-blue/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                        {/* Avatar Node */}
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-40 h-40 bg-card-bg rounded-[3rem] border-2 border-border-subtle flex items-center justify-center shadow-inner overflow-hidden">
                                {user?.profileImg ? (
                                    <img src={user.profileImg} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={60} className="text-accent-blue opacity-30" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-app-bg shadow-lg">
                                <Shield size={16} className="text-white" />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="text-center md:text-left space-y-4">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                                    {user?.firstName} {user?.lastName}
                                </h1>
                                <p className="text-accent-blue font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
                                    ID: {user?.id || '2026-REG-001'}
                                </p>
                            </div>
                            <p className="text-text-muted text-sm font-medium max-w-sm uppercase tracking-wider leading-relaxed">
                                Logged in as a verified student of the Global Academy Registry.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Details Registry - Read Only Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Identity Data */}
                    <div className="bg-card-bg border border-border-subtle rounded-[2.5rem] p-8 space-y-6 shadow-lg">
                        <div className="flex items-center gap-3 text-text-muted">
                            <Fingerprint size={18} />
                            <h3 className="text-[10px] font-black uppercase tracking-widest">Identity Registry</h3>
                        </div>

                        <div className="space-y-6 pt-2">
                            <div className="bg-app-bg/50 p-5 rounded-2xl border border-border-subtle/50">
                                <p className="text-[9px] font-bold text-text-muted uppercase mb-1">Full Name</p>
                                <p className="text-sm font-black uppercase tracking-tight">{user?.firstName} {user?.lastName}</p>
                            </div>
                            {/* <div className="bg-app-bg/50 p-5 rounded-2xl border border-border-subtle/50">
                                <p className="text-[9px] font-bold text-text-muted uppercase mb-1">Username / Alias</p>
                                <p className="text-sm font-black text-accent-blue uppercase tracking-tight">@{user?.username || 'sadaanqureshi'}</p>
                            </div> */}
                        </div>
                    </div>

                    {/* Contact & Access */}
                    <div className="bg-card-bg border border-border-subtle rounded-[2.5rem] p-8 space-y-6 shadow-lg">
                        <div className="flex items-center gap-3 text-text-muted">
                            <Mail size={18} />
                            <h3 className="text-[10px] font-black uppercase tracking-widest">Access Credentials</h3>
                        </div>

                        <div className="space-y-6 pt-2">
                            <div className="bg-app-bg/50 p-5 rounded-2xl border border-border-subtle/50">
                                <p className="text-[9px] font-bold text-text-muted uppercase mb-1">Registered Email</p>
                                <p className="text-sm font-black uppercase tracking-tight">{user?.email}</p>
                            </div>
                            <div className="bg-app-bg/50 p-5 rounded-2xl border border-border-subtle/50 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-bold text-text-muted uppercase mb-1">Member Since</p>
                                    <p className="text-sm font-black uppercase tracking-tight">2026 Registry</p>
                                </div>
                                <Calendar size={20} className="text-text-muted opacity-20" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Status */}
                <div className="p-8 bg-accent-blue/5 border border-dashed border-accent-blue/20 rounded-[2rem] text-center">
                    <p className="text-[10px] font-black uppercase text-accent-blue tracking-[0.2em] leading-relaxed">
                        Notice: To change your profile information, please contact the **Central Admin Support**.
                    </p>
                </div>

                {/* Action Link */}
                <div className="flex justify-center pt-4">
                    <Link 
                        href="/student/dashboard" 
                        className="group flex items-center gap-3 px-10 py-5 bg-text-main text-card-bg rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all active:scale-95"
                    >
                        <LayoutDashboard size={18} /> Return to Dashboard
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default StudentProfilePage;