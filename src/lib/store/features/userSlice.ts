import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    getAllStudentsAPI, 
    getAllTeachersAPI 
} from '@/lib/api/apiService';

// # THUNKS
export const fetchAllStudents = createAsyncThunk(
    'users/fetchAllStudents', 
    async (params: { page: number, limit: number } | undefined, { rejectWithValue }) => {
        try {
            const res = await getAllStudentsAPI(params?.page || 1, params?.limit || 10);
            return res.data || res;
        } catch (err: any) { return rejectWithValue(err.message); }
    }
);

export const fetchAllTeachers = createAsyncThunk(
    'users/fetchAllTeachers', 
    async (params: { page: number, limit: number } | undefined, { rejectWithValue }) => {
        try {
            const res = await getAllTeachersAPI(params?.page || 1, params?.limit || 10);
            return res.data || res;
        } catch (err: any) { return rejectWithValue(err.message); }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState: {
        students: { data: [] as any[], meta: null as any },
        teachers: { data: [] as any[], meta: null as any }, // # Added for faculty
        loading: false,
        error: null as string | null,
    },
    reducers: {
        clearUserCache: (state) => {
            state.students = { data: [], meta: null };
            state.teachers = { data: [], meta: null };
        }
    },
    extraReducers: (builder) => {
        builder
            // Students handling
            .addCase(fetchAllStudents.pending, (state) => { state.loading = true; })
            .addCase(fetchAllStudents.fulfilled, (state, action) => {
                state.loading = false;
                state.students.data = action.payload.data || action.payload;
                state.students.meta = action.payload.meta || null;
            })
            // Teachers handling
            .addCase(fetchAllTeachers.pending, (state) => { state.loading = true; })
            .addCase(fetchAllTeachers.fulfilled, (state, action) => {
                state.loading = false;
                state.teachers.data = action.payload.data || action.payload;
                state.teachers.meta = action.payload.meta || null;
            })
            .addCase(fetchAllTeachers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearUserCache } = userSlice.actions;
export default userSlice.reducer;