import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    getAllAttendancesAPI,
    updateAttendanceAPI,
    getAttendanceByIdAPI,
    getMyAttendanceAPI,
    normalizeAttendanceList,
    StudentAttendanceItem,
    StudentAttendanceResponse,
    AttendanceSession,
    UpdateAttendancePayload,
} from '@/lib/api/apiService';
import { getErrorMessage, type ToastableError } from '@/lib/api/errorMessage';

type MyAttendanceSummary = StudentAttendanceResponse['summary'];

const emptySummary: MyAttendanceSummary = {
    present: 0,
    absent: 0,
    pending: 0,
    total: 0,
};

export const fetchAttendance = createAsyncThunk(
    'academic/fetchAttendance',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getAllAttendancesAPI();
            return normalizeAttendanceList(res);
        } catch (err: unknown) {
            return rejectWithValue(getErrorMessage(err, 'Failed to fetch attendance'));
        }
    }
);

export const fetchAttendanceById = createAsyncThunk(
    'academic/fetchAttendanceById',
    async (id: number, { rejectWithValue }) => {
        try {
            return await getAttendanceByIdAPI(id);
        } catch (err: unknown) {
            return rejectWithValue(getErrorMessage(err, 'Failed to load attendance session'));
        }
    }
);

export const updateAttendance = createAsyncThunk(
    'academic/updateAttendance',
    async (
        { id, payload }: { id: number; payload: UpdateAttendancePayload },
        { rejectWithValue }
    ) => {
        try {
            return await updateAttendanceAPI(id, payload);
        } catch (err: unknown) {
            const message = getErrorMessage(err, 'Failed to update attendance');
            const status =
                err && typeof err === 'object' && 'status' in err
                    ? Number((err as ToastableError).status)
                    : undefined;
            return rejectWithValue({ message, status });
        }
    }
);

export const fetchMyAttendance = createAsyncThunk(
    'academic/fetchMyAttendance',
    async (
        params: { courseId?: number; lectureId?: number } | undefined,
        { rejectWithValue }
    ) => {
        try {
            return await getMyAttendanceAPI(params);
        } catch (err: unknown) {
            return rejectWithValue(getErrorMessage(err, 'Failed to fetch attendance'));
        }
    }
);

const academicSlice = createSlice({
    name: 'academic',
    initialState: {
        attendance: [] as AttendanceSession[],
        loading: false,
        error: null as string | null,
        selectedSession: null as AttendanceSession | null,
        selectedSessionLoading: false,
        selectedSessionError: null as string | null,
        updateLoading: false,
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
        clearSelectedAttendance: (state) => {
            state.selectedSession = null;
            state.selectedSessionLoading = false;
            state.selectedSessionError = null;
            state.updateLoading = false;
        },
        setSelectedSessionLocal: (state, action: PayloadAction<AttendanceSession | null>) => {
            state.selectedSession = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.attendance = action.payload;
            })
            .addCase(fetchAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || 'Failed to fetch attendance';
            })
            .addCase(fetchAttendanceById.pending, (state) => {
                state.selectedSessionLoading = true;
                state.selectedSessionError = null;
            })
            .addCase(fetchAttendanceById.fulfilled, (state, action) => {
                state.selectedSessionLoading = false;
                state.selectedSession = action.payload;
            })
            .addCase(fetchAttendanceById.rejected, (state, action) => {
                state.selectedSessionLoading = false;
                state.selectedSessionError =
                    (action.payload as string) || 'Failed to load attendance session';
            })
            .addCase(updateAttendance.pending, (state) => {
                state.updateLoading = true;
            })
            .addCase(updateAttendance.fulfilled, (state, action) => {
                state.updateLoading = false;
                const updatedSession = action.payload;
                state.selectedSession = updatedSession;
                state.attendance = state.attendance.map((item) =>
                    item.id === updatedSession.id ? updatedSession : item
                );
            })
            .addCase(updateAttendance.rejected, (state) => {
                state.updateLoading = false;
            })
            .addCase(fetchMyAttendance.pending, (state) => {
                state.myAttendanceLoading = true;
                state.myAttendanceError = null;
            })
            .addCase(
                fetchMyAttendance.fulfilled,
                (state, action: PayloadAction<StudentAttendanceResponse>) => {
                    state.myAttendanceLoading = false;
                    state.myAttendance = action.payload?.data || [];
                    state.myAttendanceSummary = action.payload?.summary || emptySummary;
                    state.myAttendanceError = null;
                }
            )
            .addCase(fetchMyAttendance.rejected, (state, action) => {
                state.myAttendanceLoading = false;
                state.myAttendance = [];
                state.myAttendanceSummary = emptySummary;
                state.myAttendanceError =
                    (action.payload as string) || 'Failed to fetch attendance';
            });
    },
});

export const {
    clearMyAttendance,
    clearSelectedAttendance,
    setSelectedSessionLocal,
} = academicSlice.actions;
export default academicSlice.reducer;
