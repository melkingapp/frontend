import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUnitRequests, createUnitRequest as createUnitRequestService, updateRequestStatus as updateRequestStatusService } from "../../../../shared/services/requestsService";

// Async thunks
export const fetchRequests = createAsyncThunk(
  "requests/fetchRequests",
  async (buildingId, { rejectWithValue }) => {
    try {
      console.log("🔥 fetchRequests - Building ID:", buildingId, "Type:", typeof buildingId);
      
      // Only fetch if buildingId is provided and is a valid number
      if (!buildingId || typeof buildingId !== 'number' || isNaN(buildingId)) {
        console.log("🔥 fetchRequests - Invalid buildingId, returning empty array");
        return [];
      }
      
      const response = await getUnitRequests(buildingId);
      console.log("🔥 fetchRequests - API response:", response);
      return response.requests || [];
    } catch (error) {
      console.error("🔥 fetchRequests - Error:", error);
      return rejectWithValue(error.response?.data?.error || error.message || error.statusText);
    }
  }
);

export const createRequest = createAsyncThunk(
  "requests/createRequest",
  async ({ buildingId, requestData }, { rejectWithValue }) => {
    try {
      const response = await createUnitRequestService(buildingId, requestData);
      return response.request;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateRequestStatus = createAsyncThunk(
  "requests/updateRequestStatus",
  async ({ buildingId, requestId, statusData }, { rejectWithValue }) => {
    try {
      console.log("🔥 updateRequestStatus - Building ID:", buildingId, "Request ID:", requestId, "Status:", statusData);
      const response = await updateRequestStatusService(buildingId, requestId, statusData);
      console.log("🔥 updateRequestStatus - API response:", response);
      return response.request;
    } catch (error) {
      console.error("🔥 updateRequestStatus - Error:", error);
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const requestsSlice = createSlice({
  name: "requests",
  initialState: {
    requests: [],
    selectedRequest: null,
    loading: false,
    error: null,
    createLoading: false,
    updateLoading: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedRequest: (state, action) => {
      state.selectedRequest = action.payload;
    },
    clearSelectedRequest: (state) => {
      state.selectedRequest = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch requests
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create request
      .addCase(createRequest.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.createLoading = false;
        console.log('🔥 createRequest.fulfilled - Adding request to state:', action.payload);
        // Check if request already exists (by request_id or id)
        const existingIndex = state.requests.findIndex(
          req => (req.request_id && req.request_id === action.payload.request_id) ||
                 (req.id && req.id === action.payload.id)
        );
        if (existingIndex === -1) {
          state.requests.push(action.payload);
          console.log('🔥 createRequest.fulfilled - Request added, total requests:', state.requests.length);
        } else {
          console.log('🔥 createRequest.fulfilled - Request already exists, updating instead');
          state.requests[existingIndex] = action.payload;
        }
      })
      .addCase(createRequest.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      
      // Update request status
      .addCase(updateRequestStatus.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        const payloadId = action.payload.request_id || action.payload.id;
        const index = state.requests.findIndex(request => 
          (request.request_id && request.request_id === payloadId) ||
          (request.id && request.id === payloadId)
        );
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        const selectedId = state.selectedRequest?.request_id || state.selectedRequest?.id;
        if (state.selectedRequest && selectedId === payloadId) {
          state.selectedRequest = action.payload;
        }
      })
      .addCase(updateRequestStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSelectedRequest, clearSelectedRequest } = requestsSlice.actions;
export default requestsSlice.reducer;
