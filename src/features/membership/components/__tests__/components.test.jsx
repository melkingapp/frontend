import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import membershipSlice from '../../membershipSlice';

// Mock components
const mockJoinMethodSelector = ({ onMethodSelect }) => (
  <div data-testid="join-method-selector">
    <button data-testid="building-code-btn" onClick={() => onMethodSelect('building_code')}>
      Join by Building Code
    </button>
    <button data-testid="manager-phone-btn" onClick={() => onMethodSelect('manager_phone')}>
      Join by Manager Phone
    </button>
  </div>
);

const mockJoinByManagerPhoneForm = ({ onSubmit, onBack }) => (
  <form data-testid="join-by-manager-phone-form" onSubmit={(e) => {
    e.preventDefault();
    onSubmit({ manager_phone: '09123456789', full_name: 'Test User' });
  }}>
    <input data-testid="manager-phone-input" defaultValue="09123456789" />
    <input data-testid="full-name-input" defaultValue="Test User" />
    <button type="submit" data-testid="submit-btn">Submit</button>
    <button type="button" data-testid="back-btn" onClick={onBack}>Back</button>
  </form>
);

const mockMembershipRequestForm = ({ onSubmit, loading }) => (
  <form data-testid="membership-request-form" onSubmit={(e) => {
    e.preventDefault();
    onSubmit({
      building_code: 'ABC123',
      full_name: 'Test User',
      phone_number: '09123456789'
    });
  }}>
    <input data-testid="building-code-input" defaultValue="ABC123" />
    <input data-testid="full-name-input" defaultValue="Test User" />
    <input data-testid="phone-input" defaultValue="09123456789" />
    <button type="submit" data-testid="submit-btn" disabled={loading}>
      {loading ? 'Submitting...' : 'Submit'}
    </button>
  </form>
);

const mockTransferManagementModal = ({ isOpen, onClose, onConfirm, loading }) => (
  isOpen ? (
    <div data-testid="transfer-management-modal">
      <h3>Transfer Management</h3>
      <input data-testid="new-manager-phone" defaultValue="09123456789" />
      <button data-testid="confirm-btn" onClick={() => onConfirm({ new_manager_phone: '09123456789' })} disabled={loading}>
        {loading ? 'Transferring...' : 'Transfer'}
      </button>
      <button data-testid="close-btn" onClick={onClose}>Close</button>
    </div>
  ) : null
);

const mockMembershipRequestsList = ({ requests, onViewDetails, loading }) => (
  <div data-testid="membership-requests-list">
    {loading && <div data-testid="loading">Loading...</div>}
    {!loading && (
      <div>
        {requests.map(request => (
          <div key={request.request_id} data-testid={`request-${request.request_id}`}>
            <span>{request.full_name}</span>
            <span data-testid={`status-${request.request_id}`}>{request.status}</span>
            <button
              data-testid={`view-btn-${request.request_id}`}
              onClick={() => onViewDetails(request)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

const mockMembershipRequestDetailsModal = ({ request, isOpen, onClose, onApprove, onReject }) => (
  isOpen && request ? (
    <div data-testid="membership-request-details-modal">
      <h3>Request Details</h3>
      <div data-testid="request-full-name">{request.full_name}</div>
      <div data-testid="request-phone">{request.phone_number}</div>
      <div data-testid="request-unit">{request.unit_number}</div>
      <div data-testid={`request-status-${request.status}`}>{request.status}</div>
      <button data-testid="approve-btn" onClick={() => onApprove(request.request_id)}>
        Approve
      </button>
      <button data-testid="reject-btn" onClick={() => onReject(request.request_id, 'Reason')}>
        Reject
      </button>
      <button data-testid="close-modal-btn" onClick={onClose}>
        Close
      </button>
    </div>
  ) : null
);

// Create mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      membership: membershipSlice,
    },
    preloadedState: {
      membership: {
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
        ...initialState,
      },
    },
  });
};

const renderWithProviders = (component, initialState = {}) => {
  const store = createMockStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        {component}
      </Provider>
    ),
    store,
  };
};

describe('Membership Components', () => {
  describe('JoinMethodSelector', () => {
    it('renders join method options', () => {
      const mockOnMethodSelect = jest.fn();
      renderWithProviders(
        mockJoinMethodSelector({ onMethodSelect: mockOnMethodSelect })
      );

      expect(screen.getByTestId('join-method-selector')).toBeInTheDocument();
      expect(screen.getByTestId('building-code-btn')).toBeInTheDocument();
      expect(screen.getByTestId('manager-phone-btn')).toBeInTheDocument();
    });

    it('calls onMethodSelect with correct method when buttons are clicked', () => {
      const mockOnMethodSelect = jest.fn();
      renderWithProviders(
        mockJoinMethodSelector({ onMethodSelect: mockOnMethodSelect })
      );

      fireEvent.click(screen.getByTestId('building-code-btn'));
      expect(mockOnMethodSelect).toHaveBeenCalledWith('building_code');

      fireEvent.click(screen.getByTestId('manager-phone-btn'));
      expect(mockOnMethodSelect).toHaveBeenCalledWith('manager_phone');
    });
  });

  describe('JoinByManagerPhoneForm', () => {
    it('renders form with all inputs', () => {
      const mockOnSubmit = jest.fn();
      const mockOnBack = jest.fn();

      renderWithProviders(
        mockJoinByManagerPhoneForm({ onSubmit: mockOnSubmit, onBack: mockOnBack })
      );

      expect(screen.getByTestId('join-by-manager-phone-form')).toBeInTheDocument();
      expect(screen.getByTestId('manager-phone-input')).toBeInTheDocument();
      expect(screen.getByTestId('full-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
      expect(screen.getByTestId('back-btn')).toBeInTheDocument();
    });

    it('calls onSubmit with form data when submitted', () => {
      const mockOnSubmit = jest.fn();
      const mockOnBack = jest.fn();

      renderWithProviders(
        mockJoinByManagerPhoneForm({ onSubmit: mockOnSubmit, onBack: mockOnBack })
      );

      fireEvent.click(screen.getByTestId('submit-btn'));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        manager_phone: '09123456789',
        full_name: 'Test User'
      });
    });

    it('calls onBack when back button is clicked', () => {
      const mockOnSubmit = jest.fn();
      const mockOnBack = jest.fn();

      renderWithProviders(
        mockJoinByManagerPhoneForm({ onSubmit: mockOnSubmit, onBack: mockOnBack })
      );

      fireEvent.click(screen.getByTestId('back-btn'));
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('MembershipRequestForm', () => {
    it('renders form with all required inputs', () => {
      const mockOnSubmit = jest.fn();

      renderWithProviders(
        mockMembershipRequestForm({ onSubmit: mockOnSubmit, loading: false })
      );

      expect(screen.getByTestId('membership-request-form')).toBeInTheDocument();
      expect(screen.getByTestId('building-code-input')).toBeInTheDocument();
      expect(screen.getByTestId('full-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('phone-input')).toBeInTheDocument();
      expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
    });

    it('shows loading state when loading is true', () => {
      const mockOnSubmit = jest.fn();

      renderWithProviders(
        mockMembershipRequestForm({ onSubmit: mockOnSubmit, loading: true })
      );

      expect(screen.getByTestId('submit-btn')).toBeDisabled();
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });

    it('calls onSubmit with form data when submitted', () => {
      const mockOnSubmit = jest.fn();

      renderWithProviders(
        mockMembershipRequestForm({ onSubmit: mockOnSubmit, loading: false })
      );

      fireEvent.click(screen.getByTestId('submit-btn'));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        building_code: 'ABC123',
        full_name: 'Test User',
        phone_number: '09123456789'
      });
    });
  });

  describe('TransferManagementModal', () => {
    it('renders modal when isOpen is true', () => {
      const mockOnClose = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithProviders(
        mockTransferManagementModal({
          isOpen: true,
          onClose: mockOnClose,
          onConfirm: mockOnConfirm,
          loading: false
        })
      );

      expect(screen.getByTestId('transfer-management-modal')).toBeInTheDocument();
      expect(screen.getByText('Transfer Management')).toBeInTheDocument();
      expect(screen.getByTestId('new-manager-phone')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-btn')).toBeInTheDocument();
      expect(screen.getByTestId('close-btn')).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      const mockOnClose = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithProviders(
        mockTransferManagementModal({
          isOpen: false,
          onClose: mockOnClose,
          onConfirm: mockOnConfirm,
          loading: false
        })
      );

      expect(screen.queryByTestId('transfer-management-modal')).not.toBeInTheDocument();
    });

    it('shows loading state when loading is true', () => {
      const mockOnClose = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithProviders(
        mockTransferManagementModal({
          isOpen: true,
          onClose: mockOnClose,
          onConfirm: mockOnConfirm,
          loading: true
        })
      );

      expect(screen.getByTestId('confirm-btn')).toBeDisabled();
      expect(screen.getByText('Transferring...')).toBeInTheDocument();
    });

    it('calls onConfirm with form data when confirm button is clicked', () => {
      const mockOnClose = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithProviders(
        mockTransferManagementModal({
          isOpen: true,
          onClose: mockOnClose,
          onConfirm: mockOnConfirm,
          loading: false
        })
      );

      fireEvent.click(screen.getByTestId('confirm-btn'));
      expect(mockOnConfirm).toHaveBeenCalledWith({ new_manager_phone: '09123456789' });
    });

    it('calls onClose when close button is clicked', () => {
      const mockOnClose = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithProviders(
        mockTransferManagementModal({
          isOpen: true,
          onClose: mockOnClose,
          onConfirm: mockOnConfirm,
          loading: false
        })
      );

      fireEvent.click(screen.getByTestId('close-btn'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('MembershipRequestsList', () => {
    const mockRequests = [
      { request_id: 1, full_name: 'User One', status: 'pending' },
      { request_id: 2, full_name: 'User Two', status: 'manager_approved' },
    ];

    it('renders loading state when loading is true', () => {
      const mockOnViewDetails = jest.fn();

      renderWithProviders(
        mockMembershipRequestsList({
          requests: [],
          onViewDetails: mockOnViewDetails,
          loading: true
        })
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders requests list when not loading', () => {
      const mockOnViewDetails = jest.fn();

      renderWithProviders(
        mockMembershipRequestsList({
          requests: mockRequests,
          onViewDetails: mockOnViewDetails,
          loading: false
        })
      );

      expect(screen.getByTestId('membership-requests-list')).toBeInTheDocument();
      expect(screen.getByTestId('request-1')).toBeInTheDocument();
      expect(screen.getByTestId('request-2')).toBeInTheDocument();
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
      expect(screen.getByTestId('status-1')).toHaveTextContent('pending');
      expect(screen.getByTestId('status-2')).toHaveTextContent('manager_approved');
    });

    it('calls onViewDetails when view button is clicked', () => {
      const mockOnViewDetails = jest.fn();

      renderWithProviders(
        mockMembershipRequestsList({
          requests: mockRequests,
          onViewDetails: mockOnViewDetails,
          loading: false
        })
      );

      fireEvent.click(screen.getByTestId('view-btn-1'));
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockRequests[0]);
    });
  });

  describe('MembershipRequestDetailsModal', () => {
    const mockRequest = {
      request_id: 1,
      full_name: 'Test User',
      phone_number: '09123456789',
      unit_number: '101',
      status: 'pending'
    };

    it('renders modal with request details when isOpen is true', () => {
      const mockOnClose = jest.fn();
      const mockOnApprove = jest.fn();
      const mockOnReject = jest.fn();

      renderWithProviders(
        mockMembershipRequestDetailsModal({
          request: mockRequest,
          isOpen: true,
          onClose: mockOnClose,
          onApprove: mockOnApprove,
          onReject: mockOnReject
        })
      );

      expect(screen.getByTestId('membership-request-details-modal')).toBeInTheDocument();
      expect(screen.getByTestId('request-full-name')).toHaveTextContent('Test User');
      expect(screen.getByTestId('request-phone')).toHaveTextContent('09123456789');
      expect(screen.getByTestId('request-unit')).toHaveTextContent('101');
      expect(screen.getByTestId('request-status-pending')).toHaveTextContent('pending');
      expect(screen.getByTestId('approve-btn')).toBeInTheDocument();
      expect(screen.getByTestId('reject-btn')).toBeInTheDocument();
      expect(screen.getByTestId('close-modal-btn')).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      const mockOnClose = jest.fn();
      const mockOnApprove = jest.fn();
      const mockOnReject = jest.fn();

      renderWithProviders(
        mockMembershipRequestDetailsModal({
          request: mockRequest,
          isOpen: false,
          onClose: mockOnClose,
          onApprove: mockOnApprove,
          onReject: mockOnReject
        })
      );

      expect(screen.queryByTestId('membership-request-details-modal')).not.toBeInTheDocument();
    });

    it('does not render modal when request is null', () => {
      const mockOnClose = jest.fn();
      const mockOnApprove = jest.fn();
      const mockOnReject = jest.fn();

      renderWithProviders(
        mockMembershipRequestDetailsModal({
          request: null,
          isOpen: true,
          onClose: mockOnClose,
          onApprove: mockOnApprove,
          onReject: mockOnReject
        })
      );

      expect(screen.queryByTestId('membership-request-details-modal')).not.toBeInTheDocument();
    });

    it('calls onApprove with request ID when approve button is clicked', () => {
      const mockOnClose = jest.fn();
      const mockOnApprove = jest.fn();
      const mockOnReject = jest.fn();

      renderWithProviders(
        mockMembershipRequestDetailsModal({
          request: mockRequest,
          isOpen: true,
          onClose: mockOnClose,
          onApprove: mockOnApprove,
          onReject: mockOnReject
        })
      );

      fireEvent.click(screen.getByTestId('approve-btn'));
      expect(mockOnApprove).toHaveBeenCalledWith(1);
    });

    it('calls onReject with request ID and reason when reject button is clicked', () => {
      const mockOnClose = jest.fn();
      const mockOnApprove = jest.fn();
      const mockOnReject = jest.fn();

      renderWithProviders(
        mockMembershipRequestDetailsModal({
          request: mockRequest,
          isOpen: true,
          onClose: mockOnClose,
          onApprove: mockOnApprove,
          onReject: mockOnReject
        })
      );

      fireEvent.click(screen.getByTestId('reject-btn'));
      expect(mockOnReject).toHaveBeenCalledWith(1, 'Reason');
    });

    it('calls onClose when close button is clicked', () => {
      const mockOnClose = jest.fn();
      const mockOnApprove = jest.fn();
      const mockOnReject = jest.fn();

      renderWithProviders(
        mockMembershipRequestDetailsModal({
          request: mockRequest,
          isOpen: true,
          onClose: mockOnClose,
          onApprove: mockOnApprove,
          onReject: mockOnReject
        })
      );

      fireEvent.click(screen.getByTestId('close-modal-btn'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
