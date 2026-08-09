import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getAllStudentsAPI,
    getAllTeachersAPI,
    type AdminStudentsListStats,
    type AdminTeachersListStats,
} from '@/lib/api/apiService';
import { getErrorMessage } from '@/lib/api/errorMessage';

const emptyStudentStats: AdminStudentsListStats = {
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    studentsWithEnrollments: 0,
    pendingEnrollmentRequests: 0,
    newStudentsThisMonth: 0,
};

const emptyTeacherStats: AdminTeachersListStats = {
    totalTeachers: 0,
    activeTeachers: 0,
    inactiveTeachers: 0,
    teachersWithAcceptedCourses: 0,
    pendingCourseAssignments: 0,
    newTeachersThisMonth: 0,
};

export const fetchAllStudents = createAsyncThunk(
    'users/fetchAllStudents',
    async (params: { page: number; limit: number } | undefined, { rejectWithValue }) => {
        try {
            return await getAllStudentsAPI(params?.page || 1, params?.limit || 10);
        } catch (err: unknown) {
            return rejectWithValue(getErrorMessage(err, 'Failed to load students'));
        }
    }
);

export const fetchAllTeachers = createAsyncThunk(
    'users/fetchAllTeachers',
    async (params: { page: number; limit: number } | undefined, { rejectWithValue }) => {
        try {
            return await getAllTeachersAPI(params?.page || 1, params?.limit || 10);
        } catch (err: unknown) {
            return rejectWithValue(getErrorMessage(err, 'Failed to load teachers'));
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState: {
        students: {
            data: [] as any[],
            meta: null as any,
            stats: emptyStudentStats as AdminStudentsListStats,
        },
        teachers: {
            data: [] as any[],
            meta: null as any,
            stats: emptyTeacherStats as AdminTeachersListStats,
        },
        loading: false,
        error: null as string | null,
    },
    reducers: {
        clearUserCache: (state) => {
            state.students = { data: [], meta: null, stats: emptyStudentStats };
            state.teachers = { data: [], meta: null, stats: emptyTeacherStats };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllStudents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllStudents.fulfilled, (state, action) => {
                state.loading = false;
                state.students.data = action.payload.data || [];
                state.students.meta = action.payload.meta || null;
                state.students.stats = action.payload.stats || emptyStudentStats;
            })
            .addCase(fetchAllStudents.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || 'Failed to load students';
            })
            .addCase(fetchAllTeachers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllTeachers.fulfilled, (state, action) => {
                state.loading = false;
                state.teachers.data = action.payload.data || [];
                state.teachers.meta = action.payload.meta || null;
                state.teachers.stats = action.payload.stats || emptyTeacherStats;
            })
            .addCase(fetchAllTeachers.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || 'Failed to load teachers';
            });
    },
});

export const { clearUserCache } = userSlice.actions;
export default userSlice.reducer;
