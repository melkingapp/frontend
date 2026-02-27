/* global describe, it, expect, beforeEach, jest */

// Mock apiConfig BEFORE any imports that use it
jest.mock('../../../shared/utils/apiConfig', () => ({
    getApiBaseUrl: () => 'http://127.0.0.1:8000/api/v1',
    getMediaBaseUrl: () => 'http://127.0.0.1:8000',
    __esModule: true // This is crucial for default exports, but good practice generally
}));

import authMiddleware from '../authMiddleware';
// We don't need authSlice if we construct actions manually,
// or we can mock it if it has heavy dependencies.
// For this test, we are testing middleware, so we can dispatch plain actions.

// Mock localStorage
const localStorageMock = (function () {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = value.toString();
        },
        removeItem: (key) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('authMiddleware Security', () => {
    let store;
    let next;

    beforeEach(() => {
        window.localStorage.clear();
        store = {
            getState: jest.fn(() => ({
                auth: {
                    user: {
                        id: 1,
                        username: 'testuser',
                        password: 'hashed_password', // Sensitive data that should NOT be persisted if sanitized
                        email: 'test@example.com'
                    },
                    tokens: {
                        access: 'secret_access_token',
                        refresh: 'secret_refresh_token'
                    },
                    isAuthenticated: true
                }
            })),
            dispatch: jest.fn()
        };
        next = jest.fn();
    });

    it('should NOT persist tokens in the auth state blob to localStorage', () => {
        const action = { type: 'auth/login' };
        authMiddleware(store)(next)(action);

        const storedAuth = JSON.parse(window.localStorage.getItem('auth'));

        // This test fails if tokens ARE persisted (which is the current vulnerable behavior)
        // We expect it to FAIL initially.
        expect(storedAuth.tokens).toEqual({ access: null, refresh: null });
    });

    it('should persist sanitized user data', () => {
        const action = { type: 'auth/login' };
        authMiddleware(store)(next)(action);

        const storedAuth = JSON.parse(window.localStorage.getItem('auth'));

        // Should contain allowed fields
        expect(storedAuth.user).toHaveProperty('id', 1);
        expect(storedAuth.user).toHaveProperty('username', 'testuser');

        // Should NOT contain sensitive/unwhitelisted fields
        expect(storedAuth.user).not.toHaveProperty('password');
    });
});
