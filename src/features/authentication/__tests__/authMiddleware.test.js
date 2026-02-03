import authMiddleware from '../authMiddleware';
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
});

describe('authMiddleware', () => {
  let store;
  let next;
  let action;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    store = {
      getState: jest.fn(() => ({
        auth: {
          user: {
              id: 1,
              username: 'testuser',
              role: 'admin',
              internal_flag: 'secret' // Field that should be sanitized
          },
          tokens: { access: 'access123', refresh: 'refresh123' },
          loading: true,
          error: 'some error',
          isAuthenticated: true,
        },
      })),
    };
    next = jest.fn((action) => action);
  });

  it('should save SANITIZED auth state AND persist tokens to separate keys', () => {
    action = { type: 'auth/login/fulfilled' };
    authMiddleware(store)(next)(action);

    // Verify tokens saved to separate keys
    expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'access123');
    expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh123');

    // Verify sanitized auth blob
    // Find the call for 'auth' key
    const authCall = localStorage.setItem.mock.calls.find(call => call[0] === 'auth');
    expect(authCall).toBeDefined();

    const savedAuth = JSON.parse(authCall[1]);

    // Check for Fix: Tokens are NULL in auth blob
    expect(savedAuth.tokens.access).toBeNull();
    expect(savedAuth.tokens.refresh).toBeNull();

    // Check for Fix: internal_flag is REMOVED
    expect(savedAuth.user.internal_flag).toBeUndefined();
    expect(savedAuth.user.username).toBe('testuser'); // Allowed field

    // Check loading/error are reset
    expect(savedAuth.loading).toBe(false);
    expect(savedAuth.error).toBeNull();
  });

  it('should remove tokens from separate keys on logout', () => {
      // Mock store for logout state (tokens are null)
      store.getState.mockReturnValue({
        auth: {
          user: {},
          tokens: { access: null, refresh: null },
          loading: false,
          error: null,
          isAuthenticated: false,
        }
      });

      action = { type: 'auth/logout' };
      authMiddleware(store)(next)(action);

      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');

      // Auth blob should still be saved (sanitized)
      expect(localStorage.setItem).toHaveBeenCalledWith('auth', expect.any(String));
  });
});
