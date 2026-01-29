'use client';

import React, { useState, useEffect } from 'react';
import { 
    User, ShieldCheck, Mail, Phone, Lock, 
    Save, Camera, Calendar, ExternalLink, Loader2, CheckCircle2 
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { updateUserProfileAPI, connectGoogleCalendarAPI } from '@/lib/api/apiService';
import { setUser } from '@/lib/store/features/authSlice'; 

const ProfilePage = () => {
    // 1. HYDRATION FIX: Next.js mismatch error khatam karne ke liye
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
    const [loading, setLoading] = useState(false);
    const [calendarLoading, setCalendarLoading] = useState(false);

    // Google Calendar Connected Status Check (Backend key ke mutabiq adjust karein)
    const isCalendarConnected = user?.isCalendarConnected || false;

    // User Info State
    const [userInfo, setUserInfo] = useState({
        firstName: '',
        lastName: '',
        contactNumber: ''
    });

    // 2. DATA SYNC: Redux se local state update karein
    useEffect(() => {
        if (user && mounted) {
            setUserInfo({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                contactNumber: user.contactNumber || ''
            });
        }
    }, [user, mounted]);

    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // --- 3. SAVE INFO LOGIC ---
    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return alert("User session not found.");

        setLoading(true);
        try {
            const response = await updateUserProfileAPI(user.id, userInfo);
            const updatedUser = response.data || response; 
            
            // Seamless update (No window.location.reload required)
            dispatch(setUser(updatedUser)); 
            alert("Profile successfully updated!");
        } catch (err: any) {
            alert(err.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    // --- 4. GOOGLE CALENDAR CONNECT LOGIC ---
    const handleGoogleConnect = async () => {
    if (isCalendarConnected) return;

    setCalendarLoading(true);
    try {
        // Response ab direct URL string hogi
        const responseUrl = await connectGoogleCalendarAPI();

        if (responseUrl && responseUrl.startsWith('http')) {
            // REDIRECT TO NEW TAB FIX:
            // window.open user ko naye tab par le jaye ga
            window.open(responseUrl, '_blank', 'noopener,noreferrer');
            
            // Optional: User ko guide karne ke liye alert ya message
            alert("Meharbani karke naye tab mein Google login mukammal karein.");
        } else {
            // Agar link nahi mila toh manual update (fallback)
            dispatch(setUser({ ...user, isCalendarConnected: true }));
            alert("Google Calendar Connected!");
        }
    } catch (err: any) {
        console.error("Google Auth Error:", err);
        alert(err.message || "Google integration failed");
    } finally {
        setCalendarLoading(false);
    }
};

    // Hydration Safe Displays
    const displayInitial = mounted ? (user?.firstName?.[0] || 'U') : 'U';
    const displayName = mounted ? `${user?.firstName || ''} ${user?.lastName || ''}` : 'Loading...';

    return (
        <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            
            {/* Header Card */}
            <div className="bg-[#0F172A] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 mb-8 text-white flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="relative group flex-shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-blue-600 flex items-center justify-center text-4xl font-black border-4 border-slate-800 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                        {displayInitial}
                    </div>
                </div>

                <div className="text-center sm:text-left pt-2">
                    <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-1">{displayName}</h1>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 items-center mt-2">
                        <span className="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                            {mounted ? (user?.role?.roleName || 'Member') : '...'}
                        </span>
                        <span className="text-slate-500 text-xs font-bold flex items-center gap-1.5">
                            <Mail size={14} /> {mounted ? user?.email : '...'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
                
                {/* Navigation Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-3">
                    <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4 mt-2">Account Settings</p>
                        <button onClick={() => setActiveTab('info')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-[#0F172A] text-white shadow-xl translate-x-1' : 'text-slate-400 hover:bg-slate-50'}`}>
                            <User size={18} /> Personal Info
                        </button>
                        <button onClick={() => setActiveTab('password')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'password' ? 'bg-[#0F172A] text-white shadow-xl translate-x-1' : 'text-slate-400 hover:bg-slate-50'}`}>
                            <ShieldCheck size={18} /> Security
                        </button>
                    </div>

                    {/* Google Calendar Section with Switch UI */}
                    <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4 mt-2">Integrations</p>
                        <button 
                            onClick={handleGoogleConnect}
                            disabled={calendarLoading || isCalendarConnected}
                            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group ${isCalendarConnected ? 'bg-green-50 border border-green-100' : 'hover:bg-blue-50'}`}
                        >
                            <div className="flex items-center gap-4">
                                <Calendar size={18} className={isCalendarConnected ? "text-green-600" : "text-slate-400"} /> 
                                <span className={`text-xs font-black uppercase tracking-widest ${isCalendarConnected ? 'text-green-700' : 'text-slate-400'}`}>
                                    {isCalendarConnected ? 'Linked' : 'Google Calendar'}
                                </span>
                            </div>

                            {/* TOGGLE SWITCH STYLE UI */}
                            <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isCalendarConnected ? 'bg-green-500' : 'bg-slate-200'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isCalendarConnected ? 'left-6' : 'left-1'}`}></div>
                            </div>
                        </button>
                        {isCalendarConnected && (
                            <p className="text-[9px] text-green-600 font-bold px-6 mt-2 flex items-center gap-1">
                                <CheckCircle2 size={10} /> Calendar sync is active
                            </p>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-8 bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm">
                    {activeTab === 'info' ? (
                        <form onSubmit={handleSaveInfo} className="space-y-8 animate-in fade-in duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-6">
                                <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-tighter">General Info</h2>
                                <p className="text-xs text-slate-400 font-bold italic">Fields marked with * are required</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ProfileInput label="First Name" icon={<User />} value={userInfo.firstName} onChange={(v: any) => setUserInfo({...userInfo, firstName: v})} required />
                                <ProfileInput label="Last Name" icon={<User />} value={userInfo.lastName} onChange={(v: any) => setUserInfo({...userInfo, lastName: v})} />
                                <ProfileInput label="Email Address" icon={<Mail />} value={mounted ? user?.email : ''} disabled />
                                <ProfileInput label="Contact Number" icon={<Phone />} value={userInfo.contactNumber} onChange={(v: any) => setUserInfo({...userInfo, contactNumber: v})} />
                            </div>
                            <div className="pt-4">
                                <button disabled={loading || !mounted} type="submit" className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-xl disabled:opacity-50">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className="space-y-8 animate-in fade-in duration-500">
                            <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-tighter border-b border-slate-50 pb-6">Password Update</h2>
                            <div className="space-y-6 max-w-md">
                                <ProfileInput label="Current Password" type="password" icon={<Lock />} required />
                                <div className="h-px bg-slate-50 my-2"></div>
                                <ProfileInput label="New Password" type="password" icon={<Lock />} required />
                                <ProfileInput label="Confirm New Password" type="password" icon={<Lock />} required />
                            </div>
                            <div className="pt-4">
                                <button type="button" className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase hover:bg-black transition-all active:scale-95 shadow-xl">
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
                type={type} value={value} disabled={disabled}
                onChange={(e) => onChange?.(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 outline-none text-sm font-bold transition-all ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-slate-50/50 text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600'}`} 
            />
        </div>
    </div>
);

export default ProfilePage;