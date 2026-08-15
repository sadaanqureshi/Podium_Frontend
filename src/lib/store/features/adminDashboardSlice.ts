import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getAdminDashboard, AdminDashboardResponse } from '@/lib/api/apiService';
import { getErrorMessage } from '@/lib/api/errorMessage';

export const fetchAdminDashboard = createAsyncThunk(
    'adminDashboard/fetch',
    async (_, { rejectWithValue }) => {
        try {
            return await getAdminDashboard();
        } catch (err: unknown) {
            return rejectWithValue(getErrorMessage(err, 'Failed to load dashboard'));
        }
    },
    {
        condition: (_, { getState }) => {
            const { loading } = (getState() as { adminDashboard: { loading: boolean } }).adminDashboard;
            return !loading;
        },
    }
);

type AdminDashboardState = {
    data: AdminDashboardResponse | null;
    loading: boolean;
    error: string | null;
};

const initialState: AdminDashboardState = {
    data: null,
    loading: false,
    error: null,
};

const adminDashboardSlice = createSlice({
    name: 'adminDashboard',
    initialState,
    reducers: {
        clearAdminDashboard: (state) => {
            state.data = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchAdminDashboard.fulfilled,
                (state, action: PayloadAction<AdminDashboardResponse>) => {
                    state.loading = false;
                    state.data = action.payload;
                    state.error = null;
                }
            )
            .addCase(fetchAdminDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || 'Failed to load dashboard';
            });
    },
});

export const { clearAdminDashboard } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;
