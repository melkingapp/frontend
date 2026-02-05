
import { jest } from '@jest/globals';

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock slice reducers to avoid complex dependencies
jest.mock('../../features/authentication/authSlice', () => ({
  __esModule: true,
  default: (state = { tokens: { access: null, refresh: null }, isAuthenticated: false }, action) => state,
}));
jest.mock('../../features/authentication/authMiddleware', () => ({
    __esModule: true,
    default: () => next => action => next(action),
}));
// Mock other reducers as simple functions
const mockReducer = (state = {}, action) => state;
jest.mock('../../features/manager/building/buildingSlice', () => ({ __esModule: true, default: mockReducer }));
jest.mock('../../features/manager/finance/store/slices/financeSlice', () => ({ __esModule: true, default: mockReducer }));
jest.mock('../../features/manager/notification/slices/lettersSlice', () => ({ __esModule: true, default: mockReducer }));
jest.mock('../../features/manager/notification/slices/servicesSlice', () => ({ __esModule: true, default: mockReducer }));
jest.mock('../../features/manager/notification/slices/surveysSlice', () => ({ __esModule: true, default: mockReducer }));
jest.mock('../../features/manager/finance/store/slices/expenseTypesSlice', () => ({ __esModule: true, default: mockReducer }));
jest.mock('../../features/manager/finance/store/slices/paymentsSlice', () => ({ __esModule: true, default: mockReducer }));
jest.mock('../../features/manager/finance/store/slices/extraPaymentSlice', () => ({ __esModule: true, default: mockReducer }));
jest.mock('../../features/manager/unitManagement/slices/unitsSlice', () => ({ __esModule: true, default: mockReducer }));
jest.mock('../../features/manager/unitManagement/slices/requestsSlice', () => ({ __esModule: true, default: mockReducer }));
jest.mock('../../features/manager/unitManagement/slices/transactionsSlice', () => ({ __esModule: true, default: mockReducer }));
jest.mock('../../features/resident/building/residentBuildingSlice', () => ({ __esModule: true, default: mockReducer }));
jest.mock('../../features/manager/building/slices/buildingResidentsSlice', () => ({ __esModule: true, default: mockReducer }));
jest.mock('../../features/membership/membershipSlice', () => ({ __esModule: true, default: mockReducer }));
jest.mock('../../features/profile/profileSlice', () => ({ __esModule: true, default: mockReducer }));
jest.mock('../../features/settings/settingsSlice', () => ({ __esModule: true, default: mockReducer }));

describe('store initialization', () => {
  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
  });

  it('should rehydrate tokens from access_token/refresh_token keys even if auth blob is empty of tokens', async () => {
    // Setup localStorage with sanitized auth blob (no tokens)
    const sanitizedAuth = {
      isAuthenticated: true,
      user: { id: 1, username: 'test' },
      tokens: { access: null, refresh: null } // Simulating stripped tokens
    };
    localStorage.setItem('auth', JSON.stringify(sanitizedAuth));

    // Setup independent tokens
    localStorage.setItem('access_token', 'independent_access_token');
    localStorage.setItem('refresh_token', 'independent_refresh_token');

    // Re-import store to trigger initialization
    const { default: store } = await import('../store.js');

    const state = store.getState();

    // This expects the FIX to be present. Currently it should fail.
    expect(state.auth.isAuthenticated).toBe(true);
    expect(state.auth.tokens.access).toBe('independent_access_token');
    expect(state.auth.tokens.refresh).toBe('independent_refresh_token');
  });
});
