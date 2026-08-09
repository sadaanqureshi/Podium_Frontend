export function formatMoney(value: string | number | null | undefined): string {
    const n = typeof value === 'number' ? value : Number.parseFloat(String(value ?? '0'));
    if (Number.isNaN(n)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(n);
}

export function formatRelativeTime(iso: string | null | undefined): string {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    const diffMs = date.getTime() - Date.now();
    const abs = Math.abs(diffMs);
    const minutes = Math.round(abs / 60000);
    const hours = Math.round(abs / 3600000);
    const days = Math.round(abs / 86400000);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (minutes < 60) return rtf.format(Math.sign(diffMs) * minutes || 0, 'minute');
    if (hours < 48) return rtf.format(Math.sign(diffMs) * hours, 'hour');
    if (days < 30) return rtf.format(Math.sign(diffMs) * days, 'day');
    return date.toLocaleDateString('en-GB');
}

export function formatMonthLabel(ym: string): string {
    const [y, m] = ym.split('-').map(Number);
    if (!y || !m) return ym;
    return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short', year: '2-digit' });
}
