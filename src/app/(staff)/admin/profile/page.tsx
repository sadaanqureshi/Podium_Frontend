'use client';

import React, { useState, useEffect } from 'react';
import {
    User,
    ShieldCheck,
    Mail,
    Phone,
    Lock,
    Save,
    Calendar,
    Loader2,
    CheckCircle2,
    Link2,
    Sparkles,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import {
    updateUserProfileAPI,
    connectGoogleCalendarAPI,
    fetchProfileAPI,
} from '@/lib/api/apiService';
import { getErrorMessage } from '@/lib/api/errorMessage';
import { setUser, setAuth } from '@/lib/store/features/authSlice';
import bcrypt from 'bcryptjs';
import { useToast } from '@/context/ToastContext';
import {
    GOOGLE_CALENDAR_SYNC_KEY,
    GOOGLE_CALENDAR_SUCCESS_PATH,
    resolveGoogleConnected,
    withGoogleConnectedFlag,
} from '@/lib/googleCalendar';
import Cookies from 'js-cookie';

const AdminProfilePage = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const token = useAppSelector((state) => state.auth.token);
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
    const [loading, setLoading] = useState(false);
    const [calendarLoading, setCalendarLoading] = useState(false);

    const isCalendarConnected = resolveGoogleConnected(user);

    const [userInfo, setUserInfo] = useState({
        firstName: '',
        lastName: '',
        contactNumber: '',
    });

    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (user && mounted) {
            setUserInfo({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                contactNumber: user.contactNumber || '',
            });
        }
    }, [user, mounted]);

    const refreshProfileAfterGoogle = async () => {
        const authToken = token || Cookies.get('authToken');
        if (!authToken) return;
        try {
            const profile = await fetchProfileAPI(authToken);
            const apiUser = withGoogleConnectedFlag(profile.user, profile, {
                is_google_connected: true,
            });
            dispatch(
                setAuth({
                    token: authToken,
                    user: apiUser,
                    role: apiUser?.role || 'admin',
                    sidebar: profile.sidebar || [],
                })
            );
            dispatch(setUser(apiUser));
            if (resolveGoogleConnected(apiUser)) {
                showToast('Google Calendar connected', 'success');
            }
        } catch {
            /* SessionManager may also sync */
        }
    };

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type !== 'GOOGLE_CALENDAR_CONNECTED') return;
            if (event.data?.user) {
                dispatch(
                    setUser(withGoogleConnectedFlag(event.data.user, { is_google_connected: true }))
                );
                showToast('Google Calendar connected', 'success');
            } else {
                refreshProfileAfterGoogle();
            }
        };

        const onStorage = (event: StorageEvent) => {
            if (event.key === GOOGLE_CALENDAR_SYNC_KEY && event.newValue) {
                refreshProfileAfterGoogle();
            }
        };

        const onVisible = () => {
            if (document.visibilityState !== 'visible') return;
            try {
                if (localStorage.getItem(GOOGLE_CALENDAR_SYNC_KEY)) {
                    localStorage.removeItem(GOOGLE_CALENDAR_SYNC_KEY);
                    refreshProfileAfterGoogle();
                }
            } catch {
                /* ignore */
            }
        };

        window.addEventListener('message', onMessage);
        window.addEventListener('storage', onStorage);
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', onVisible);

        return () => {
            window.removeEventListener('message', onMessage);
            window.removeEventListener('storage', onStorage);
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('focus', onVisible);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, token]);

    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = await updateUserProfileAPI(user.id, userInfo);
            dispatch(setUser(withGoogleConnectedFlag(response.data || response, user)));
            showToast('Profile updated successfully!', 'success');
        } catch (err: unknown) {
            showToast(getErrorMessage(err, 'Update failed. Please try again.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            return showToast('New passwords do not match!', 'error');
        }

        const isMatch = bcrypt.compareSync(passwords.oldPassword, user?.password || '');
        if (!isMatch) {
            return showToast('Current password is wrong!', 'error');
        }

        setLoading(true);
        try {
            const response = await updateUserProfileAPI(user.id, {
                ...userInfo,
                password: passwords.newPassword,
            });
            dispatch(setUser(withGoogleConnectedFlag(response.data || response, user)));
            showToast('Password changed successfully!', 'success');
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: unknown) {
            showToast(getErrorMessage(err, 'Failed to update password.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleConnect = async () => {
        if (isCalendarConnected) return;
        setCalendarLoading(true);
        try {
            const returnUrl = `${window.location.origin}${GOOGLE_CALENDAR_SUCCESS_PATH}?next=${encodeURIComponent('/admin/profile')}`;
            const responseUrl = await connectGoogleCalendarAPI({ returnUrl });
            if (responseUrl && responseUrl.startsWith('http')) {
                window.open(responseUrl, '_blank', 'noopener,noreferrer');
                showToast(
                    'Complete Google sign-in in the new tab. This page will update when done.',
                    'info'
                );
            } else {
                showToast('Could not start Google connection. Try again.', 'error');
            }
        } catch (err: unknown) {
            showToast(getErrorMessage(err, 'Google connection failed.'), 'error');
        } finally {
            setCalendarLoading(false);
        }
    };

    if (!mounted) return null;

    const initials =
        `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'A';

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-6 md:pt-10 space-y-8 text-text-main animate-in fade-in duration-500">
            <section className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-border-subtle bg-card-bg shadow-xl">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.22),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.08),_transparent_50%)]" />
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent-blue/10 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-8 p-8 md:p-12">
                    <div className="relative shrink-0">
                        <div className="h-24 w-24 md:h-28 md:w-28 rounded-[1.75rem] bg-gradient-to-br from-accent-blue to-hover-blue text-white flex items-center justify-center text-3xl md:text-4xl font-black shadow-2xl shadow-accent-blue/30 ring-4 ring-card-bg">
                            {initials}
                        </div>
                        {isCalendarConnected && (
                            <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg ring-4 ring-card-bg">
                                <CheckCircle2 size={18} />
                            </span>
                        )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-accent-blue">
                            Admin profile
                        </p>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none truncate">
                            {user?.firstName} {user?.lastName}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent-blue/25 bg-accent-blue/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-accent-blue">
                                <Sparkles size={12} />
                                {user?.role?.roleName || 'Administrator'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-app-bg/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                <Mail size={12} className="text-accent-blue" />
                                {user?.email}
                            </span>
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                                    isCalendarConnected
                                        ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500'
                                        : 'border-amber-500/25 bg-amber-500/10 text-amber-500'
                                }`}
                            >
                                <Calendar size={12} />
                                {isCalendarConnected ? 'Google linked' : 'Google not linked'}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-card-bg border border-border-subtle w-fit">
                <TabButton
                    active={activeTab === 'info'}
                    onClick={() => setActiveTab('info')}
                    icon={<User size={15} />}
                    label="Profile"
                />
                <TabButton
                    active={activeTab === 'password'}
                    onClick={() => setActiveTab('password')}
                    icon={<ShieldCheck size={15} />}
                    label="Password"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <aside className="xl:col-span-4 space-y-4">
                    <div className="relative overflow-hidden rounded-[1.75rem] border border-border-subtle bg-card-bg p-6 shadow-sm">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.12),_transparent_60%)]" />
                        <div className="relative z-10 space-y-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-text-muted">
                                        Integrations
                                    </p>
                                    <h2 className="mt-2 text-lg font-black tracking-tight">
                                        Google Calendar
                                    </h2>
                                    <p className="mt-2 text-xs text-text-muted leading-relaxed font-medium">
                                        Optional for admins — useful if you also schedule calendar
                                        events from Podium.
                                    </p>
                                </div>
                                <div
                                    className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center ${
                                        isCalendarConnected
                                            ? 'bg-emerald-500/15 text-emerald-500'
                                            : 'bg-accent-blue/10 text-accent-blue'
                                    }`}
                                >
                                    <Link2 size={18} />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleConnect}
                                disabled={calendarLoading || isCalendarConnected}
                                className={`w-full flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 transition-all ${
                                    isCalendarConnected
                                        ? 'border-emerald-500/25 bg-emerald-500/10 cursor-default'
                                        : 'border-border-subtle bg-app-bg hover:border-accent-blue/40 hover:bg-accent-blue/5'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Calendar
                                        size={18}
                                        className={
                                            isCalendarConnected
                                                ? 'text-emerald-500'
                                                : 'text-accent-blue'
                                        }
                                    />
                                    <div className="text-left min-w-0">
                                        <p
                                            className={`text-[11px] font-black uppercase tracking-widest truncate ${
                                                isCalendarConnected
                                                    ? 'text-emerald-500'
                                                    : 'text-text-main'
                                            }`}
                                        >
                                            {calendarLoading
                                                ? 'Connecting…'
                                                : isCalendarConnected
                                                  ? 'Connected'
                                                  : 'Link Google'}
                                        </p>
                                        <p className="text-[10px] font-bold text-text-muted mt-0.5">
                                            {isCalendarConnected
                                                ? 'Calendar sync active'
                                                : 'Tap to authorize'}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                                        isCalendarConnected ? 'bg-emerald-500' : 'bg-border-subtle'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                                            isCalendarConnected ? 'left-6' : 'left-1'
                                        }`}
                                    />
                                </div>
                            </button>

                            {calendarLoading && (
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    <Loader2 size={14} className="animate-spin text-accent-blue" />
                                    Opening Google…
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                <section className="xl:col-span-8 rounded-[1.75rem] border border-border-subtle bg-card-bg p-6 md:p-10 shadow-sm min-h-[420px]">
                    {activeTab === 'info' ? (
                        <form
                            onSubmit={handleSaveInfo}
                            className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-border-subtle pb-6">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black tracking-tight">
                                        Basic details
                                    </h2>
                                    <p className="text-xs text-text-muted font-medium mt-1">
                                        Keep your admin identity up to date.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <ProfileInput
                                    label="First Name"
                                    icon={<User />}
                                    value={userInfo.firstName}
                                    onChange={(v: string) =>
                                        setUserInfo({ ...userInfo, firstName: v })
                                    }
                                    required
                                />
                                <ProfileInput
                                    label="Last Name"
                                    icon={<User />}
                                    value={userInfo.lastName}
                                    onChange={(v: string) =>
                                        setUserInfo({ ...userInfo, lastName: v })
                                    }
                                />
                                <ProfileInput
                                    label="Email Address"
                                    icon={<Mail />}
                                    value={user?.email}
                                    disabled
                                />
                                <ProfileInput
                                    label="Phone Number"
                                    icon={<Phone />}
                                    value={userInfo.contactNumber}
                                    onChange={(v: string) =>
                                        setUserInfo({ ...userInfo, contactNumber: v })
                                    }
                                />
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-accent-blue text-white text-[11px] font-black uppercase tracking-widest hover:bg-hover-blue transition-all disabled:opacity-50 shadow-lg shadow-accent-blue/20"
                            >
                                {loading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Save size={16} />
                                )}
                                Save changes
                            </button>
                        </form>
                    ) : (
                        <form
                            onSubmit={handleUpdatePassword}
                            className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-lg"
                        >
                            <div className="border-b border-border-subtle pb-6">
                                <h2 className="text-xl md:text-2xl font-black tracking-tight">
                                    Security
                                </h2>
                                <p className="text-xs text-text-muted font-medium mt-1">
                                    Update your password to keep your account secure.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <ProfileInput
                                    label="Current Password"
                                    type="password"
                                    icon={<Lock />}
                                    value={passwords.oldPassword}
                                    onChange={(v: string) =>
                                        setPasswords({ ...passwords, oldPassword: v })
                                    }
                                    required
                                />
                                <ProfileInput
                                    label="New Password"
                                    type="password"
                                    icon={<Lock />}
                                    value={passwords.newPassword}
                                    onChange={(v: string) =>
                                        setPasswords({ ...passwords, newPassword: v })
                                    }
                                    required
                                />
                                <ProfileInput
                                    label="Confirm New Password"
                                    type="password"
                                    icon={<Lock />}
                                    value={passwords.confirmPassword}
                                    onChange={(v: string) =>
                                        setPasswords({ ...passwords, confirmPassword: v })
                                    }
                                    required
                                />
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-text-main text-card-bg text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <ShieldCheck size={16} />
                                )}
                                Update password
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </div>
    );
};

function TabButton({
    active,
    onClick,
    icon,
    label,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                active
                    ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/25'
                    : 'text-text-muted hover:text-text-main hover:bg-app-bg'
            }`}
        >
            {icon}
            {label}
        </button>
    );
}

const ProfileInput = ({
    label,
    value,
    onChange,
    icon,
    type = 'text',
    disabled = false,
    required = false,
}: any) => (
    <div className="space-y-2">
        <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-text-muted ml-1">
            {label} {required && <span className="text-accent-blue">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/45 group-focus-within:text-accent-blue transition-colors pointer-events-none">
                {React.cloneElement(icon, { size: 18 })}
            </div>
            <input
                type={type}
                value={value ?? ''}
                disabled={disabled}
                onChange={(e) => onChange?.(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border outline-none text-sm font-semibold transition-all ${
                    disabled
                        ? 'bg-app-bg/60 text-text-muted opacity-70 cursor-not-allowed border-border-subtle'
                        : 'bg-app-bg text-text-main border-border-subtle focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10'
                }`}
            />
        </div>
    </div>
);

export default AdminProfilePage;
