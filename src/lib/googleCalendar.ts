/** localStorage key set by /google-calendar/success after OAuth completes */
export const GOOGLE_CALENDAR_SYNC_KEY = 'podium_google_calendar_connected';

export const GOOGLE_CALENDAR_SUCCESS_PATH = '/google-calendar/success';

/**
 * Resolve Google connection from login/profile payloads.
 * Supports root-level `is_google_connected` and legacy user fields.
 */
export function resolveGoogleConnected(...sources: unknown[]): boolean {
    for (const source of sources) {
        if (source == null || typeof source !== 'object') continue;
        const s = source as Record<string, unknown>;
        const candidates = [
            s.is_google_connected,
            s.isGoogleConnected,
            s.isCalendarConnected,
            s.is_calendar_connected,
        ];
        for (const v of candidates) {
            if (typeof v === 'boolean') return v;
            if (v === 1 || v === '1' || v === 'true') return true;
            if (v === 0 || v === '0' || v === 'false') return false;
        }
    }
    return false;
}

/** Merge Google flag onto the user object for Redux (toggle-friendly). */
export function withGoogleConnectedFlag(user: any, ...extras: unknown[]) {
    const connected = resolveGoogleConnected(user, ...extras);
    return {
        ...(user || {}),
        is_google_connected: connected,
        isGoogleConnected: connected,
        isCalendarConnected: connected,
        is_calendar_connected: connected,
    };
}
