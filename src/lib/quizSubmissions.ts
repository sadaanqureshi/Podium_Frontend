/** Helpers for quiz attempt / submission counts (with-content + attempts API) */

export type QuizAttemptRow = {
    id?: number;
    attemptId?: number;
    studentName?: string;
    submittedAt?: string | null;
    isGraded?: boolean;
    status?: string | null;
    totalMarks?: number | null;
    totalMarksObtained?: number | null;
    [key: string]: unknown;
};

/** with-content / quiz object keys that may carry an attempt count */
const QUIZ_COUNT_KEYS = [
    'attemptCount',
    'attemptsCount',
    'submissionCount',
    'submissionsCount',
    'totalAttempts',
    'total_attempts',
    'attempts_count',
    'submissions_count',
] as const;

function positiveNumber(value: unknown): number | null {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
    return value;
}

/** True when an attempts-list row is a real student attempt (not missing). */
export function isRealQuizAttempt(row: QuizAttemptRow | null | undefined): boolean {
    if (!row) return false;
    const status = String(row.status ?? '')
        .trim()
        .toLowerCase();
    if (status === 'missing' || status === 'none' || status === 'not_submitted') return false;
    if (row.submittedAt) return true;
    if (row.isGraded === true) return true;
    if (status && status !== 'null') return true;
    // Attempts API usually only returns real attempts — count by id presence
    return row.id != null || row.attemptId != null;
}

export function countRealQuizAttempts(rows: QuizAttemptRow[] | null | undefined): number | null {
    if (!Array.isArray(rows)) return null;
    const n = rows.filter(isRealQuizAttempt).length;
    return n > 0 ? n : null;
}

export function normalizeQuizAttemptsList(payload: unknown): QuizAttemptRow[] {
    if (Array.isArray(payload)) return payload as QuizAttemptRow[];
    if (payload && typeof payload === 'object') {
        const data = (payload as { data?: unknown }).data;
        if (Array.isArray(data)) return data as QuizAttemptRow[];
    }
    return [];
}

/**
 * Best count from GET /courses/:id/with-content quiz object.
 * Prefers explicit count fields, then nested `_count`, then embedded `attempts[]`.
 */
export function resolveQuizCountFromWithContent(quiz: any): number | null {
    if (!quiz || typeof quiz !== 'object') return null;

    for (const key of QUIZ_COUNT_KEYS) {
        const n = positiveNumber(quiz[key]);
        if (n !== null) return n > 0 ? n : null;
    }

    const nested =
        positiveNumber(quiz._count?.attempts) ??
        positiveNumber(quiz._count?.submissions) ??
        positiveNumber(quiz._count?.Attempts) ??
        positiveNumber(quiz.stats?.attempts) ??
        positiveNumber(quiz.stats?.submissions) ??
        positiveNumber(quiz.stats?.attemptCount);

    if (nested !== null) return nested > 0 ? nested : null;

    if (Array.isArray(quiz.attempts)) {
        return countRealQuizAttempts(quiz.attempts);
    }
    if (Array.isArray(quiz.submissions)) {
        return countRealQuizAttempts(quiz.submissions);
    }

    return null;
}

/** Whether with-content already exposed a count (including 0) so we can skip N+1 fetches. */
export function hasQuizCountOnWithContent(quiz: any): boolean {
    if (!quiz || typeof quiz !== 'object') return false;
    for (const key of QUIZ_COUNT_KEYS) {
        if (typeof quiz[key] === 'number') return true;
    }
    if (typeof quiz._count?.attempts === 'number') return true;
    if (typeof quiz._count?.submissions === 'number') return true;
    if (typeof quiz.stats?.attemptCount === 'number') return true;
    if (typeof quiz.stats?.attempts === 'number') return true;
    if (Array.isArray(quiz.attempts) || Array.isArray(quiz.submissions)) return true;
    return false;
}

export function resolveQuizSubmissionBadge(
    quiz: any,
    fetchedAttempts?: QuizAttemptRow[] | null
): number | null {
    const fromContent = resolveQuizCountFromWithContent(quiz);
    if (fromContent !== null) return fromContent;
    if (fetchedAttempts !== undefined && fetchedAttempts !== null) {
        return countRealQuizAttempts(fetchedAttempts);
    }
    return null;
}
