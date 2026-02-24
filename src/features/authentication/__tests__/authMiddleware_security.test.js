import { configureStore } from '@reduxjs/toolkit';

// Mock apiConfig first to avoid import.meta usage
jest.mock('../../../shared/utils/apiConfig', () => ({
  getApiBaseUrl: () => 'http://localhost:8000/api/v1',
  getMediaBaseUrl: () => 'http://localhost:8000',
}));

import authReducer, { registerUser, loginUser, refreshToken } from '../authSlice';
import authMiddleware from '../authMiddleware';

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

// Mock apiService because thunks use it
jest.mock('../../../shared/services/authService', () => ({
  register: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
  logout: jest.fn(),
}));

describe('authMiddleware Security Check', () => {
  let store;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    store = configureStore({
      reducer: {
        auth: authReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authMiddleware),
    });
  });

  it('should NOT persist tokens in localStorage when they are present in state', async () => {
    // 1. Arrange: Dispatch an action that sets tokens in state
    // We can dispatch the fulfilled action of a thunk directly to bypass the async logic and mocking
    // Or we can just dispatch a dummy action if the reducer handles it, but authSlice handles specific thunks.
    // Let's use the registerUser.fulfilled action type manually.

    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'resident',
      password: 'hashed_password_leak', // Should be sanitized
    };

    const mockTokens = {
      access: 'secret_access_token_123',
      refresh: 'secret_refresh_token_456',
    };

    // Simulate registerUser.fulfilled
    store.dispatch({
      type: registerUser.fulfilled.type,
      payload: {
        user: mockUser,
        tokens: mockTokens,
      },
    });

    // 2. Act: The middleware should have run

    // 3. Assert: Check localStorage 'auth' key
    const storedAuth = JSON.parse(localStorage.getItem('auth'));

    expect(storedAuth).toBeDefined();

    // Check for Tokens Leak
    // VULNERABILITY CHECK: If this passes, the vulnerability exists (tokens are leaked)
    // We expect this to FAIL after the fix.
    // For now, let's assert what we expect strictly for security:

    // Tokens should be null in localStorage
    expect(storedAuth.tokens.access).toBeNull();
    expect(storedAuth.tokens.refresh).toBeNull();

    // User should be sanitized
    expect(storedAuth.user.password).toBeUndefined();
    expect(storedAuth.user.email).toBe('test@example.com');
  });
});
