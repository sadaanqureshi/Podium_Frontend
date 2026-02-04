import Cookies from 'js-cookie';

// ==============================
// BASE URL
// ==============================
const API_URL = 'http://localhost:3006';
// process.env use karne se Next.js khud hi environment ke mutabiq URL utha lega
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ==============================
// AUTH APIs
// ==============================
export const loginUser = async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
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
    const token = Cookies.get('authToken');
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

export const logoutLocal = () => {
    Cookies.remove('authToken');
    const role = Cookies.get('userRole');
    if (role === 'admin') window.location.href = '/admin/signin';
    else if (role === 'teacher') window.location.href = '/teacher/signin';
    else window.location.href = '/student/signin';
    Cookies.remove('userRole');
};

// ==============================
// USER PROFILE
// ==============================
export const updateUserProfileAPI = async (userId: number, data: any) => {
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/courses/categories/all`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Categories load nahi ho sakeen');
    return await response.json();
};

export const getCourseByIdAPI = async (id: number) => {
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/courses/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Course details load nahi ho sakeen');
    return await response.json();
};

export const getCourseWithContentAPI = async (courseId: number) => {
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
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

export const updateCourseAPI = async (id: number, formData: FormData) => {
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
    if (!response.ok) throw new Error('Course update nahi ho saka');
    return await response.json();
};

export const getCourseDetailsAPI = async (id: string) => {
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
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

export const createRecordedLectureAPI = async (formData: FormData) => {
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/lectures/recorded`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    if (!response.ok) throw new Error('Recorded lecture upload fail ho gaya');
    return await response.json();
};

export const createLiveLectureAPI = async (data: any) => {
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/assignments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    if (!response.ok) throw new Error('Assignment upload fail ho gaya');
    return await response.json();
};

// # ASSIGNMENT DELETE API
export const deleteAssignmentAPI = async (id: number) => {
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/assignments/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Assignment delete fail ho gayi');
    return await response.json();
};

// # FUTURE ASSIGNMENT UPDATE API (Commented for now)
/* export const updateAssignmentAPI = async (id: number, formData: FormData) => {
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/assignments/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Assignment detail load nahi ho saki');
    return await response.json();
};

export const uploadAssignmentSubmissionAPI = async (assignmentId: string | number, files: File[]) => {
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');

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
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
    const res = await fetch(`${API_URL}/admin/users/students`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Student create nahi ho saka');
    return await res.json();
};

export const getAllStudentsAPI = async (page = 1, limit = 10) => {
    const token = Cookies.get('authToken');
    const res = await fetch(`${API_URL}/admin/users/students?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Students load nahi ho sakay');
    return await res.json();
};

export const updateStudentsAPI = async (userId: number, data: any) => {
    const token = Cookies.get('authToken');
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Student update nahi ho saka');
    return await res.json();
};

export const deleteStudentsAPI = async (id: number) => {
    const token = Cookies.get('authToken');
    const res = await fetch(`${API_URL}/admin/users/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Student delete nahi ho saka');
    return true;
};

export const getStudentsAPI = async () => {
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
    const res = await fetch(`${API_URL}/admin/users/teachers`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Teacher create nahi ho saka');
    return await res.json();
};

export const getTeachersAPI = async () => {
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/admin/users/teachers`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Teachers list load nahi ho saki');
    return await response.json();
};

export const getAllTeachersAPI = async (page = 1, limit = 10) => {
    const token = Cookies.get('authToken');
    const res = await fetch(`${API_URL}/admin/users/teachers?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Teachers load nahi ho sakay');
    return await res.json();
};

export const updateTeachersAPI = async (id: number, data: any) => {
    const token = Cookies.get('authToken');

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
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/lectures/${lectureId}/course/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Lecture delete nahi ho saka');
    return true;
};

// # Update Lecture API: JSON Payload conversion
export const updateLectureAPI = async (lectureId: number, courseId: number, data: FormData) => {
    const token = Cookies.get('authToken');

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
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/resources/${courseId}/sections/${sectionId}/resources/${resourceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Resource delete nahi ho saka');
    return true;
};

export const updateResourceAPI = async (courseId: number, sectionId: number, resourceId: number, data: FormData) => {
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/resources/${courseId}/sections/${sectionId}/resources/${resourceId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Resource detail load nahi ho saki');
    return await response.json();
};

//student delete from course
export const dismissStudentAPI = async (enrollmentId: number, courseId: number, studentId: number) => {
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
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
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/quizzes/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Quiz create nahi ho saka');
    return await response.json();
};

export const updateQuizAPI = async (id: number, data: any) => {
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/quizzes/update/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Quiz update nahi ho saka');
    return await response.json();
};

export const deleteQuizAPI = async (id: number) => {
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/quizzes/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Quiz delete nahi ho saka');
    return true;
};

export const getSpecificQuizAPI = async (id: number) => {
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/quizzes/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        // cache: 'no-store'
    });
    if (!response.ok) throw new Error('Quiz details nahi mil sakin');
    return await response.json();
};

// # QUIZ SUBMISSIONS & GRADING APIs
export const getQuizSubmissionsAPI = async (quizId: number) => {
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/quizzes/quiz/${quizId}/attempts`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Submissions load nahi ho sakeen');
    return await response.json();
};

export const getQuizAttemptDetailAPI = async (attemptId: number) => {
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/quizzes/attempt/${attemptId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Attempt details nahi mil sakin');
    return await response.json();
};

export const gradeQuizAttemptAPI = async (attemptId: number, data: { marksObtained: number, comments: string }) => {
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/quizzes/grade/${attemptId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Grading fail ho gayi');
    return await response.json();
};

// # ATTENDANCE APIs
export const getAllAttendancesAPI = async () => {
    const token = Cookies.get('authToken');
    const response = await fetch(`${API_URL}/attendance/all`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
    });
    if (!response.ok) throw new Error('Attendance list load nahi ho saki');
    return await response.json();
};

export const updateAttendanceAPI = async (attendanceId: number, payload: any) => {
    const token = Cookies.get('authToken');
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