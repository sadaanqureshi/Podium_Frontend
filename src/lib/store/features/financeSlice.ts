import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFeesDataAPI, getEnrollmentsAPI, getTransactionByIdAPI } from '@/lib/api/apiService';

// # THUNK 1: Fetch Finance Data (List)
export const fetchFeesData = createAsyncThunk(
    'finance/fetchFeesData',
    async (params: { page: number; limit: number } | undefined, { rejectWithValue }) => {
        try {
            const res = await getFeesDataAPI(params?.page || 1, params?.limit || 10);
            return res.data || res;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Finance data load nahi ho saka');
        }
    }
);

// # THUNK 2: Fetch Enrollments Data
export const fetchEnrollmentsData = createAsyncThunk(
    'finance/fetchEnrollmentsData',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getEnrollmentsAPI();
            return res; 
        } catch (err: any) {
            return rejectWithValue(err.message || 'Enrollments data load nahi ho saka');
        }
    }
);

// # THUNK 3: Fetch Single Transaction Details (NEW API from image_593d95.png)
export const fetchTransactionDetails = createAsyncThunk(
    'finance/fetchTransactionDetails',
    async (transactionId: number | string, { rejectWithValue }) => {
        try {
            const res = await getTransactionByIdAPI(transactionId);
            return res; 
        } catch (err: any) {
            return rejectWithValue(err.message || 'Transaction details load nahi ho sake');
        }
    }
);

interface FinanceState {
    transactions: any[];
    enrollments: any[]; 
    selectedTransaction: any | null; // Single transaction details store karne ke liye
    stats: any | null;
    meta: any | null;
    loading: boolean;
    enrollmentsLoading: boolean; 
    detailsLoading: boolean; // Detail fetch ki loading state
    error: string | null;
}

const initialState: FinanceState = {
    transactions: [],
    enrollments: [],
    selectedTransaction: null,
    stats: null,
    meta: null,
    loading: false,
    enrollmentsLoading: false,
    detailsLoading: false,
    error: null,
};

const financeSlice = createSlice({
    name: 'finance',
    initialState,
    reducers: {
        clearFinanceCache: (state) => {
            state.transactions = [];
            state.enrollments = [];
            state.selectedTransaction = null;
            state.stats = null;
            state.meta = null;
        },
        clearSelectedTransaction: (state) => {
            state.selectedTransaction = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Transactions Cases
            .addCase(fetchFeesData.pending, (state) => { state.loading = true; })
            .addCase(fetchFeesData.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload.transactions || [];
                state.stats = action.payload.stats || null;
                state.meta = action.payload.meta || null;
            })
            .addCase(fetchFeesData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Enrollments Cases
            .addCase(fetchEnrollmentsData.pending, (state) => { state.enrollmentsLoading = true; })
            .addCase(fetchEnrollmentsData.fulfilled, (state, action) => {
                state.enrollmentsLoading = false;
                state.enrollments = action.payload || [];
            })
            .addCase(fetchEnrollmentsData.rejected, (state, action) => {
                state.enrollmentsLoading = false;
                state.error = action.payload as string;
            })
            // Transaction Details Cases
            .addCase(fetchTransactionDetails.pending, (state) => {
                state.detailsLoading = true;
                state.error = null;
            })
            .addCase(fetchTransactionDetails.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.selectedTransaction = action.payload;
            })
            .addCase(fetchTransactionDetails.rejected, (state, action) => {
                state.detailsLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearFinanceCache, clearSelectedTransaction } = financeSlice.actions;
export default financeSlice.reducer;