'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, Calendar, AlertCircle } from 'lucide-react';
import Cookies from 'js-cookie';
import { fetchProfileAPI } from '@/lib/api/apiService';
import { getErrorMessage } from '@/lib/api/errorMessage';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setAuth, setUser } from '@/lib/store/features/authSlice';
import { useToast } from '@/context/ToastContext';
import { roleFromRoleId } from '@/lib/navigationConfig';
import { GOOGLE_CALENDAR_SYNC_KEY } from '@/lib/googleCalendar';
import { withGoogleConnectedFlag } from '@/lib/googleCalendar';

function profilePathForRole(role: string | null | undefined): string {
    const r = String(role || '').toLowerCase();
    if (r === 'admin') return '/admin/profile';
    if (r === 'student') return '/student/profile';
    return '/teacher/profile';
}

function GoogleCalendarSuccessInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const { showToast } = useToast();
    const authRole = useAppSelector((s) => s.auth.role);
    const authRoleId = useAppSelector((s) => s.auth.roleId);
    const [status, setStatus] = useState<'syncing' | 'done' | 'error'>('syncing');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        let cancelled = false;

        const finish = async () => {
            const token = Cookies.get('authToken');
            if (!token) {
                setStatus('error');
                setErrorMsg('Session expired. Please sign in again.');
                showToast('Session expired. Please sign in again.', 'error');
                setTimeout(() => router.replace('/teacher/signin'), 1500);
                return;
            }

            try {
                try {
                    localStorage.setItem(GOOGLE_CALENDAR_SYNC_KEY, String(Date.now()));
                } catch {
                    /* ignore */
                }

                const profile = await fetchProfileAPI(token);
                const apiUser = withGoogleConnectedFlag(profile.user, profile, {
                    is_google_connected: true,
                });
                const apiRole = apiUser?.role;
                const apiRoleName =
                    apiRole?.roleName || apiRole?.name || authRole || 'teacher';

                dispatch(
                    setAuth({
                        token,
                        user: apiUser,
                        role: apiRole || apiRoleName,
                        sidebar: profile.sidebar || [],
                    })
                );
                dispatch(setUser(apiUser));

                if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
                    try {
                        window.opener.postMessage(
                            { type: 'GOOGLE_CALENDAR_CONNECTED', user: apiUser },
                            window.location.origin
                        );
                    } catch {
                        /* ignore */
                    }
                }

                if (cancelled) return;
                setStatus('done');
                showToast('Google Calendar connected successfully', 'success');

                const portal =
                    roleFromRoleId(apiUser?.role?.id ?? authRoleId) ||
                    String(apiRoleName).toLowerCase();
                const next =
                    searchParams.get('next') || profilePathForRole(portal);

                setTimeout(() => {
                    if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
                        window.close();
                        router.replace(next);
                        return;
                    }
                    router.replace(next);
                }, 1200);
            } catch (err) {
                if (cancelled) return;
                const msg = getErrorMessage(
                    err,
                    'Connected, but failed to refresh profile. Open Profile to verify.'
                );
                setStatus('error');
                setErrorMsg(msg);
                showToast(msg, 'error');
                setTimeout(() => {
                    router.replace(profilePathForRole(authRole));
                }, 2000);
            }
        };

        finish();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-app-bg p-6 text-center text-text-main">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-[2.5rem] blur-2xl opacity-40 animate-pulse" />
                <div className="relative w-24 h-24 bg-card-bg rounded-[2rem] shadow-xl flex items-center justify-center border border-border-subtle">
                    {status === 'error' ? (
                        <AlertCircle size={48} className="text-red-500" />
                    ) : (
                        <CheckCircle size={48} className="text-emerald-500 animate-in zoom-in duration-300" />
                    )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-text-main text-card-bg rounded-2xl flex items-center justify-center border-4 border-app-bg shadow-lg">
                    <Calendar size={18} />
                </div>
            </div>

            <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight uppercase">
                    {status === 'error' ? 'Almost there' : 'Calendar Connected'}
                </h1>
                <p className="text-text-muted font-medium max-w-sm mx-auto leading-relaxed text-sm">
                    {status === 'error'
                        ? errorMsg
                        : 'Your Google Calendar is linked with Podium. Redirecting to your profile…'}
                </p>
            </div>

            {status !== 'error' && (
                <div className="mt-12 flex items-center gap-3 px-6 py-3 bg-card-bg rounded-2xl border border-border-subtle shadow-sm">
                    <Loader2 className="animate-spin text-accent-blue" size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                        {status === 'syncing' ? 'Syncing profile' : 'Opening profile'}
                    </span>
                </div>
            )}
        </div>
    );
}

export default function GoogleCalendarSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="h-screen flex items-center justify-center bg-app-bg text-text-muted">
                    <Loader2 className="animate-spin" size={28} />
                </div>
            }
        >
            <GoogleCalendarSuccessInner />
        </Suspense>
    );
}
