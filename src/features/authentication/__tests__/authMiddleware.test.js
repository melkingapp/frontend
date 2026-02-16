/* global describe, test, expect, jest, beforeEach */
import authMiddleware from '../authMiddleware';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock store
const mockStore = {
  getState: jest.fn(),
  dispatch: jest.fn(),
};

const next = jest.fn();

describe('authMiddleware Security Check', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('should not store tokens or sensitive data in localStorage', () => {
    const sensitiveUser = {
      id: 1,
      username: 'testuser',
      password_hash: 'secret_hash', // sensitive!
      role: 'admin',
      tokens: { access: '123', refresh: '456' } // sensitive!
    };

    const state = {
      auth: {
        user: sensitiveUser,
        tokens: { access: 'abc', refresh: 'def' }, // sensitive!
        isAuthenticated: true,
      },
    };

    mockStore.getState.mockReturnValue(state);

    const action = { type: 'auth/login/fulfilled' };

    authMiddleware(mockStore)(next)(action);

    expect(localStorageMock.setItem).toHaveBeenCalled();
    const storedAuth = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);

    // Check that sensitive data is NOT present
    // Tokens should be null or empty object, definitely not the sensitive tokens
    expect(storedAuth.tokens).toEqual({ access: null, refresh: null });

    // User should not have password_hash
    expect(storedAuth.user).not.toHaveProperty('password_hash');

    // User should have allowed fields
    expect(storedAuth.user).toHaveProperty('username', 'testuser');
  });
});
