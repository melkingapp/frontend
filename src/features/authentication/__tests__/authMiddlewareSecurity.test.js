import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import authMiddleware from '../authMiddleware';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock security utils
// We mock this because we will add this import to the middleware
jest.mock('../../../shared/utils/security', () => ({
  sanitizeUser: jest.fn(user => {
    // Simple mock implementation of sanitization
    // In reality, it whitelist fields. Here we just mark it.
    const { password, ...rest } = user;
    return { ...rest, sanitized: true };
  }),
  sanitizeString: jest.fn(str => str)
}));

describe('authMiddleware Security', () => {
  let store;
  let next;

  beforeEach(() => {
    store = {
      getState: jest.fn()
    };
    next = jest.fn(action => action);
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should NOT persist sensitive tokens in localStorage', () => {
    // Setup state with sensitive data
    const sensitiveState = {
      auth: {
        user: { id: 1, username: 'admin', password: 'hashed_secret' },
        tokens: { access: 'secret_access_token', refresh: 'secret_refresh_token' },
        isAuthenticated: true
      }
    };

    store.getState.mockReturnValue(sensitiveState);

    // Action that triggers middleware persistence
    const action = { type: 'auth/login/fulfilled' };

    // Execute middleware
    authMiddleware(store)(next)(action);

    // Check localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth', expect.any(String));

    const storedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);

    // CRITICAL SECURITY ASSERTION: Tokens must NOT be persisted
    expect(storedData.tokens.access).toBeNull();
    expect(storedData.tokens.refresh).toBeNull();

    // Ensure the original secret token is definitively gone
    expect(storedData.tokens.access).not.toBe('secret_access_token');
  });

  it('should sanitize user object before persistence', () => {
    // Setup state
    const sensitiveState = {
      auth: {
        user: { id: 1, username: 'admin', password: 'hashed_secret' },
        tokens: { access: 'token', refresh: 'token' },
        isAuthenticated: true
      }
    };

    store.getState.mockReturnValue(sensitiveState);
    const action = { type: 'auth/updateProfile' };

    authMiddleware(store)(next)(action);

    const storedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);

    // Verify sanitization was applied
    // (Our mock removes 'password' and adds 'sanitized: true')
    expect(storedData.user.password).toBeUndefined();
    expect(storedData.user.sanitized).toBe(true);
  });
});
