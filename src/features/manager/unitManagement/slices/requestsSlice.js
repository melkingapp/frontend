import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUnitRequests, createUnitRequest as createUnitRequestService, updateRequestStatus as updateRequestStatusService } from "../../../../shared/services/requestsService";

// Async thunks
export const fetchRequests = createAsyncThunk(
  "requests/fetchRequests",
  async (buildingId, { rejectWithValue }) => {
    try {
      console.log("🔥 fetchRequests - Building ID:", buildingId);
      
      // Only fetch if buildingId is provided
      if (!buildingId) {
        return [];
      }
      
      const response = await getUnitRequests(buildingId);
      console.log("🔥 fetchRequests - API response:", response);
      return response.requests || [];
    } catch (error) {
      console.error("🔥 fetchRequests - Error:", error);
      return rejectWithValue(error.response?.data?.error || error.message);
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
        state.requests.push(action.payload);
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
        const index = state.requests.findIndex(request => request.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        if (state.selectedRequest && state.selectedRequest.id === action.payload.id) {
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
