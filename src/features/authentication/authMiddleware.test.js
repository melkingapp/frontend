import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import authMiddleware from './authMiddleware';

describe('authMiddleware', () => {
  let store;
  let next;
  let action;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock localStorage methods
    const mockSetItem = jest.fn();
    const mockGetItem = jest.fn();

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true
    });

    store = {
      getState: jest.fn(() => ({
        auth: {
          user: {
            id: 1,
            username: 'testuser',
            password: 'hashedpassword', // Sensitive!
            role: 'manager'
          },
          tokens: {
            access: 'access-token-123', // Sensitive!
            refresh: 'refresh-token-456' // Sensitive!
          },
          isAuthenticated: true
        }
      }))
    };
    next = jest.fn(action => action);
  });

  afterEach(() => {
     jest.restoreAllMocks();
  });

  it('security fix: prevents tokens and sensitive user data from being persisted to localStorage', () => {
    action = { type: 'auth/login/fulfilled' };

    authMiddleware(store)(next)(action);

    expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);

    const [key, value] = window.localStorage.setItem.mock.calls[0];
    expect(key).toBe('auth');

    const parsedValue = JSON.parse(value);

    // VERIFY FIX: Tokens should NOT be persisted (should be null)
    expect(parsedValue.tokens).toBeDefined();
    expect(parsedValue.tokens.access).toBeNull();
    expect(parsedValue.tokens.refresh).toBeNull();

    // VERIFY FIX: Sensitive user data (password) should be removed
    expect(parsedValue.user.password).toBeUndefined();

    // Verify allowed fields are kept
    expect(parsedValue.user.username).toBe('testuser');
    expect(parsedValue.user.role).toBe('manager');
  });
});
