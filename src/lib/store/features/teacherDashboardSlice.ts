import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    getTeacherDashboard,
    TeacherDashboardResponse,
} from '@/lib/api/apiService';
import { getErrorMessage } from '@/lib/api/errorMessage';

export const fetchTeacherDashboard = createAsyncThunk(
    'teacherDashboard/fetch',
    async (_, { rejectWithValue }) => {
        try {
            return await getTeacherDashboard();
        } catch (err: unknown) {
            return rejectWithValue(getErrorMessage(err, 'Failed to load dashboard'));
        }
    }
);

type TeacherDashboardState = {
    data: TeacherDashboardResponse | null;
    loading: boolean;
    error: string | null;
};

const initialState: TeacherDashboardState = {
    data: null,
    loading: false,
    error: null,
};

const teacherDashboardSlice = createSlice({
    name: 'teacherDashboard',
    initialState,
    reducers: {
        clearTeacherDashboard: (state) => {
            state.data = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTeacherDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchTeacherDashboard.fulfilled,
                (state, action: PayloadAction<TeacherDashboardResponse>) => {
                    state.loading = false;
                    state.data = action.payload;
                    state.error = null;
                }
            )
            .addCase(fetchTeacherDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || 'Failed to load dashboard';
            });
    },
});

export const { clearTeacherDashboard } = teacherDashboardSlice.actions;
export default teacherDashboardSlice.reducer;
