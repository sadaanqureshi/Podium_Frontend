'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Loader2,
    Calendar,
    ClipboardCheck,
    CheckCircle2,
    XCircle,
    Clock3,
    Users,
    Eye,
    X,
    Save,
    ArrowLeft,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
    fetchAttendance,
    fetchAttendanceById,
    updateAttendance,
    clearSelectedAttendance,
} from '@/lib/store/features/academicSlice';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/api/errorMessage';
import type {
    AttendanceDetailStatus,
    AttendanceSession,
    AttendanceSessionDetail,
} from '@/lib/api/apiService';

type DraftStatus = 'present' | 'absent' | '-';

function statusMeta(status: AttendanceDetailStatus | string) {
    if (status === 'present') {
        return {
            label: 'Present',
            className: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500',
            Icon: CheckCircle2,
        };
    }
    if (status === 'absent') {
        return {
            label: 'Absent',
            className: 'bg-red-500/10 border-red-500/25 text-red-500',
            Icon: XCircle,
        };
    }
    return {
        label: 'Pending',
        className: 'bg-amber-500/10 border-amber-500/25 text-amber-500',
        Icon: Clock3,
    };
}

function buildUpdatePayload(
    rows: Array<{ studentId: number; status: DraftStatus }>
) {
    return {
        presentStudentIds: rows
            .filter((r) => r.status === 'present')
            .map((r) => r.studentId),
        absentStudentIds: rows
            .filter((r) => r.status === 'absent')
            .map((r) => r.studentId),
    };
}

function summarizeDetails(details: AttendanceSessionDetail[] = []) {
    let present = 0;
    let absent = 0;
    let pending = 0;
    for (const d of details) {
        if (d.status === 'present') present += 1;
        else if (d.status === 'absent') absent += 1;
        else pending += 1;
    }
    return { present, absent, pending, total: details.length };
}

export default function TeacherAttendancePage() {
    const dispatch = useAppDispatch();
    const { showToast } = useToast();

    const {
        attendance,
        loading,
        error,
        selectedSession,
        selectedSessionLoading,
        selectedSessionError,
        updateLoading,
    } = useAppSelector((state) => state.academic);

    /** Local draft statuses keyed by student.id — only PATCH on Save */
    const [draft, setDraft] = useState<Record<number, DraftStatus>>({});
    const [panelOpen, setPanelOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchAttendance());
        return () => {
            dispatch(clearSelectedAttendance());
        };
    }, [dispatch]);

    useEffect(() => {
        if (error) showToast(error, 'error');
    }, [error, showToast]);

    useEffect(() => {
        if (selectedSessionError) showToast(selectedSessionError, 'error');
    }, [selectedSessionError, showToast]);

    // Sync draft from loaded session
    useEffect(() => {
        if (!selectedSession?.attendanceDetails) {
            setDraft({});
            return;
        }
        const next: Record<number, DraftStatus> = {};
        for (const det of selectedSession.attendanceDetails) {
            const sid = det.student?.id;
            if (sid == null) continue;
            const s = det.status;
            next[sid] =
                s === 'present' || s === 'absent' ? s : '-';
        }
        setDraft(next);
    }, [selectedSession]);

    const openSession = async (id: number) => {
        setPanelOpen(true);
        try {
            await dispatch(fetchAttendanceById(id)).unwrap();
        } catch (err) {
            showToast(getErrorMessage(err, 'Failed to load attendance session'), 'error');
        }
    };

    const closePanel = () => {
        setPanelOpen(false);
        dispatch(clearSelectedAttendance());
        setDraft({});
    };

    const setStudentStatus = (studentId: number, status: DraftStatus) => {
        if (selectedSession?.isMarked === true) return;
        setDraft((prev) => ({ ...prev, [studentId]: status }));
    };

    const isViewOnly = selectedSession?.isMarked === true;

    const draftSummary = useMemo(() => {
        const values = Object.values(draft);
        return {
            present: values.filter((s) => s === 'present').length,
            absent: values.filter((s) => s === 'absent').length,
            pending: values.filter((s) => s === '-').length,
            total: values.length,
        };
    }, [draft]);

    const isDirty = useMemo(() => {
        if (isViewOnly) return false;
        if (!selectedSession?.attendanceDetails) return false;
        return selectedSession.attendanceDetails.some((det) => {
            const sid = det.student?.id;
            if (sid == null) return false;
            const original =
                det.status === 'present' || det.status === 'absent' ? det.status : '-';
            return (draft[sid] ?? '-') !== original;
        });
    }, [draft, selectedSession, isViewOnly]);

    const handleSave = async () => {
        if (!selectedSession?.id) return;
        if (selectedSession.isMarked === true) {
            showToast('Attendance is already marked and can only be viewed', 'error');
            return;
        }

        const rows = Object.entries(draft).map(([studentId, status]) => ({
            studentId: Number(studentId),
            status,
        }));

            const payload = {
            ...(selectedSession.attendanceDate
                ? { attendanceDate: selectedSession.attendanceDate }
                : {}),
            ...buildUpdatePayload(rows),
        };

        try {
            const updated = await dispatch(
                updateAttendance({ id: selectedSession.id, payload })
            ).unwrap();
            showToast('Attendance saved successfully', 'success');
            // Lock immediately from response; refetch if flag missing
            if (updated?.isMarked !== true) {
                await dispatch(fetchAttendanceById(selectedSession.id));
            }
            dispatch(fetchAttendance());
        } catch (err: unknown) {
            const status =
                err && typeof err === 'object' && 'status' in err
                    ? Number((err as { status?: number }).status)
                    : undefined;
            const message = getErrorMessage(err, 'Failed to save attendance');
            const alreadyMarked =
                status === 400 ||
                /already marked/i.test(message) ||
                /can only be viewed/i.test(message);

            if (alreadyMarked) {
                showToast('Attendance is already marked and can only be viewed', 'error');
                try {
                    await dispatch(fetchAttendanceById(selectedSession.id)).unwrap();
                } catch {
                    /* ignore refresh errors — toast already shown */
                }
                dispatch(fetchAttendance());
            } else {
                showToast(message, 'error');
            }
        }
    };

    if (loading && attendance.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-app-bg text-text-muted">
                <Loader2 className="animate-spin text-accent-blue" size={28} />
                <p className="text-[10px] font-black uppercase tracking-widest">
                    Loading attendance…
                </p>
                </div>
        );
    }

    return (
        <div className="bg-app-bg min-h-screen text-text-main">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 md:pt-10 pb-16 space-y-8">
                {/* Header */}
                <section className="relative overflow-hidden rounded-[2rem] border border-border-subtle bg-card-bg p-8 md:p-10 shadow-sm">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.18),_transparent_55%)]" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="space-y-3">
                            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-accent-blue">
                                <ClipboardCheck size={14} /> Teacher attendance
                            </span>
                            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                                Mark Attendance
                            </h1>
                            <p className="text-sm text-text-muted font-medium max-w-xl">
                                Open a live-lecture session, mark students present or absent, then
                                save. Sessions are created automatically when you schedule a live
                                lecture.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <StatChip label="Sessions" value={String(attendance.length)} />
                        </div>
                    </div>
                </section>

                {/* Session list */}
                {attendance.length === 0 ? (
                    <div className="rounded-2xl border border-border-subtle bg-card-bg p-12 text-center">
                        <Users className="mx-auto text-text-muted/40 mb-4" size={36} />
                        <p className="text-sm font-black uppercase tracking-widest text-text-muted">
                            No attendance sessions yet
                        </p>
                        <p className="text-xs text-text-muted mt-2 max-w-md mx-auto">
                            Create an online live lecture to seed a roll for enrolled students.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {attendance.map((session: AttendanceSession) => {
                            const summary = summarizeDetails(session.attendanceDetails || []);
                            const marked = session.isMarked === true;
                            return (
                                <button
                                    key={session.id}
                                    type="button"
                                    onClick={() => openSession(session.id)}
                                    className="text-left rounded-2xl border border-border-subtle bg-card-bg p-5 md:p-6 shadow-sm hover:border-accent-blue/40 transition-colors group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-accent-blue">
                                                    Session #{session.id}
                                                </p>
                                                <MiniBadge
                                                    className={
                                                        marked
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                    }
                                                    label={marked ? 'Marked' : 'Pending'}
                                                />
                                            </div>
                                            <h3 className="text-base font-black tracking-tight truncate group-hover:text-accent-blue transition-colors">
                                                {session.lecture?.title || 'Untitled lecture'}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Calendar size={12} className="text-accent-blue" />
                                                    {session.attendanceDate || 'Not dated'}
                                                </span>
                                                <span>·</span>
                                                <span>
                                                    {session.teacher?.firstName}{' '}
                                                    {session.teacher?.lastName}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="shrink-0 h-10 w-10 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center group-hover:bg-accent-blue group-hover:text-white transition-colors">
                                            <Eye size={16} />
                                        </span>
            </div>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <MiniBadge
                                            className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                            label={`${summary.present} present`}
                                        />
                                        <MiniBadge
                                            className="bg-red-500/10 text-red-500 border-red-500/20"
                                            label={`${summary.absent} absent`}
                                        />
                                        <MiniBadge
                                            className="bg-amber-500/10 text-amber-500 border-amber-500/20"
                                            label={`${summary.pending} pending`}
                                        />
                                        <MiniBadge
                                            className="bg-app-bg text-text-muted border-border-subtle"
                                            label={`${summary.total} students`}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Mark attendance panel */}
            {panelOpen && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-3xl max-h-[92vh] sm:rounded-[1.75rem] rounded-t-[1.75rem] overflow-hidden flex flex-col bg-card-bg border border-border-subtle shadow-2xl">
                        {/* Panel header */}
                        <div className="relative border-b border-border-subtle px-5 md:px-7 py-5 bg-app-bg/80">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 space-y-1">
                                    <button
                                        type="button"
                                        onClick={closePanel}
                                        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent-blue mb-2"
                                    >
                                        <ArrowLeft size={14} /> Back to list
                                    </button>
                                    <h2 className="text-xl md:text-2xl font-black tracking-tight truncate">
                                        {selectedSession?.lecture?.title ||
                                            (selectedSessionLoading
                                                ? 'Loading…'
                                                : 'Attendance session')}
                                    </h2>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-2">
                                            <Calendar size={12} className="text-accent-blue" />
                                            {selectedSession?.attendanceDate || '—'}
                                        </span>
                                        {selectedSession?.id != null && (
                                            <span className="text-text-muted/70">
                                                · ID {selectedSession.id}
                                            </span>
                                        )}
                                        {isViewOnly && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border bg-emerald-500/10 text-emerald-500 border-emerald-500/25">
                                                <CheckCircle2 size={10} />
                                                Marked — View only
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closePanel}
                                    className="shrink-0 h-10 w-10 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-main hover:border-accent-blue/40"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {!selectedSessionLoading && selectedSession && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <StatChip
                                        label="Present"
                                        value={String(draftSummary.present)}
                                        tone="emerald"
                                    />
                                    <StatChip
                                        label="Absent"
                                        value={String(draftSummary.absent)}
                                        tone="red"
                                    />
                                    <StatChip
                                        label="Pending"
                                        value={String(draftSummary.pending)}
                                        tone="amber"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Students */}
                        <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-3 bg-card-bg">
                            {selectedSessionLoading && (
                                <div className="py-16 flex flex-col items-center gap-3 text-text-muted">
                                    <Loader2 className="animate-spin text-accent-blue" size={24} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">
                                        Loading roll…
                                    </p>
                                </div>
                            )}

                            {!selectedSessionLoading &&
                                (!selectedSession?.attendanceDetails ||
                                    selectedSession.attendanceDetails.length === 0) && (
                                    <div className="py-16 text-center text-xs font-bold uppercase tracking-widest text-text-muted">
                                        No students in this attendance session
                                    </div>
                                )}

                            {!selectedSessionLoading &&
                                selectedSession?.attendanceDetails?.map((detail) => {
                                    const studentId = detail.student.id;
                                    const status = draft[studentId] ?? '-';
                                    const meta = statusMeta(status);
                                    const StatusIcon = meta.Icon;
                                    const name = `${detail.student.firstName || ''} ${detail.student.lastName || ''}`.trim();

                                    return (
                                        <div
                                            key={detail.id ?? studentId}
                                            className="rounded-2xl border border-border-subtle bg-app-bg p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="h-11 w-11 rounded-xl bg-accent-blue text-white flex items-center justify-center font-black text-sm shrink-0">
                                                    {(detail.student.firstName?.[0] || '?').toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black tracking-tight truncate">
                                                        {name || 'Student'}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-text-muted truncate">
                                                        {detail.student.rollNumber ||
                                                            detail.student.roll_number ||
                                                            `ID ${studentId}`}
                                                    </p>
                                                    <span
                                                        className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${meta.className}`}
                                                    >
                                                        <StatusIcon size={10} />
                                                        {meta.label}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 sm:shrink-0">
                                                <StatusToggle
                                                    active={status === 'present'}
                                                    tone="present"
                                                    label="Present"
                                                    onClick={() =>
                                                        setStudentStatus(
                                                            studentId,
                                                            status === 'present' ? '-' : 'present'
                                                        )
                                                    }
                                                    disabled={updateLoading || isViewOnly}
                                                />
                                                <StatusToggle
                                                    active={status === 'absent'}
                                                    tone="absent"
                                                    label="Absent"
                                                    onClick={() =>
                                                        setStudentStatus(
                                                            studentId,
                                                            status === 'absent' ? '-' : 'absent'
                                                        )
                                                    }
                                                    disabled={updateLoading || isViewOnly}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-border-subtle bg-app-bg px-5 md:px-7 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                {isViewOnly
                                    ? 'Marked — view only (cannot remake)'
                                    : isDirty
                                      ? 'Unsaved changes — tap Save to update'
                                      : 'Mark present / absent, then save'}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={closePanel}
                                    className="px-5 py-3 rounded-xl border border-border-subtle text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-main"
                                >
                                    Close
                                </button>
                                {!isViewOnly && (
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={
                                            updateLoading ||
                                            selectedSessionLoading ||
                                            !selectedSession
                                        }
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest hover:bg-hover-blue disabled:opacity-50 shadow-lg shadow-accent-blue/20"
                                    >
                                        {updateLoading ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <Save size={14} />
                                        )}
                                        Save attendance
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatChip({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone?: 'emerald' | 'red' | 'amber';
}) {
    const toneClass =
        tone === 'emerald'
            ? 'border-emerald-500/20 text-emerald-500'
            : tone === 'red'
              ? 'border-red-500/20 text-red-500'
              : tone === 'amber'
                ? 'border-amber-500/20 text-amber-500'
                : 'border-border-subtle text-text-main';

    return (
        <div
            className={`rounded-xl border bg-card-bg/80 px-4 py-2.5 min-w-[88px] ${toneClass}`}
        >
            <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</p>
            <p className="text-lg font-black tabular-nums leading-none mt-1">{value}</p>
        </div>
    );
}

function MiniBadge({ label, className }: { label: string; className: string }) {
    return (
        <span
            className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${className}`}
        >
            {label}
        </span>
    );
}

function StatusToggle({
    active,
    tone,
    label,
    onClick,
    disabled,
}: {
    active: boolean;
    tone: 'present' | 'absent';
    label: string;
    onClick: () => void;
    disabled?: boolean;
}) {
    const base =
        tone === 'present'
            ? active
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-transparent text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10'
            : active
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-transparent text-red-500 border-red-500/30 hover:bg-red-500/10';

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`px-3.5 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50 ${base}`}
        >
            {label}
        </button>
    );
}
