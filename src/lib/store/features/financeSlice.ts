import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getFeesDataAPI,
    getEnrollmentsAPI,
    getTransactionByIdAPI,
    GetAdminEnrollmentsParams,
    AdminEnrollmentsListStats,
} from '@/lib/api/apiService';
import { getErrorMessage } from '@/lib/api/errorMessage';

const emptyEnrollmentStats: AdminEnrollmentsListStats = {
    total: 0,
    pending: 0,
    enrolled: 0,
    rejected: 0,
    dismissed: 0,
};

export const fetchFeesData = createAsyncThunk(
    'finance/fetchFeesData',
    async (params: { page: number; limit: number } | undefined, { rejectWithValue }) => {
        try {
            const res = await getFeesDataAPI(params?.page || 1, params?.limit || 10);
            return res.data || res;
        } catch (err: any) {
            return rejectWithValue(getErrorMessage(err, 'Finance data load nahi ho saka'));
        }
    }
);

export const fetchEnrollmentsData = createAsyncThunk(
    'finance/fetchEnrollmentsData',
    async (params: GetAdminEnrollmentsParams | undefined, { rejectWithValue }) => {
        try {
            return await getEnrollmentsAPI(params || { page: 1, limit: 10, status: 'pending' });
        } catch (err: any) {
            return rejectWithValue(getErrorMessage(err, 'Enrollments data load nahi ho saka'));
        }
    }
);

export const fetchTransactionDetails = createAsyncThunk(
    'finance/fetchTransactionDetails',
    async (transactionId: number | string, { rejectWithValue }) => {
        try {
            const res = await getTransactionByIdAPI(transactionId);
            return res;
        } catch (err: any) {
            return rejectWithValue(getErrorMessage(err, 'Transaction details load nahi ho sake'));
        }
    }
);

interface FinanceState {
    transactions: any[];
    enrollments: any[];
    enrollmentsMeta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    } | null;
    enrollmentsStats: AdminEnrollmentsListStats;
    selectedTransaction: any | null;
    stats: any | null;
    meta: any | null;
    loading: boolean;
    enrollmentsLoading: boolean;
    detailsLoading: boolean;
    error: string | null;
}

const initialState: FinanceState = {
    transactions: [],
    enrollments: [],
    enrollmentsMeta: null,
    enrollmentsStats: emptyEnrollmentStats,
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
            state.enrollmentsMeta = null;
            state.enrollmentsStats = emptyEnrollmentStats;
            state.selectedTransaction = null;
            state.stats = null;
            state.meta = null;
        },
        clearSelectedTransaction: (state) => {
            state.selectedTransaction = null;
        },
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
            })
            .addCase(fetchEnrollmentsData.pending, (state) => {
                state.enrollmentsLoading = true;
            })
            .addCase(fetchEnrollmentsData.fulfilled, (state, action) => {
                state.enrollmentsLoading = false;
                state.enrollments = action.payload?.data || [];
                state.enrollmentsMeta = action.payload?.meta || null;
                state.enrollmentsStats = action.payload?.stats || emptyEnrollmentStats;
            })
            .addCase(fetchEnrollmentsData.rejected, (state, action) => {
                state.enrollmentsLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchTransactionDetails.pending, (state) => {
                state.detailsLoading = true;
                state.error = null;
            })
            .addCase(fetchTransactionDetails.fulfilled, (state, action) => {
                state.detailsLoading = false;
                const payload = action.payload;
                state.selectedTransaction =
                    payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
                        ? payload.data
                        : payload?.transaction && typeof payload.transaction === 'object'
                          ? payload.transaction
                          : payload;
            })
            .addCase(fetchTransactionDetails.rejected, (state, action) => {
                state.detailsLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearFinanceCache, clearSelectedTransaction } = financeSlice.actions;
export default financeSlice.reducer;
