import { jest, describe, beforeEach, it, expect } from '@jest/globals';

// Mock localStorage
const localStorageMock = (() => {
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
  configurable: true
});

// Mock dependencies that might cause issues during store initialization
jest.mock('../../features/authentication/authSlice', () => {
    return {
        __esModule: true,
        default: (state = {
            user: {},
            tokens: { access: null, refresh: null }
        }, action) => state // Dummy reducer
    };
});
// Mock other reducers to keep it light
const dummyReducer = (state = {}, action) => state;
jest.mock('../../features/manager/building/buildingSlice', () => ({ __esModule: true, default: dummyReducer }));
jest.mock('../../features/manager/finance/store/slices/financeSlice', () => ({ __esModule: true, default: dummyReducer }));
jest.mock('../../features/manager/notification/slices/lettersSlice', () => ({ __esModule: true, default: dummyReducer }));
jest.mock('../../features/manager/notification/slices/servicesSlice', () => ({ __esModule: true, default: dummyReducer }));
jest.mock('../../features/manager/notification/slices/surveysSlice', () => ({ __esModule: true, default: dummyReducer }));
jest.mock('../../features/manager/finance/store/slices/expenseTypesSlice', () => ({ __esModule: true, default: dummyReducer }));
jest.mock('../../features/manager/finance/store/slices/paymentsSlice', () => ({ __esModule: true, default: dummyReducer }));
jest.mock('../../features/manager/finance/store/slices/extraPaymentSlice', () => ({ __esModule: true, default: dummyReducer }));
jest.mock('../../features/manager/unitManagement/slices/unitsSlice', () => ({ __esModule: true, default: dummyReducer }));
jest.mock('../../features/manager/unitManagement/slices/requestsSlice', () => ({ __esModule: true, default: dummyReducer }));
jest.mock('../../features/manager/unitManagement/slices/transactionsSlice', () => ({ __esModule: true, default: dummyReducer }));
jest.mock('../../features/resident/building/residentBuildingSlice', () => ({ __esModule: true, default: dummyReducer }));
jest.mock('../../features/manager/building/slices/buildingResidentsSlice', () => ({ __esModule: true, default: dummyReducer }));
jest.mock('../../features/membership/membershipSlice', () => ({ __esModule: true, default: dummyReducer }));
jest.mock('../../features/profile/profileSlice', () => ({ __esModule: true, default: dummyReducer }));
jest.mock('../../features/settings/settingsSlice', () => ({ __esModule: true, default: dummyReducer }));

// Mock authMiddleware
jest.mock('../../features/authentication/authMiddleware', () => () => next => action => next(action));

describe('Store Rehydration', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetModules();
  });

  it('should merge tokens from localStorage into auth state when initializing', async () => {
    // Setup:
    // 1. auth blob WITHOUT tokens (sanitized)
    // 2. tokens in separate keys
    const sanitizedAuth = {
        user: { id: 123, username: 'test' },
        isAuthenticated: true,
        // tokens is missing (simulating sanitized state)
    };

    localStorage.setItem('auth', JSON.stringify(sanitizedAuth));
    localStorage.setItem('access_token', 'access_token_123');
    localStorage.setItem('refresh_token', 'refresh_token_123');

    // Import store dynamically to trigger initialization
    const storeModule = await import('../store.js');
    const store = storeModule.default;

    const state = store.getState();

    // Verification
    // Since we mocked authSlice reducer to just return state,
    // the state should reflect what was passed as preloadedState
    expect(state.auth.tokens).toBeDefined();
    expect(state.auth.tokens.access).toBe('access_token_123');
    expect(state.auth.tokens.refresh).toBe('refresh_token_123');
    expect(state.auth.user.id).toBe(123);
  });

  it('should handle missing tokens in localStorage', async () => {
     const sanitizedAuth = {
        user: { id: 123 },
        isAuthenticated: true,
        tokens: { access: null, refresh: null } // Explicit nulls if saved that way or defaulted
    };
    localStorage.setItem('auth', JSON.stringify(sanitizedAuth));
    // No tokens set in separate keys

    const storeModule = await import('../store.js');
    const store = storeModule.default;
    const state = store.getState();

    // Tokens should remain null (or whatever was in savedAuth)
    // Since we haven't implemented the fix yet, this test just checks default behavior.
    // If the fix is NOT implemented, store.js loads exactly what is in 'auth'.
    expect(state.auth.user.id).toBe(123);
    if (state.auth.tokens) {
        expect(state.auth.tokens.access).toBeNull();
    }
  });
});
