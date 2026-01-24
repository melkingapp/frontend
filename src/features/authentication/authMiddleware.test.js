import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, test, jest, beforeEach } from '@jest/globals';

// Mocks MUST be defined before imports that use them to prevent syntax errors in dependencies
jest.mock('../../shared/utils/apiConfig', () => ({
  getApiBaseUrl: () => 'http://test-api',
  getMediaBaseUrl: () => 'http://test-media',
  getBaseUrl: () => 'http://test-base',
}));

jest.mock('../../shared/services/authService', () => ({
  login: jest.fn(),
  register: jest.fn(),
  refreshToken: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  isAuthenticated: jest.fn(),
}));

import authMiddleware from './authMiddleware';
import authReducer, { login } from './authSlice';

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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('authMiddleware Security Check', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authMiddleware),
    });
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('VULNERABILITY: Sensitive tokens are persisted to localStorage', () => {
    const sensitivePayload = {
      user: {
        id: 1,
        username: 'victim',
        password: 's3cret_password_hash', // Should not be here but simulating leak
        role: 'admin',
        email: 'test@example.com',
        phone_number: '09123456789'
      },
      tokens: {
        access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sensitive_access_token',
        refresh: 'sensitive_refresh_token'
      }
    };

    // Dispatch login action
    store.dispatch(login(sensitivePayload));

    // Check localStorage
    const storedAuthRaw = localStorage.getItem('auth');

    // Check if auth data exists
    expect(storedAuthRaw).not.toBeNull();

    const storedAuth = JSON.parse(storedAuthRaw);

    // This test confirms that the FIX WORKS.
    // The middleware should now sanitize the state.

    // Assertions that confirm the FIX:
    expect(localStorage.setItem).toHaveBeenCalled();

    // 1. Tokens are NOT leaked (should be null or undefined)
    expect(storedAuth.tokens.access).toBeNull();

    // 2. Sensitive user data is NOT leaked (password should be undefined)
    expect(storedAuth.user.password).toBeUndefined();

    // 3. Allowed fields ARE preserved
    expect(storedAuth.user.username).toBe('victim');
    expect(storedAuth.user.role).toBe('admin');
  });
});
