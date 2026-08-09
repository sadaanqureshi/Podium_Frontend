'use client';

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type PaginationMeta = {
    totalItems?: number;
    itemCount?: number;
    itemsPerPage?: number;
    totalPages?: number;
    currentPage?: number;
};

type PaginationProps = {
    /** 1-based current page */
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    /** Optional total item count for “· N total” */
    totalItems?: number;
    /** Disable controls while fetching */
    loading?: boolean;
    /**
     * `simple` — Prev / Next + “Page X of Y” (server lists)
     * `numbered` — page number buttons (grids / catalogs)
     */
    variant?: 'simple' | 'numbered';
    /** Hide entirely when only one page (default false — still shows “Page 1 of 1”) */
    hideWhenSinglePage?: boolean;
    className?: string;
    align?: 'start' | 'between' | 'center';
};

function buildPageList(current: number, total: number): Array<number | 'ellipsis'> {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = new Set<number>([1, total, current]);
    for (let i = current - 1; i <= current + 1; i++) {
        if (i >= 1 && i <= total) pages.add(i);
    }
    if (current <= 3) {
        pages.add(2);
        pages.add(3);
        pages.add(4);
    }
    if (current >= total - 2) {
        pages.add(total - 1);
        pages.add(total - 2);
        pages.add(total - 3);
    }

    const sorted = Array.from(pages).sort((a, b) => a - b);
    const out: Array<number | 'ellipsis'> = [];
    for (let i = 0; i < sorted.length; i++) {
        const n = sorted[i];
        if (i > 0 && n - sorted[i - 1] > 1) out.push('ellipsis');
        out.push(n);
    }
    return out;
}

/** Normalize common API meta shapes into page / totalPages / totalItems */
export function normalizePaginationMeta(
    meta?: PaginationMeta | null,
    fallbackPage = 1
): { page: number; totalPages: number; totalItems: number } {
    const page = Math.max(1, meta?.currentPage ?? fallbackPage);
    const totalPages = Math.max(1, meta?.totalPages ?? 1);
    const totalItems = meta?.totalItems ?? meta?.itemCount ?? 0;
    return { page, totalPages, totalItems };
}

const Pagination: React.FC<PaginationProps> = ({
    page,
    totalPages,
    onPageChange,
    totalItems,
    loading = false,
    variant = 'simple',
    hideWhenSinglePage = false,
    className = '',
    align = 'between',
}) => {
    const safeTotal = Math.max(1, totalPages || 1);
    const safePage = Math.min(Math.max(1, page || 1), safeTotal);
    const pageList = useMemo(
        () => buildPageList(safePage, safeTotal),
        [safePage, safeTotal]
    );

    if (hideWhenSinglePage && safeTotal <= 1) return null;

    const alignClass =
        align === 'center'
            ? 'justify-center'
            : align === 'start'
              ? 'justify-start'
              : 'justify-between';

    const go = (next: number) => {
        if (loading) return;
        const clamped = Math.min(Math.max(1, next), safeTotal);
        if (clamped !== safePage) onPageChange(clamped);
    };

    return (
        <nav
            aria-label="Pagination"
            className={`flex flex-wrap items-center gap-3 ${alignClass} ${className}`}
        >
            {(variant === 'simple' || totalItems != null) && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    Page {safePage} of {safeTotal}
                    {typeof totalItems === 'number' ? ` · ${totalItems} total` : ''}
                </p>
            )}

            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    disabled={safePage <= 1 || loading}
                    onClick={() => go(safePage - 1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-border-subtle text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent-blue hover:border-accent-blue/30 disabled:opacity-40 transition-colors"
                >
                    <ChevronLeft size={14} /> Prev
                </button>

                {variant === 'numbered' &&
                    pageList.map((item, idx) =>
                        item === 'ellipsis' ? (
                            <span
                                key={`e-${idx}`}
                                className="w-8 h-8 flex items-center justify-center text-text-muted text-xs"
                            >
                                …
                            </span>
                        ) : (
                            <button
                                key={item}
                                type="button"
                                disabled={loading}
                                onClick={() => go(item)}
                                className={`w-8 h-8 flex items-center justify-center rounded-xl text-[10px] font-black transition-all border ${
                                    safePage === item
                                        ? 'bg-accent-blue text-white border-accent-blue shadow-lg shadow-accent-blue/20'
                                        : 'bg-card-bg text-text-muted border-border-subtle hover:border-accent-blue/30'
                                }`}
                            >
                                {item}
                            </button>
                        )
                    )}

                <button
                    type="button"
                    disabled={safePage >= safeTotal || loading}
                    onClick={() => go(safePage + 1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-border-subtle text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent-blue hover:border-accent-blue/30 disabled:opacity-40 transition-colors"
                >
                    Next <ChevronRight size={14} />
                </button>
            </div>
        </nav>
    );
};

export default Pagination;
