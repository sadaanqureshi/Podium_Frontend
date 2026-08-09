import {
    getCourseWithContentAPI,
    getQuizSubmissionsAPI,
    type TeacherDashboardGradingItem,
    type TeacherDashboardResponse,
} from '@/lib/api/apiService';
import {
    isRealQuizAttempt,
    normalizeQuizAttemptsList,
} from '@/lib/quizSubmissions';

const MAX_QUIZZES_TO_SCAN = 40;

function unwrapCoursePayload(payload: unknown): any {
    if (!payload || typeof payload !== 'object') return null;
    const root = payload as { data?: unknown; course?: unknown };
    if (root.data && typeof root.data === 'object') return root.data;
    if (root.course && typeof root.course === 'object') return root.course;
    return payload;
}

function countPendingQuizAttempts(rows: ReturnType<typeof normalizeQuizAttemptsList>): number {
    return rows.filter((row) => isRealQuizAttempt(row) && row.isGraded !== true).length;
}

function asAssignmentQueueItem(
    item: TeacherDashboardResponse['gradingQueue'][number]
): TeacherDashboardGradingItem {
    return {
        ...item,
        kind: item.kind === 'quiz' ? 'quiz' : 'assignment',
        assignmentId: item.assignmentId ?? item.id,
        quizId: item.quizId,
        sectionId: item.sectionId ?? null,
    };
}

/** Deep-link into the right grading surface for an assignment or quiz queue row. */
export function teacherGradingItemHref(item: TeacherDashboardGradingItem): string {
    if (item.kind === 'quiz' && item.quizId && item.courseId) {
        if (item.sectionId) {
            return `/teacher/assigned-courses/${item.courseId}/section/${item.sectionId}/quiz/${item.quizId}/submissions`;
        }
        return `/teacher/assigned-courses/${item.courseId}`;
    }
    if (item.assignmentId && item.courseId && item.sectionId) {
        return `/teacher/assigned-courses/${item.courseId}/section/${item.sectionId}/assignment/${item.assignmentId}`;
    }
    return item.courseId
        ? `/teacher/assigned-courses/${item.courseId}`
        : '/teacher/assigned-courses';
}

export function teacherGradingItemKey(item: TeacherDashboardGradingItem): string {
    if (item.kind === 'quiz' && item.quizId != null) return `quiz-${item.quizId}`;
    if (item.assignmentId != null) return `assignment-${item.assignmentId}`;
    return `item-${item.courseId}-${item.title}`;
}

type QuizScanTarget = {
    quizId: number;
    title: string;
    courseId: number;
    courseName: string;
    sectionId: number | null;
    dueDate: string | null;
};

/**
 * Backend my-dashboard grading fields are assignment-centric.
 * Scan accepted courses for quiz attempts that still need review and merge them in.
 */
export async function enrichTeacherDashboardWithQuizGrading(
    data: TeacherDashboardResponse
): Promise<TeacherDashboardResponse> {
    const courses = data.recentCourses || [];
    if (!courses.length) {
        return {
            ...data,
            gradingQueue: (data.gradingQueue || []).map(asAssignmentQueueItem),
        };
    }

    const targets: QuizScanTarget[] = [];

    await Promise.all(
        courses.map(async (course) => {
            try {
                const raw = await getCourseWithContentAPI(course.courseId);
                const courseData = unwrapCoursePayload(raw);
                const sections = Array.isArray(courseData?.sections) ? courseData.sections : [];

                for (const section of sections) {
                    const quizzes = Array.isArray(section?.quizzes) ? section.quizzes : [];
                    for (const quiz of quizzes) {
                        const quizId = Number(quiz?.id);
                        if (!Number.isFinite(quizId) || quizId <= 0) continue;
                        targets.push({
                            quizId,
                            title: String(quiz.title || 'Quiz'),
                            courseId: course.courseId,
                            courseName: course.courseName,
                            sectionId: Number(section?.id) || null,
                            dueDate: quiz.end_time || quiz.endTime || null,
                        });
                    }
                }
            } catch {
                // Skip course content failures
            }
        })
    );

    const capped = targets.slice(0, MAX_QUIZZES_TO_SCAN);

    const quizResults = await Promise.all(
        capped.map(async (target): Promise<TeacherDashboardGradingItem | null> => {
            try {
                const attemptsRes = await getQuizSubmissionsAPI(target.quizId);
                const rows = normalizeQuizAttemptsList(attemptsRes);
                const pending = countPendingQuizAttempts(rows);
                if (pending <= 0) return null;

                return {
                    kind: 'quiz',
                    quizId: target.quizId,
                    title: target.title,
                    courseId: target.courseId,
                    courseName: target.courseName,
                    sectionId: target.sectionId,
                    dueDate: target.dueDate,
                    pendingSubmissionCount: pending,
                };
            } catch {
                return null;
            }
        })
    );

    const quizQueue = quizResults.filter(
        (item): item is TeacherDashboardGradingItem => item != null
    );
    const quizPendingTotal = quizQueue.reduce(
        (sum, item) => sum + (item.pendingSubmissionCount ?? 0),
        0
    );

    const assignmentQueue = (data.gradingQueue || []).map(asAssignmentQueueItem);
    const gradingQueue = [...assignmentQueue, ...quizQueue].sort(
        (a, b) => (b.pendingSubmissionCount ?? 0) - (a.pendingSubmissionCount ?? 0)
    );

    return {
        ...data,
        metrics: {
            ...data.metrics,
            submissionsToGradeCount:
                (data.metrics.submissionsToGradeCount ?? 0) + quizPendingTotal,
        },
        gradingQueue,
    };
}
