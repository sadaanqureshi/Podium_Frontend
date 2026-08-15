'use client';
import React, { useEffect, useState } from 'react';
import { X, Loader2, Check, AlertCircle } from 'lucide-react';

export interface InfoField {
    label: string;
    value: React.ReactNode;
    isHighlight?: boolean;
    capitalize?: boolean;
}

export interface InfoSection {
    title: string;
    icon?: React.ReactNode;
    fields: InfoField[];
}

interface MoreInfoProps {
    isOpen: boolean;
    onClose: () => void;
    loading?: boolean;

    title: string;
    subtitle?: string;
    headerIcon?: React.ReactNode;

    topCards?: { label: string; value: React.ReactNode }[];
    sections: InfoSection[];
    imageProof?: { label: string; url: string } | null;

    showActions?: boolean;
    closedMessage?: string;
    actionLoading?: boolean;
    onApprove?: () => void;
    onReject?: () => void;
    approveText?: string;
    rejectText?: string;

    /** Show in-drawer rejection reason form (no browser prompt) */
    rejectReasonOpen?: boolean;
    rejectionReason?: string;
    onRejectionReasonChange?: (value: string) => void;
    onConfirmReject?: () => void;
    onCancelReject?: () => void;
    rejectReasonPlaceholder?: string;
}

const MoreInfo: React.FC<MoreInfoProps> = ({
    isOpen,
    onClose,
    loading,
    title,
    subtitle,
    headerIcon,
    topCards,
    sections,
    imageProof,
    showActions,
    closedMessage,
    actionLoading,
    onApprove,
    onReject,
    approveText = 'Approve',
    rejectText = 'Reject',
    rejectReasonOpen = false,
    rejectionReason = '',
    onRejectionReasonChange,
    onConfirmReject,
    onCancelReject,
    rejectReasonPlaceholder = 'e.g. Payment proof unclear',
}) => {
    const [isZoomed, setIsZoomed] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isZoomed) setIsZoomed(false);
                else if (rejectReasonOpen && onCancelReject) onCancelReject();
                else onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, isZoomed, rejectReasonOpen, onCancelReject]);

    useEffect(() => {
        if (isOpen || isZoomed) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isZoomed]);

    useEffect(() => {
        if (!isOpen) setIsZoomed(false);
    }, [isOpen]);

    useEffect(() => {
        setImageFailed(false);
    }, [imageProof?.url]);

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            <div
                className={`fixed inset-y-0 right-0 w-full max-w-lg bg-card-bg shadow-2xl border-l border-border-subtle z-[110] transform transition-transform duration-300 ease-in-out flex flex-col ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-border-subtle bg-app-bg/50 gap-3">
                    <div className="flex items-center gap-3">
                        {headerIcon && (
                            <div className="p-2 bg-accent-blue/10 text-accent-blue rounded-md">
                                {headerIcon}
                            </div>
                        )}
                        <div>
                            <h2 className="text-lg font-bold text-text-main tracking-tight">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-widest mt-0.5">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-border-subtle text-text-muted hover:text-text-main rounded-md transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-50">
                            <Loader2 className="animate-spin text-accent-blue" size={32} />
                            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                Fetching Record...
                            </p>
                        </div>
                    ) : sections.length > 0 || topCards?.length ? (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            {topCards && topCards.length > 0 && (
                                <div className="bg-app-bg p-5 rounded-xl border border-border-subtle flex items-center justify-between shadow-sm">
                                    {topCards.map((card, idx) => (
                                        <div key={idx} className={idx > 0 ? 'text-right' : ''}>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                                                {card.label}
                                            </p>
                                            <div>{card.value}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {sections.map((section, secIdx) => (
                                <div key={secIdx}>
                                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted mb-4 border-b border-border-subtle pb-2">
                                        {section.icon} {section.title}
                                    </h3>
                                    <div className="space-y-4 px-2">
                                        {section.fields.map((field, fIdx) => (
                                            <div key={fIdx} className="flex flex-col">
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-0.5">
                                                    {field.label}
                                                </span>
                                                <span
                                                    className={`text-sm tracking-tight ${
                                                        field.capitalize ? 'capitalize' : ''
                                                    } ${
                                                        field.isHighlight
                                                            ? 'font-bold text-accent-blue'
                                                            : 'font-medium text-text-main'
                                                    }`}
                                                >
                                                    {field.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {imageProof?.url && (
                                <div className="mt-8 border-t border-border-subtle pt-6">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">
                                        {imageProof.label}
                                    </p>
                                    {!imageFailed ? (
                                        <div
                                            className="rounded-xl border border-border-subtle overflow-hidden bg-app-bg p-2 shadow-sm cursor-zoom-in hover:border-accent-blue/50 transition-colors group"
                                            onClick={() => setIsZoomed(true)}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={imageProof.url}
                                                alt={imageProof.label}
                                                referrerPolicy="no-referrer"
                                                className="w-full object-contain max-h-64 rounded-lg group-hover:opacity-90 transition-opacity"
                                                onError={() => setImageFailed(true)}
                                            />
                                            <p className="text-center text-[9px] text-text-muted mt-2 font-medium">
                                                Click to enlarge
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-border-subtle bg-app-bg p-4 space-y-3">
                                            <p className="text-xs text-text-muted font-medium">
                                                Preview failed to load. Open the original proof link instead.
                                            </p>
                                            <a
                                                href={imageProof.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex text-[10px] font-black uppercase tracking-widest text-accent-blue hover:underline break-all"
                                            >
                                                Open verification proof
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-text-muted text-sm font-medium">
                            No details found.
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-border-subtle bg-app-bg/50">
                    {rejectReasonOpen ? (
                        <div className="space-y-3 animate-in fade-in duration-200">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">
                                    Rejection reason
                                </p>
                                <p className="text-[11px] text-text-muted font-medium mb-2">
                                    Required — the student will see this message.
                                </p>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) =>
                                        onRejectionReasonChange?.(e.target.value)
                                    }
                                    rows={3}
                                    placeholder={rejectReasonPlaceholder}
                                    disabled={actionLoading || loading}
                                    className="w-full bg-card-bg border border-border-subtle rounded-xl p-3 text-sm text-text-main outline-none focus:border-red-500/50 resize-none disabled:opacity-50"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onCancelReject}
                                    disabled={actionLoading || loading}
                                    className="flex-1 py-3 px-4 rounded-lg border border-border-subtle text-text-muted font-bold text-xs uppercase tracking-wider hover:text-text-main transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirmReject}
                                    disabled={actionLoading || loading}
                                    className="flex-1 py-3 px-4 rounded-lg bg-red-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-500/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <X size={16} strokeWidth={2.5} />
                                    )}
                                    Confirm reject
                                </button>
                            </div>
                        </div>
                    ) : showActions ? (
                        <div className="flex gap-3">
                            {onReject && (
                                <button
                                    type="button"
                                    onClick={onReject}
                                    disabled={actionLoading || loading}
                                    className="flex-1 py-3 px-4 rounded-lg border border-red-500/20 text-red-500 font-bold text-xs uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <X size={16} strokeWidth={2.5} /> {rejectText}
                                </button>
                            )}
                            {onApprove && (
                                <button
                                    type="button"
                                    onClick={onApprove}
                                    disabled={actionLoading || loading}
                                    className="flex-1 py-3 px-4 rounded-lg bg-accent-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-hover-blue shadow-md transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Check size={16} strokeWidth={2.5} /> {approveText}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 justify-center text-text-muted bg-card-bg py-3 rounded-lg border border-border-subtle shadow-sm">
                            <AlertCircle size={16} strokeWidth={2} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                {closedMessage || 'Action Locked'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {isZoomed && imageProof?.url && (
                <div
                    className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 sm:p-8 cursor-zoom-out animate-in fade-in duration-200"
                    onClick={() => setIsZoomed(false)}
                >
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsZoomed(false);
                        }}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors z-[210]"
                    >
                        <X size={24} />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageProof.url}
                        alt="Enlarged Proof"
                        referrerPolicy="no-referrer"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
};

export default MoreInfo;
