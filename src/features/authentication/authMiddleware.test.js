import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import authMiddleware from './authMiddleware';

describe('authMiddleware Security Check', () => {
  let store;
  let next;
  let action;

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

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  beforeEach(() => {
    store = {
      getState: jest.fn(),
    };
    next = jest.fn();
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('should sanitize user data before saving to localStorage', () => {
    const sensitiveUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      hashed_password: 'super_secret_hash', // SENSITIVE
      internal_metadata: 'do_not_expose', // SENSITIVE
      role: 'admin',
    };

    store.getState.mockReturnValue({
      auth: {
        user: sensitiveUser,
        tokens: { access: 'abc', refresh: 'def' },
        isAuthenticated: true,
      },
    });

    // Action that triggers the middleware
    action = { type: 'auth/loginUser/fulfilled' };

    authMiddleware(store)(next)(action);

    expect(window.localStorage.setItem).toHaveBeenCalled();

    const storedAuthCall = window.localStorage.setItem.mock.calls.find(call => call[0] === 'auth');
    const storedAuth = JSON.parse(storedAuthCall[1]);

    // Assert that sensitive fields are REMOVED
    expect(storedAuth.user).not.toHaveProperty('hashed_password');
    expect(storedAuth.user).not.toHaveProperty('internal_metadata');

    // Assert that allowed fields are PRESERVED
    expect(storedAuth.user).toHaveProperty('id', 1);
    expect(storedAuth.user).toHaveProperty('username', 'testuser');
    expect(storedAuth.user).toHaveProperty('email', 'test@example.com');
    expect(storedAuth.user).toHaveProperty('role', 'admin');
  });
});
