'use client';

import React, { useState, useEffect } from 'react';
import {
    User, ShieldCheck, Mail, Phone, Lock,
    Save, Calendar, Loader2, CheckCircle2, X, AlertTriangle
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { updateUserProfileAPI, connectGoogleCalendarAPI } from '@/lib/api/apiService';
import { setUser } from '@/lib/store/features/authSlice';
import bcrypt from 'bcryptjs';

// Generic Toast Import
import Toast from '@/components/ui/Toast';

const ProfilePage = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    
    const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
    const [loading, setLoading] = useState(false);
    const [calendarLoading, setCalendarLoading] = useState(false);
    
    // Toast State
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: '', type: null });

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
    };

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

    // --- 1. SAVE PROFILE INFO ---
    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = await updateUserProfileAPI(user.id, userInfo);
            dispatch(setUser(response.data || response));
            showToast("Profile updated successfully!", "success");
        } catch (err: any) {
            showToast("Update failed. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. PASSWORD UPDATE LOGIC (Bcrypt Local Check) ---
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            return showToast("New passwords do not match!", "error");
        }

        // Backend se milne wala hash aur current input ka comparison
        // Note: Agar user.password undefined hai, toh backend se hash mangwana hoga
        const isMatch = bcrypt.compareSync(passwords.oldPassword, user?.password || '');
        
        if (!isMatch) {
            return showToast("Current password is wrong!", "error");
        }

        setLoading(true);
        try {
            // Updating via same API
            const response = await updateUserProfileAPI(user.id, { 
                ...userInfo, 
                password: passwords.newPassword 
            });
            dispatch(setUser(response.data || response));
            showToast("Password changed successfully!", "success");
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            showToast("Failed to update password.", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- 3. GOOGLE CALENDAR LOGIC (Back in action!) ---
    const handleGoogleConnect = async () => {
        if (isCalendarConnected) return;
        setCalendarLoading(true);
        try {
            const responseUrl = await connectGoogleCalendarAPI();
            if (responseUrl && responseUrl.startsWith('http')) {
                window.open(responseUrl, '_blank', 'noopener,noreferrer');
                showToast("Please complete login in the new tab.", "success");
            }
        } catch (err: any) {
            showToast("Google connection failed.", "error");
        } finally {
            setCalendarLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 bg-app-bg min-h-screen text-text-main transition-colors relative">
            
            {/* TOAST NOTIFICATION */}
            <Toast 
                message={toast.msg} 
                type={toast.type} 
                onClose={() => setToast({ msg: '', type: null })} 
            />

            {/* Header Card */}
            <div className="hero-registry-card rounded-[2.5rem] p-8 md:p-12 mb-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-8 transition-all duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="relative group flex-shrink-0">
                    <div className="w-24 h-24 md:w-36 md:h-36 rounded-[2.5rem] bg-accent-blue text-white flex items-center justify-center text-5xl font-black border-4 border-card-bg shadow-2xl transition-transform duration-500 group-hover:scale-105">
                        {user?.firstName?.[0] || 'U'}
                    </div>
                </div>
                <div className="text-center sm:text-left pt-4">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-2">{user?.firstName} {user?.lastName}</h1>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 items-center mt-4">
                        <span className="px-4 py-1.5 bg-accent-blue/20 text-accent-blue rounded-full text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">{user?.role?.roleName || 'User'}</span>
                        <span className="text-text-muted text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide"><Mail size={14} className="text-accent-blue" /> {user?.email}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="bg-card-bg rounded-[2.5rem] p-4 border border-border-subtle shadow-sm space-y-2">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-5 mb-4 mt-3">Account Settings</p>
                        <button onClick={() => setActiveTab('info')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-text-main text-card-bg shadow-xl translate-x-1' : 'text-text-muted hover:bg-app-bg'}`}><User size={18} /> Profile Info</button>
                        <button onClick={() => setActiveTab('password')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'password' ? 'bg-text-main text-card-bg shadow-xl translate-x-1' : 'text-text-muted hover:bg-app-bg'}`}><ShieldCheck size={18} /> Password</button>
                    </div>

                    {/* Google Connection Card */}
                    <div className="bg-card-bg rounded-[2.5rem] p-4 border border-border-subtle shadow-sm">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-5 mb-4 mt-3">Integrations</p>
                        <button onClick={handleGoogleConnect} disabled={calendarLoading || isCalendarConnected} className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all ${isCalendarConnected ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-app-bg border border-border-subtle hover:border-accent-blue/30'}`}>
                            <div className="flex items-center gap-4">
                                <Calendar size={18} className={isCalendarConnected ? "text-emerald-500" : "text-accent-blue"} />
                                <span className={`text-[11px] font-black uppercase tracking-widest ${isCalendarConnected ? 'text-emerald-600' : 'text-text-main'}`}>
                                    {isCalendarConnected ? 'Google Linked' : 'Link Google'}
                                </span>
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-all ${isCalendarConnected ? 'bg-emerald-500' : 'bg-border-subtle'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isCalendarConnected ? 'left-6' : 'left-1'}`}></div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="lg:col-span-8 bg-card-bg rounded-[2.5rem] p-8 md:p-12 border border-border-subtle shadow-sm min-h-[500px]">
                    {activeTab === 'info' ? (
                        <form onSubmit={handleSaveInfo} className="space-y-10 animate-in fade-in duration-500">
                            <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter border-b border-border-subtle pb-8">Basic Profile</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <ProfileInput label="First Name" icon={<User />} value={userInfo.firstName} onChange={(v: string) => setUserInfo({ ...userInfo, firstName: v })} required />
                                <ProfileInput label="Last Name" icon={<User />} value={userInfo.lastName} onChange={(v: string) => setUserInfo({ ...userInfo, lastName: v })} />
                                <ProfileInput label="Email Address" icon={<Mail />} value={user?.email} disabled />
                                <ProfileInput label="Phone Number" icon={<Phone />} value={userInfo.contactNumber} onChange={(v: string) => setUserInfo({ ...userInfo, contactNumber: v })} />
                            </div>
                            <button disabled={loading} type="submit" className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-accent-blue text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-hover-blue transition-all active:scale-95 shadow-xl shadow-accent-blue/20 disabled:opacity-50">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleUpdatePassword} className="space-y-10 animate-in fade-in duration-500">
                            <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter border-b border-border-subtle pb-8">Security Check</h2>
                            <div className="space-y-8 max-w-md">
                                <ProfileInput label="Current Password" type="password" icon={<Lock />} value={passwords.oldPassword} onChange={(v: string) => setPasswords({...passwords, oldPassword: v})} required />
                                <ProfileInput label="New Password" type="password" icon={<Lock />} value={passwords.newPassword} onChange={(v: string) => setPasswords({...passwords, newPassword: v})} required />
                                <ProfileInput label="Confirm New Password" type="password" icon={<Lock />} value={passwords.confirmPassword} onChange={(v: string) => setPasswords({...passwords, confirmPassword: v})} required />
                            </div>
                            <button disabled={loading} type="submit" className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-text-main text-card-bg rounded-2xl font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-2xl disabled:opacity-50">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />} Update Password
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// Themed Input
const ProfileInput = ({ label, value, onChange, icon, type = "text", disabled = false, required = false }: any) => (
    <div className="space-y-3">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">{label} {required && <span className="text-accent-blue">*</span>}</label>
        <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-accent-blue transition-colors pointer-events-none">{React.cloneElement(icon, { size: 20 })}</div>
            <input type={type} value={value} disabled={disabled} onChange={(e) => onChange?.(e.target.value)} className={`w-full pl-14 pr-6 py-5 rounded-[1.5rem] border-2 border-border-subtle outline-none text-sm font-bold transition-all ${disabled ? 'bg-app-bg text-text-muted opacity-50 cursor-not-allowed' : 'bg-app-bg text-text-main focus:bg-card-bg focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue shadow-inner'}`} />
        </div>
    </div>
);

export default ProfilePage;