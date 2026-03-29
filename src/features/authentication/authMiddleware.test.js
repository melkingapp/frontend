
import { jest } from '@jest/globals';
import authMiddleware from '../../features/authentication/authMiddleware';

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

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

// Mock console.log
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('Security Hardening', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem.mockClear();
    consoleLogSpy.mockClear();
  });

  test('authMiddleware does NOT leak tokens to localStorage', () => {
    const store = {
      getState: () => ({
        auth: {
          user: { id: 1, username: 'test' },
          tokens: { access: 'secret_access_token', refresh: 'secret_refresh_token' },
          isAuthenticated: true
        }
      })
    };
    const next = jest.fn();
    const action = { type: 'auth/login' };

    authMiddleware(store)(next)(action);

    // Verify auth is saved
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth', expect.any(String));

    // Verify tokens are NOT present in the saved JSON
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.user).toBeDefined();
    expect(savedData.isAuthenticated).toBe(true);
    expect(savedData.tokens).toBeUndefined();
    expect(JSON.stringify(savedData)).not.toContain('secret_access_token');
    expect(JSON.stringify(savedData)).not.toContain('secret_refresh_token');
  });
});
