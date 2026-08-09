/** Helpers for GET /assignments/:id/submissions */

export type AssignmentSubmission = {
    studentId?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    status?: string | null;
    marksObtained?: number | string | null;
    marks_obtained?: number | string | null;
    obtainedMarks?: number | string | null;
    obtained_marks?: number | string | null;
    marks?: number | string | null;
    grade?: number | string | null;
    score?: number | string | null;
    comments?: string | null;
    submittedAt?: string | null;
    submissionFiles?: string[] | null;
    student?: { id?: number; firstName?: string; lastName?: string; email?: string };
    [key: string]: unknown;
};

const MARKS_KEYS = [
    'marksObtained',
    'marks_obtained',
    'obtainedMarks',
    'obtained_marks',
    'marks',
    'grade',
    'score',
    'gradedMarks',
    'graded_marks',
    'totalMarksObtained',
    'total_marks_obtained',
] as const;

/**
 * True when the student actually submitted work.
 * API uses status "missing" for enrolled students with no submission — those must not count.
 */
export function hasSubmissionStatus(item: AssignmentSubmission | null | undefined): boolean {
    const status = String(item?.status ?? '')
        .trim()
        .toLowerCase();
    if (!status || status === 'missing' || status === 'null' || status === 'none') {
        return false;
    }
    // Prefer an actual submit timestamp when present
    if (item?.submittedAt) return true;
    // submitted / graded / late / pending-review, etc.
    return status !== 'not_submitted' && status !== 'not-submitted';
}

function coerceMarks(raw: unknown): number | null {
    if (raw === null || raw === undefined || raw === '') return null;
    if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
    if (typeof raw === 'string') {
        const n = Number(raw.trim());
        return Number.isFinite(n) ? n : null;
    }
    return null;
}

/** Read obtained marks from any camelCase / snake_case field the API may return. */
export function getSubmissionMarks(item: AssignmentSubmission | null | undefined): number | null {
    if (!item || typeof item !== 'object') return null;

    for (const key of MARKS_KEYS) {
        if (key in item) {
            const parsed = coerceMarks((item as Record<string, unknown>)[key]);
            if (parsed !== null) return parsed;
        }
    }

    // Nested shapes: { grade: { marksObtained } } / { submission: { marks_obtained } }
    for (const nestKey of ['grade', 'submission', 'result', 'evaluation'] as const) {
        const nested = (item as Record<string, unknown>)[nestKey];
        if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
            for (const key of MARKS_KEYS) {
                const parsed = coerceMarks((nested as Record<string, unknown>)[key]);
                if (parsed !== null) return parsed;
            }
        }
    }

    return null;
}

export function isSubmissionGraded(item: AssignmentSubmission | null | undefined): boolean {
    const status = String(item?.status || '').toLowerCase();
    if (status === 'graded') return true;
    return getSubmissionMarks(item) !== null;
}

/** Score cell label — prefer numeric marks from API; never show "Ungraded" when status is graded. */
export function formatSubmissionScore(
    item: AssignmentSubmission | null | undefined,
    totalMarks?: number | null
): string {
    const score = getSubmissionMarks(item);
    const total = Number(totalMarks);
    const hasTotal = Number.isFinite(total) && total > 0;

    if (score !== null) {
        return hasTotal ? `${score} / ${total}` : String(score);
    }

    if (isSubmissionGraded(item)) {
        return hasTotal ? `— / ${total}` : 'Graded';
    }

    return 'Ungraded';
}

export function isSubmissionLate(
    submittedAt: string | null | undefined,
    dueDate: string | null | undefined
): boolean {
    if (!submittedAt || !dueDate) return false;
    const submitted = new Date(submittedAt).getTime();
    const due = new Date(dueDate).getTime();
    if (Number.isNaN(submitted) || Number.isNaN(due)) return false;
    return submitted > due;
}

function normalizeSubmissionRow(row: AssignmentSubmission): AssignmentSubmission {
    const marks = getSubmissionMarks(row);
    return {
        ...row,
        // Canonicalize so table / grade modal always see camelCase marks
        ...(marks !== null ? { marksObtained: marks } : {}),
    };
}

export function normalizeSubmissionsList(payload: unknown): AssignmentSubmission[] {
    let rows: AssignmentSubmission[] = [];
    if (Array.isArray(payload)) rows = payload as AssignmentSubmission[];
    else if (payload && typeof payload === 'object') {
        const data = (payload as { data?: unknown }).data;
        if (Array.isArray(data)) rows = data as AssignmentSubmission[];
    }
    return rows.map(normalizeSubmissionRow);
}

/** Count only rows that actually have a submission status — used for list badges. */
export function countStatusBearingSubmissions(
    rows: AssignmentSubmission[] | null | undefined
): number | null {
    if (!Array.isArray(rows)) return null;
    const count = rows.filter(hasSubmissionStatus).length;
    return count > 0 ? count : null;
}

export function formatSubmissionStatus(item: AssignmentSubmission): string {
    const status = String(item?.status || '').trim().toLowerCase();
    if (status) return status;
    if (isSubmissionGraded(item)) return 'graded';
    if (item?.submittedAt) return 'submitted';
    return '—';
}
