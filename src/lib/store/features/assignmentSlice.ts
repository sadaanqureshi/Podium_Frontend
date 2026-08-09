import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getAssignmentSubmissionsAPI, gradeSubmissionAPI, submitAssignmentAPI } from '@/lib/api/apiService';
import { getErrorMessage } from '@/lib/api/errorMessage';
import { normalizeSubmissionsList } from '@/lib/assignmentSubmissions';

interface AssignmentState {
    submissionsCache: Record<number, any[]>;
    loading: Record<number, boolean>;
    error: string | null;
}

const initialState: AssignmentState = {
    submissionsCache: {},
    loading: {},
    error: null,
};

// # THUNK 1: Fetch Submissions for a specific assignment
export const fetchSubmissions = createAsyncThunk(
    'assignment/fetchSubmissions',
    async (assignmentId: number, { rejectWithValue }) => {
        try {
            const res = await getAssignmentSubmissionsAPI(assignmentId);
            return { assignmentId, data: normalizeSubmissionsList(res) };
        } catch (err: any) {
            return rejectWithValue(getErrorMessage(err, 'Submissions load nahi ho sakeen'));
        }
    }
);

// # THUNK 2: Submit Grade (Teacher side)
export const submitGrade = createAsyncThunk(
    'assignment/submitGrade',
    async ({ assignmentId, studentId, gradeData }: { assignmentId: number; studentId: number; gradeData: any }, { rejectWithValue }) => {
        try {
            const res = await gradeSubmissionAPI(assignmentId, studentId, gradeData);
            return { assignmentId, studentId, updatedData: res.data || res };
        } catch (err: any) {
            return rejectWithValue(getErrorMessage(err, 'Grading fail ho gayi'));
        }
    }
);

export const submitAssignment = createAsyncThunk(
    'assignment/submit',
    async ({ id, formData }: { id: number; formData: FormData }, { rejectWithValue }) => {
        try {
            return await submitAssignmentAPI(id, formData);
        } catch (err: any) {
            return rejectWithValue(getErrorMessage(err, 'Submission failed'));
        }
    }
);

const assignmentSlice = createSlice({
    name: 'assignment',
    initialState,
    reducers: {
        clearAssignmentCache: (state) => {
            state.submissionsCache = {};
            state.loading = {};
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetching Logic
            .addCase(fetchSubmissions.pending, (state, action) => {
                state.loading[action.meta.arg] = true;
            })
            .addCase(fetchSubmissions.fulfilled, (state, action) => {
                const { assignmentId, data } = action.payload;
                state.loading[assignmentId] = false;
                state.submissionsCache[assignmentId] = data;
            })
            .addCase(fetchSubmissions.rejected, (state, action) => {
                const assignmentId = action.meta.arg;
                state.loading[assignmentId] = false;
                state.error = action.payload as string;
            })
            // # OPTIMISTIC UPDATE: Instant Grade Refresh in Redux Cache
            .addCase(submitGrade.fulfilled, (state, action) => {
                const { assignmentId, studentId, updatedData } = action.payload;
                const raw =
                    updatedData && typeof updatedData === 'object' && !Array.isArray(updatedData)
                        ? (updatedData.data && typeof updatedData.data === 'object'
                              ? updatedData.data
                              : updatedData)
                        : {};
                const patch = {
                    ...raw,
                    status: (raw as any)?.status || 'graded',
                };
                if (state.submissionsCache[assignmentId]) {
                    state.submissionsCache[assignmentId] = state.submissionsCache[assignmentId].map(
                        (sub) => {
                            const subStudentId = sub.studentId ?? sub.student?.id ?? sub.userId;
                            return Number(subStudentId) === Number(studentId)
                                ? { ...sub, ...patch }
                                : sub;
                        }
                    );
                }
            });
    },
});

export const { clearAssignmentCache } = assignmentSlice.actions;
export default assignmentSlice.reducer;