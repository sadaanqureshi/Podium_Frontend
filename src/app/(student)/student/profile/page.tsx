'use client';
import React, { useState, useEffect } from 'react'; 
import { 
    User, Mail, Shield, Calendar, 
    ArrowLeft, Phone, BadgeInfo
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
        <div className="h-full bg-app-bg text-text-main pb-16">
            <div className="max-w-4xl mx-auto px-6 pt-12 space-y-8 animate-in fade-in slide-in-from-top-4">
                
                {/* Navigation Links */}
                <div className="flex justify-between items-center">
                    <Link href="/student/dashboard" className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold text-xs uppercase tracking-wider transition-colors">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                </div>

                {/* Profile Hero Card */}
                <div className="bg-card-bg rounded-2xl p-8 md:p-12 border border-border-subtle shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    
                    {/* Decorative Background Blob */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
                    
                    {/* Avatar Display */}
                    {/* <div className="relative shrink-0 group">
                        <div className="w-28 h-28 md:w-36 md:h-36 bg-app-bg rounded-full border border-border-subtle flex items-center justify-center shadow-inner overflow-hidden relative z-10">
                            {user?.profileImg ? (
                                <img src={user.profileImg} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={50} className="text-accent-blue/40" />
                            )}
                        </div>
                        <div className="absolute bottom-2 right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-card-bg shadow-md z-20" title="Verified Student">
                            <Shield size={14} className="text-white" />
                        </div>
                    </div> */}

                    {/* Basic Info */}
                    <div className="text-center md:text-left space-y-3 z-10 relative">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-blue/10 text-accent-blue rounded-md text-[10px] font-bold uppercase tracking-widest mb-2">
                            Student Account
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-none text-text-main capitalize">
                            {user?.firstName || "Unknown"} {user?.lastName || "Student"}
                        </h1>
                        <p className="text-text-muted text-sm font-medium max-w-sm mx-auto md:mx-0 leading-relaxed">
                            Actively enrolled and verified member of Podium Professional.
                        </p>
                    </div>
                </div>

                {/* Details Registry - Read Only Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Identity Data */}
                    <div className="bg-card-bg border border-border-subtle rounded-2xl p-8 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3 text-text-main border-b border-border-subtle pb-4">
                            <User size={18} className="text-accent-blue" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Personal Details</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">First Name</p>
                                <p className="text-sm font-bold text-text-main capitalize">{user?.firstName || "-"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Last Name</p>
                                <p className="text-sm font-bold text-text-main capitalize">{user?.lastName || "-"}</p>
                            </div>
                            {user?.rollNumber && (
                                <div>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Roll Number</p>
                                    <div className="inline-flex items-center gap-2 text-sm font-bold text-text-main uppercase bg-app-bg border border-border-subtle px-3 py-1.5 rounded-lg">
                                        <BadgeInfo size={14} className="text-accent-blue"/> {user.rollNumber}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact & Access */}
                    <div className="bg-card-bg border border-border-subtle rounded-2xl p-8 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3 text-text-main border-b border-border-subtle pb-4">
                            <Mail size={18} className="text-accent-blue" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Contact Info</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Registered Email</p>
                                <p className="text-sm font-bold text-text-main lowercase">{user?.email || "No email linked"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Phone Number</p>
                                <div className="flex items-center gap-2 text-sm font-bold text-text-main">
                                    <Phone size={14} className="text-text-muted" />
                                    {user?.contactNumber || "Not Provided"}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Status */}
                <div className="p-6 bg-app-bg border border-border-subtle rounded-xl text-center shadow-sm">
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-center gap-2">
                        <Shield size={14} /> To update your profile information, please contact the administration.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default StudentProfilePage;