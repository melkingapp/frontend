import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import authMiddleware from './authMiddleware';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('authMiddleware', () => {
  let store;
  let next;
  let action;

  beforeEach(() => {
    window.localStorage.clear();
    next = jest.fn();
    store = {
      getState: jest.fn()
    };
  });

  it('should sanitize user data before saving to localStorage', () => {
    const sensitiveUser = {
      id: 1,
      username: 'testuser',
      password: 'secret_password', // Sensitive!
      hashed_password: 'hashed_secret', // Sensitive!
      role: 'admin'
    };

    store.getState.mockReturnValue({
      auth: {
        user: sensitiveUser,
        tokens: { access: 'token', refresh: 'refresh' },
        isAuthenticated: true
      }
    });

    action = { type: 'auth/login/fulfilled' };

    authMiddleware(store)(next)(action);

    const savedAuthJson = window.localStorage.getItem('auth');
    expect(savedAuthJson).not.toBeNull();

    const savedAuth = JSON.parse(savedAuthJson);

    // Core verification
    expect(savedAuth.user).toBeDefined();
    expect(savedAuth.user.username).toBe('testuser');

    // Check that sensitive fields are GONE
    expect(savedAuth.user.password).toBeUndefined();
    expect(savedAuth.user.hashed_password).toBeUndefined();
  });
});
