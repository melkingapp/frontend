import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import membershipApi from '../../shared/services/membershipApi';

// Async thunks
export const createMembershipRequest = createAsyncThunk(
  'membership/createRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await membershipApi.createMembershipRequest(requestData);
      return response;
    } catch (error) {
      // Log error details for debugging (only in development)
      if (import.meta.env.DEV) {
        console.error("❌ createMembershipRequest error:", error);
        console.error("❌ Error data:", error.data);
        console.error("❌ Error response:", error.response);
      }
      
      // Handle Django REST Framework validation errors
      const errorData = error.data || error.response?.data;
      if (errorData) {
        // If it's validation errors (object with field names as keys)
        if (typeof errorData === 'object' && !errorData.error && !errorData.message && !errorData.detail) {
          const validationErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              const message = Array.isArray(messages) ? messages[0] : messages;
              return `${field}: ${message}`;
            })
            .join(', ');
          return rejectWithValue(validationErrors || 'خطا در اعتبارسنجی داده‌ها');
        }
        // If it's a simple error message
        if (errorData.error) {
          return rejectWithValue(errorData.error);
        }
        // If it's a detail or message field
        return rejectWithValue(errorData.detail || errorData.message || 'خطا در ارسال درخواست');
      }
      return rejectWithValue(error.message || 'خطا در ارسال درخواست');
    }
  }
);

export const fetchMembershipRequests = createAsyncThunk(
  'membership/fetchRequests',
  async (params = {}, { rejectWithValue }) => {
    try {
      let response;
      
      // اگر owner_id مشخص شده، از API مخصوص مالک استفاده کن
      if (params.owner_id) {
        response = await membershipApi.getOwnerMembershipRequests();
      }
      // اگر status مشخص شده و owner_approved است، از API مخصوص مدیر استفاده کن
      else if (params.status === 'owner_approved') {
        response = await membershipApi.getManagerPendingRequests();
      }
      // در غیر این صورت از API عمومی استفاده کن
      else {
        response = await membershipApi.getMembershipRequests(params);
      }
            return response;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("❌ fetchMembershipRequests error:", error);
      }
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchMembershipRequest = createAsyncThunk(
  'membership/fetchRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await membershipApi.getMembershipRequest(requestId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const approveMembershipRequestByOwner = createAsyncThunk(
  'membership/approveRequestByOwner',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await membershipApi.approveMembershipRequestByOwner(requestId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const approveMembershipRequestByManager = createAsyncThunk(
  'membership/approveRequestByManager',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await membershipApi.approveMembershipRequestByManager(requestId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const rejectMembershipRequest = createAsyncThunk(
  'membership/rejectRequest',
  async ({ requestId, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await membershipApi.rejectMembershipRequest(requestId, rejectionReason);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchUnitByPhone = createAsyncThunk(
  'membership/fetchUnitByPhone',
  async (phoneNumber, { rejectWithValue }) => {
    try {
      const response = await membershipApi.getUnitByPhone(phoneNumber);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchPendingOwnerApprovalRequests = createAsyncThunk(
  'membership/fetchPendingOwnerApprovalRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await membershipApi.getPendingOwnerApprovalRequests();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
  requests: [],
  selectedRequest: null,
  unitData: null,
  pendingOwnerApprovalRequests: [],
  loading: false,
  error: null,
  createLoading: false,
  approveLoading: false,
  rejectLoading: false,
  unitLoading: false,
  pendingOwnerApprovalLoading: false,
  count: 0,
  pendingOwnerApprovalCount: 0,
};

const membershipSlice = createSlice({
  name: 'membership',
  initialState,
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
    clearRequests: (state) => {
      state.requests = [];
      state.count = 0;
    },
    clearUnitData: (state) => {
      state.unitData = null;
    },
    clearPendingOwnerApprovalRequests: (state) => {
      state.pendingOwnerApprovalRequests = [];
      state.pendingOwnerApprovalCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create membership request
      .addCase(createMembershipRequest.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createMembershipRequest.fulfilled, (state, action) => {
        state.createLoading = false;
        if (import.meta.env.DEV) {
          console.log("🔍 createMembershipRequest.fulfilled payload:", action.payload);
        }
        if (action.payload) {
          // اگر payload خود درخواست است
          if (action.payload.request_id) {
            state.requests.unshift(action.payload);
            state.count += 1;
          }
          // اگر payload شامل request است
          else if (action.payload.request) {
            state.requests.unshift(action.payload.request);
            state.count += 1;
          }
        }
      })
      .addCase(createMembershipRequest.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      
      // Fetch membership requests
      .addCase(fetchMembershipRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembershipRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload?.requests || [];
        state.count = action.payload?.count || 0;
      })
      .addCase(fetchMembershipRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single membership request
      .addCase(fetchMembershipRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembershipRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRequest = action.payload || null;
      })
      .addCase(fetchMembershipRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Approve membership request by owner
      .addCase(approveMembershipRequestByOwner.pending, (state) => {
        state.approveLoading = true;
        state.error = null;
      })
      .addCase(approveMembershipRequestByOwner.fulfilled, (state, action) => {
        state.approveLoading = false;
        if (action.payload?.request) {
          const requestId = action.payload.request.request_id;
          const index = state.requests.findIndex(req => req.request_id === requestId);
          if (index !== -1) {
            state.requests[index] = action.payload.request;
          }
          if (state.selectedRequest?.request_id === requestId) {
            state.selectedRequest = action.payload.request;
          }
        }
      })
      .addCase(approveMembershipRequestByOwner.rejected, (state, action) => {
        state.approveLoading = false;
        state.error = action.payload;
      })
      
      // Approve membership request by manager
      .addCase(approveMembershipRequestByManager.pending, (state) => {
        state.approveLoading = true;
        state.error = null;
      })
      .addCase(approveMembershipRequestByManager.fulfilled, (state, action) => {
        state.approveLoading = false;
        if (action.payload?.request) {
          const requestId = action.payload.request.request_id;
          const index = state.requests.findIndex(req => req.request_id === requestId);
          if (index !== -1) {
            state.requests[index] = action.payload.request;
          }
          if (state.selectedRequest?.request_id === requestId) {
            state.selectedRequest = action.payload.request;
          }
        }
      })
      .addCase(approveMembershipRequestByManager.rejected, (state, action) => {
        state.approveLoading = false;
        state.error = action.payload;
      })
      
      // Reject membership request
      .addCase(rejectMembershipRequest.pending, (state) => {
        state.rejectLoading = true;
        state.error = null;
      })
      .addCase(rejectMembershipRequest.fulfilled, (state, action) => {
        state.rejectLoading = false;
        if (action.payload?.request) {
          const requestId = action.payload.request.request_id;
          const index = state.requests.findIndex(req => req.request_id === requestId);
          if (index !== -1) {
            state.requests[index] = action.payload.request;
          }
          if (state.selectedRequest?.request_id === requestId) {
            state.selectedRequest = action.payload.request;
          }
        }
      })
      .addCase(rejectMembershipRequest.rejected, (state, action) => {
        state.rejectLoading = false;
        state.error = action.payload;
      })
      
      // Fetch unit by phone
      .addCase(fetchUnitByPhone.pending, (state) => {
        state.unitLoading = true;
        state.error = null;
      })
      .addCase(fetchUnitByPhone.fulfilled, (state, action) => {
        state.unitLoading = false;
        state.unitData = action.payload?.unit || null;
      })
      .addCase(fetchUnitByPhone.rejected, (state, action) => {
        state.unitLoading = false;
        state.error = action.payload;
        state.unitData = null;
      })
      
      // Fetch pending owner approval requests
      .addCase(fetchPendingOwnerApprovalRequests.pending, (state) => {
        state.pendingOwnerApprovalLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingOwnerApprovalRequests.fulfilled, (state, action) => {
        state.pendingOwnerApprovalLoading = false;
        state.pendingOwnerApprovalRequests = action.payload?.requests || [];
        state.pendingOwnerApprovalCount = action.payload?.count || 0;
      })
      .addCase(fetchPendingOwnerApprovalRequests.rejected, (state, action) => {
        state.pendingOwnerApprovalLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setSelectedRequest,
  clearSelectedRequest,
  clearRequests,
  clearUnitData,
  clearPendingOwnerApprovalRequests,
} = membershipSlice.actions;

// Selectors
export const selectMembershipRequests = (state) => state.membership.requests;
export const selectMembershipLoading = (state) => state.membership.loading;
export const selectMembershipError = (state) => state.membership.error;
export const selectMembershipCreateLoading = (state) => state.membership.createLoading;
export const selectMembershipApproveLoading = (state) => state.membership.approveLoading;
export const selectMembershipRejectLoading = (state) => state.membership.rejectLoading;
export const selectSelectedMembershipRequest = (state) => state.membership.selectedRequest;
export const selectMembershipCount = (state) => state.membership.count;
export const selectUnitData = (state) => state.membership.unitData;
export const selectUnitLoading = (state) => state.membership.unitLoading;
export const selectPendingOwnerApprovalRequests = (state) => state.membership.pendingOwnerApprovalRequests;
export const selectPendingOwnerApprovalLoading = (state) => state.membership.pendingOwnerApprovalLoading;
export const selectPendingOwnerApprovalCount = (state) => state.membership.pendingOwnerApprovalCount;

export default membershipSlice.reducer;
