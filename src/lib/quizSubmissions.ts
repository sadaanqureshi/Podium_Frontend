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

const MARKS_KEYS = [
    'totalMarksObtained',
    'total_marks_obtained',
    'marksObtained',
    'marks_obtained',
    'obtainedMarks',
    'obtained_marks',
    'score',
    'grade',
    'totalMarks',
] as const;

function coerceMarks(raw: unknown): number | null {
    if (raw === null || raw === undefined || raw === '') return null;
    if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
    if (typeof raw === 'string') {
        const n = Number(raw.trim());
        return Number.isFinite(n) ? n : null;
    }
    return null;
}

/** Flatten GET /quizzes/:id whether attempt sits on the quiz or a sibling key. */
export function unwrapQuizDetail(payload: any): any {
    if (!payload || typeof payload !== 'object') return payload;
    const root = payload.data ?? payload;
    const quiz = root?.quiz && typeof root.quiz === 'object' ? root.quiz : root;
    const attempt =
        quiz?.userAttempt ??
        quiz?.user_attempt ??
        quiz?.myAttempt ??
        quiz?.my_attempt ??
        quiz?.attempt ??
        quiz?.submission ??
        root?.userAttempt ??
        root?.user_attempt ??
        root?.myAttempt ??
        root?.attempt ??
        payload?.userAttempt ??
        payload?.user_attempt ??
        null;
    return { ...quiz, userAttempt: attempt };
}

export function pickQuizAttempt(quizOrAttempt: any): QuizAttemptRow | null {
    if (!quizOrAttempt || typeof quizOrAttempt !== 'object') return null;
    const nested =
        quizOrAttempt.userAttempt ??
        quizOrAttempt.user_attempt ??
        quizOrAttempt.myAttempt ??
        quizOrAttempt.my_attempt ??
        quizOrAttempt.attempt ??
        quizOrAttempt.submission ??
        null;
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
        return nested as QuizAttemptRow;
    }
    const status = String(quizOrAttempt.status ?? '').trim().toLowerCase();
    const looksLikeAttempt =
        quizOrAttempt.attemptId != null ||
        quizOrAttempt.submittedAt ||
        quizOrAttempt.isGraded === true ||
        quizOrAttempt.is_graded === true ||
        status === 'submitted' ||
        status === 'graded' ||
        status === 'late';
    if (looksLikeAttempt) return quizOrAttempt as QuizAttemptRow;
    return null;
}

/** True when the student actually submitted an attempt (not a missing placeholder). */
export function hasQuizAttempt(attempt: QuizAttemptRow | null | undefined): boolean {
    return isRealQuizAttempt(attempt);
}

export function getQuizAttemptId(attempt: QuizAttemptRow | null | undefined): number | null {
    if (!attempt) return null;
    const raw = attempt.id ?? attempt.attemptId ?? (attempt as any).attempt_id;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
}

export function getQuizAttemptMarks(attempt: any): number | null {
    if (!attempt || typeof attempt !== 'object') return null;
    for (const key of MARKS_KEYS) {
        if (key in attempt) {
            const parsed = coerceMarks(attempt[key]);
            if (parsed !== null) return parsed;
        }
    }
    return null;
}

export function isQuizAttemptGraded(attempt: QuizAttemptRow | null | undefined): boolean {
    if (!attempt) return false;
    if (attempt.isGraded === true || (attempt as any).is_graded === true) return true;
    const status = String(attempt.status ?? '').trim().toLowerCase();
    if (status === 'graded' || status === 'evaluated') return true;
    return getQuizAttemptMarks(attempt) !== null;
}

export function unwrapQuizResult(payload: any): any {
    if (!payload || typeof payload !== 'object') return payload;
    return payload.data ?? payload.result ?? payload;
}
