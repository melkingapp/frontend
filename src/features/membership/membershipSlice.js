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

// ===== US6: Family Invitation Thunks =====
export const createFamilyInvitation = createAsyncThunk(
  'membership/createFamilyInvitation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await membershipApi.createFamilyInvitation(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchFamilyInvitations = createAsyncThunk(
  'membership/fetchFamilyInvitations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await membershipApi.listFamilyInvitations();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const acceptFamilyInvitation = createAsyncThunk(
  'membership/acceptFamilyInvitation',
  async (code, { rejectWithValue }) => {
    try {
      const response = await membershipApi.acceptFamilyInvitation(code);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// ===== US7: Conflict Report Thunks =====
export const reportUnitConflict = createAsyncThunk(
  'membership/reportUnitConflict',
  async (data, { rejectWithValue }) => {
    try {
      const response = await membershipApi.reportUnitConflict(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchConflictReports = createAsyncThunk(
  'membership/fetchConflictReports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await membershipApi.listConflictReports();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const resolveConflict = createAsyncThunk(
  'membership/resolveConflict',
  async ({ reportId, data }, { rejectWithValue }) => {
    try {
      const response = await membershipApi.resolveConflict(reportId, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// ===== US9: Withdraw Request Thunk =====
export const withdrawMembershipRequest = createAsyncThunk(
  'membership/withdrawRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await membershipApi.withdrawMembershipRequest(requestId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// ===== US11: Invite Link Thunks =====
export const createInviteLink = createAsyncThunk(
  'membership/createInviteLink',
  async (data, { rejectWithValue }) => {
    try {
      const response = await membershipApi.createInviteLink(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchInviteLinks = createAsyncThunk(
  'membership/fetchInviteLinks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await membershipApi.listInviteLinks();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const validateInviteLink = createAsyncThunk(
  'membership/validateInviteLink',
  async (token, { rejectWithValue }) => {
    try {
      const response = await membershipApi.validateInviteLink(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const useInviteLink = createAsyncThunk(
  'membership/useInviteLink',
  async (token, { rejectWithValue }) => {
    try {
      const response = await membershipApi.useInviteLink(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// ===== PRD: Suggested Users Management =====
export const registerSuggestedUser = createAsyncThunk(
  'membership/registerSuggestedUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await membershipApi.registerSuggestedUser(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// ===== PRD: Join by Manager Phone =====
export const joinByManagerPhone = createAsyncThunk(
  'membership/joinByManagerPhone',
  async (data, { rejectWithValue }) => {
    try {
      const response = await membershipApi.joinByManagerPhone(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// ===== PRD: Transfer Management =====
export const transferBuildingManagement = createAsyncThunk(
  'membership/transferBuildingManagement',
  async ({ buildingId, data }, { rejectWithValue }) => {
    try {
      const response = await membershipApi.transferBuildingManagement(buildingId, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// ===== PRD: Manager Tasks =====
export const getManagerTasks = createAsyncThunk(
  'membership/getManagerTasks',
  async (buildingId, { rejectWithValue }) => {
    try {
      const response = await membershipApi.getManagerTasks(buildingId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const completeManagerTask = createAsyncThunk(
  'membership/completeManagerTask',
  async ({ buildingId, data }, { rejectWithValue }) => {
    try {
      const response = await membershipApi.completeManagerTask(buildingId, data);
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
  // US6: Family Invitations
  familyInvitations: [],
  familyInvitationsLoading: false,
  createFamilyInvitationLoading: false,
  // US7: Conflict Reports
  conflictReports: [],
  conflictReportsLoading: false,
  resolveConflictLoading: false,
  // US11: Invite Links
  inviteLinks: [],
  inviteLinksLoading: false,
  createInviteLinkLoading: false,
  validateInviteLinkLoading: false,
  useInviteLinkLoading: false,
  inviteLinkData: null,
  // PRD: Manager Tasks
  managerTasks: [],
  managerTasksLoading: false,
  completeTaskLoading: false,
  // PRD: Transfer Management
  transferManagementLoading: false,
  // Common
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
      })

      // ===== US6: Family Invitation =====
      .addCase(createFamilyInvitation.pending, (state) => {
        state.createFamilyInvitationLoading = true;
        state.error = null;
      })
      .addCase(createFamilyInvitation.fulfilled, (state, action) => {
        state.createFamilyInvitationLoading = false;
        state.familyInvitations.unshift(action.payload);
      })
      .addCase(createFamilyInvitation.rejected, (state, action) => {
        state.createFamilyInvitationLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchFamilyInvitations.pending, (state) => {
        state.familyInvitationsLoading = true;
        state.error = null;
      })
      .addCase(fetchFamilyInvitations.fulfilled, (state, action) => {
        state.familyInvitationsLoading = false;
        state.familyInvitations = action.payload?.invitations || [];
      })
      .addCase(fetchFamilyInvitations.rejected, (state, action) => {
        state.familyInvitationsLoading = false;
        state.error = action.payload;
      })

      // ===== US7: Conflict Reports =====
      .addCase(reportUnitConflict.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(reportUnitConflict.fulfilled, (state, action) => {
        state.createLoading = false;
        // Can add to conflictReports if needed
      })
      .addCase(reportUnitConflict.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchConflictReports.pending, (state) => {
        state.conflictReportsLoading = true;
        state.error = null;
      })
      .addCase(fetchConflictReports.fulfilled, (state, action) => {
        state.conflictReportsLoading = false;
        state.conflictReports = action.payload?.reports || [];
      })
      .addCase(fetchConflictReports.rejected, (state, action) => {
        state.conflictReportsLoading = false;
        state.error = action.payload;
      })

      .addCase(resolveConflict.pending, (state) => {
        state.resolveConflictLoading = true;
        state.error = null;
      })
      .addCase(resolveConflict.fulfilled, (state, action) => {
        state.resolveConflictLoading = false;
        const reportId = action.payload.report.report_id;
        const index = state.conflictReports.findIndex(report => report.report_id === reportId);
        if (index !== -1) {
          state.conflictReports[index] = action.payload.report;
        }
      })
      .addCase(resolveConflict.rejected, (state, action) => {
        state.resolveConflictLoading = false;
        state.error = action.payload;
      })

      // ===== US9: Withdraw Request =====
      .addCase(withdrawMembershipRequest.pending, (state) => {
        state.rejectLoading = true;
        state.error = null;
      })
      .addCase(withdrawMembershipRequest.fulfilled, (state, action) => {
        state.rejectLoading = false;
        // Remove the withdrawn request from the list
        const requestId = action.meta.arg;
        state.requests = state.requests.filter(req => req.request_id !== requestId);
        state.count = Math.max(0, state.count - 1);
      })
      .addCase(withdrawMembershipRequest.rejected, (state, action) => {
        state.rejectLoading = false;
        state.error = action.payload;
      })

      // ===== US11: Invite Links =====
      .addCase(createInviteLink.pending, (state) => {
        state.createInviteLinkLoading = true;
        state.error = null;
      })
      .addCase(createInviteLink.fulfilled, (state, action) => {
        state.createInviteLinkLoading = false;
        state.inviteLinks.unshift(action.payload);
      })
      .addCase(createInviteLink.rejected, (state, action) => {
        state.createInviteLinkLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchInviteLinks.pending, (state) => {
        state.inviteLinksLoading = true;
        state.error = null;
      })
      .addCase(fetchInviteLinks.fulfilled, (state, action) => {
        state.inviteLinksLoading = false;
        state.inviteLinks = action.payload?.invitations || [];
      })
      .addCase(fetchInviteLinks.rejected, (state, action) => {
        state.inviteLinksLoading = false;
        state.error = action.payload;
      })

      .addCase(validateInviteLink.pending, (state) => {
        state.validateInviteLinkLoading = true;
        state.error = null;
      })
      .addCase(validateInviteLink.fulfilled, (state, action) => {
        state.validateInviteLinkLoading = false;
        state.inviteLinkData = action.payload;
      })
      .addCase(validateInviteLink.rejected, (state, action) => {
        state.validateInviteLinkLoading = false;
        state.error = action.payload;
        state.inviteLinkData = null;
      })

      .addCase(useInviteLink.pending, (state) => {
        state.useInviteLinkLoading = true;
        state.error = null;
      })
      .addCase(useInviteLink.fulfilled, (state, action) => {
        state.useInviteLinkLoading = false;
        // Link has been used successfully
      })
      .addCase(useInviteLink.rejected, (state, action) => {
        state.useInviteLinkLoading = false;
        state.error = action.payload;
      })

      // ===== PRD: Suggested Users Management =====
      .addCase(registerSuggestedUser.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(registerSuggestedUser.fulfilled, (state, action) => {
        state.createLoading = false;
        // Can add to some list if needed
      })
      .addCase(registerSuggestedUser.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // ===== PRD: Join by Manager Phone =====
      .addCase(joinByManagerPhone.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(joinByManagerPhone.fulfilled, (state, action) => {
        state.createLoading = false;
        // Handle response - could add to requests or navigate
      })
      .addCase(joinByManagerPhone.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // ===== PRD: Transfer Management =====
      .addCase(transferBuildingManagement.pending, (state) => {
        state.transferManagementLoading = true;
        state.error = null;
      })
      .addCase(transferBuildingManagement.fulfilled, (state, action) => {
        state.transferManagementLoading = false;
        // Building management transferred successfully
      })
      .addCase(transferBuildingManagement.rejected, (state, action) => {
        state.transferManagementLoading = false;
        state.error = action.payload;
      })

      // ===== PRD: Manager Tasks =====
      .addCase(getManagerTasks.pending, (state) => {
        state.managerTasksLoading = true;
        state.error = null;
      })
      .addCase(getManagerTasks.fulfilled, (state, action) => {
        state.managerTasksLoading = false;
        state.managerTasks = action.payload?.tasks || [];
      })
      .addCase(getManagerTasks.rejected, (state, action) => {
        state.managerTasksLoading = false;
        state.error = action.payload;
      })

      .addCase(completeManagerTask.pending, (state) => {
        state.completeTaskLoading = true;
        state.error = null;
      })
      .addCase(completeManagerTask.fulfilled, (state, action) => {
        state.completeTaskLoading = false;
        // Update the completed task in the list
        if (action.payload?.task) {
          const taskIndex = state.managerTasks.findIndex(task => task.manager_task_id === action.payload.task.manager_task_id);
          if (taskIndex !== -1) {
            state.managerTasks[taskIndex] = action.payload.task;
          }
        }
      })
      .addCase(completeManagerTask.rejected, (state, action) => {
        state.completeTaskLoading = false;
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

// US6: Family Invitations
export const selectFamilyInvitations = (state) => state.membership.familyInvitations;
export const selectFamilyInvitationsLoading = (state) => state.membership.familyInvitationsLoading;
export const selectCreateFamilyInvitationLoading = (state) => state.membership.createFamilyInvitationLoading;

// US7: Conflict Reports
export const selectConflictReports = (state) => state.membership.conflictReports;
export const selectConflictReportsLoading = (state) => state.membership.conflictReportsLoading;
export const selectResolveConflictLoading = (state) => state.membership.resolveConflictLoading;

// US11: Invite Links
export const selectInviteLinks = (state) => state.membership.inviteLinks;
export const selectInviteLinksLoading = (state) => state.membership.inviteLinksLoading;
export const selectCreateInviteLinkLoading = (state) => state.membership.createInviteLinkLoading;
export const selectValidateInviteLinkLoading = (state) => state.membership.validateInviteLinkLoading;
export const selectUseInviteLinkLoading = (state) => state.membership.useInviteLinkLoading;
export const selectInviteLinkData = (state) => state.membership.inviteLinkData;

// PRD: Manager Tasks
export const selectManagerTasks = (state) => state.membership.managerTasks;
export const selectManagerTasksLoading = (state) => state.membership.managerTasksLoading;
export const selectCompleteTaskLoading = (state) => state.membership.completeTaskLoading;

// PRD: Transfer Management
export const selectTransferManagementLoading = (state) => state.membership.transferManagementLoading;

export default membershipSlice.reducer;
