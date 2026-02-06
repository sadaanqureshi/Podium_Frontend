import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        activeRequests: 0, // Kitni APIs abhi chal rahi hain
    },
    reducers: {
        startLoading: (state) => {
            state.activeRequests += 1;
        },
        stopLoading: (state) => {
            state.activeRequests = Math.max(0, state.activeRequests - 1);
        },
    },
});

export const { startLoading, stopLoading } = uiSlice.actions;
export default uiSlice.reducer;