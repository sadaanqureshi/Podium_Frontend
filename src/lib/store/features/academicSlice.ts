import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getAllAttendancesAPI, updateAttendanceAPI } from '@/lib/api/apiService';

// # THUNK: Fetch all attendance sessions
export const fetchAttendance = createAsyncThunk('academic/fetchAttendance', async (_, { rejectWithValue }) => {
    try {
        const res = await getAllAttendancesAPI();
        return res.data || res || [];
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
});

// # THUNK: Update specific session
export const updateAttendance = createAsyncThunk(
    'academic/updateAttendance',
    async ({ id, payload }: { id: number; payload: any }, { rejectWithValue }) => {
        try {
            const res = await updateAttendanceAPI(id, payload);
            return res.data || res; // Backend se updated record aayega
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

const academicSlice = createSlice({
    name: 'academic',
    initialState: {
        attendance: [] as any[],
        loading: false,
        error: null as string | null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAttendance.pending, (state) => { state.loading = true; })
            .addCase(fetchAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.attendance = action.payload;
            })
            // # OPTIMISTIC UPDATE: Jab update success ho, toh state mein mojud array ko foran badal do
            .addCase(updateAttendance.fulfilled, (state, action) => {
                const updatedSession = action.payload;
                state.attendance = state.attendance.map(item => 
                    item.id === updatedSession.id ? updatedSession : item
                );
            });
    }
});

export default academicSlice.reducer;