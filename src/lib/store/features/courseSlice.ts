import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    getAssignedCoursesAPI,
    getCourseWithContentAPI,
    getAllCoursesAPI,
    getCourseCategoriesAPI,
    getTeachersAPI,
    getMyEnrolledCoursesAPI,
    getMyEnrollmentRequestsAPI,
    getMyCourseUpdatesAPI,
    getAdminTeacherAssignmentsAPI,
    MyEnrollmentRequestItem,
    MyEnrollmentRequestsResponse,
    EnrollmentRequestStatus,
    CourseUpdateItem,
    CourseUpdateType,
    MyCourseUpdatesResponse,
    GetAdminTeacherAssignmentsParams,
    AdminTeacherAssignmentsStats,
    AdminTeacherAssignmentItem,
} from '@/lib/api/apiService';
import { getErrorMessage } from '@/lib/api/errorMessage';

// ==============================
// TYPES & INTERFACES
// ==============================
interface CourseContent {
    course: any;
    sections: any[];
    enrollments?: any[];
    pendingEnrollments?: any[];
    rejectedEnrollments?: any[];
    stats?: Record<string, number> | null;
    enrollmentCount?: number;
}

type MyEnrollmentRequestsSummary = MyEnrollmentRequestsResponse['summary'];

const emptyRequestSummary: MyEnrollmentRequestsSummary = {
    pending: 0,
    enrolled: 0,
    rejected: 0,
    dismissed: 0,
    total: 0,
};

type AdminCoursesListStats = {
    totalCourses: number;
    activeCourses: number;
    inactiveCourses: number;
    withTeacher: number;
    withoutTeacher: number;
    pendingTeacherAssignments: number;
    totalEnrolledStudents: number;
    pendingEnrollmentRequests: number;
};

const emptyAdminCourseStats: AdminCoursesListStats = {
    totalCourses: 0,
    activeCourses: 0,
    inactiveCourses: 0,
    withTeacher: 0,
    withoutTeacher: 0,
    pendingTeacherAssignments: 0,
    totalEnrolledStudents: 0,
    pendingEnrollmentRequests: 0,
};

const emptyTeacherAssignmentStats: AdminTeacherAssignmentsStats = {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    unassigned: 0,
};

interface CourseState {
    assignedCourses: { data: any[]; meta: any | null };
    adminCourses: {
        data: any[];
        meta: any | null;
        stats: AdminCoursesListStats;
    };
    teacherAssignments: {
        data: AdminTeacherAssignmentItem[];
        meta: {
            totalItems: number;
            itemCount: number;
            itemsPerPage: number;
            totalPages: number;
            currentPage: number;
        } | null;
        stats: AdminTeacherAssignmentsStats;
    };
    teacherAssignmentsLoading: boolean;
    categories: any[];
    teachers: any[];
    courseContent: Record<number, CourseContent>;
    enrolledCourses: any[];
    availableCourses: { data: any[]; meta: any | null };
    preflightedCourses: number[];
    myEnrollmentRequests: MyEnrollmentRequestItem[];
    myEnrollmentRequestsSummary: MyEnrollmentRequestsSummary;
    myEnrollmentRequestsLoading: boolean;
    myEnrollmentRequestsError: string | null;
    myCourseUpdates: CourseUpdateItem[];
    myCourseUpdatesMeta: MyCourseUpdatesResponse['meta'] | null;
    myCourseUpdatesLoading: boolean;
    myCourseUpdatesError: string | null;
    loading: {
        enrolledCourses: boolean;
        assignedCourses: boolean;
        adminCourses: boolean;
        availableCourses: boolean;
        metadata: boolean;
        courseContent: Record<number, boolean>;
    };
    error: string | null;
}

const initialState: CourseState = {
    assignedCourses: { data: [], meta: null },
    adminCourses: { data: [], meta: null, stats: emptyAdminCourseStats },
    teacherAssignments: { data: [], meta: null, stats: emptyTeacherAssignmentStats },
    teacherAssignmentsLoading: false,
    categories: [],
    teachers: [],
    courseContent: {},
    preflightedCourses: [],
    enrolledCourses: [],
    availableCourses: { data: [], meta: {} },
    myEnrollmentRequests: [],
    myEnrollmentRequestsSummary: emptyRequestSummary,
    myEnrollmentRequestsLoading: false,
    myEnrollmentRequestsError: null,
    myCourseUpdates: [],
    myCourseUpdatesMeta: null,
    myCourseUpdatesLoading: false,
    myCourseUpdatesError: null,
    loading: {
        enrolledCourses: false,
        assignedCourses: false,
        adminCourses: false,
        availableCourses: false,
        metadata: false,
        courseContent: {},
    },
    error: null,
};

// ==============================
// ASYNC THUNKS
// ==============================

// Teacher: Get assigned courses (paginated)
export const fetchAssignedCourses = createAsyncThunk(
    'course/fetchAssignedCourses',
    async (
        { page = 1, limit = 6 }: { page?: number; limit?: number } = {},
        { rejectWithValue }
    ) => {
        try {
            return await getAssignedCoursesAPI(page, limit);
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch assigned courses'));
        }
    }
);

// Admin: Get all courses (Paginated)
export const fetchAdminCourses = createAsyncThunk(
    'course/fetchAdminCourses',
    async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
        try {
            const response = await getAllCoursesAPI(page, limit);
            return response;
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch admin courses'));
        }
    }
);

export const fetchTeacherAssignments = createAsyncThunk(
    'course/fetchTeacherAssignments',
    async (params: GetAdminTeacherAssignmentsParams | undefined, { rejectWithValue }) => {
        try {
            return await getAdminTeacherAssignmentsAPI(
                params || { page: 1, limit: 10, status: 'pending' }
            );
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch teacher assignments'));
        }
    }
);

// Admin: Get Categories and Teachers for Modals
export const fetchAdminMetadata = createAsyncThunk(
    'course/fetchAdminMetadata',
    async (_, { rejectWithValue }) => {
        try {
            const [catRes, teacherRes] = await Promise.all([
                getCourseCategoriesAPI(),
                getTeachersAPI()
            ]);
            return {
                categories: catRes.data || catRes,
                teachers: teacherRes.data || teacherRes
            };
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch metadata'));
        }
    }
);

// Shared: Fetch Specific Course Content (With Cache Check)
export const fetchCourseContent = createAsyncThunk( 
    'course/fetchCourseContent',
    async (courseId: number, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { course: CourseState };
            if (state.course.courseContent[courseId]) {
                return { courseId, content: state.course.courseContent[courseId], fromCache: true };
            }
            const content = await getCourseWithContentAPI(courseId);
            return { courseId, content, fromCache: false };
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, `Course ${courseId} load nahi ho saka`));
        }
    }
);

export const fetchEnrolledCourses = createAsyncThunk(
    'course/fetchEnrolledCourses',
    async (_, { rejectWithValue }) => {
        try {
            return await getMyEnrolledCoursesAPI();
        } catch (err: any) {
            return rejectWithValue(getErrorMessage(err, 'Failed to fetch enrolled courses'));
        }
    }


);

export const fetchMyEnrollmentRequests = createAsyncThunk(
    'course/fetchMyEnrollmentRequests',
    async (params: { status?: EnrollmentRequestStatus } | undefined, { rejectWithValue }) => {
        try {
            return await getMyEnrollmentRequestsAPI(params);
        } catch (err: any) {
            return rejectWithValue(getErrorMessage(err, 'Failed to fetch enrollment requests'));
        }
    }
);

export const fetchMyCourseUpdates = createAsyncThunk(
    'course/fetchMyCourseUpdates',
    async (
        params:
            | {
                  limit?: number;
                  courseId?: number;
                  types?: CourseUpdateType[] | string;
              }
            | undefined,
        { rejectWithValue }
    ) => {
        try {
            return await getMyCourseUpdatesAPI(params);
        } catch (err: any) {
            return rejectWithValue(getErrorMessage(err, 'Failed to fetch course updates'));
        }
    }
);

export const fetchAllCourses = createAsyncThunk(
    'course/fetchAllCourses',
    async ({ page, limit }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
        try {
            const response = await getAllCoursesAPI(page, limit);
            return response; // Ismein { data: [], meta: {} } aayega
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch courses'));
        }
    }
);

// ==============================
// SLICE DEFINITION
// ==============================
export const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {
        clearCourseCache: (state) => {
            state.assignedCourses = { data: [], meta: null };
            state.adminCourses = { data: [], meta: null, stats: emptyAdminCourseStats };
            state.teacherAssignments = {
                data: [],
                meta: null,
                stats: emptyTeacherAssignmentStats,
            };
            state.teacherAssignmentsLoading = false;
            state.courseContent = {};
            state.preflightedCourses = [];
            state.enrolledCourses = [];
            state.categories = [];
            state.teachers = [];
            state.myEnrollmentRequests = [];
            state.myEnrollmentRequestsSummary = emptyRequestSummary;
            state.myEnrollmentRequestsError = null;
            state.myEnrollmentRequestsLoading = false;
            state.myCourseUpdates = [];
            state.myCourseUpdatesMeta = null;
            state.myCourseUpdatesError = null;
            state.myCourseUpdatesLoading = false;
            state.error = null;
            state.loading = initialState.loading;
        },
        clearMyEnrollmentRequests: (state) => {
            state.myEnrollmentRequests = [];
            state.myEnrollmentRequestsSummary = emptyRequestSummary;
            state.myEnrollmentRequestsError = null;
            state.myEnrollmentRequestsLoading = false;
        },
        clearMyCourseUpdates: (state) => {
            state.myCourseUpdates = [];
            state.myCourseUpdatesMeta = null;
            state.myCourseUpdatesError = null;
            state.myCourseUpdatesLoading = false;
        },
        refreshCourseContent: (state, action: PayloadAction<number>) => {
            delete state.courseContent[action.payload];
            state.preflightedCourses = state.preflightedCourses.filter(id => id !== action.payload);
        },
        // # OPTIMISTIC DELETE FOR ADMIN LIST (Ready for use)
        removeCourseFromAdminList: (state, action: PayloadAction<number>) => {
            state.adminCourses.data = state.adminCourses.data.filter(c => c.id !== action.payload);
        },
        // Optimistic Delete for Lectures
        removeLectureLocal: (state, action: PayloadAction<{ courseId: number; sectionId: number; lectureId: number }>) => {
            const content = state.courseContent[action.payload.courseId];
            if (content?.sections) {
                const section = content.sections.find((s: any) => s.id === action.payload.sectionId);
                if (section) {
                    section.lectures = section.lectures.filter((l: any) => l.id !== action.payload.lectureId);
                }
            }
        },
        // Optimistic Delete for Resources
        removeResourceLocal: (state, action: PayloadAction<{ courseId: number; sectionId: number; resourceId: number }>) => {
            const content = state.courseContent[action.payload.courseId];
            if (content?.sections) {
                const section = content.sections.find((s: any) => s.id === action.payload.sectionId);
                if (section) {
                    section.resources = section.resources.filter((r: any) => r.id !== action.payload.resourceId);
                }
            }
        } 
    },
    extraReducers: (builder) => {
        builder
            // Teacher Assigned Courses
            .addCase(fetchAssignedCourses.pending, (state) => { state.loading.assignedCourses = true; })
            .addCase(fetchAssignedCourses.fulfilled, (state, action) => {
                state.loading.assignedCourses = false;
                state.assignedCourses = {
                    data: action.payload?.data || [],
                    meta: action.payload?.meta || null,
                };
            })
            .addCase(fetchAssignedCourses.rejected, (state, action) => {
                state.loading.assignedCourses = false;
                state.error = action.payload as string;
            })

            // Admin Courses List
            .addCase(fetchAdminCourses.pending, (state) => { state.loading.adminCourses = true; })
            .addCase(fetchAdminCourses.fulfilled, (state, action) => {
                state.loading.adminCourses = false;
                state.adminCourses.data = action.payload?.data || [];
                state.adminCourses.meta = action.payload?.meta || null;
                state.adminCourses.stats = action.payload?.stats || emptyAdminCourseStats;
            })
            .addCase(fetchAdminCourses.rejected, (state, action) => {
                state.loading.adminCourses = false;
                state.error = action.payload as string;
            })

            .addCase(fetchTeacherAssignments.pending, (state) => {
                state.teacherAssignmentsLoading = true;
            })
            .addCase(fetchTeacherAssignments.fulfilled, (state, action) => {
                state.teacherAssignmentsLoading = false;
                state.teacherAssignments.data = action.payload?.data || [];
                state.teacherAssignments.meta = action.payload?.meta || null;
                state.teacherAssignments.stats =
                    action.payload?.stats || emptyTeacherAssignmentStats;
            })
            .addCase(fetchTeacherAssignments.rejected, (state, action) => {
                state.teacherAssignmentsLoading = false;
                state.error = action.payload as string;
            })

            // Admin Metadata
            .addCase(fetchAdminMetadata.pending, (state) => { state.loading.metadata = true; })
            .addCase(fetchAdminMetadata.fulfilled, (state, action) => {
                state.loading.metadata = false;
                state.categories = action.payload.categories;
                state.teachers = action.payload.teachers;
            })

            // Course Content (Cache)
            .addCase(fetchCourseContent.fulfilled, (state, action) => {
                const { courseId, content, fromCache } = action.payload;
                if (!fromCache) state.courseContent[courseId] = content;
            })

            .addCase(fetchEnrolledCourses.pending, (state) => {
                state.loading.enrolledCourses = true;
            })
            .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
                state.loading.enrolledCourses = false;
                state.enrolledCourses = action.payload;
            })
            .addCase(fetchEnrolledCourses.rejected, (state) => {
                state.loading.enrolledCourses = false;
            })

            .addCase(fetchMyEnrollmentRequests.pending, (state) => {
                state.myEnrollmentRequestsLoading = true;
                state.myEnrollmentRequestsError = null;
            })
            .addCase(fetchMyEnrollmentRequests.fulfilled, (state, action: PayloadAction<MyEnrollmentRequestsResponse>) => {
                state.myEnrollmentRequestsLoading = false;
                state.myEnrollmentRequests = action.payload?.data || [];
                state.myEnrollmentRequestsSummary = action.payload?.summary || emptyRequestSummary;
                state.myEnrollmentRequestsError = null;
            })
            .addCase(fetchMyEnrollmentRequests.rejected, (state, action) => {
                state.myEnrollmentRequestsLoading = false;
                state.myEnrollmentRequests = [];
                state.myEnrollmentRequestsSummary = emptyRequestSummary;
                state.myEnrollmentRequestsError = (action.payload as string) || 'Failed to fetch enrollment requests';
            })

            .addCase(fetchMyCourseUpdates.pending, (state) => {
                state.myCourseUpdatesLoading = true;
                state.myCourseUpdatesError = null;
            })
            .addCase(fetchMyCourseUpdates.fulfilled, (state, action: PayloadAction<MyCourseUpdatesResponse>) => {
                state.myCourseUpdatesLoading = false;
                state.myCourseUpdates = action.payload?.data || [];
                state.myCourseUpdatesMeta = action.payload?.meta || null;
                state.myCourseUpdatesError = null;
            })
            .addCase(fetchMyCourseUpdates.rejected, (state, action) => {
                state.myCourseUpdatesLoading = false;
                state.myCourseUpdates = [];
                state.myCourseUpdatesMeta = null;
                state.myCourseUpdatesError = (action.payload as string) || 'Failed to fetch course updates';
            })

            // FETCH ALL COURSES cases
            .addCase(fetchAllCourses.pending, (state) => { state.loading.availableCourses = true; })
            .addCase(fetchAllCourses.fulfilled, (state, action) => {
                state.loading.availableCourses = false;
                // Student catalog: keep only data/meta (ignore admin-only `stats` if present)
                state.availableCourses = {
                    data: action.payload?.data || [],
                    meta: action.payload?.meta || null,
                };
            })
            .addCase(fetchAllCourses.rejected, (state, action) => { state.loading.availableCourses = false; state.error = action.payload as string; });
    },
});

export const {
    clearCourseCache, clearMyEnrollmentRequests, clearMyCourseUpdates, refreshCourseContent,
    removeLectureLocal, removeResourceLocal, removeCourseFromAdminList
} = courseSlice.actions;

export default courseSlice.reducer;