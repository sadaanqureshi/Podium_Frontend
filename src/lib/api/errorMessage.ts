/**
 * Backend-first API error helpers.
 * Prefer response body message; fall back to a frontend default.
 */

export type ToastableError = {
    message?: string;
    status?: number;
    isNetworkError?: boolean;
    skipErrorToast?: boolean;
};

/** Pull a human-readable string from a typical API error body. */
export function extractBackendMessage(body: unknown): string | null {
    if (body == null) return null;
    if (typeof body === 'string') {
        const trimmed = body.trim();
        return trimmed || null;
    }
    if (typeof body !== 'object') return null;

    const obj = body as Record<string, unknown>;

    for (const key of ['message', 'error', 'msg'] as const) {
        const val = obj[key];
        if (typeof val === 'string' && val.trim()) return val.trim();
        if (Array.isArray(val) && val.length) {
            const first = val[0];
            if (typeof first === 'string' && first.trim()) return first.trim();
            if (first && typeof first === 'object' && typeof (first as any).message === 'string') {
                return String((first as any).message).trim();
            }
        }
    }

    if (Array.isArray(obj.errors) && obj.errors.length) {
        const first = obj.errors[0];
        if (typeof first === 'string' && first.trim()) return first.trim();
        if (first && typeof first === 'object') {
            const m = (first as any).message ?? (first as any).msg;
            if (typeof m === 'string' && m.trim()) return m.trim();
        }
    }

    return null;
}

/**
 * Normalize any thrown / RTK / axios-ish value into a display string.
 * Order: known message fields → Error.message → fallback.
 */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
    if (err == null || err === '') return fallback;

    if (typeof err === 'string') {
        const trimmed = err.trim();
        return trimmed || fallback;
    }

    if (err instanceof Error) {
        const fromMsg = err.message?.trim();
        if (fromMsg) return fromMsg;
        return fallback;
    }

    if (typeof err === 'object') {
        const obj = err as Record<string, unknown>;

        const direct = extractBackendMessage(obj);
        if (direct) return direct;

        // RTK / axios shapes
        if (obj.payload != null) {
            const fromPayload = getErrorMessage(obj.payload, '');
            if (fromPayload) return fromPayload;
        }
        if (obj.data != null) {
            const fromData = extractBackendMessage(obj.data) || getErrorMessage(obj.data, '');
            if (fromData) return fromData;
        }
        if (obj.response && typeof obj.response === 'object') {
            const res = obj.response as Record<string, unknown>;
            const fromResData = extractBackendMessage(res.data);
            if (fromResData) return fromResData;
        }
        if (obj.error != null && typeof obj.error === 'object') {
            const nested = getErrorMessage(obj.error, '');
            if (nested) return nested;
        }
    }

    return fallback;
}

/**
 * If response is not ok, parse JSON (safely) and throw Error with
 * backend message when available, otherwise `fallback`.
 * Attaches `status` (and preserves network-style flags when relevant).
 */
export async function throwIfNotOk(
    response: Response,
    fallback = 'Request failed'
): Promise<void> {
    if (response.ok) return;

    let body: unknown = null;
    try {
        const text = await response.text();
        if (text) {
            try {
                body = JSON.parse(text);
            } catch {
                body = text;
            }
        }
    } catch {
        body = null;
    }

    const message = extractBackendMessage(body) || fallback;
    const err = new Error(message) as Error & ToastableError;
    err.status = response.status;
    throw err;
}

/** Attach skipErrorToast so SessionManager / silent callers can opt out. */
export function markSilentError(err: unknown): unknown {
    if (err && typeof err === 'object') {
        (err as ToastableError).skipErrorToast = true;
    }
    return err;
}
