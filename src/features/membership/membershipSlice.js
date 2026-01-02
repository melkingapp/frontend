import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import membershipApi from '../../shared/services/membershipApi';

// Helper function to handle API errors consistently
const handleApiError = (error, rejectWithValue) => {
  if (import.meta.env.DEV) {
    console.error("❌ API Error:", error.response || error);
  }
  const errorData = error.data || error.response?.data;
  if (errorData) {
    if (typeof errorData === 'object' && !errorData.error && !errorData.message && !errorData.detail) {
      const validationErrors = Object.entries(errorData)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages[0] : messages}`)
        .join(', ');
      return rejectWithValue(validationErrors || 'خطا در اعتبارسنجی داده‌ها');
    }
    return rejectWithValue(errorData.error || errorData.detail || errorData.message || 'یک خطای ناشناخته رخ داد');
  }
  return rejectWithValue(error.message || 'یک خطای ناشناخته رخ داد');
};

const createApiThunk = (name, apiCall) => {
  return createAsyncThunk(name, async (arg, { rejectWithValue }) => {
    try {
      return await apiCall(arg);
    } catch (error) {
      return handleApiError(error, rejectWithValue);
    }
  });
};

// #region --- Async Thunks ---
export const createMembershipRequest = createApiThunk('membership/createRequest', membershipApi.createMembershipRequest);
export const fetchMembershipRequests = createApiThunk('membership/fetchRequests', async (params = {}) => {
    if (params.owner_id) return await membershipApi.getOwnerMembershipRequests();
    if (params.status === 'owner_approved') return await membershipApi.getManagerPendingRequests();
    return await membershipApi.getMembershipRequests(params);
});
export const fetchMembershipRequest = createApiThunk('membership/fetchRequest', membershipApi.getMembershipRequest);
export const editMembershipRequest = createApiThunk('membership/editRequest', ({ requestId, requestData }) => membershipApi.editMembershipRequest(requestId, requestData));
export const approveMembershipRequestByOwner = createApiThunk('membership/approveRequestByOwner', membershipApi.approveMembershipRequestByOwner);
export const approveMembershipRequestByManager = createApiThunk('membership/approveRequestByManager', membershipApi.approveMembershipRequestByManager);
export const rejectRequest = createApiThunk('membership/rejectRequest', ({ requestId, rejectionReason, isSuggested = false }) => 
    isSuggested 
    ? membershipApi.rejectSuggestedMembershipRequest(requestId, rejectionReason) 
    : membershipApi.rejectMembershipRequest(requestId, rejectionReason)
);
// Alias for backward compatibility
export const rejectMembershipRequest = rejectRequest;
export const fetchUnitByPhone = createApiThunk('membership/fetchUnitByPhone', membershipApi.getUnitByPhone);
export const fetchPendingOwnerApprovalRequests = createApiThunk('membership/fetchPendingOwnerApprovalRequests', membershipApi.getPendingOwnerApprovalRequests);
export const createFamilyInvitation = createApiThunk('membership/createFamilyInvitation', membershipApi.createFamilyInvitation);
export const fetchFamilyInvitations = createApiThunk('membership/fetchFamilyInvitations', membershipApi.listFamilyInvitations);
export const acceptFamilyInvitation = createApiThunk('membership/acceptFamilyInvitation', membershipApi.acceptFamilyInvitation);
export const reportUnitConflict = createApiThunk('membership/reportUnitConflict', membershipApi.reportUnitConflict);
export const fetchConflictReports = createApiThunk('membership/fetchConflictReports', membershipApi.listConflictReports);
export const resolveConflict = createApiThunk('membership/resolveConflict', ({ reportId, data }) => membershipApi.resolveConflict(reportId, data));
export const withdrawMembershipRequest = createApiThunk('membership/withdrawRequest', membershipApi.withdrawMembershipRequest);
export const createInviteLink = createApiThunk('membership/createInviteLink', membershipApi.createInviteLink);
export const fetchInviteLinks = createApiThunk('membership/fetchInviteLinks', membershipApi.listInviteLinks);
export const validateInviteLink = createApiThunk('membership/validateInviteLink', membershipApi.validateInviteLink);
export const useInviteLink = createApiThunk('membership/useInviteLink', membershipApi.useInviteLink);
export const registerSuggestedUser = createApiThunk('membership/registerSuggestedUser', membershipApi.registerSuggestedUser);
export const joinByManagerPhone = createApiThunk('membership/joinByManagerPhone', membershipApi.joinByManagerPhone);
export const fetchSuggestedRequests = createApiThunk('membership/fetchSuggestedRequests', membershipApi.getSuggestedRequests);
export const transferBuildingManagement = createApiThunk('membership/transferBuildingManagement', ({ buildingId, data }) => membershipApi.transferBuildingManagement(buildingId, data));
// #endregion

const initialState = {
  requests: [],
  selectedRequest: null,
  unitData: null,
  unitsData: [],
  pendingOwnerApprovalRequests: [],
  familyInvitations: [],
  conflictReports: [],
  inviteLinks: [],
  inviteLinkData: null,
  suggestedRequests: [],
  loadingStates: {
    fetchRequests: false,
    fetchRequest: false,
    createRequest: false,
    editRequest: false,
    approveRequest: false,
    rejectRequest: false,
    withdrawRequest: false,
    fetchUnitByPhone: false,
    fetchPendingOwner: false,
    family: false,
    conflict: false,
    invite: false,
    suggested: false,
    transfer: false,
  },
  error: null,
  count: 0,
  pendingOwnerApprovalCount: 0,
};

const thunkLoadingStateMap = {
  [fetchMembershipRequests.pending.type]: 'fetchRequests',
  [fetchMembershipRequest.pending.type]: 'fetchRequest',
  [createMembershipRequest.pending.type]: 'createRequest',
  [editMembershipRequest.pending.type]: 'editRequest',
  [approveMembershipRequestByOwner.pending.type]: 'approveRequest',
  [approveMembershipRequestByManager.pending.type]: 'approveRequest',
  [rejectRequest.pending.type]: 'rejectRequest',
  [withdrawMembershipRequest.pending.type]: 'withdrawRequest',
  [fetchUnitByPhone.pending.type]: 'fetchUnitByPhone',
  // etc.
};

const membershipSlice = createSlice({
  name: 'membership',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setSelectedRequest: (state, action) => { state.selectedRequest = action.payload; },
    clearSelectedRequest: (state) => { state.selectedRequest = null; },
    clearRequests: (state) => { state.requests = []; state.count = 0; },
    clearUnitData: (state) => { state.unitData = null; state.unitsData = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createMembershipRequest.fulfilled, (state, action) => {
        const newRequest = action.payload?.request || action.payload;
        if (newRequest?.request_id) {
          const existingIndex = state.requests.findIndex(req => req.request_id === newRequest.request_id);
          if (existingIndex !== -1) { state.requests[existingIndex] = newRequest; } 
          else { state.requests.unshift(newRequest); state.count += 1; }
        }
      })
      .addCase(fetchMembershipRequests.fulfilled, (state, action) => {
        state.requests = action.payload?.requests || [];
        state.count = action.payload?.count || 0;
      })
      .addCase(fetchMembershipRequest.fulfilled, (state, action) => {
        state.selectedRequest = action.payload || null;
      })
      .addCase(fetchUnitByPhone.fulfilled, (state, action) => {
        const payload = action.payload;
        // Handle both single unit and array of units
        if (Array.isArray(payload)) {
          state.unitsData = payload;
          state.unitData = payload[0] || null;
        } else if (payload?.units && Array.isArray(payload.units)) {
          state.unitsData = payload.units;
          state.unitData = payload.units[0] || payload.unit || null;
        } else if (payload?.unit) {
          state.unitData = payload.unit;
          state.unitsData = [payload.unit];
        } else {
          state.unitData = payload;
          state.unitsData = payload ? [payload] : [];
        }
      })
      .addCase(withdrawMembershipRequest.fulfilled, (state, action) => {
        const requestId = action.meta.arg;
        state.requests = state.requests.filter(req => req.request_id !== requestId);
        state.count = Math.max(0, state.count - 1);
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state, action) => {
          state.error = null;
          const loadingKey = thunkLoadingStateMap[action.type];
          if(loadingKey) state.loadingStates[loadingKey] = true;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state, action) => {
          const loadingKey = thunkLoadingStateMap[action.type.replace('/fulfilled', '/pending')];
          if(loadingKey) state.loadingStates[loadingKey] = false;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.error = action.payload;
          const loadingKey = thunkLoadingStateMap[action.type.replace('/rejected', '/pending')];
          if(loadingKey) state.loadingStates[loadingKey] = false;
        }
      );
  },
});

export const {
  clearError,
  setSelectedRequest,
  clearSelectedRequest,
  clearRequests,
  clearUnitData,
} = membershipSlice.actions;

// --- Selectors ---
export const selectConflictReports = (state) => state.membership.conflictReports;
export const selectConflictReportsLoading = (state) => state.membership.loadingStates.conflict;
export const selectCreateFamilyInvitationLoading = (state) => state.membership.loadingStates.family;
export const selectCreateInviteLinkLoading = (state) => state.membership.loadingStates.invite;
export const selectFamilyInvitations = (state) => state.membership.familyInvitations;
export const selectFamilyInvitationsLoading = (state) => state.membership.loadingStates.family;
export const selectInviteLinkData = (state) => state.membership.inviteLinkData;
export const selectInviteLinks = (state) => state.membership.inviteLinks;
export const selectInviteLinksLoading = (state) => state.membership.loadingStates.invite;
export const selectMembershipApproveLoading = (state) => state.membership.loadingStates.approveRequest;
export const selectMembershipCount = (state) => state.membership.count;
export const selectMembershipCreateLoading = (state) => state.membership.loadingStates.createRequest;
export const selectMembershipError = (state) => state.membership.error;
export const selectMembershipLoading = (state) => state.membership.loadingStates.fetchRequests;
export const selectMembershipLoadingStates = (state) => state.membership.loadingStates;
export const selectMembershipRejectLoading = (state) => state.membership.loadingStates.rejectRequest;
export const selectMembershipRequests = (state) => state.membership.requests;
export const selectMembershipState = (state) => state.membership;
export const selectPendingOwnerApprovalCount = (state) => state.membership.pendingOwnerApprovalCount;
export const selectPendingOwnerApprovalLoading = (state) => state.membership.loadingStates.fetchPendingOwner;
export const selectPendingOwnerApprovalRequests = (state) => state.membership.pendingOwnerApprovalRequests;
export const selectResolveConflictLoading = (state) => state.membership.loadingStates.conflict;
export const selectSelectedMembershipRequest = (state) => state.membership.selectedRequest;
export const selectSuggestedRequests = (state) => state.membership.suggestedRequests;
export const selectSuggestedRequestsLoading = (state) => state.membership.loadingStates.suggested;
export const selectTransferManagementLoading = (state) => state.membership.loadingStates.transfer;
export const selectUnitData = (state) => state.membership.unitData;
export const selectUnitsData = (state) => state.membership.unitsData;
export const selectUnitLoading = (state) => state.membership.loadingStates.fetchUnitByPhone;
export const selectUseInviteLinkLoading = (state) => state.membership.loadingStates.invite;
export const selectValidateInviteLinkLoading = (state) => state.membership.loadingStates.invite;

export default membershipSlice.reducer;
