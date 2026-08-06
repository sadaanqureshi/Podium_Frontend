import Cookies from 'js-cookie';

// ==============================
// BASE URL
// ==============================
// const API_URL = 'http://localhost:3006';
// process.env use karne se Next.js khud hi environment ke mutabiq URL utha lega
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

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

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
    }

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
        throw err;
    }

    if (!response.ok) {
        let message = 'Session expired or invalid';
        try {
            const errorData = await response.json();
            message = errorData.message || message;
        } catch {
            /* ignore */
        }
        const err: any = new Error(message);
        err.status = response.status;
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

    if (!response.ok) {
        const errorData = await response.json();
        // Backend se aane wala error message ya default error
        throw new Error(errorData.message || 'Registration Protocol Failed');
    }

    return await response.json();
};

export const forgotPasswordAPI = async (email: string) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset email');
    }

    return await response.json();
};

export const resetPasswordAPI = async (token: string, newPassword: any) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password. Link might be expired.');
    }

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

    if (!response.ok) throw new Error('Backend logout failed');
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

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Profile update fail ho gaya');
    }
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

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch courses');
    }

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

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Course create karne mein masla hua');
    }

    return await response.json();
};

export const getCourseCategoriesAPI = async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/courses/categories/all`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Categories load nahi ho sakeen');
    return await response.json();
};

export const getCourseByIdAPI = async (id: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/courses/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Course details load nahi ho sakeen');
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

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch course content');
    }

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
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch enrolled courses');
    }
    
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
            message = errorData.message || message;
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
            message = errorData.message || message;
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

export type EnrollmentRequestStatus = 'pending' | 'enrolled' | 'rejected' | 'dismissed';
export type TransactionStatus = 'pending' | 'paid' | 'free' | 'failed';

export type MyEnrollmentRequestItem = {
    id: number;
    status: EnrollmentRequestStatus;
    isActive: boolean;
    rejectionReason: string | null;
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
            message = errorData.message || message;
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
    if (!response.ok) throw new Error('Course update nahi ho saka');
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

    if (!response.ok) throw new Error('Section create nahi ho saka');
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
    if (!response.ok) throw new Error('Recorded lecture upload fail ho gaya');
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
    if (!response.ok) throw new Error('Live lecture schedule nahi ho saka');
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

    if (!response.ok) throw new Error('Resource upload nahi ho saka');
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
    if (!response.ok) throw new Error('Assignment upload fail ho gaya');
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

        if (!response.ok) {
            throw new Error("Failed to fetch assignment details");
        }
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
    if (!response.ok) throw new Error('Assignment delete fail ho gayi');
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
        // Agar status 404 hai toh iska matlab backend par route nahi hai
        if (response.status === 404) {
            throw new Error(`Critical Alert: Route Not Found [404] at ${fullUrl}`);
        }
        const errorData = await response.json().catch(() => ({ message: 'Submission Protocol Interrupted' }));
        throw new Error(errorData.message || 'Submission failed');
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
    if (!response.ok) throw new Error('Assignment update fail ho gaya');
    return await response.json();
};
*/

export const getAssignmentDetailAPI = async (id: string | number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/assignments/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Assignment detail load nahi ho saki');
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
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission upload failed');
    }
    return await response.json();
};

export const getAssignmentSubmissionsAPI = async (id: string | number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/assignments/${id}/submissions`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Submissions load nahi ho sakeen');
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
    if (!response.ok) throw new Error('Grading fail ho gayi');
    return await response.json();
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

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Enrollment fail ho gayi');
    }

    return await response.json();
};

export const getEnrolledStudentsAPI = async (courseId: string) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/enrollments/course/${courseId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
};

// ==============================
// STUDENT APIs
// ==============================
export const createStudentsAPI = async (data: any) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/admin/users/students`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Student create nahi ho saka');
    return await res.json();
};

export const getAllStudentsAPI = async (page = 1, limit = 10) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/admin/users/students?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Students load nahi ho sakay');
    return await res.json();
};

export const updateStudentsAPI = async (userId: number, data: any) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Student update nahi ho saka');
    return await res.json();
};

export const deleteStudentsAPI = async (id: number) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/admin/users/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Student delete nahi ho saka');
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

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Students load karne mein masla hua');
    }
    return await response.json();
};

// ==============================
// TEACHER APIs
// ==============================
export const createTeachersAPI = async (data: any) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/admin/users/teachers`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Teacher create nahi ho saka');
    return await res.json();
};

export const getTeachersAPI = async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/users/teachers`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Teachers list load nahi ho saki');
    return await response.json();
};

export const getAllTeachersAPI = async (page = 1, limit = 10) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/admin/users/teachers?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Teachers load nahi ho sakay');
    return await res.json();
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

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Teacher update nahi ho saka');
    }
    return await res.json();
};

export const deleteTeachersAPI = async (id: number) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/admin/users/teachers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Teacher delete nahi ho saka');
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
    if (!res.ok) throw new Error('Fees data load nahi ho saka');
    return await res.json();
};

// ==============================
// ASSIGNED COURSES
// ==============================
export const getAssignedCoursesAPI = async (page = 1, limit = 10) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/courses/assign-courses?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Assigned courses load nahi ho sakay');
    return await response.json();
};

// ==============================
// GOOGLE CALENDAR
// ==============================
export const connectGoogleCalendarAPI = async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/google-calendar/connect`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Google connection failed');
    return await response.text();
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
    if (!response.ok) throw new Error('Lecture delete nahi ho saka');
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

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Lecture update nahi ho saka');
    }
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
    if (!response.ok) throw new Error('Resource delete nahi ho saka');
    return true;
};

export const updateResourceAPI = async (courseId: number, sectionId: number, resourceId: number, data: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/resources/${courseId}/sections/${sectionId}/resources/${resourceId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data,
    });
    if (!response.ok) throw new Error('Resource update nahi ho saka');
    return await response.json();
};

// src/lib/api/apiService.ts

export const getSpecificResourceAPI = async (courseId: number, sectionId: number, resourceId: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/resources/${courseId}/sections/${sectionId}/resources/${resourceId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Resource detail load nahi ho saki');
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

    if (!response.ok) throw new Error('Student remove nahi ho saka');
    return await response.json();
};

export const getLecturesBySectionAPI = async (courseId: number, sectionId: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/lectures/course/${courseId}/section/${sectionId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Lectures load karne mein masla hua');
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
    if (!response.ok) throw new Error('Quiz create nahi ho saka');
    return await response.json();
};

export const updateQuizAPI = async (id: number, data: any) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/quizzes/update/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Quiz update nahi ho saka');
    return await response.json();
};

export const deleteQuizAPI = async (id: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/quizzes/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Quiz delete nahi ho saka');
    return true;
};

export const getSpecificQuizAPI = async (id: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/quizzes/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        // cache: 'no-store'
    });
    if (!response.ok) throw new Error('Quiz details nahi mil sakin');
    return await response.json();
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
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Submission failed');
    }
    return await response.json();
};

// # QUIZ SUBMISSIONS & GRADING APIs
export const getQuizSubmissionsAPI = async (quizId: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/quizzes/quiz/${quizId}/attempts`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Submissions load nahi ho sakeen');
    return await response.json();
};

export const getQuizAttemptDetailAPI = async (attemptId: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/quizzes/attempt/${attemptId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Attempt details nahi mil sakin');
    return await response.json();
};

// export const gradeQuizAttemptAPI = async (attemptId: number, data: { marksObtained: number, comments: string }) => {
//     const token = getToken();
//     const response = await fetch(`${API_URL}/quizzes/grade/${attemptId}`, {
//         method: 'POST',
//         headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
//         body: JSON.stringify(data)
//     });
//     if (!response.ok) throw new Error('Grading fail ho gayi');
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

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Grading failed');
    }

    return await response.json();
};

// student views their own graded quiz result
export const getStudentQuizResultAPI = async (attemptId: number) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/quizzes/my-result/${attemptId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Result fetch protocol failed');
    return await response.json();
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
            message = errorData.message || message;
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
    if (!response.ok) throw new Error('Attendance list load nahi ho saki');
    return await response.json();
};

export const updateAttendanceAPI = async (attendanceId: number, payload: any) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/attendance/${attendanceId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Update fail ho gaya');
    return await response.json();
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

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Enrollment request failed. Please try again.');
    }

    return await response.json();
};

// Enrollments fetch karne ki API
export const getEnrollmentsAPI = async () => {
    // const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/enrollments`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch enrollments');
    return await response.json();
};

// Enrollment status update karne ki API (Approve/Reject)
export const updateEnrollmentStatusAPI = async (id: number, data: { action: string; rejectionReason?: string }) => {
    // const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const token = getToken();
    
    // Note: Backend method POST, PUT ya PATCH ho sakta hai. Agar error aaye toh PATCH ko POST kar lijiyega.
    const response = await fetch(`${API_URL}/enrollments/${id}/status`, {
        method: 'PATCH', 
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Failed to update status');
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

    if (!response.ok) throw new Error('Failed to fetch transaction details');
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

    if (!response.ok) throw new Error('Failed to update transaction status');
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

        if (!response.ok) {
            throw new Error("Failed to mark lecture as complete");
        }
        return await response.json();
    } catch (error) {
        console.error("Complete API Error:", error);
        throw error;
    }
};