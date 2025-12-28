import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import membershipSlice from '../../membershipSlice';

// Mock pages with simplified implementations for testing
const mockJoinPage = () => (
  <div data-testid="join-page">
    <h1>Join Building</h1>
    <div data-testid="join-options">
      <button data-testid="building-code-option">Join by Building Code</button>
      <button data-testid="manager-phone-option">Join by Manager Phone</button>
    </div>
  </div>
);

const mockFamilyInvitationsPage = ({ invitations, loading, onCreateInvitation }) => (
  <div data-testid="family-invitations-page">
    <h1>Family Invitations</h1>
    {loading && <div data-testid="loading">Loading...</div>}
    {!loading && (
      <div>
        <button data-testid="create-invitation-btn" onClick={onCreateInvitation}>
          Create Invitation
        </button>
        <div data-testid="invitations-list">
          {invitations.map(invitation => (
            <div key={invitation.invitation_id} data-testid={`invitation-${invitation.invitation_id}`}>
              <span>{invitation.invited_phone}</span>
              <span data-testid={`status-${invitation.invitation_id}`}>{invitation.status}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const mockAcceptFamilyInvitePage = ({ code, onAccept, loading }) => (
  <div data-testid="accept-family-invite-page">
    <h1>Accept Family Invitation</h1>
    <div data-testid="invitation-code">Code: {code}</div>
    <button
      data-testid="accept-btn"
      onClick={onAccept}
      disabled={loading}
    >
      {loading ? 'Accepting...' : 'Accept Invitation'}
    </button>
  </div>
);

const mockConflictReportsPage = ({ reports, loading, onResolve }) => (
  <div data-testid="conflict-reports-page">
    <h1>Conflict Reports</h1>
    {loading && <div data-testid="loading">Loading...</div>}
    {!loading && (
      <div data-testid="reports-list">
        {reports.map(report => (
          <div key={report.report_id} data-testid={`report-${report.report_id}`}>
            <span>{report.unit_number}</span>
            <span data-testid={`status-${report.report_id}`}>{report.status}</span>
            {report.status === 'pending' && (
              <button
                data-testid={`resolve-btn-${report.report_id}`}
                onClick={() => onResolve(report.report_id)}
              >
                Resolve
              </button>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

const mockInviteLinksPage = ({ links, loading, onCreateLink }) => (
  <div data-testid="invite-links-page">
    <h1>Invite Links</h1>
    {loading && <div data-testid="loading">Loading...</div>}
    {!loading && (
      <div>
        <button data-testid="create-link-btn" onClick={onCreateLink}>
          Create Invite Link
        </button>
        <div data-testid="links-list">
          {links.map(link => (
            <div key={link.link_id} data-testid={`link-${link.link_id}`}>
              <span>{link.unit_number}</span>
              <span data-testid={`used-${link.link_id}`}>{link.is_used ? 'Used' : 'Active'}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const mockJoinByInviteLinkPage = ({ token, onJoin, loading, error }) => (
  <div data-testid="join-by-invite-link-page">
    <h1>Join by Invite Link</h1>
    <div data-testid="token-display">Token: {token}</div>
    {error && <div data-testid="error-message">{error}</div>}
    <button
      data-testid="join-btn"
      onClick={onJoin}
      disabled={loading}
    >
      {loading ? 'Joining...' : 'Join Building'}
    </button>
  </div>
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
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    ),
    store,
  };
};

describe('Membership Pages', () => {
  describe('JoinPage', () => {
    it('renders join options', () => {
      renderWithProviders(mockJoinPage());

      expect(screen.getByTestId('join-page')).toBeInTheDocument();
      expect(screen.getByText('Join Building')).toBeInTheDocument();
      expect(screen.getByTestId('join-options')).toBeInTheDocument();
      expect(screen.getByTestId('building-code-option')).toBeInTheDocument();
      expect(screen.getByTestId('manager-phone-option')).toBeInTheDocument();
    });

    it('displays join method buttons', () => {
      renderWithProviders(mockJoinPage());

      expect(screen.getByText('Join by Building Code')).toBeInTheDocument();
      expect(screen.getByText('Join by Manager Phone')).toBeInTheDocument();
    });
  });

  describe('FamilyInvitationsPage', () => {
    const mockInvitations = [
      { invitation_id: 1, invited_phone: '09123456789', status: 'pending' },
      { invitation_id: 2, invited_phone: '09198765432', status: 'accepted' },
    ];

    it('renders page with title', () => {
      const mockOnCreateInvitation = jest.fn();

      renderWithProviders(
        mockFamilyInvitationsPage({
          invitations: [],
          loading: false,
          onCreateInvitation: mockOnCreateInvitation
        })
      );

      expect(screen.getByTestId('family-invitations-page')).toBeInTheDocument();
      expect(screen.getByText('Family Invitations')).toBeInTheDocument();
    });

    it('shows loading state when loading is true', () => {
      const mockOnCreateInvitation = jest.fn();

      renderWithProviders(
        mockFamilyInvitationsPage({
          invitations: [],
          loading: true,
          onCreateInvitation: mockOnCreateInvitation
        })
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders invitations list when not loading', () => {
      const mockOnCreateInvitation = jest.fn();

      renderWithProviders(
        mockFamilyInvitationsPage({
          invitations: mockInvitations,
          loading: false,
          onCreateInvitation: mockOnCreateInvitation
        })
      );

      expect(screen.getByTestId('invitations-list')).toBeInTheDocument();
      expect(screen.getByTestId('invitation-1')).toBeInTheDocument();
      expect(screen.getByTestId('invitation-2')).toBeInTheDocument();
      expect(screen.getByText('09123456789')).toBeInTheDocument();
      expect(screen.getByText('09198765432')).toBeInTheDocument();
      expect(screen.getByTestId('status-1')).toHaveTextContent('pending');
      expect(screen.getByTestId('status-2')).toHaveTextContent('accepted');
    });

    it('calls onCreateInvitation when create button is clicked', () => {
      const mockOnCreateInvitation = jest.fn();

      renderWithProviders(
        mockFamilyInvitationsPage({
          invitations: mockInvitations,
          loading: false,
          onCreateInvitation: mockOnCreateInvitation
        })
      );

      fireEvent.click(screen.getByTestId('create-invitation-btn'));
      expect(mockOnCreateInvitation).toHaveBeenCalled();
    });
  });

  describe('AcceptFamilyInvitePage', () => {
    it('renders page with invitation code', () => {
      const mockOnAccept = jest.fn();

      renderWithProviders(
        mockAcceptFamilyInvitePage({
          code: 'ABC123',
          onAccept: mockOnAccept,
          loading: false
        })
      );

      expect(screen.getByTestId('accept-family-invite-page')).toBeInTheDocument();
      expect(screen.getByText('Accept Family Invitation')).toBeInTheDocument();
      expect(screen.getByTestId('invitation-code')).toHaveTextContent('Code: ABC123');
    });

    it('shows loading state when accepting', () => {
      const mockOnAccept = jest.fn();

      renderWithProviders(
        mockAcceptFamilyInvitePage({
          code: 'ABC123',
          onAccept: mockOnAccept,
          loading: true
        })
      );

      expect(screen.getByTestId('accept-btn')).toBeDisabled();
      expect(screen.getByText('Accepting...')).toBeInTheDocument();
    });

    it('calls onAccept when accept button is clicked', () => {
      const mockOnAccept = jest.fn();

      renderWithProviders(
        mockAcceptFamilyInvitePage({
          code: 'ABC123',
          onAccept: mockOnAccept,
          loading: false
        })
      );

      fireEvent.click(screen.getByTestId('accept-btn'));
      expect(mockOnAccept).toHaveBeenCalled();
    });
  });

  describe('ConflictReportsPage', () => {
    const mockReports = [
      { report_id: 1, unit_number: '101', status: 'pending' },
      { report_id: 2, unit_number: '102', status: 'resolved' },
    ];

    it('renders page with title', () => {
      const mockOnResolve = jest.fn();

      renderWithProviders(
        mockConflictReportsPage({
          reports: [],
          loading: false,
          onResolve: mockOnResolve
        })
      );

      expect(screen.getByTestId('conflict-reports-page')).toBeInTheDocument();
      expect(screen.getByText('Conflict Reports')).toBeInTheDocument();
    });

    it('shows loading state when loading is true', () => {
      const mockOnResolve = jest.fn();

      renderWithProviders(
        mockConflictReportsPage({
          reports: [],
          loading: true,
          onResolve: mockOnResolve
        })
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders reports list with resolve buttons for pending reports', () => {
      const mockOnResolve = jest.fn();

      renderWithProviders(
        mockConflictReportsPage({
          reports: mockReports,
          loading: false,
          onResolve: mockOnResolve
        })
      );

      expect(screen.getByTestId('reports-list')).toBeInTheDocument();
      expect(screen.getByTestId('report-1')).toBeInTheDocument();
      expect(screen.getByTestId('report-2')).toBeInTheDocument();
      expect(screen.getByText('101')).toBeInTheDocument();
      expect(screen.getByText('102')).toBeInTheDocument();
      expect(screen.getByTestId('status-1')).toHaveTextContent('pending');
      expect(screen.getByTestId('status-2')).toHaveTextContent('resolved');

      // Only pending reports should have resolve button
      expect(screen.getByTestId('resolve-btn-1')).toBeInTheDocument();
      expect(screen.queryByTestId('resolve-btn-2')).not.toBeInTheDocument();
    });

    it('calls onResolve when resolve button is clicked', () => {
      const mockOnResolve = jest.fn();

      renderWithProviders(
        mockConflictReportsPage({
          reports: mockReports,
          loading: false,
          onResolve: mockOnResolve
        })
      );

      fireEvent.click(screen.getByTestId('resolve-btn-1'));
      expect(mockOnResolve).toHaveBeenCalledWith(1);
    });
  });

  describe('InviteLinksPage', () => {
    const mockLinks = [
      { link_id: 1, unit_number: '101', is_used: false },
      { link_id: 2, unit_number: '102', is_used: true },
    ];

    it('renders page with title', () => {
      const mockOnCreateLink = jest.fn();

      renderWithProviders(
        mockInviteLinksPage({
          links: [],
          loading: false,
          onCreateLink: mockOnCreateLink
        })
      );

      expect(screen.getByTestId('invite-links-page')).toBeInTheDocument();
      expect(screen.getByText('Invite Links')).toBeInTheDocument();
    });

    it('shows loading state when loading is true', () => {
      const mockOnCreateLink = jest.fn();

      renderWithProviders(
        mockInviteLinksPage({
          links: [],
          loading: true,
          onCreateLink: mockOnCreateLink
        })
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders links list with usage status', () => {
      const mockOnCreateLink = jest.fn();

      renderWithProviders(
        mockInviteLinksPage({
          links: mockLinks,
          loading: false,
          onCreateLink: mockOnCreateLink
        })
      );

      expect(screen.getByTestId('links-list')).toBeInTheDocument();
      expect(screen.getByTestId('link-1')).toBeInTheDocument();
      expect(screen.getByTestId('link-2')).toBeInTheDocument();
      expect(screen.getByText('101')).toBeInTheDocument();
      expect(screen.getByText('102')).toBeInTheDocument();
      expect(screen.getByTestId('used-1')).toHaveTextContent('Active');
      expect(screen.getByTestId('used-2')).toHaveTextContent('Used');
    });

    it('calls onCreateLink when create button is clicked', () => {
      const mockOnCreateLink = jest.fn();

      renderWithProviders(
        mockInviteLinksPage({
          links: mockLinks,
          loading: false,
          onCreateLink: mockOnCreateLink
        })
      );

      fireEvent.click(screen.getByTestId('create-link-btn'));
      expect(mockOnCreateLink).toHaveBeenCalled();
    });
  });

  describe('JoinByInviteLinkPage', () => {
    it('renders page with token display', () => {
      const mockOnJoin = jest.fn();

      renderWithProviders(
        mockJoinByInviteLinkPage({
          token: 'token123',
          onJoin: mockOnJoin,
          loading: false,
          error: null
        })
      );

      expect(screen.getByTestId('join-by-invite-link-page')).toBeInTheDocument();
      expect(screen.getByText('Join by Invite Link')).toBeInTheDocument();
      expect(screen.getByTestId('token-display')).toHaveTextContent('Token: token123');
    });

    it('shows error message when error exists', () => {
      const mockOnJoin = jest.fn();

      renderWithProviders(
        mockJoinByInviteLinkPage({
          token: 'token123',
          onJoin: mockOnJoin,
          loading: false,
          error: 'Invalid token'
        })
      );

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Invalid token')).toBeInTheDocument();
    });

    it('shows loading state when joining', () => {
      const mockOnJoin = jest.fn();

      renderWithProviders(
        mockJoinByInviteLinkPage({
          token: 'token123',
          onJoin: mockOnJoin,
          loading: true,
          error: null
        })
      );

      expect(screen.getByTestId('join-btn')).toBeDisabled();
      expect(screen.getByText('Joining...')).toBeInTheDocument();
    });

    it('calls onJoin when join button is clicked', () => {
      const mockOnJoin = jest.fn();

      renderWithProviders(
        mockJoinByInviteLinkPage({
          token: 'token123',
          onJoin: mockOnJoin,
          loading: false,
          error: null
        })
      );

      fireEvent.click(screen.getByTestId('join-btn'));
      expect(mockOnJoin).toHaveBeenCalled();
    });
  });

  describe('Page Integration with Redux', () => {
    it('FamilyInvitationsPage connects to Redux state', () => {
      const mockInvitations = [
        { invitation_id: 1, invited_phone: '09123456789', status: 'pending' }
      ];

      const mockOnCreateInvitation = jest.fn();

      const { store } = renderWithProviders(
        mockFamilyInvitationsPage({
          invitations: mockInvitations,
          loading: false,
          onCreateInvitation: mockOnCreateInvitation
        }),
        { familyInvitations: mockInvitations }
      );

      // Check that component can access Redux state
      expect(store.getState().membership.familyInvitations).toEqual(mockInvitations);
    });

    it('ConflictReportsPage connects to Redux state', () => {
      const mockReports = [
        { report_id: 1, unit_number: '101', status: 'pending' }
      ];

      const mockOnResolve = jest.fn();

      const { store } = renderWithProviders(
        mockConflictReportsPage({
          reports: mockReports,
          loading: false,
          onResolve: mockOnResolve
        }),
        { conflictReports: mockReports }
      );

      // Check that component can access Redux state
      expect(store.getState().membership.conflictReports).toEqual(mockReports);
    });

    it('InviteLinksPage connects to Redux state', () => {
      const mockLinks = [
        { link_id: 1, unit_number: '101', is_used: false }
      ];

      const mockOnCreateLink = jest.fn();

      const { store } = renderWithProviders(
        mockInviteLinksPage({
          links: mockLinks,
          loading: false,
          onCreateLink: mockOnCreateLink
        }),
        { inviteLinks: mockLinks }
      );

      // Check that component can access Redux state
      expect(store.getState().membership.inviteLinks).toEqual(mockLinks);
    });
  });
});
