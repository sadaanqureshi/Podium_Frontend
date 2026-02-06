import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFeesDataAPI } from '@/lib/api/apiService';

// # THUNK: Fetch Finance Data
export const fetchFeesData = createAsyncThunk(
    'finance/fetchFeesData',
    async (params: { page: number; limit: number } | undefined, { rejectWithValue }) => {
        try {
            const res = await getFeesDataAPI(params?.page || 1, params?.limit || 10);
            return res.data || res; // Expecting { transactions: [], stats: {}, meta: {} }
        } catch (err: any) {
            return rejectWithValue(err.message || 'Finance data load nahi ho saka');
        }
    }
);

interface FinanceState {
    transactions: any[];
    stats: any | null;
    meta: any | null;
    loading: boolean;
    error: string | null;
}

const initialState: FinanceState = {
    transactions: [],
    stats: null,
    meta: null,
    loading: false,
    error: null,
};

const financeSlice = createSlice({
    name: 'finance',
    initialState,
    reducers: {
        clearFinanceCache: (state) => {
            state.transactions = [];
            state.stats = null;
            state.meta = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFeesData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFeesData.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload.transactions || [];
                state.stats = action.payload.stats || null;
                state.meta = action.payload.meta || null;
            })
            .addCase(fetchFeesData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearFinanceCache } = financeSlice.actions;
export default financeSlice.reducer;