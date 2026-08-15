import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    getStudentDashboardAPI,
    StudentDashboardResponse,
} from '@/lib/api/apiService';
import { getErrorMessage } from '@/lib/api/errorMessage';

export const fetchStudentDashboard = createAsyncThunk(
    'studentDashboard/fetch',
    async (_, { rejectWithValue }) => {
        try {
            return await getStudentDashboardAPI();
        } catch (err: any) {
            return rejectWithValue(getErrorMessage(err, 'Failed to load dashboard'));
        }
    },
    {
        condition: (_, { getState }) => {
            const { loading } = (getState() as { studentDashboard: { loading: boolean } }).studentDashboard;
            return !loading;
        },
    }
);

type StudentDashboardState = {
    data: StudentDashboardResponse | null;
    loading: boolean;
    error: string | null;
};

const initialState: StudentDashboardState = {
    data: null,
    loading: false,
    error: null,
};

const studentDashboardSlice = createSlice({
    name: 'studentDashboard',
    initialState,
    reducers: {
        clearStudentDashboard: (state) => {
            state.data = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudentDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchStudentDashboard.fulfilled,
                (state, action: PayloadAction<StudentDashboardResponse>) => {
                    state.loading = false;
                    state.data = action.payload;
                    state.error = null;
                }
            )
            .addCase(fetchStudentDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || 'Failed to load dashboard';
            });
    },
});

export const { clearStudentDashboard } = studentDashboardSlice.actions;
export default studentDashboardSlice.reducer;
