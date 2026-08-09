import Cookies from 'js-cookie';
import { throwIfNotOk, extractBackendMessage } from './errorMessage';

// ==============================
// BASE URL
// ==============================
// const API_URL = 'http://localhost:3006';
// process.env use karne se Next.js khud hi environment ke mutabiq URL utha lega
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

/** Turn relative upload paths into absolute URLs the browser can load. */
export const resolveMediaUrl = (url?: string | null): string | null => {
    if (url == null || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
        return trimmed;
    }
    if (trimmed.startsWith('//')) return `https:${trimmed}`;
    const base = API_URL.replace(/\/$/, '');
    if (trimmed.startsWith('/')) return `${base}${trimmed}`;
    return `${base}/${trimmed}`;
};

export const getToken = (serverToken?: string) => {
    if (serverToken) return serverToken; 
    if (typeof window !== 'undefined') {
        return Cookies.get('authToken'); 
    }
    return null;
};

// =======================================
// AUTH APIs
// ================================
export const loginUser = async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },//swad
        body: JSON.stringify(credentials),
    });

    await throwIfNotOk(response, 'Login failed');

    return await response.json();
};

// src/lib/api/apiService.ts ke andar add karein
export const fetchProfileAPI = async (token: string) => {
    let response: Response;
    try {
        response = await fetch(`${API_URL}/auth/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });
    } catch {
        // Backend down / CORS / offline — do not throw raw TypeError (Next overlays it)
        const err: any = new Error('Unable to reach auth server');
        err.status = 0;
        err.isNetworkError = true;
        err.skipErrorToast = true;
        throw err;
    }

    if (!response.ok) {
        let message = 'Session expired or invalid';
        try {
            const errorData = await response.json();
            message = extractBackendMessage(errorData) || message;
        } catch {
            /* ignore */
        }
        const err: any = new Error(message);
        err.status = response.status;
        err.skipErrorToast = true; // SessionManager handles profile quietly
        throw err;
    }

    return await response.json();
};

// ==============================
// STUDENT REGISTER API (NEW)
// ==============================
export const registerStudentAPI = async (data: any) => {
    const response = await fetch(`${API_URL}/auth/signup/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    await throwIfNotOk(response, 'Registration Protocol Failed');

    return await response.json();
};

export const forgotPasswordAPI = async (email: string) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    await throwIfNotOk(response, 'Failed to send reset email');

    return await response.json();
};

export const resetPasswordAPI = async (token: string, newPassword: any) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
    });

    await throwIfNotOk(response, 'Failed to reset password. Link might be expired.');

    return await response.json();
};

export const logoutUserAPI = async () => {
    const token = getToken();
    if (!token) return;

    const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    await throwIfNotOk(response, 'Backend logout failed');
    return await response.json();
};

export const clearAuthCookies = () => {
    Cookies.remove('authToken', { path: '/' });
    Cookies.remove('userRole', { path: '/' });
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('last_active_time');
    }
};

export const setAuthCookies = (token: string, roleName: string) => {
    Cookies.set('authToken', token, { path: '/', sameSite: 'lax' });
    Cookies.set('userRole', roleName, { path: '/', sameSite: 'lax' });
};

export const logoutLocal = () => {
    const role = String(Cookies.get('userRole') || '').toLowerCase();
    clearAuthCookies();
    if (role === 'admin') window.location.href = '/admin/signin';
    else if (role === 'teacher') window.location.href = '/teacher/signin';
    else window.location.href = '/student/signin';
};

// ==============================
// USER PROFILE
// ==============================
export const updateUserProfileAPI = async (userId: number, data: any) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });

    await throwIfNotOk(response, 'Profile update fail ho gaya');
    return await response.json();
};

// ==============================
// COURSE APIs
// ==============================
export const getAllCoursesAPI = async (page = 1, limit = 10) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/courses/all?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    await throwIfNotOk(response, 'Failed to fetch courses');

    return await response.json();
};

export const createCourseAPI = async (formData: FormData) => {
    const token = getToken();
    if (!token) throw new Error('Authentication token missing');

    const response = await fetch(`${API_URL}/courses/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });

    await throwIfNotOk(response, 'Course create karne mein masla hua');

    return await response.json();
};

export const getCourseCategoriesAPI = async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/courses/categories/all`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await throwIfNotOk(response, 'Categories load nahi ho sakeen');
    return await response.json();
};

export const getCourseByIdAPI = async (id: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/courses/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await throwIfNotOk(response, 'Course details load nahi ho sakeen');
    return await response.json();
};

export const getCourseWithContentAPI = async (courseId: number) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/courses/${courseId}/with-content`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    await throwIfNotOk(response, 'Failed to fetch course content');

    return await response.json();
};

export const getMyEnrolledCoursesAPI = async () => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    
    const response = await fetch(`${API_URL}/enrollments/my-courses`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    
    await throwIfNotOk(response, 'Failed to fetch enrolled courses');
    
    return await response.json();
};

export type CourseUpdateType = 'lecture' | 'assignment' | 'quiz' | 'resource';

export type CourseUpdateItem = {
    type: CourseUpdateType;
    id: number;
    title: string;
    occurredAt: string | null;
    lectureType?: 'online' | 'live' | 'recorded' | null;
    resourceType?: string | null;
    course: {
        id: number;
        courseName: string;
    };
    section: {
        id: number;
        title: string;
    } | null;
};

export type MyCourseUpdatesResponse = {
    data: CourseUpdateItem[];
    meta: {
        returned: number;
        limit: number;
    };
};

export const getMyCourseUpdatesAPI = async (params?: {
    limit?: number;
    courseId?: number;
    types?: CourseUpdateType[] | string;
}): Promise<MyCourseUpdatesResponse> => {
    const token = getToken();
    if (!token) {
        logoutLocal();
        throw new Error('No authentication token found');
    }

    const query = new URLSearchParams();
    if (params?.limit != null) {
        query.set('limit', String(Math.min(Math.max(params.limit, 1), 50)));
    }
    if (params?.courseId != null) query.set('courseId', String(params.courseId));
    if (params?.types != null) {
        const types =
            Array.isArray(params.types) ? params.types.join(',') : params.types;
        if (types && types !== 'all') query.set('types', types);
    }
    const qs = query.toString();

    const response = await fetch(
        `${API_URL}/enrollments/my-updates${qs ? `?${qs}` : ''}`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        }
    );

    if (response.status === 401) {
        logoutLocal();
        throw new Error('Unauthorized. Please sign in again.');
    }

    if (!response.ok) {
        let message = 'Failed to fetch course updates';
        try {
            const errorData = await response.json();
            message = extractBackendMessage(errorData) || message;
        } catch {
            /* ignore */
        }
        if (response.status === 403) {
            throw new Error(
                message || 'You do not have access to updates for this course.'
            );
        }
        throw new Error(message);
    }

    return await response.json();
};

export type StudentDashboardResponse = {
    welcome: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
    metrics: {
        enrolledCoursesCount: number;
        pendingEnrollmentCount: number;
        averageProgressPercent: number | null;
        attendance: {
            present: number;
            absent: number;
            pending: number;
            total: number;
            ratePercent: number | null;
        };
    };
    recentCourses: Array<{
        enrollmentId: number;
        courseId: number;
        courseName: string;
        coverImg: string | null;
        shortDescription: string | null;
        overall: { total: number; completed: number };
        progressPercent: number | null;
    }>;
    pendingEnrollments: Array<{
        id: number;
        courseId: number;
        courseName: string;
        coverImg: string | null;
        createdAt: string | null;
        paymentStatus: string | null;
    }>;
    recentUpdates: Array<{
        type: 'lecture' | 'assignment' | 'quiz' | 'resource';
        id: number;
        title: string;
        occurredAt: string | null;
        lectureType?: string | null;
        course: { id: number; courseName: string };
        section: { id: number; title: string } | null;
    }>;
    recentAttendance: Array<{
        attendanceId: number;
        attendanceDate: string | null;
        status: 'present' | 'absent' | '-';
        lectureTitle: string;
        courseName: string;
        courseId: number;
    }>;
};

export const getStudentDashboardAPI = async (): Promise<StudentDashboardResponse> => {
    const token = getToken();
    if (!token) {
        logoutLocal();
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/enrollments/my-dashboard`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    if (response.status === 401) {
        logoutLocal();
        throw new Error('Unauthorized. Please sign in again.');
    }

    if (!response.ok) {
        let message = 'Failed to load student dashboard';
        try {
            const errorData = await response.json();
            message = extractBackendMessage(errorData) || message;
        } catch {
            /* ignore */
        }
        if (response.status === 403) {
            throw new Error(message || 'Only students can view this dashboard.');
        }
        throw new Error(message);
    }

    return await response.json();
};

// ==============================
// TEACHER DASHBOARD (aggregate home)
// ==============================
export type TeacherDashboardGradingItem = {
    kind?: 'assignment' | 'quiz';
    /** Present for assignment rows (backend) */
    assignmentId?: number;
    /** Present for quiz rows (frontend enrichment) */
    quizId?: number;
    id?: number;
    title: string;
    courseId: number;
    courseName: string;
    sectionId?: number | null;
    dueDate: string | null;
    pendingSubmissionCount: number;
};

export type TeacherDashboardResponse = {
    welcome: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
    metrics: {
        acceptedCoursesCount: number;
        pendingCourseAssignmentCount: number;
        studentsEnrolledCount: number;
        submissionsToGradeCount: number;
        unmarkedAttendanceCount: number;
        googleCalendarConnected: boolean;
    };
    recentCourses: Array<{
        courseId: number;
        courseName: string;
        coverImg: string | null;
        shortDescription: string | null;
        teacherStatus: string;
        enrolledStudentsCount: number;
    }>;
    pendingCourseAssignments: Array<{
        courseId: number;
        courseName: string;
        coverImg: string | null;
        shortDescription: string | null;
        teacherStatus: string;
        needsAction: boolean;
        createdAt: string | null;
        updatedAt: string | null;
    }>;
    gradingQueue: TeacherDashboardGradingItem[];
    recentAttendance: Array<{
        attendanceId: number;
        attendanceDate: string | null;
        isMarked: boolean;
        lectureTitle: string;
        lectureId: number | null;
        courseId: number | null;
        courseName: string | null;
    }>;
    googleCalendar: {
        connected: boolean;
        googleEmail?: string | null;
    };
};

/** GET /courses/my-dashboard — teacher home aggregate */
export const getTeacherDashboard = async (): Promise<TeacherDashboardResponse> => {
    const token = getToken();
    if (!token) {
        logoutLocal();
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/courses/my-dashboard`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    if (response.status === 401) {
        logoutLocal();
        throw new Error('Unauthorized. Please sign in again.');
    }

    if (!response.ok) {
        let message = 'Failed to load teacher dashboard';
        try {
            const errorData = await response.json();
            message = extractBackendMessage(errorData) || message;
        } catch {
            /* ignore */
        }
        if (response.status === 403) {
            throw new Error(message || 'Only teachers can view this dashboard.');
        }
        throw new Error(message);
    }

    const json = await response.json();
    return (json?.data ?? json) as TeacherDashboardResponse;
};

export const getTeacherDashboardAPI = getTeacherDashboard;

// ==============================
// ADMIN DASHBOARD (aggregate home)
// ==============================
export type AdminDashboardResponse = {
    welcome: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
    metrics: {
        students: { total: number; active: number; newThisMonth: number };
        teachers: { total: number; active: number; newThisMonth: number };
        courses: {
            total: number;
            active: number;
            withTeacher: number;
            withoutTeacher: number;
        };
        enrollments: {
            total: number;
            pending: number;
            enrolled: number;
            rejected: number;
            dismissed: number;
        };
        teacherAssignments: {
            pending: number;
            accepted: number;
            rejected: number;
            unassigned: number;
        };
        revenue: {
            totalRevenue: string;
            pendingAmount: string;
            revenueThisMonth: string;
            paidCount: number;
            pendingCount: number;
            failedCount: number;
            freeCount: number;
        };
        workload: {
            pendingSubmissionsToGrade: number;
            unmarkedAttendanceSessions: number;
        };
    };
    actionRequired: {
        pendingEnrollments: Array<{
            id: number;
            studentName: string;
            studentId: number;
            courseName: string;
            courseId: number;
            amount: string;
            screenshotUrl: string | null;
            createdAt: string | null;
        }>;
        pendingTeacherAssignments: Array<{
            courseId: number;
            courseName: string;
            teacherName: string;
            teacherId: number;
            assignmentStatus: string;
            updatedAt: string | null;
        }>;
        pendingPayments: Array<{
            uuid: string;
            studentName: string;
            courseName: string;
            amount: string;
            screenshotUrl: string | null;
            createdAt: string | null;
        }>;
    };
    recentActivity: {
        recentEnrollments: Array<{
            id: number;
            status: string;
            studentName: string;
            courseName: string;
            createdAt: string | null;
        }>;
        recentCourses: Array<{
            id: number;
            courseName: string;
            coverImg: string | null;
            teacherStatus: string;
            teacherName: string | null;
            createdAt: string | null;
        }>;
        recentStudents: Array<{
            id: number;
            firstName: string;
            lastName: string;
            email: string;
            createdAt: string | null;
        }>;
    };
    charts: {
        enrollmentsByStatus: Array<{ label: string; value: number }>;
        coursesByAssignmentStatus: Array<{ label: string; value: number }>;
        revenueLast6Months: Array<{ month: string; amount: string }>;
    };
};

/** GET /admin/dashboard — admin home aggregate */
export const getAdminDashboard = async (): Promise<AdminDashboardResponse> => {
    const token = getToken();
    if (!token) {
        logoutLocal();
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/admin/dashboard`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        let message = 'Failed to load admin dashboard';
        try {
            const errorData = await response.json();
            message = extractBackendMessage(errorData) || message;
        } catch {
            /* ignore */
        }
        if (response.status === 403) {
            throw new Error(message || 'Only admins can view this dashboard.');
        }
        throw new Error(message);
    }

    const json = await response.json();
    return (json?.data ?? json) as AdminDashboardResponse;
};

export const getAdminDashboardAPI = getAdminDashboard;

export type EnrollmentRequestStatus = 'pending' | 'enrolled' | 'rejected' | 'dismissed';
export type TransactionStatus = 'pending' | 'paid' | 'free' | 'failed';

export type MyEnrollmentRequestItem = {
    id: number;
    status: EnrollmentRequestStatus;
    isActive: boolean;
    rejectionReason: string | null;
    /** When admin rejected this request (ISO) */
    rejectedAt?: string | null;
    /** false while inside 48h cooldown after reject */
    canReapply?: boolean;
    /** ISO datetime when re-request is allowed; null if already eligible or not rejected */
    reapplyAvailableAt?: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    course: {
        id: number;
        courseName: string;
        price: string | null;
        coverImg: string | null;
        shortDescription: string | null;
        courseCategory: { id: number; name: string | null } | null;
        teacher: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
        } | null;
    } | null;
    transaction: {
        id: number;
        amount: string;
        status: TransactionStatus;
        paymentType: 'online' | 'cash' | null;
        screenshotUrl: string | null;
        createdAt: string | null;
        updatedAt: string | null;
    } | null;
};

export type MyEnrollmentRequestsResponse = {
    data: MyEnrollmentRequestItem[];
    summary: {
        pending: number;
        enrolled: number;
        rejected: number;
        dismissed: number;
        total: number;
    };
};

export const getMyEnrollmentRequestsAPI = async (params?: {
    status?: EnrollmentRequestStatus;
}): Promise<MyEnrollmentRequestsResponse> => {
    const token = getToken();
    if (!token) {
        logoutLocal();
        throw new Error('No authentication token found');
    }

    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();

    const response = await fetch(`${API_URL}/enrollments/my-requests${qs ? `?${qs}` : ''}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    if (response.status === 401) {
        logoutLocal();
        throw new Error('Unauthorized. Please sign in again.');
    }

    if (!response.ok) {
        let message = 'Failed to fetch enrollment requests';
        try {
            const errorData = await response.json();
            message = extractBackendMessage(errorData) || message;
        } catch {
            /* ignore */
        }
        if (response.status === 403) {
            throw new Error(message || 'Only students can view enrollment requests.');
        }
        throw new Error(message);
    }

    return await response.json();
};

export const updateCourseAPI = async (id: number, formData: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
    await throwIfNotOk(response, 'Course update nahi ho saka');
    return await response.json();
};

export const getCourseDetailsAPI = async (id: string) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/courses/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
};

// ==============================
// SECTION & LECTURES
// ==============================
export const createSectionAPI = async (courseId: number, data: { title: string; description: string }) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/courses/${courseId}/sections`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });

    await throwIfNotOk(response, 'Section create nahi ho saka');
    return await response.json();
};

export const createRecordedLectureAPI = async (data: any) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/lectures/recorded`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    await throwIfNotOk(response, 'Recorded lecture upload fail ho gaya');
    return await response.json();
};

export const createLiveLectureAPI = async (data: any) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/lectures/live`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    await throwIfNotOk(response, 'Live lecture schedule nahi ho saka');
    return await response.json();
};

// ==============================
// RESOURCES
// ==============================
export const createResourceAPI = async (courseId: number, sectionId: number, formData: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/resources/${courseId}/sections/${sectionId}/resources`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });

    await throwIfNotOk(response, 'Resource upload nahi ho saka');
    return await response.json();
};

// ==============================
// ASSIGNMENTS
// ==============================
export const createAssignmentAPI = async (formData: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/assignments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    await throwIfNotOk(response, 'Assignment upload fail ho gaya');
    return await response.json();
};

// lib/api/apiService.ts

export const getAssignmentDetailsAPI = async (assignmentId: number) => {
    const token = getToken()
    try {
        const response = await fetch(`${API_URL}/assignments/${assignmentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Agar token required ho tou uncomment kar lein
            }
        });

        await throwIfNotOk(response, 'Failed to fetch assignment details');
        return await response.json();
    } catch (error) {
        console.error("Assignment Fetch API Error:", error);
        throw error;
    }
};

// # ASSIGNMENT DELETE API
export const deleteAssignmentAPI = async (id: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/assignments/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await throwIfNotOk(response, 'Assignment delete fail ho gayi');
    return await response.json();
};
// ==============================
// SUBMIT ASSIGNMENT (FINAL FIXED)
// ==============================
export const submitAssignmentAPI = async (assignmentId: number, formData: FormData) => {
    // 1. Aapki file ke mutabiq Cookies se token uthayen
    const token = getToken();
    
    if (!token) throw new Error('Authentication token missing. Please login again.');

    // 2. Exact URL matching your Swagger image
    const fullUrl = `${API_URL}/assignments/${assignmentId}/submit`;
    console.log("🚀 Executing Protocol at:", fullUrl);

    const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
            // Correct header nesting
            'Authorization': `Bearer ${token}`
            // Content-Type: multipart/form-data YAHAN NAHI LIKHNA (fetch khud handles boundaries)
        },
        body: formData,
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Critical Alert: Route Not Found [404] at ${fullUrl}`);
        }
        await throwIfNotOk(response, 'Submission failed');
    }

    return await response.json();
};

// # FUTURE ASSIGNMENT UPDATE API (Commented for now)
/* export const updateAssignmentAPI = async (id: number, formData: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/assignments/update/${id}`, {
        method: 'PATCH', // ya PUT, backend ke mutabiq
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
    await throwIfNotOk(response, 'Assignment update fail ho gaya');
    return await response.json();
};
*/

export const getAssignmentDetailAPI = async (id: string | number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/assignments/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await throwIfNotOk(response, 'Assignment detail load nahi ho saki');
    return await response.json();
};

export const uploadAssignmentSubmissionAPI = async (assignmentId: string | number, files: File[]) => {
    const token = getToken();
    if (!token) throw new Error('Authentication token missing');
    
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await fetch(`${API_URL}/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    
    await throwIfNotOk(response, 'Submission upload failed');
    return await response.json();
};

export const getAssignmentSubmissionsAPI = async (id: string | number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/assignments/${id}/submissions`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await throwIfNotOk(response, 'Submissions load nahi ho sakeen');
    return await response.json();
};

export const gradeSubmissionAPI = async (
    assignmentId: string | number,
    studentId: string | number,
    data: { marksObtained: number; comments: string }
) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/assignments/${assignmentId}/submissions/${studentId}/grade`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    await throwIfNotOk(response, 'Grading fail ho gayi');
    // PATCH may return 200/204 with an empty body — don't fail JSON parse on success
    const text = await response.text();
    if (!text?.trim()) {
        return { marksObtained: data.marksObtained, comments: data.comments };
    }
    try {
        return JSON.parse(text);
    } catch {
        return { marksObtained: data.marksObtained, comments: data.comments };
    }
};

// ==============================
// ENROLLMENT
// ==============================
export const enrollStudentAPI = async (payload: { courseId: number; studentId: number }) => {
    const token = getToken();

    const response = await fetch(`${API_URL}/enrollments`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    await throwIfNotOk(response, 'Enrollment fail ho gayi');

    return await response.json();
};

export type AdminEnrollmentStatus = 'pending' | 'enrolled' | 'rejected' | 'dismissed';
export type AdminEnrollmentPaymentStatus = 'pending' | 'paid' | 'free' | 'failed';

export type AdminEnrollmentItem = {
    id: number;
    status: AdminEnrollmentStatus | string;
    isActive?: boolean;
    lectureViewed?: number;
    rejectionReason?: string | null;
    rejectedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    student?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        rollNumber?: string | null;
        contactNumber?: string | null;
    } | null;
    course?: {
        id: number;
        courseName: string;
        price?: string | null;
        coverImg?: string | null;
    } | null;
    transaction?: {
        id: number;
        uuid?: string | null;
        amount?: string | null;
        status?: AdminEnrollmentPaymentStatus | string | null;
        paymentType?: string | null;
        screenshotUrl?: string | null;
        createdAt?: string | null;
        updatedAt?: string | null;
    } | null;
    enrolledBy?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    } | null;
};

export type AdminEnrollmentsListStats = {
    total: number;
    pending: number;
    enrolled: number;
    rejected: number;
    dismissed: number;
};

export type AdminEnrollmentsListResponse = {
    data: AdminEnrollmentItem[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
    stats: AdminEnrollmentsListStats;
};

export type AdminEnrollmentsByCourseResponse = {
    course?: {
        id: number;
        courseName: string;
        price?: string | null;
        coverImg?: string | null;
    } | null;
    data: AdminEnrollmentItem[];
    stats: AdminEnrollmentsListStats;
};

export type GetAdminEnrollmentsParams = {
    page?: number;
    limit?: number;
    status?: AdminEnrollmentStatus | '';
    studentName?: string;
    courseName?: string;
    courseId?: number;
};

/** GET /admin/enrollments/course/:courseId — enriched roster (admin JWT only) */
export const getEnrolledStudentsAPI = async (
    courseId: string | number
): Promise<AdminEnrollmentsByCourseResponse> => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/enrollments/course/${courseId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });
    await throwIfNotOk(response, 'Failed to fetch course enrollments');
    const json = await response.json();
    // Backward-compatible if API ever returns a bare array
    if (Array.isArray(json)) {
        return {
            data: json,
            stats: {
                total: json.length,
                pending: 0,
                enrolled: json.length,
                rejected: 0,
                dismissed: 0,
            },
        };
    }
    return {
        course: json?.course ?? null,
        data: Array.isArray(json?.data) ? json.data : [],
        stats: json?.stats || {
            total: 0,
            pending: 0,
            enrolled: 0,
            rejected: 0,
            dismissed: 0,
        },
    };
};

// ==============================
// STUDENT APIs (admin)
// ==============================
export type AdminStudentListItem = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber?: string | null;
    role?: string;
    rollNumber?: string | null;
    isActive: boolean;
    createdAt?: string | null;
};

export type AdminStudentsListStats = {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    studentsWithEnrollments: number;
    pendingEnrollmentRequests: number;
    newStudentsThisMonth: number;
};

export type AdminStudentsListResponse = {
    data: AdminStudentListItem[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
    stats: AdminStudentsListStats;
};

export type AdminStudentProfileResponse = {
    student: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        contactNumber?: string | null;
        rollNumber?: string | null;
        role?: string;
        isActive: boolean;
        createdAt?: string | null;
        updatedAt?: string | null;
    };
    stats: {
        enrolledCourses: number;
        pendingEnrollments: number;
        rejectedEnrollments: number;
        totalEnrollments: number;
        attendancePresent: number;
        attendanceAbsent: number;
        attendanceRatePercent: number | null;
        paidTransactions: number;
        pendingPayments: number;
        failedPayments: number;
        totalPaidAmount: string;
    };
    enrollments: Array<{
        id: number;
        status: 'pending' | 'enrolled' | 'rejected' | 'dismissed' | string;
        isActive: boolean;
        lectureViewed?: number;
        rejectionReason?: string | null;
        rejectedAt?: string | null;
        createdAt?: string | null;
        updatedAt?: string | null;
        course: {
            id: number;
            courseName: string;
            price?: string | null;
            coverImg?: string | null;
            teacher?: {
                id: number;
                firstName: string;
                lastName: string;
                email?: string;
            } | null;
        } | null;
        transaction: {
            id: number;
            amount: string;
            status: 'pending' | 'paid' | 'free' | 'failed' | string;
            paymentType?: string | null;
            screenshotUrl?: string | null;
            createdAt?: string | null;
            updatedAt?: string | null;
        } | null;
    }>;
    recentAttendance: Array<{
        attendanceId: number;
        attendanceDate: string | null;
        status: 'present' | 'absent' | string;
        lectureTitle: string;
        courseName: string;
        courseId: number;
    }>;
};

export const createStudentsAPI = async (data: any) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/admin/users/students`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    await throwIfNotOk(res, 'Student create nahi ho saka');
    return await res.json();
};

export const getAllStudentsAPI = async (
    page = 1,
    limit = 10
): Promise<AdminStudentsListResponse> => {
    const token = getToken();
    const res = await fetch(`${API_URL}/admin/users/students?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });
    await throwIfNotOk(res, 'Students load nahi ho sakay');
    const json = await res.json();
    return {
        data: Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [],
        meta: json?.meta || {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: limit,
            totalPages: 1,
            currentPage: page,
        },
        stats: json?.stats || {
            totalStudents: 0,
            activeStudents: 0,
            inactiveStudents: 0,
            studentsWithEnrollments: 0,
            pendingEnrollmentRequests: 0,
            newStudentsThisMonth: 0,
        },
    };
};

/** GET /admin/users/students/:studentId — admin student profile */
export const getAdminStudentByIdAPI = async (
    studentId: number
): Promise<AdminStudentProfileResponse> => {
    const token = getToken();
    if (!token) {
        logoutLocal();
        throw new Error('No authentication token found');
    }

    const res = await fetch(`${API_URL}/admin/users/students/${studentId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });

    if (res.status === 401) {
        logoutLocal();
        throw new Error('Unauthorized. Please sign in again.');
    }

    if (res.status === 404) {
        throw new Error('Student not found');
    }

    await throwIfNotOk(res, 'Failed to load student profile');
    const json = await res.json();
    return (json?.data ?? json) as AdminStudentProfileResponse;
};

export const updateStudentsAPI = async (userId: number, data: any) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    await throwIfNotOk(res, 'Student update nahi ho saka');
    return await res.json();
};

export const deleteStudentsAPI = async (id: number) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/admin/users/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await throwIfNotOk(res, 'Student delete nahi ho saka');
    return true;
};

export const getStudentsAPI = async () => {
    const token = getToken();
    if (!token) throw new Error('Authentication token missing');

    const response = await fetch(`${API_URL}/admin/users/students`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    await throwIfNotOk(response, 'Students load karne mein masla hua');
    return await response.json();
};

// ==============================
// TEACHER APIs (admin)
// ==============================
export type AdminTeacherListItem = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber?: string | null;
    role?: string;
    isActive: boolean;
    createdAt?: string | null;
};

export type AdminTeachersListStats = {
    totalTeachers: number;
    activeTeachers: number;
    inactiveTeachers: number;
    teachersWithAcceptedCourses: number;
    pendingCourseAssignments: number;
    newTeachersThisMonth: number;
};

export type AdminTeachersListResponse = {
    data: AdminTeacherListItem[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
    stats: AdminTeachersListStats;
};

export type AdminTeacherProfileResponse = {
    teacher: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        contactNumber?: string | null;
        role?: string;
        isActive: boolean;
        createdAt?: string | null;
        updatedAt?: string | null;
    };
    stats: {
        acceptedCourses: number;
        pendingCourseAssignments: number;
        totalAssignedCourses: number;
        studentsEnrolled: number;
        pendingSubmissionsToGrade: number;
        unmarkedAttendanceSessions: number;
    };
    courses: Array<{
        id: number;
        courseName: string;
        shortDescription?: string | null;
        price?: string | null;
        coverImg?: string | null;
        isActive?: boolean;
        teacherStatus: 'pending' | 'accepted' | 'rejected' | string;
        enrolledStudentsCount: number;
        createdAt?: string | null;
        courseCategory?: { id: number; name: string | null } | null;
    }>;
};

export const createTeachersAPI = async (data: any) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/admin/users/teachers`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    await throwIfNotOk(res, 'Teacher create nahi ho saka');
    return await res.json();
};

export const getTeachersAPI = async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/users/teachers`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await throwIfNotOk(response, 'Teachers list load nahi ho saki');
    return await response.json();
};

export const getAllTeachersAPI = async (
    page = 1,
    limit = 10
): Promise<AdminTeachersListResponse> => {
    const token = getToken();
    const res = await fetch(`${API_URL}/admin/users/teachers?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });
    await throwIfNotOk(res, 'Teachers load nahi ho sakay');
    const json = await res.json();
    return {
        data: Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [],
        meta: json?.meta || {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: limit,
            totalPages: 1,
            currentPage: page,
        },
        stats: json?.stats || {
            totalTeachers: 0,
            activeTeachers: 0,
            inactiveTeachers: 0,
            teachersWithAcceptedCourses: 0,
            pendingCourseAssignments: 0,
            newTeachersThisMonth: 0,
        },
    };
};

/** GET /admin/users/teachers/:teacherId — admin teacher profile */
export const getAdminTeacherByIdAPI = async (
    teacherId: number
): Promise<AdminTeacherProfileResponse> => {
    const token = getToken();
    if (!token) {
        logoutLocal();
        throw new Error('No authentication token found');
    }

    const res = await fetch(`${API_URL}/admin/users/teachers/${teacherId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });

    if (res.status === 401) {
        logoutLocal();
        throw new Error('Unauthorized. Please sign in again.');
    }

    if (res.status === 404) {
        throw new Error('Teacher not found');
    }

    await throwIfNotOk(res, 'Failed to load teacher profile');
    const json = await res.json();
    return (json?.data ?? json) as AdminTeacherProfileResponse;
};

export const updateTeachersAPI = async (id: number, data: any) => {
    const token = getToken();

    const payload = {
        ...data,
        isActive: data.isActive === 'true' || data.isActive === true
    };

    const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    await throwIfNotOk(res, 'Teacher update nahi ho saka');
    return await res.json();
};

export const deleteTeachersAPI = async (id: number) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/admin/users/teachers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await throwIfNotOk(res, 'Teacher delete nahi ho saka');
    return true;
};

// ==============================
// FEES
// ==============================
export const getFeesDataAPI = async (page = 1, limit = 10) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/admin/fees?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await throwIfNotOk(res, 'Fees data load nahi ho saka');
    return await res.json();
};

// ==============================
// ASSIGNED COURSES (teacher inbox + workspace)
// ==============================
export type TeacherAssignmentStatus = 'pending' | 'accepted' | 'rejected';

export type AssignedCourseItem = {
    id: number;
    courseName: string;
    shortDescription?: string | null;
    longDescription?: string | null;
    price?: string | null;
    coverImg?: string | null;
    teacherStatus: TeacherAssignmentStatus | string;
    needsAction: boolean;
    courseCategory?: { id: number; name: string | null } | null;
    createdBy?: { id: number; firstName: string; lastName: string } | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    [key: string]: unknown;
};

export type AssignedCoursesMeta = {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
};

export type AssignedCoursesSummary = {
    pending: number;
    accepted: number;
    filter: string;
};

export type AssignedCoursesResponse = {
    data: AssignedCourseItem[];
    meta: AssignedCoursesMeta;
    summary: AssignedCoursesSummary;
};

export type AssignCoursesListParams = {
    status?: 'pending' | 'accepted';
    page?: number;
    limit?: number;
};

/** GET /courses/assign-courses — teacher assignment inbox / list */
export const getAssignedCourses = async (
    params?: AssignCoursesListParams
): Promise<AssignedCoursesResponse> => {
    const token = getToken();
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    query.set('page', String(params?.page ?? 1));
    query.set('limit', String(params?.limit ?? 10));

    const response = await fetch(
        `${API_URL}/courses/assign-courses?${query.toString()}`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        }
    );
    await throwIfNotOk(response, 'Assigned courses load nahi ho sakay');
    const json = await response.json();

    const data = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : [];

    const meta: AssignedCoursesMeta = json?.meta || {
        totalItems: data.length,
        itemCount: data.length,
        itemsPerPage: params?.limit ?? 10,
        totalPages: 1,
        currentPage: params?.page ?? 1,
    };

    const summary: AssignedCoursesSummary = json?.summary || {
        pending: 0,
        accepted: 0,
        filter: params?.status || 'all',
    };

    return { data, meta, summary };
};

/** PATCH /courses/:courseId/teacher-assignment — in-app accept / reject */
export const respondToCourseAssignment = async (
    courseId: number,
    action: 'accept' | 'reject'
): Promise<{
    message?: string;
    courseName?: string;
    teacherStatus?: TeacherAssignmentStatus | string;
}> => {
    const token = getToken();
    const response = await fetch(
        `${API_URL}/courses/${courseId}/teacher-assignment`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action }),
        }
    );
    await throwIfNotOk(response, 'Failed to update course assignment');
    return await response.json();
};

// ==============================
// ADMIN TEACHER ASSIGNMENTS (course ↔ teacher queue)
// ==============================
export type AdminTeacherAssignmentStatus =
    | 'pending'
    | 'accepted'
    | 'rejected'
    | 'unassigned';

export type AdminTeacherAssignmentItem = {
    courseId: number;
    courseName: string;
    shortDescription?: string | null;
    price?: string | null;
    coverImg?: string | null;
    isActive?: boolean;
    assignmentStatus: AdminTeacherAssignmentStatus | string;
    needsAction?: boolean;
    teacher?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        contactNumber?: string | null;
    } | null;
    courseCategory?: { id: number; name: string | null } | null;
    createdAt?: string | null;
    updatedAt?: string | null;
};

export type AdminTeacherAssignmentsStats = {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    unassigned: number;
};

export type AdminTeacherAssignmentsResponse = {
    data: AdminTeacherAssignmentItem[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
    stats: AdminTeacherAssignmentsStats;
};

export type GetAdminTeacherAssignmentsParams = {
    page?: number;
    limit?: number;
    status?: AdminTeacherAssignmentStatus | '';
    teacherName?: string;
    courseName?: string;
    teacherId?: number;
};

/** GET /admin/teacher-assignments — admin review queue */
export const getAdminTeacherAssignmentsAPI = async (
    params: GetAdminTeacherAssignmentsParams = {}
): Promise<AdminTeacherAssignmentsResponse> => {
    const token = getToken();
    const qs = new URLSearchParams();
    qs.set('page', String(params.page ?? 1));
    qs.set('limit', String(params.limit ?? 10));
    if (params.status) qs.set('status', params.status);
    if (params.teacherName?.trim()) qs.set('teacherName', params.teacherName.trim());
    if (params.courseName?.trim()) qs.set('courseName', params.courseName.trim());
    if (params.teacherId != null) qs.set('teacherId', String(params.teacherId));

    const response = await fetch(`${API_URL}/admin/teacher-assignments?${qs.toString()}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });
    await throwIfNotOk(response, 'Failed to fetch teacher assignments');
    const json = await response.json();

    return {
        data: Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [],
        meta: json?.meta || {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: params.limit ?? 10,
            totalPages: 1,
            currentPage: params.page ?? 1,
        },
        stats: json?.stats || {
            total: 0,
            pending: 0,
            accepted: 0,
            rejected: 0,
            unassigned: 0,
        },
    };
};

/** POST /courses/assign-teacher/:courseId/:teacherId — send / reassign invitation */
export const assignTeacherToCourseAPI = async (courseId: number, teacherId: number) => {
    const token = getToken();
    const response = await fetch(
        `${API_URL}/courses/assign-teacher/${courseId}/${teacherId}`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );
    await throwIfNotOk(response, 'Failed to assign teacher to course');
    return await response.json();
};

/** Workspace list (accepted courses) — keeps older callers working */
export const getAssignedCoursesAPI = async (page = 1, limit = 10) => {
    return getAssignedCourses({ page, limit, status: 'accepted' });
};

// ==============================
// GOOGLE CALENDAR
// ==============================
export const connectGoogleCalendarAPI = async (opts?: {
    /** Frontend URL Google OAuth should return to after backend callback */
    returnUrl?: string;
}) => {
    const token = getToken();
    const query = new URLSearchParams();
    if (opts?.returnUrl) {
        query.set('returnUrl', opts.returnUrl);
        query.set('frontendUrl', opts.returnUrl);
        query.set('redirect', opts.returnUrl);
    }
    const qs = query.toString();

    const response = await fetch(
        `${API_URL}/google-calendar/connect${qs ? `?${qs}` : ''}`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    await throwIfNotOk(response, 'Google connection failed');

    const text = (await response.text()).trim();
    if (!text) throw new Error('Google connection URL was empty');

    try {
        const json = JSON.parse(text);
        const url =
            json.url ||
            json.authUrl ||
            json.auth_url ||
            json.redirectUrl ||
            json.data?.url ||
            json.data;
        if (typeof url === 'string' && url.startsWith('http')) return url;
    } catch {
        /* plain text URL */
    }

    const cleaned = text.replace(/^"|"$/g, '').trim();
    if (cleaned.startsWith('http')) return cleaned;
    throw new Error('Invalid Google connection URL from server');
};


// ==============================
// LECTURE ACTIONS (DELETE & PATCH)
// ==============================
export const deleteLectureAPI = async (lectureId: number, courseId: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/lectures/${lectureId}/course/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await throwIfNotOk(response, 'Lecture delete nahi ho saka');
    return true;
};

// # Update Lecture API: JSON Payload conversion
export const updateLectureAPI = async (lectureId: number, courseId: number, data: FormData) => {
    const token = getToken();

    // # FormData ko plain object mein convert kar rahe hain
    const payload = Object.fromEntries(data);

    const response = await fetch(`${API_URL}/lectures/${lectureId}/course/${courseId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' // # Mandatory for this API
        },
        body: JSON.stringify(payload),
    });

    await throwIfNotOk(response, 'Lecture update nahi ho saka');
    return await response.json();
};

// ==============================
// RESOURCE ACTIONS (DELETE & PATCH)
// ==============================
export const deleteResourceAPI = async (courseId: number, sectionId: number, resourceId: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/resources/${courseId}/sections/${sectionId}/resources/${resourceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await throwIfNotOk(response, 'Resource delete nahi ho saka');
    return true;
};

export const updateResourceAPI = async (courseId: number, sectionId: number, resourceId: number, data: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/resources/${courseId}/sections/${sectionId}/resources/${resourceId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data,
    });
    await throwIfNotOk(response, 'Resource update nahi ho saka');
    return await response.json();
};

// src/lib/api/apiService.ts

export const getSpecificResourceAPI = async (courseId: number, sectionId: number, resourceId: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/resources/${courseId}/sections/${sectionId}/resources/${resourceId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    await throwIfNotOk(response, 'Resource detail load nahi ho saki');
    return await response.json();
};

//student delete from course
export const dismissStudentAPI = async (enrollmentId: number, courseId: number, studentId: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/enrollments/${enrollmentId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        // # User ki requirement ke mutabiq body parameters set kiye gaye hain
        body: JSON.stringify({
            courseId: courseId,
            studentId: studentId,
            status: 'dismissed'
        })
    });

    await throwIfNotOk(response, 'Student remove nahi ho saka');
    return await response.json();
};

export const getLecturesBySectionAPI = async (courseId: number, sectionId: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/lectures/course/${courseId}/section/${sectionId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    await throwIfNotOk(response, 'Lectures load karne mein masla hua');
    return await response.json();
};

//--------------------------------------------------------------------------------
// # QUIZ CRUD APIs
export const createQuizAPI = async (data: any) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/quizzes/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    await throwIfNotOk(response, 'Quiz create nahi ho saka');
    return await response.json();
};

export const updateQuizAPI = async (id: number, data: any) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/quizzes/update/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    await throwIfNotOk(response, 'Quiz update nahi ho saka');
    return await response.json();
};

export const deleteQuizAPI = async (id: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/quizzes/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await throwIfNotOk(response, 'Quiz delete nahi ho saka');
    return true;
};

export const getSpecificQuizAPI = async (id: number, opts?: { forStudent?: boolean }) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/quizzes/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
    });
    await throwIfNotOk(response, 'Quiz details nahi mil sakin');
    const json = await response.json();
    const quiz = json?.data ?? json;

    // Never expose correct answers to students in client state
    if (opts?.forStudent && quiz?.questions) {
        quiz.questions = quiz.questions.map((q: any) => ({
            ...q,
            options: (q.options || []).map((opt: any) => {
                const { is_correct, isCorrect, ...safe } = opt || {};
                return safe;
            }),
        }));
    }

    return quiz;
};

// apiService.ts mein add karein
export const submitQuizAnswersAPI = async (payload: any) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/quizzes/submit`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
    });
    await throwIfNotOk(response, 'Submission failed');
    return await response.json();
};

// # QUIZ SUBMISSIONS & GRADING APIs
export const getQuizSubmissionsAPI = async (quizId: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/quizzes/quiz/${quizId}/attempts`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await throwIfNotOk(response, 'Submissions load nahi ho sakeen');
    return await response.json();
};

export const getQuizAttemptDetailAPI = async (attemptId: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/quizzes/attempt/${attemptId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await throwIfNotOk(response, 'Attempt details nahi mil sakin');
    return await response.json();
};

// export const gradeQuizAttemptAPI = async (attemptId: number, data: { marksObtained: number, comments: string }) => {
//     const token = getToken();
//     const response = await fetch(`${API_URL}/quizzes/grade/${attemptId}`, {
//         method: 'POST',
//         headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
//         body: JSON.stringify(data)
//     });
//     await throwIfNotOk(response, 'Grading fail ho gayi');
//     return await response.json();
// };

// ==============================
// QUIZ GRADING API (PATCH)
// ==============================
export const gradeQuizAttemptAPI = async (attemptId: number, data: { comments: string, questions: any[] }) => {
    const token = getToken();
    
    if (!token) throw new Error('Authentication token missing.');

    const response = await fetch(`${API_URL}/quizzes/grade/${attemptId}`, {
        method: 'PATCH',
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
    });

    await throwIfNotOk(response, 'Grading failed');

    return await response.json();
};

// student views their own graded quiz result
export const getStudentQuizResultAPI = async (attemptId: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/quizzes/my-result/${attemptId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    await throwIfNotOk(response, 'Result fetch protocol failed');
    return await response.json();
};

// ==============================
// STUDENT COURSE MARKSHEET
// ==============================
export type MarksheetWorkStatus = 'missing' | 'submitted' | 'graded' | 'late';

export type MarksheetBucketSummary = {
    total: number;
    graded: number;
    submitted: number;
    missing: number;
    obtainedMarks: number;
    gradedTotalMarks: number;
    possibleTotalMarks: number;
    percentage: number | null;
};

export type CourseMarksheetResponse = {
    student: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
    course: {
        id: number;
        courseName: string;
        coverImg: string | null;
        price?: string | number | null;
    };
    summary: {
        assignments: MarksheetBucketSummary;
        quizzes: MarksheetBucketSummary;
        overall: {
            obtainedMarks: number;
            gradedTotalMarks: number;
            possibleTotalMarks: number;
            percentage: number | null;
            gradedItems: number;
            totalItems: number;
        };
    };
    assignments: Array<{
        id: number;
        title: string;
        sectionId: number;
        sectionTitle: string;
        dueDate: string | null;
        totalMarks: number;
        status: MarksheetWorkStatus;
        marksObtained: number | null;
        comments: string | null;
        submittedAt: string | null;
    }>;
    quizzes: Array<{
        id: number;
        title: string;
        sectionId: number;
        sectionTitle: string;
        totalMarks: number;
        attemptId: number | null;
        attemptStatus: Exclude<MarksheetWorkStatus, 'late'> | MarksheetWorkStatus;
        marksObtained: number | null;
        comments: string | null;
        submittedAt: string | null;
        gradedAt: string | null;
    }>;
};

/** GET /progress/courses/:courseId/marksheet — enrolled student only */
export const getCourseMarksheetAPI = async (
    courseId: number
): Promise<CourseMarksheetResponse> => {
    const token = getToken();
    if (!token) {
        logoutLocal();
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/progress/courses/${courseId}/marksheet`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    if (response.status === 401) {
        logoutLocal();
        throw new Error('Unauthorized. Please sign in again.');
    }

    await throwIfNotOk(response, 'Failed to load marksheet');

    const json = await response.json();
    return (json?.data ?? json) as CourseMarksheetResponse;
};

// # ATTENDANCE APIs
export type StudentAttendanceStatus = 'present' | 'absent' | '-';

export type StudentAttendanceItem = {
    attendanceId: number;
    attendanceDate: string | null;
    status: StudentAttendanceStatus;
    lecture: {
        id: number;
        title: string;
        lectureType: string;
        lectureOrder: number | null;
    };
    course: {
        id: number;
        courseName: string;
    };
};

export type StudentAttendanceResponse = {
    data: StudentAttendanceItem[];
    summary: {
        present: number;
        absent: number;
        pending: number;
        total: number;
    };
};

export const getMyAttendanceAPI = async (params?: {
    courseId?: number;
    lectureId?: number;
}): Promise<StudentAttendanceResponse> => {
    const token = getToken();
    if (!token) {
        logoutLocal();
        throw new Error('No authentication token found');
    }

    const query = new URLSearchParams();
    if (params?.courseId != null) query.set('courseId', String(params.courseId));
    if (params?.lectureId != null) query.set('lectureId', String(params.lectureId));
    const qs = query.toString();

    const response = await fetch(`${API_URL}/attendance/me${qs ? `?${qs}` : ''}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    if (response.status === 401) {
        logoutLocal();
        throw new Error('Unauthorized. Please sign in again.');
    }

    if (!response.ok) {
        let message = 'Failed to fetch attendance';
        try {
            const errorData = await response.json();
            message = extractBackendMessage(errorData) || message;
        } catch {
            /* ignore parse errors */
        }

        if (response.status === 403) {
            throw new Error(message || 'You are not enrolled in this course or do not have access.');
        }
        if (response.status === 404) {
            throw new Error(message || 'Lecture not found for this course.');
        }
        throw new Error(message);
    }

    return await response.json();
};

export const getAllAttendancesAPI = async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/attendance/all`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
    });
    await throwIfNotOk(response, 'Attendance list load nahi ho saki');
    return await response.json();
};

export type AttendanceDetailStatus = 'present' | 'absent' | '-';

export type AttendanceSessionDetail = {
    id: number;
    status: AttendanceDetailStatus | string;
    student: {
        id: number;
        firstName: string;
        lastName: string;
        email?: string;
        rollNumber?: string | null;
        roll_number?: string | null;
        [key: string]: unknown;
    };
};

export type AttendanceSession = {
    id: number;
    attendanceDate: string | null;
    /** After first successful mark → true; new live lecture → false */
    isMarked?: boolean | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    lecture?: {
        id: number;
        title: string;
        [key: string]: unknown;
    } | null;
    teacher?: {
        id: number;
        firstName: string;
        lastName: string;
        [key: string]: unknown;
    } | null;
    attendanceDetails: AttendanceSessionDetail[];
};

export type UpdateAttendancePayload = {
    attendanceDate?: string;
    presentStudentIds?: number[];
    absentStudentIds?: number[];
};

/** Normalize list/detail payloads — support isMarked / is_marked */
export function normalizeAttendanceSession(raw: unknown): AttendanceSession {
    const session = ((raw as { data?: unknown })?.data ?? raw) as Record<string, unknown>;
    const markedRaw = session?.isMarked ?? session?.is_marked;
    const isMarked =
        typeof markedRaw === 'boolean' ? markedRaw : markedRaw == null ? null : Boolean(markedRaw);

    return {
        ...(session as unknown as AttendanceSession),
        isMarked,
        attendanceDetails: Array.isArray(session?.attendanceDetails)
            ? (session.attendanceDetails as AttendanceSessionDetail[])
            : [],
    };
}

export function normalizeAttendanceList(raw: unknown): AttendanceSession[] {
    const root = (raw as { data?: unknown })?.data ?? raw;
    const list = Array.isArray(root) ? root : [];
    return list.map((item) => normalizeAttendanceSession(item));
}

/** Load one attendance roll — GET /attendance/:id */
export const getAttendanceByIdAPI = async (
    attendanceId: number
): Promise<AttendanceSession> => {
    const token = getToken();
    if (!token) {
        logoutLocal();
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/attendance/${attendanceId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    if (response.status === 401) {
        logoutLocal();
        throw new Error('Unauthorized. Please sign in again.');
    }

    await throwIfNotOk(response, 'Failed to load attendance session');
    const json = await response.json();
    return normalizeAttendanceSession(json);
};

export const updateAttendanceAPI = async (
    attendanceId: number,
    payload: UpdateAttendancePayload
): Promise<AttendanceSession> => {
    const token = getToken();
    const response = await fetch(`${API_URL}/attendance/${attendanceId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    await throwIfNotOk(response, 'Failed to update attendance');
    const json = await response.json();
    return normalizeAttendanceSession(json);
};

export const enrollWithProofAPI = async (formData: FormData) => {
    // Token retrieve karein
    const token = getToken();

    const response = await fetch(`${API_URL}/enrollments`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
            // Note: FormData ke sath 'Content-Type' header mat lagayen. Browser automatically attach karega.
        },
        body: formData,
    });

    await throwIfNotOk(response, 'Enrollment request failed. Please try again.');

    return await response.json();
};

/** GET /admin/enrollments — paginated list with stats (admin JWT) */
export const getEnrollmentsAPI = async (
    params: GetAdminEnrollmentsParams = {}
): Promise<AdminEnrollmentsListResponse> => {
    const token = getToken();
    const qs = new URLSearchParams();
    qs.set('page', String(params.page ?? 1));
    qs.set('limit', String(params.limit ?? 10));
    if (params.status) qs.set('status', params.status);
    if (params.studentName?.trim()) qs.set('studentName', params.studentName.trim());
    if (params.courseName?.trim()) qs.set('courseName', params.courseName.trim());
    if (params.courseId != null) qs.set('courseId', String(params.courseId));

    const response = await fetch(`${API_URL}/admin/enrollments?${qs.toString()}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });

    await throwIfNotOk(response, 'Failed to fetch enrollments');
    const json = await response.json();

    // Guard if an older server still returns a bare array
    if (Array.isArray(json)) {
        return {
            data: json,
            meta: {
                totalItems: json.length,
                itemCount: json.length,
                itemsPerPage: json.length || 10,
                totalPages: 1,
                currentPage: 1,
            },
            stats: {
                total: json.length,
                pending: json.filter((e: any) => e.status === 'pending').length,
                enrolled: json.filter((e: any) => e.status === 'enrolled').length,
                rejected: json.filter((e: any) => e.status === 'rejected').length,
                dismissed: json.filter((e: any) => e.status === 'dismissed').length,
            },
        };
    }

    return {
        data: Array.isArray(json?.data) ? json.data : [],
        meta: json?.meta || {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: params.limit ?? 10,
            totalPages: 1,
            currentPage: params.page ?? 1,
        },
        stats: json?.stats || {
            total: 0,
            pending: 0,
            enrolled: 0,
            rejected: 0,
            dismissed: 0,
        },
    };
};

export type UpdateEnrollmentStatusPayload =
    | { action: 'approve' }
    | { action: 'reject'; rejectionReason: string };

/** PATCH /enrollments/:id/status — admin approve / reject (pending only) */
export const updateEnrollmentStatusAPI = async (
    id: number,
    data: UpdateEnrollmentStatusPayload
) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/enrollments/${id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    await throwIfNotOk(response, 'Failed to update enrollment status');
    return await response.json();
};

// # 1. Fetch Transaction Details (GET)
export const getTransactionByIdAPI = async (transactionId: number | string) => {
    // const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/fees/transactions/${transactionId}`, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    await throwIfNotOk(response, 'Failed to fetch transaction details');
    return await response.json();
};

// # 2. Update Transaction Status (PATCH)
export const updateTransactionStatusAPI = async (transactionId: number | string, payload: any) => {
    // const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/fees/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
    });

    await throwIfNotOk(response, 'Failed to update transaction status');
    return await response.json();
};

export const markLectureCompleteAPI = async (lectureId: number) => {
    const token = getToken();
    try {
        // Agar aap custom axios instance use kar rahay hain toh axios.post use kar lein
        // e.g., await axiosInstance.post(`/lectures/${lectureId}/complete`);
        const response = await fetch(`${API_URL}/lectures/${lectureId}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Zaroorat parne par token zaroor bhejein
            }
        });

        await throwIfNotOk(response, 'Failed to mark lecture as complete');
        return await response.json();
    } catch (error) {
        console.error("Complete API Error:", error);
        throw error;
    }
};