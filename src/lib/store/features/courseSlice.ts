import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
    getAssignedCoursesAPI, 
    getCourseWithContentAPI,
    getAllCoursesAPI,
    getCourseCategoriesAPI,
    getTeachersAPI 
} from '@/lib/api/apiService';

// ==============================
// TYPES & INTERFACES
// ==============================
interface CourseContent {
    course: any;
    sections: any[];
    enrollments?: any[]; 
}

interface CourseState {
    assignedCourses: any[]; 
    adminCourses: { data: any[]; meta: any | null };
    categories: any[];
    teachers: any[];
    courseContent: Record<number, CourseContent>; 
    preflightedCourses: number[]; 
    loading: {
        assignedCourses: boolean;
        adminCourses: boolean;
        metadata: boolean;
        courseContent: Record<number, boolean>;
    };
    error: string | null;
}

const initialState: CourseState = {
    assignedCourses: [],
    adminCourses: { data: [], meta: null },
    categories: [],
    teachers: [],
    courseContent: {},
    preflightedCourses: [],
    loading: {
        assignedCourses: false,
        adminCourses: false,
        metadata: false,
        courseContent: {},
    },
    error: null,
};

// ==============================
// ASYNC THUNKS
// ==============================

// Teacher: Get assigned courses
export const fetchAssignedCourses = createAsyncThunk(
    'course/fetchAssignedCourses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAssignedCoursesAPI();
            return response.data || response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch assigned courses');
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
            return rejectWithValue(error.message || 'Failed to fetch admin courses');
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
            return rejectWithValue(error.message || 'Failed to fetch metadata');
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
            return rejectWithValue(error.message || `Course ${courseId} load nahi ho saka`);
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
            state.assignedCourses = [];
            state.adminCourses = { data: [], meta: null };
            state.courseContent = {};
            state.preflightedCourses = [];
            state.categories = [];
            state.teachers = [];
            state.error = null;
            state.loading = initialState.loading;
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
                state.assignedCourses = action.payload;
            })
            .addCase(fetchAssignedCourses.rejected, (state, action) => {
                state.loading.assignedCourses = false;
                state.error = action.payload as string;
            })

            // Admin Courses List
            .addCase(fetchAdminCourses.pending, (state) => { state.loading.adminCourses = true; })
            .addCase(fetchAdminCourses.fulfilled, (state, action) => {
                state.loading.adminCourses = false;
                state.adminCourses.data = action.payload.data;
                state.adminCourses.meta = action.payload.meta;
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
            });
    },
});

export const { 
    clearCourseCache, refreshCourseContent, 
    removeLectureLocal, removeResourceLocal, removeCourseFromAdminList 
} = courseSlice.actions;

export default courseSlice.reducer;