import membershipSliceReducer, {
  createMembershipRequest,
  fetchMembershipRequests,
  fetchMembershipRequest,
  approveMembershipRequestByOwner,
  approveMembershipRequestByManager,
  rejectMembershipRequest,
  withdrawMembershipRequest,
  fetchUnitByPhone,
  fetchPendingOwnerApprovalRequests,
  createFamilyInvitation,
  fetchFamilyInvitations,
  acceptFamilyInvitation,
  reportUnitConflict,
  fetchConflictReports,
  resolveConflict,
  createInviteLink,
  validateInviteLink,
  useInviteLink,
  registerSuggestedUser,
  joinByManagerPhone,
  transferBuildingManagement,
  getManagerTasks,
  completeManagerTask,
  clearError,
  setSelectedRequest,
  clearRequests,
  clearUnitData,
  clearPendingOwnerApprovalRequests,
} from '../membershipSlice';

import membershipApi from '../../../shared/services/membershipApi';

// Mock the API service
jest.mock('../../../shared/services/membershipApi');

describe('membershipSlice', () => {
  const initialState = {
    requests: [],
    selectedRequest: null,
    unitData: null,
    pendingOwnerApprovalRequests: [],
    familyInvitations: [],
    familyInvitationsLoading: false,
    createFamilyInvitationLoading: false,
    conflictReports: [],
    conflictReportsLoading: false,
    resolveConflictLoading: false,
    inviteLinks: [],
    inviteLinksLoading: false,
    createInviteLinkLoading: false,
    validateInviteLinkLoading: false,
    useInviteLinkLoading: false,
    inviteLinkData: null,
    managerTasks: [],
    managerTasksLoading: false,
    completeTaskLoading: false,
    transferManagementLoading: false,
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(membershipSliceReducer(undefined, { type: undefined })).toEqual(initialState);
    });
  });

  describe('reducers', () => {
    it('should handle clearError', () => {
      const state = { ...initialState, error: 'Some error' };
      const action = clearError();
      const result = membershipSliceReducer(state, action);
      expect(result.error).toBeNull();
    });

    it('should handle setSelectedRequest', () => {
      const mockRequest = { id: 1, name: 'Test Request' };
      const action = setSelectedRequest(mockRequest);
      const result = membershipSliceReducer(initialState, action);
      expect(result.selectedRequest).toEqual(mockRequest);
    });

    it('should handle clearRequests', () => {
      const state = { ...initialState, requests: [{ id: 1 }], count: 1 };
      const action = clearRequests();
      const result = membershipSliceReducer(state, action);
      expect(result.requests).toEqual([]);
      expect(result.count).toBe(0);
    });

    it('should handle clearUnitData', () => {
      const state = { ...initialState, unitData: { id: 1 } };
      const action = clearUnitData();
      const result = membershipSliceReducer(state, action);
      expect(result.unitData).toBeNull();
    });

    it('should handle clearPendingOwnerApprovalRequests', () => {
      const state = {
        ...initialState,
        pendingOwnerApprovalRequests: [{ id: 1 }],
        pendingOwnerApprovalCount: 1
      };
      const action = clearPendingOwnerApprovalRequests();
      const result = membershipSliceReducer(state, action);
      expect(result.pendingOwnerApprovalRequests).toEqual([]);
      expect(result.pendingOwnerApprovalCount).toBe(0);
    });
  });

  describe('async thunks', () => {
    describe('createMembershipRequest', () => {
      it('should handle successful request creation', async () => {
        const mockRequestData = { full_name: 'Test User', phone_number: '09123456789' };
        const mockResponse = { request_id: 1, ...mockRequestData };

        membershipApi.createMembershipRequest.mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = createMembershipRequest(mockRequestData);

        await thunk(dispatch, () => ({}), undefined);

        const dispatchedActions = dispatch.mock.calls.map(call => call[0]);

        expect(dispatchedActions[0].type).toBe(createMembershipRequest.pending.type);
        expect(dispatchedActions[1].type).toBe(createMembershipRequest.fulfilled.type);
        expect(dispatchedActions[1].payload).toEqual(mockResponse);
      });

      it('should handle request creation failure', async () => {
        const mockError = { response: { data: { error: 'Validation error' } } };
        membershipApi.createMembershipRequest.mockRejectedValue(mockError);

        const dispatch = jest.fn();
        const thunk = createMembershipRequest({});

        await thunk(dispatch, () => ({}), undefined);

        const dispatchedActions = dispatch.mock.calls.map(call => call[0]);

        expect(dispatchedActions[0].type).toBe(createMembershipRequest.pending.type);
        expect(dispatchedActions[1].type).toBe(createMembershipRequest.rejected.type);
        expect(dispatchedActions[1].payload).toBe('Validation error');
      });
    });

    describe('registerSuggestedUser', () => {
      it('should handle successful suggested user registration', async () => {
        const mockData = { full_name: 'Suggested User', phone_number: '09123456789' };
        const mockResponse = { request_id: 1, status: 'suggested' };

        membershipApi.registerSuggestedUser.mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = registerSuggestedUser(mockData);

        await thunk(dispatch, () => ({}), undefined);

        const dispatchedActions = dispatch.mock.calls.map(call => call[0]);

        expect(dispatchedActions[0].type).toBe(registerSuggestedUser.pending.type);
        expect(dispatchedActions[1].type).toBe(registerSuggestedUser.fulfilled.type);
        expect(dispatchedActions[1].payload).toEqual(mockResponse);
      });
    });

    describe('joinByManagerPhone', () => {
      it('should handle successful join by manager phone', async () => {
        const mockData = { manager_phone: '09123456789', full_name: 'Test User' };
        const mockResponse = { request_id: 1, message: 'Request created' };

        membershipApi.joinByManagerPhone.mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = joinByManagerPhone(mockData);

        await thunk(dispatch, () => ({}), undefined);

        const dispatchedActions = dispatch.mock.calls.map(call => call[0]);

        expect(dispatchedActions[0].type).toBe(joinByManagerPhone.pending.type);
        expect(dispatchedActions[1].type).toBe(joinByManagerPhone.fulfilled.type);
        expect(dispatchedActions[1].payload).toEqual(mockResponse);
      });

      it('should handle multiple buildings selection', async () => {
        const mockData = { manager_phone: '09123456789', full_name: 'Test User' };
        const mockResponse = {
          requires_selection: true,
          buildings: [
            { building_id: 1, title: 'Building 1' },
            { building_id: 2, title: 'Building 2' }
          ]
        };

        membershipApi.joinByManagerPhone.mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = joinByManagerPhone(mockData);

        await thunk(dispatch, () => ({}), undefined);

        const dispatchedActions = dispatch.mock.calls.map(call => call[0]);
        expect(dispatchedActions[1].payload).toEqual(mockResponse);
      });
    });

    describe('withdrawMembershipRequest', () => {
      it('should remove request from list on successful withdrawal', async () => {
        const mockResponse = { message: 'Request withdrawn' };
        membershipApi.withdrawMembershipRequest.mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = withdrawMembershipRequest(1);

        // Set up initial state with the request
        const getState = () => ({
          membership: {
            requests: [{ request_id: 1 }, { request_id: 2 }],
            count: 2
          }
        });

        await thunk(dispatch, getState, undefined);

        const dispatchedActions = dispatch.mock.calls.map(call => call[0]);
        expect(dispatchedActions[1].type).toBe(withdrawMembershipRequest.fulfilled.type);
      });
    });

    describe('createFamilyInvitation', () => {
      it('should add invitation to list on successful creation', async () => {
        const mockData = { building: 1, unit_number: '101', invited_phone: '09123456789' };
        const mockResponse = { invitation_id: 1, status: 'pending' };

        membershipApi.createFamilyInvitation.mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = createFamilyInvitation(mockData);

        await thunk(dispatch, () => ({}), undefined);

        const dispatchedActions = dispatch.mock.calls.map(call => call[0]);
        expect(dispatchedActions[0].type).toBe(createFamilyInvitation.pending.type);
        expect(dispatchedActions[1].type).toBe(createFamilyInvitation.fulfilled.type);
        expect(dispatchedActions[1].payload).toEqual(mockResponse);
      });
    });

    describe('acceptFamilyInvitation', () => {
      it('should handle successful family invitation acceptance', async () => {
        const mockCode = 'ABC123';
        const mockResponse = { message: 'Invitation accepted', invitation: { status: 'accepted' } };

        membershipApi.acceptFamilyInvitation.mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = acceptFamilyInvitation(mockCode);

        await thunk(dispatch, () => ({}), undefined);

        const dispatchedActions = dispatch.mock.calls.map(call => call[0]);
        expect(dispatchedActions[1].payload).toEqual(mockResponse);
      });
    });

    describe('createInviteLink', () => {
      it('should add link to list on successful creation', async () => {
        const mockData = { building: 1, unit_number: '101', role: 'resident' };
        const mockResponse = { link_id: 1, token: 'token123' };

        membershipApi.createInviteLink.mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = createInviteLink(mockData);

        await thunk(dispatch, () => ({}), undefined);

        const dispatchedActions = dispatch.mock.calls.map(call => call[0]);
        expect(dispatchedActions[1].payload).toEqual(mockResponse);
      });
    });

    describe('validateInviteLink', () => {
      it('should set invite link data on successful validation', async () => {
        const mockToken = 'token123';
        const mockResponse = { link_id: 1, building: { title: 'Test Building' } };

        membershipApi.validateInviteLink.mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = validateInviteLink(mockToken);

        await thunk(dispatch, () => ({}), undefined);

        const dispatchedActions = dispatch.mock.calls.map(call => call[0]);
        expect(dispatchedActions[1].payload).toEqual(mockResponse);
      });
    });

    describe('useInviteLink', () => {
      it('should handle successful invite link usage', async () => {
        const mockToken = 'token123';
        const mockResponse = { message: 'Link used successfully' };

        membershipApi.useInviteLink.mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = useInviteLink(mockToken);

        await thunk(dispatch, () => ({}), undefined);

        const dispatchedActions = dispatch.mock.calls.map(call => call[0]);
        expect(dispatchedActions[1].payload).toEqual(mockResponse);
      });
    });

    describe('getManagerTasks', () => {
      it('should populate manager tasks list', async () => {
        const mockBuildingId = 1;
        const mockResponse = {
          tasks: [
            { task_id: 1, title: 'Complete building info', is_completed: false },
            { task_id: 2, title: 'Add units', is_completed: true }
          ],
          completed_count: 1,
          total_count: 2
        };

        membershipApi.getManagerTasks.mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = getManagerTasks(mockBuildingId);

        await thunk(dispatch, () => ({}), undefined);

        const dispatchedActions = dispatch.mock.calls.map(call => call[0]);
        expect(dispatchedActions[1].payload).toEqual(mockResponse);
      });
    });

    describe('completeManagerTask', () => {
      it('should update task status on successful completion', async () => {
        const mockData = { buildingId: 1, data: { task_id: 1 } };
        const mockResponse = {
          message: 'Task completed',
          task: { task_id: 1, is_completed: true }
        };

        membershipApi.completeManagerTask.mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = completeManagerTask(mockData);

        await thunk(dispatch, () => ({}), undefined);

        const dispatchedActions = dispatch.mock.calls.map(call => call[0]);
        expect(dispatchedActions[1].payload).toEqual(mockResponse);
      });
    });

    describe('transferBuildingManagement', () => {
      it('should handle successful management transfer', async () => {
        const mockData = { buildingId: 1, data: { new_manager_phone: '09123456789' } };
        const mockResponse = { message: 'Management transferred successfully' };

        membershipApi.transferBuildingManagement.mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = transferBuildingManagement(mockData);

        await thunk(dispatch, () => ({}), undefined);

        const dispatchedActions = dispatch.mock.calls.map(call => call[0]);
        expect(dispatchedActions[1].payload).toEqual(mockResponse);
      });
    });
  });

  describe('extra reducers', () => {
    it('should update state on createMembershipRequest fulfilled', () => {
      const mockRequest = { request_id: 1, full_name: 'Test User' };
      const action = { type: createMembershipRequest.fulfilled.type, payload: mockRequest };

      const result = membershipSliceReducer(initialState, action);

      expect(result.requests).toHaveLength(1);
      expect(result.requests[0]).toEqual(mockRequest);
      expect(result.count).toBe(1);
      expect(result.createLoading).toBe(false);
    });

    it('should update selectedRequest on fetchMembershipRequest fulfilled', () => {
      const mockRequest = { request_id: 1, full_name: 'Test User' };
      const action = { type: fetchMembershipRequest.fulfilled.type, payload: mockRequest };

      const result = membershipSliceReducer(initialState, action);

      expect(result.selectedRequest).toEqual(mockRequest);
      expect(result.loading).toBe(false);
    });

    it('should update request status on approveMembershipRequestByOwner fulfilled', () => {
      const initialStateWithRequest = {
        ...initialState,
        requests: [{ request_id: 1, status: 'pending' }],
        selectedRequest: { request_id: 1, status: 'pending' }
      };

      const mockResponse = {
        request: { request_id: 1, status: 'owner_approved' }
      };

      const action = {
        type: approveMembershipRequestByOwner.fulfilled.type,
        payload: mockResponse
      };

      const result = membershipSliceReducer(initialStateWithRequest, action);

      expect(result.requests[0].status).toBe('owner_approved');
      expect(result.selectedRequest.status).toBe('owner_approved');
      expect(result.approveLoading).toBe(false);
    });

    it('should update managerTasks on getManagerTasks fulfilled', () => {
      const mockTasks = [{ task_id: 1, title: 'Test Task' }];
      const action = {
        type: getManagerTasks.fulfilled.type,
        payload: mockTasks
      };

      const result = membershipSliceReducer(initialState, action);

      expect(result.managerTasks).toEqual(mockTasks);
      expect(result.managerTasksLoading).toBe(false);
    });

    it('should update task in list on completeManagerTask fulfilled', () => {
      const initialStateWithTasks = {
        ...initialState,
        managerTasks: [
          { task_id: 1, is_completed: false },
          { task_id: 2, is_completed: false }
        ]
      };

      const mockResponse = {
        task: { task_id: 1, is_completed: true }
      };

      const action = {
        type: completeManagerTask.fulfilled.type,
        payload: mockResponse
      };

      const result = membershipSliceReducer(initialStateWithTasks, action);

      expect(result.managerTasks[0].is_completed).toBe(true);
      expect(result.managerTasks[1].is_completed).toBe(false);
      expect(result.completeTaskLoading).toBe(false);
    });

    it('should remove request from list on withdrawMembershipRequest fulfilled', () => {
      const initialStateWithRequests = {
        ...initialState,
        requests: [
          { request_id: 1, status: 'pending' },
          { request_id: 2, status: 'pending' }
        ],
        count: 2
      };

      const action = {
        type: withdrawMembershipRequest.fulfilled.type,
        meta: { arg: 1 }
      };

      const result = membershipSliceReducer(initialStateWithRequests, action);

      expect(result.requests).toHaveLength(1);
      expect(result.requests[0].request_id).toBe(2);
      expect(result.count).toBe(1);
      expect(result.rejectLoading).toBe(false);
    });
  });
});
