import membershipApi from '../membershipApi';

// Mock axios
jest.mock('../api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

import api from '../api';

describe('membershipApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMembershipRequest', () => {
    it('should call POST /membership/create/ with correct data', async () => {
      const mockData = {
        building_code: 'ABC123',
        full_name: 'Test User',
        phone_number: '09123456789'
      };
      const mockResponse = { data: { request_id: 1, message: 'Success' } };

      api.post.mockResolvedValue(mockResponse);

      const result = await membershipApi.createMembershipRequest(mockData);

      expect(api.post).toHaveBeenCalledWith('/membership/create/', mockData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      api.post.mockRejectedValue(mockError);

      await expect(membershipApi.createMembershipRequest({}))
        .rejects.toThrow('API Error');
    });
  });

  describe('getMembershipRequests', () => {
    it('should call GET /membership/list/ with params', async () => {
      const mockParams = { status: 'pending' };
      const mockResponse = { data: { requests: [], count: 0 } };

      api.get.mockResolvedValue(mockResponse);

      const result = await membershipApi.getMembershipRequests(mockParams);

      expect(api.get).toHaveBeenCalledWith('/membership/list/', { params: mockParams });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getOwnerMembershipRequests', () => {
    it('should call GET /membership/owner/requests/', async () => {
      const mockResponse = { data: { requests: [], count: 0 } };

      api.get.mockResolvedValue(mockResponse);

      const result = await membershipApi.getOwnerMembershipRequests();

      expect(api.get).toHaveBeenCalledWith('/membership/owner/requests/', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should include status filter in params', async () => {
      const mockResponse = { data: { requests: [], count: 0 } };

      api.get.mockResolvedValue(mockResponse);

      const result = await membershipApi.getOwnerMembershipRequests('approved');

      expect(api.get).toHaveBeenCalledWith('/membership/owner/requests/', { params: { status: 'approved' } });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getManagerPendingRequests', () => {
    it('should call GET /membership/manager/pending/', async () => {
      const mockResponse = { data: { requests: [], count: 0 } };

      api.get.mockResolvedValue(mockResponse);

      const result = await membershipApi.getManagerPendingRequests();

      expect(api.get).toHaveBeenCalledWith('/membership/manager/pending/');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getMembershipRequest', () => {
    it('should call GET /membership/{requestId}/', async () => {
      const mockResponse = { data: { request_id: 1, full_name: 'Test' } };

      api.get.mockResolvedValue(mockResponse);

      const result = await membershipApi.getMembershipRequest(1);

      expect(api.get).toHaveBeenCalledWith('/membership/1/');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('approveMembershipRequestByOwner', () => {
    it('should call POST /membership/{requestId}/approve-by-owner/', async () => {
      const mockResponse = { data: { message: 'Approved' } };

      api.post.mockResolvedValue(mockResponse);

      const result = await membershipApi.approveMembershipRequestByOwner(1);

      expect(api.post).toHaveBeenCalledWith('/membership/1/approve-by-owner/');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('approveMembershipRequestByManager', () => {
    it('should call POST /membership/{requestId}/approve-by-manager/', async () => {
      const mockResponse = { data: { message: 'Approved by manager' } };

      api.post.mockResolvedValue(mockResponse);

      const result = await membershipApi.approveMembershipRequestByManager(1);

      expect(api.post).toHaveBeenCalledWith('/membership/1/approve-by-manager/');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('rejectMembershipRequest', () => {
    it('should call POST /membership/{requestId}/reject/ with reason', async () => {
      const mockResponse = { data: { message: 'Rejected' } };

      api.post.mockResolvedValue(mockResponse);

      const result = await membershipApi.rejectMembershipRequest(1, 'Invalid data');

      expect(api.post).toHaveBeenCalledWith('/membership/1/reject/', {
        rejection_reason: 'Invalid data'
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getPendingOwnerApprovalRequests', () => {
    it('should call GET /membership/owner/pending-approval/', async () => {
      const mockResponse = { data: { requests: [], count: 0 } };

      api.get.mockResolvedValue(mockResponse);

      const result = await membershipApi.getPendingOwnerApprovalRequests();

      expect(api.get).toHaveBeenCalledWith('/membership/owner/pending-approval/');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createFamilyInvitation', () => {
    it('should call POST /membership/family/invite/', async () => {
      const mockData = {
        building: 1,
        unit_number: '101',
        invited_phone: '09123456789'
      };
      const mockResponse = { data: { invitation_id: 1 } };

      api.post.mockResolvedValue(mockResponse);

      const result = await membershipApi.createFamilyInvitation(mockData);

      expect(api.post).toHaveBeenCalledWith('/membership/family/invite/', mockData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('listFamilyInvitations', () => {
    it('should call GET /membership/family/invitations/', async () => {
      const mockResponse = { data: { invitations: [], count: 0 } };

      api.get.mockResolvedValue(mockResponse);

      const result = await membershipApi.listFamilyInvitations();

      expect(api.get).toHaveBeenCalledWith('/membership/family/invitations/');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('acceptFamilyInvitation', () => {
    it('should call POST /membership/family/accept/{code}/', async () => {
      const mockResponse = { data: { message: 'Accepted' } };

      api.post.mockResolvedValue(mockResponse);

      const result = await membershipApi.acceptFamilyInvitation('ABC123');

      expect(api.post).toHaveBeenCalledWith('/membership/family/accept/ABC123/');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('reportUnitConflict', () => {
    it('should call POST /membership/conflict/report/', async () => {
      const mockData = {
        building: 1,
        unit_number: '101',
        reason: 'Conflict reason'
      };
      const mockResponse = { data: { report_id: 1 } };

      api.post.mockResolvedValue(mockResponse);

      const result = await membershipApi.reportUnitConflict(mockData);

      expect(api.post).toHaveBeenCalledWith('/membership/conflict/report/', mockData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('listConflictReports', () => {
    it('should call GET /membership/conflict/list/', async () => {
      const mockResponse = { data: { reports: [], count: 0 } };

      api.get.mockResolvedValue(mockResponse);

      const result = await membershipApi.listConflictReports();

      expect(api.get).toHaveBeenCalledWith('/membership/conflict/list/');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('resolveConflict', () => {
    it('should call POST /membership/conflict/{reportId}/resolve/', async () => {
      const mockData = { action: 'resolve', resolution_note: 'Fixed' };
      const mockResponse = { data: { message: 'Resolved' } };

      api.post.mockResolvedValue(mockResponse);

      const result = await membershipApi.resolveConflict(1, mockData);

      expect(api.post).toHaveBeenCalledWith('/membership/conflict/1/resolve/', mockData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('withdrawMembershipRequest', () => {
    it('should call POST /membership/{requestId}/withdraw/', async () => {
      const mockResponse = { data: { message: 'Withdrawn' } };

      api.post.mockResolvedValue(mockResponse);

      const result = await membershipApi.withdrawMembershipRequest(1);

      expect(api.post).toHaveBeenCalledWith('/membership/1/withdraw/');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createInviteLink', () => {
    it('should call POST /membership/invite-link/create/', async () => {
      const mockData = { building: 1, unit_number: '101', role: 'resident' };
      const mockResponse = { data: { link_id: 1, token: 'token123' } };

      api.post.mockResolvedValue(mockResponse);

      const result = await membershipApi.createInviteLink(mockData);

      expect(api.post).toHaveBeenCalledWith('/membership/invite-link/create/', mockData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('validateInviteLink', () => {
    it('should call GET /membership/invite-link/validate/{token}/', async () => {
      const mockResponse = { data: { link_id: 1, building: { title: 'Test' } } };

      api.get.mockResolvedValue(mockResponse);

      const result = await membershipApi.validateInviteLink('token123');

      expect(api.get).toHaveBeenCalledWith('/membership/invite-link/validate/token123/');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('useInviteLink', () => {
    it('should call POST /membership/invite-link/use/{token}/', async () => {
      const mockResponse = { data: { message: 'Used successfully' } };

      api.post.mockResolvedValue(mockResponse);

      const result = await membershipApi.useInviteLink('token123');

      expect(api.post).toHaveBeenCalledWith('/membership/invite-link/use/token123/');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('registerSuggestedUser', () => {
    it('should call POST /membership/suggest-user/', async () => {
      const mockData = {
        building_code: 'ABC123',
        full_name: 'Suggested User',
        phone_number: '09123456789'
      };
      const mockResponse = { data: { request_id: 1, status: 'suggested' } };

      api.post.mockResolvedValue(mockResponse);

      const result = await membershipApi.registerSuggestedUser(mockData);

      expect(api.post).toHaveBeenCalledWith('/membership/suggest-user/', mockData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('joinByManagerPhone', () => {
    it('should call POST /membership/join-by-manager-phone/', async () => {
      const mockData = {
        manager_phone: '09123456789',
        full_name: 'Test User',
        phone_number: '09198765432'
      };
      const mockResponse = { data: { request_id: 1, message: 'Success' } };

      api.post.mockResolvedValue(mockResponse);

      const result = await membershipApi.joinByManagerPhone(mockData);

      expect(api.post).toHaveBeenCalledWith('/membership/join-by-manager-phone/', mockData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('transferBuildingManagement', () => {
    it('should call POST /buildings/{buildingId}/transfer-management/', async () => {
      const mockData = { new_manager_phone: '09123456789' };
      const mockResponse = { data: { message: 'Transferred' } };

      api.post.mockResolvedValue(mockResponse);

      const result = await membershipApi.transferBuildingManagement(1, mockData);

      expect(api.post).toHaveBeenCalledWith('/buildings/1/transfer-management/', mockData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getUnitByPhone', () => {
    it('should call GET /buildings/units/by-phone/ with phone parameter', async () => {
      const mockResponse = { data: { unit: { unit_number: '101' } } };

      api.get.mockResolvedValue(mockResponse);

      const result = await membershipApi.getUnitByPhone('09123456789');

      expect(api.get).toHaveBeenCalledWith('/buildings/units/by-phone/?phone_number=09123456789');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle empty phone number', async () => {
      const mockResponse = { data: { unit: null } };

      api.get.mockResolvedValue(mockResponse);

      const result = await membershipApi.getUnitByPhone('');

      expect(api.get).toHaveBeenCalledWith('/buildings/units/by-phone/?phone_number=');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('debugAllRequests', () => {
    it('should call GET /membership/debug/all/', async () => {
      const mockResponse = { data: { user_info: {}, all_requests: [] } };

      api.get.mockResolvedValue(mockResponse);

      const result = await membershipApi.debugAllRequests();

      expect(api.get).toHaveBeenCalledWith('/membership/debug/all/');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
