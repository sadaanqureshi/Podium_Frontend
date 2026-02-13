'use client';

import React, { useState, useEffect } from 'react';
import {
    User, ShieldCheck, Mail, Phone, Lock,
    Save, Camera, Calendar, ExternalLink, Loader2, CheckCircle2
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { updateUserProfileAPI, connectGoogleCalendarAPI } from '@/lib/api/apiService';
import { setUser } from '@/lib/store/features/authSlice';

// Toast logic agar aapne context setup kar liya hai toh useToast import karlein
// Warna local state wala toast hi rehne dein jo maine pichli baar diya tha.

const AdminProfilePage = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);

    const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
    const [loading, setLoading] = useState(false);

    const isCalendarConnected = user?.isCalendarConnected || false;

    const [userInfo, setUserInfo] = useState({
        firstName: '',
        lastName: '',
        contactNumber: ''
    });

    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user && mounted) {
            setUserInfo({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                contactNumber: user.contactNumber || ''
            });
        }
    }, [user, mounted]);

    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = await updateUserProfileAPI(user.id, userInfo);
            dispatch(setUser(response.data || response));
            // showToast("Admin profile updated!", "success");
        } catch (err: any) {
            console.error("Update failed");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        // Password logic here
    };

    const displayInitial = mounted ? (user?.firstName?.[0] || 'A') : 'A';
    const displayName = mounted ? `${user?.firstName || ''} ${user?.lastName || ''}` : 'Loading Admin...';

    if (!mounted) return null;

    return (
        <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 bg-app-bg min-h-screen text-text-main transition-colors duration-300">

            {/* 1. Admin Header Card - Using hero-registry-card logic */}
            <div className="hero-registry-card rounded-[2.5rem] p-8 md:p-12 mb-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-8 transition-all duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                <div className="relative group flex-shrink-0">
                    <div className="w-24 h-24 md:w-36 md:h-36 rounded-[2.5rem] bg-accent-blue text-white flex items-center justify-center text-5xl font-black border-4 border-card-bg shadow-2xl transition-transform duration-300 group-hover:scale-105">
                        {displayInitial}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-3 bg-text-main text-card-bg rounded-2xl shadow-2xl hover:scale-110 transition-all active:scale-90 border-2 border-border-subtle">
                        <Camera size={18} strokeWidth={3} />
                    </button>
                </div>

                <div className="text-center sm:text-left pt-4">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-2">{displayName}</h1>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 items-center mt-4">
                        <span className="px-4 py-1.5 bg-accent-blue/20 text-accent-blue rounded-full text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">
                            System Administrator
                        </span>
                        <span className="text-text-muted text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
                            <Mail size={14} className="text-accent-blue" /> {user?.email}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* 2. Admin Sidebar Navigation */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="bg-card-bg rounded-[2.5rem] p-4 border border-border-subtle shadow-sm space-y-2">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-5 mb-4 mt-3">Control Center</p>

                        <button onClick={() => setActiveTab('info')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-text-main text-card-bg shadow-xl translate-x-1' : 'text-text-muted hover:bg-app-bg'}`}>
                            <User size={18} /> Admin Profile
                        </button>

                        <button onClick={() => setActiveTab('password')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'password' ? 'bg-text-main text-card-bg shadow-xl translate-x-1' : 'text-text-muted hover:bg-app-bg'}`}>
                            <ShieldCheck size={18} /> Safety Keys
                        </button>
                    </div>

                    <div className="bg-card-bg rounded-[2.5rem] p-4 border border-border-subtle shadow-sm">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-5 mb-4 mt-3">System Sync</p>
                        <button className="w-full flex items-center justify-between px-6 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-text-muted hover:bg-app-bg hover:text-accent-blue border border-transparent hover:border-border-subtle transition-all group">
                            <div className="flex items-center gap-4">
                                <Calendar size={18} className="group-hover:scale-110 transition-transform" />
                                <span>Calendar Link</span>
                            </div>
                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                </div>

                {/* 3. Main Action Area */}
                <div className="lg:col-span-8 bg-card-bg rounded-[2.5rem] p-8 md:p-12 border border-border-subtle shadow-sm min-h-[500px]">
                    {activeTab === 'info' ? (
                        <form onSubmit={handleSaveInfo} className="space-y-10 animate-in fade-in duration-300">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-8">
                                <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter">Admin Settings</h2>
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest bg-app-bg px-4 py-1.5 rounded-lg border border-border-subtle">Core Identity</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <AdminInput label="First Name" icon={<User />} value={userInfo.firstName} onChange={(v: string) => setUserInfo({ ...userInfo, firstName: v })} required />
                                <AdminInput label="Last Name" icon={<User />} value={userInfo.lastName} onChange={(v: string) => setUserInfo({ ...userInfo, lastName: v })} />
                                <AdminInput label="Email Address" icon={<Mail />} value={user?.email} disabled />
                                <AdminInput label="Contact Line" icon={<Phone />} value={userInfo.contactNumber} onChange={(v: string) => setUserInfo({ ...userInfo, contactNumber: v })} />
                            </div>

                            <button disabled={loading} type="submit" className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-accent-blue text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-hover-blue transition-all active:scale-95 shadow-xl shadow-accent-blue/20 disabled:opacity-50">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Update Admin Data</>}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleUpdatePassword} className="space-y-10 animate-in fade-in duration-300">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-8">
                                <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter">System Access</h2>
                                <p className="text-[10px] bg-accent-blue/10 text-accent-blue px-4 py-1.5 rounded-lg font-black uppercase border border-accent-blue/20">Secure Vault</p>
                            </div>

                            <div className="space-y-8 max-w-md">
                                <AdminInput label="Current Key" type="password" icon={<Lock />} value={passwords.oldPassword} onChange={(v: string) => setPasswords({ ...passwords, oldPassword: v })} required />
                                <div className="h-px bg-border-subtle my-2"></div>
                                <AdminInput label="New Master Key" type="password" icon={<Lock />} value={passwords.newPassword} onChange={(v: string) => setPasswords({ ...passwords, newPassword: v })} required />
                                <AdminInput label="Verify Master Key" type="password" icon={<Lock />} value={passwords.confirmPassword} onChange={(v: string) => setPasswords({ ...passwords, confirmPassword: v })} required />
                            </div>

                            <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-text-main text-card-bg rounded-2xl font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-2xl">
                                <ShieldCheck size={18} /> Synchronize Access
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// Reusable Admin Input (Themed)
const AdminInput = ({ label, value, onChange, icon, type = "text", disabled = false, required = false }: any) => (
    <div className="space-y-3">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">
            {label} {required && <span className="text-accent-blue">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-accent-blue transition-colors pointer-events-none">
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <input
                type={type} value={value} disabled={disabled}
                onChange={(e) => onChange?.(e.target.value)}
                className={`w-full pl-14 pr-6 py-5 rounded-[1.5rem] border-2 border-border-subtle outline-none text-sm font-bold transition-all ${disabled
                        ? 'bg-app-bg text-text-muted opacity-50 cursor-not-allowed border-dashed'
                        : 'bg-app-bg text-text-main focus:bg-card-bg focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue shadow-inner'
                    }`}
            />
        </div>
    </div>
);

export default AdminProfilePage;