'use client';

import React, { useState } from 'react';
import {
    User, ShieldCheck, Mail, Phone, Lock,
    Save, Camera, Calendar, ExternalLink
} from 'lucide-react';
import { useAppSelector } from '@/lib/store/hooks';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
    const user = useAppSelector((state) => state.auth.user);

    // User Info State
    const [userInfo, setUserInfo] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        contactNumber: user?.contactNumber || ''
    });

    // Password State
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSaveInfo = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Information update ho gayi (Mock)!");
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Password change ho gaya (Mock)!");
    };

    const handleGoogleConnect = () => {
        alert("Redirecting to Google Auth... (Mock)");
    };

    return (
        <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

            {/* 1. Header Card - Responsive Flex */}
            <div className="bg-[#0F172A] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 mb-8 text-white flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                <div className="relative group flex-shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-blue-600 flex items-center justify-center text-4xl font-black border-4 border-slate-800 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                        {user?.firstName?.[0] || 'U'}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2.5 bg-white text-[#0F172A] rounded-xl shadow-xl hover:bg-blue-50 hover:scale-110 transition-all active:scale-90 border-2 border-slate-800">
                        <Camera size={18} />
                    </button>
                </div>

                <div className="text-center sm:text-left pt-2">
                    <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-1">
                        {user?.firstName} {user?.lastName}
                    </h1>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 items-center mt-2">
                        <span className="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                            {user?.role?.roleName || 'Member'}
                        </span>
                        <span className="text-slate-500 text-xs font-bold flex items-center gap-1.5">
                            <Mail size={14} /> {user?.email}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Main Settings Grid - 1 Col on Mobile, 12 on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">

                {/* Navigation Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-3">
                    <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4 mt-2">Account Settings</p>

                        <button
                            onClick={() => setActiveTab('info')}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-[#0F172A] text-white shadow-xl shadow-blue-900/20 translate-x-1' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            <User size={18} /> Personal Info
                        </button>

                        <button
                            onClick={() => setActiveTab('password')}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'password' ? 'bg-[#0F172A] text-white shadow-xl shadow-blue-900/20 translate-x-1' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            <ShieldCheck size={18} /> Security
                        </button>
                    </div>

                    {/* Google Calendar Section */}
                    <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4 mt-2">Integrations</p>
                        <button
                            onClick={handleGoogleConnect}
                            className="w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <Calendar size={18} className="group-hover:scale-110 transition-transform" />
                                <span>Google Calendar</span>
                            </div>
                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                </div>

                {/* Forms Content Area */}
                <div className="lg:col-span-8 bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 lg:p-12 border border-slate-100 shadow-sm">
                    {activeTab === 'info' ? (
                        <form onSubmit={handleSaveInfo} className="space-y-8 animate-in fade-in duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-6">
                                <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-tighter">General Info</h2>
                                <p className="text-xs text-slate-400 font-bold italic">Fields marked with * are required</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ProfileInput label="First Name" icon={<User />} value={userInfo.firstName} onChange={(v: any) => setUserInfo({ ...userInfo, firstName: v })} required />
                                <ProfileInput label="Last Name" icon={<User />} value={userInfo.lastName} onChange={(v: any) => setUserInfo({ ...userInfo, lastName: v })} />
                                <ProfileInput label="Email Address" icon={<Mail />} value={userInfo.email} disabled />
                                <ProfileInput label="Contact Number" icon={<Phone />} value={userInfo.contactNumber} onChange={(v: any) => setUserInfo({ ...userInfo, contactNumber: v })} />
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100">
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleUpdatePassword} className="space-y-8 animate-in fade-in duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-6">
                                <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-tighter text-purple-600">Password Update</h2>
                                <p className="text-[10px] bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-black uppercase">Secure Session</p>
                            </div>

                            <div className="space-y-6 max-w-md">
                                <ProfileInput label="Current Password" type="password" icon={<Lock />} value={passwords.oldPassword} onChange={(v: any) => setPasswords({ ...passwords, oldPassword: v })} required />
                                <div className="h-px bg-slate-50 my-2"></div>
                                <ProfileInput label="New Password" type="password" icon={<Lock />} value={passwords.newPassword} onChange={(v: any) => setPasswords({ ...passwords, newPassword: v })} required />
                                <ProfileInput label="Confirm New Password" type="password" icon={<Lock />} value={passwords.confirmPassword} onChange={(v: any) => setPasswords({ ...passwords, confirmPassword: v })} required />
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-xl">
                                    <ShieldCheck size={18} /> Update Password
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// Reusable Responsive Input
const ProfileInput = ({ label, value, onChange, icon, type = "text", disabled = false, required = false }: any) => (
    <div className="space-y-2">
        <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                {React.cloneElement(icon, { size: 18 })}
            </div>
            <input
                type={type}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange?.(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none text-sm font-bold transition-all ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-slate-50/50 text-slate-700'}`}
            />
        </div>
    </div>
);

export default ProfilePage;