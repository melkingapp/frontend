import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    createExtraPaymentRequest as createExtraPaymentRequestService,
    getExtraPaymentRequests as getExtraPaymentRequestsService,
    approveExtraPaymentRequest as approveExtraPaymentRequestService,
    rejectExtraPaymentRequest as rejectExtraPaymentRequestService
} from "../../../../../shared/services/billingService";

// Async thunks
export const createExtraPaymentRequest = createAsyncThunk(
    "extraPayment/createRequest",
    async ({ buildingId, data }, { rejectWithValue }) => {
        try {
            const response = await createExtraPaymentRequestService(buildingId, data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message || "خطا در ثبت درخواست");
        }
    }
);

export const fetchExtraPaymentRequests = createAsyncThunk(
    "extraPayment/fetchRequests",
    async ({ buildingId, filters = {} }, { rejectWithValue }) => {
        try {
            const response = await getExtraPaymentRequestsService(buildingId, filters);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message || "خطا در دریافت درخواست‌ها");
        }
    }
);

export const approveExtraPaymentRequest = createAsyncThunk(
    "extraPayment/approveRequest",
    async (requestId, { rejectWithValue }) => {
        try {
            const response = await approveExtraPaymentRequestService(requestId);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message || "خطا در تایید درخواست");
        }
    }
);

export const rejectExtraPaymentRequest = createAsyncThunk(
    "extraPayment/rejectRequest",
    async ({ requestId, reason = "" }, { rejectWithValue }) => {
        try {
            const response = await rejectExtraPaymentRequestService(requestId, reason);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message || "خطا در رد درخواست");
        }
    }
);

const initialState = {
    requests: [],
    loading: false,
    creating: false,
    error: null,
    count: 0
};

const extraPaymentSlice = createSlice({
    name: "extraPayment",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearRequests: (state) => {
            state.requests = [];
            state.count = 0;
        }
    },
    extraReducers: (builder) => {
        // Create request
        builder
            .addCase(createExtraPaymentRequest.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createExtraPaymentRequest.fulfilled, (state, action) => {
                state.creating = false;
                state.requests.unshift(action.payload);
                state.count += 1;
            })
            .addCase(createExtraPaymentRequest.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            });

        // Fetch requests
        builder
            .addCase(fetchExtraPaymentRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExtraPaymentRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload.requests || action.payload || [];
                state.count = action.payload.count || state.requests.length;
            })
            .addCase(fetchExtraPaymentRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Approve request
        builder
            .addCase(approveExtraPaymentRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveExtraPaymentRequest.fulfilled, (state, action) => {
                state.loading = false;
                const requestId = action.payload.request_id;
                const index = state.requests.findIndex(r => r.request_id === requestId);
                if (index !== -1) {
                    state.requests[index] = { ...state.requests[index], ...action.payload };
                }
            })
            .addCase(approveExtraPaymentRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Reject request
        builder
            .addCase(rejectExtraPaymentRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectExtraPaymentRequest.fulfilled, (state, action) => {
                state.loading = false;
                const requestId = action.payload.request_id;
                const index = state.requests.findIndex(r => r.request_id === requestId);
                if (index !== -1) {
                    state.requests[index] = { ...state.requests[index], ...action.payload };
                }
            })
            .addCase(rejectExtraPaymentRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearRequests } = extraPaymentSlice.actions;
export default extraPaymentSlice.reducer;

