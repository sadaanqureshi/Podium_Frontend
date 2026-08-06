import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    getAllAttendancesAPI,
    updateAttendanceAPI,
    getMyAttendanceAPI,
    StudentAttendanceItem,
    StudentAttendanceResponse,
} from '@/lib/api/apiService';

type MyAttendanceSummary = StudentAttendanceResponse['summary'];

const emptySummary: MyAttendanceSummary = {
    present: 0,
    absent: 0,
    pending: 0,
    total: 0,
};

// # THUNK: Fetch all attendance sessions (admin / teacher)
export const fetchAttendance = createAsyncThunk('academic/fetchAttendance', async (_, { rejectWithValue }) => {
    try {
        const res = await getAllAttendancesAPI();
        return res.data || res || [];
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
});

// # THUNK: Update specific session (admin / teacher)
export const updateAttendance = createAsyncThunk(
    'academic/updateAttendance',
    async ({ id, payload }: { id: number; payload: any }, { rejectWithValue }) => {
        try {
            const res = await updateAttendanceAPI(id, payload);
            return res.data || res;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// # THUNK: Student — own attendance via GET /attendance/me
export const fetchMyAttendance = createAsyncThunk(
    'academic/fetchMyAttendance',
    async (params: { courseId?: number; lectureId?: number } | undefined, { rejectWithValue }) => {
        try {
            return await getMyAttendanceAPI(params);
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to fetch attendance');
        }
    }
);

const academicSlice = createSlice({
    name: 'academic',
    initialState: {
        attendance: [] as any[],
        loading: false,
        error: null as string | null,
        myAttendance: [] as StudentAttendanceItem[],
        myAttendanceSummary: emptySummary as MyAttendanceSummary,
        myAttendanceLoading: false,
        myAttendanceError: null as string | null,
    },
    reducers: {
        clearMyAttendance: (state) => {
            state.myAttendance = [];
            state.myAttendanceSummary = emptySummary;
            state.myAttendanceError = null;
            state.myAttendanceLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAttendance.pending, (state) => { state.loading = true; })
            .addCase(fetchAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.attendance = action.payload;
            })
            .addCase(updateAttendance.fulfilled, (state, action) => {
                const updatedSession = action.payload;
                state.attendance = state.attendance.map(item =>
                    item.id === updatedSession.id ? updatedSession : item
                );
            })
            .addCase(fetchMyAttendance.pending, (state) => {
                state.myAttendanceLoading = true;
                state.myAttendanceError = null;
            })
            .addCase(fetchMyAttendance.fulfilled, (state, action: PayloadAction<StudentAttendanceResponse>) => {
                state.myAttendanceLoading = false;
                state.myAttendance = action.payload?.data || [];
                state.myAttendanceSummary = action.payload?.summary || emptySummary;
                state.myAttendanceError = null;
            })
            .addCase(fetchMyAttendance.rejected, (state, action) => {
                state.myAttendanceLoading = false;
                state.myAttendance = [];
                state.myAttendanceSummary = emptySummary;
                state.myAttendanceError = (action.payload as string) || 'Failed to fetch attendance';
            });
    }
});

export const { clearMyAttendance } = academicSlice.actions;
export default academicSlice.reducer;
