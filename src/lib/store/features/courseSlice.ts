import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getAssignedCoursesAPI, getCourseWithContentAPI } from '@/lib/api/apiService';

// ==============================
// TYPES & INTERFACES (Merged)
// ==============================
interface CourseContent {
    course: any;
    sections: any[];
    // # MISSING PROPERTY ADDED HERE
    enrollments?: any[]; 
}

interface CourseState {
    assignedCourses: any[]; // # Teacher's main list
    courseContent: Record<number, CourseContent>; // # Caching: Keyed by courseId
    loading: {
        assignedCourses: boolean;
        courseContent: Record<number, boolean>;
        preflighting: boolean;
    };
    preflightedCourses: number[]; 
    error: string | null;
}

const initialState: CourseState = {
    assignedCourses: [],
    courseContent: {},
    loading: {
        assignedCourses: false,
        courseContent: {},
        preflighting: false,
    },
    preflightedCourses: [],
    error: null,
};

// ==============================
// ASYNC THUNKS (Professional Caching)
// ==============================

// # 1. FETCH TEACHER ASSIGNED COURSES (Student enrolled courses removed)
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

// # 2. FETCH SPECIFIC COURSE CONTENT (With Cache Check)
export const fetchCourseContent = createAsyncThunk(
    'course/fetchCourseContent',
    async (courseId: number, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { course: CourseState };
            // Agar data cache mein hai toh wapis nikal lo
            if (state.course.courseContent[courseId]) {
                return { courseId, content: state.course.courseContent[courseId], fromCache: true };
            }
            const content = await getCourseWithContentAPI(courseId);
            return { courseId, content, fromCache: false };
        } catch (error: any) {
            return rejectWithValue(error.message || `Course ${courseId} load nahi ho saka`);
        }
    },
    {
        condition: (courseId, { getState }) => {
            const state = getState() as { course: CourseState };
            return !state.course.courseContent[courseId];
        }
    }
);

// ==============================
// SLICE (Merged Features)
// ==============================
export const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {
        // # FIX FOR LAYOUTWRAPPER ERROR: clearCourseCache exported here
        clearCourseCache: (state) => {
            state.assignedCourses = [];
            state.courseContent = {};
            state.preflightedCourses = [];
            state.error = null;
            state.loading = { assignedCourses: false, courseContent: {}, preflighting: false };
        },
        // # REFRESH SPECIFIC COURSE
        refreshCourseContent: (state, action: PayloadAction<number>) => {
            delete state.courseContent[action.payload];
            state.preflightedCourses = state.preflightedCourses.filter(id => id !== action.payload);
        },
        // # OPTIMISTIC UPDATES (Lecture/Resource removal)
        removeLectureLocal: (state, action: PayloadAction<{ courseId: number; sectionId: number; lectureId: number }>) => {
            const content = state.courseContent[action.payload.courseId];
            if (content?.sections) {
                const section = content.sections.find((s: any) => s.id === action.payload.sectionId);
                if (section) {
                    section.lectures = section.lectures.filter((l: any) => l.id !== action.payload.lectureId);
                }
            }
        },
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
            // Assigned Courses
            .addCase(fetchAssignedCourses.pending, (state) => { state.loading.assignedCourses = true; })
            .addCase(fetchAssignedCourses.fulfilled, (state, action) => {
                state.loading.assignedCourses = false;
                state.assignedCourses = action.payload;
            })
            .addCase(fetchAssignedCourses.rejected, (state, action) => {
                state.loading.assignedCourses = false;
                state.error = action.payload as string;
            })
            // Specific Course Content
            .addCase(fetchCourseContent.pending, (state, action) => {
                const courseId = action.meta.arg;
                if (!state.courseContent[courseId]) state.loading.courseContent[courseId] = true;
            })
            .addCase(fetchCourseContent.fulfilled, (state, action) => {
                const { courseId, content, fromCache } = action.payload;
                state.loading.courseContent[courseId] = false;
                if (!fromCache) {
                    state.courseContent[courseId] = content;
                    if (!state.preflightedCourses.includes(courseId)) state.preflightedCourses.push(courseId);
                }
            })
            .addCase(fetchCourseContent.rejected, (state, action) => {
                const courseId = action.meta.arg;
                state.loading.courseContent[courseId] = false;
                state.error = action.payload as string;
            });
    },
});

export const { 
    clearCourseCache, 
    refreshCourseContent, 
    removeLectureLocal, 
    removeResourceLocal 
} = courseSlice.actions;

export default courseSlice.reducer;