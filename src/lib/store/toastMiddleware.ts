import { Middleware, isRejected, isRejectedWithValue } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/api/errorMessage';
import { toastBus } from '@/lib/toastBus';

/** Thunk type prefixes that should never auto-toast errors (background / silent). */
const SILENT_ERROR_PREFIXES: string[] = [
    // reserved for future silent profile thunks
];

function shouldSkipErrorToast(action: any): boolean {
    if (action?.meta?.aborted) return true;
    if (action?.meta?.condition) return true; // RTK skipped due to condition

    const type = String(action?.type || '');
    if (SILENT_ERROR_PREFIXES.some((p) => type.startsWith(p))) return true;

    const payload = action?.payload;
    if (payload && typeof payload === 'object' && (payload as any).skipErrorToast) {
        return true;
    }

    // Serialized error from throw with skipErrorToast
    if (action?.error && typeof action.error === 'object' && (action.error as any).skipErrorToast) {
        return true;
    }

    return false;
}

/**
 * Auto-toast rejected async thunks with backend-first messages.
 * Success toasts stay at call sites (mutations) to avoid spam on list GETs.
 */
export const toastMiddleware: Middleware = () => (next) => (action) => {
    const result = next(action);

    if (isRejected(action) || isRejectedWithValue(action)) {
        if (shouldSkipErrorToast(action)) return result;

        const message = getErrorMessage(
            (action as any).payload ?? (action as any).error,
            'Something went wrong'
        );

        // Ignore empty / ConditionError noise
        if (
            !message ||
            message === 'Aborted' ||
            message.includes('ConditionError') ||
            message === 'Rejected'
        ) {
            return result;
        }

        toastBus.emit(message, 'error');
    }

    return result;
};
