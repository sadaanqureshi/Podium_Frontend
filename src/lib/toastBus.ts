export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastPayload = {
    message: string;
    type: ToastType;
};

type Listener = (payload: ToastPayload) => void;

const listeners = new Set<Listener>();

/** Tiny event bus so Redux middleware can emit toasts without React hooks. */
export const toastBus = {
    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
    emit(message: string, type: ToastType = 'error') {
        const msg = (message || '').trim();
        if (!msg) return;
        const payload: ToastPayload = { message: msg, type };
        listeners.forEach((l) => {
            try {
                l(payload);
            } catch {
                /* ignore listener errors */
            }
        });
    },
};
