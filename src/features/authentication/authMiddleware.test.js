
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import authMiddleware from './authMiddleware';

// Mock sanitizeUser since it's an external dependency
// We want to test that authMiddleware CALLS it.
// However, since we are in a CJS/ESM mixed env, mocking modules might be tricky.
// But since we are testing integration with the real utility (if available),
// checking output is better.
// The real utility is imported by the middleware.

describe('authMiddleware', () => {
    let store;
    let next;
    let invoke;

    beforeEach(() => {
        store = {
            getState: jest.fn(() => ({
                auth: {
                    user: {
                        id: 1,
                        username: 'test',
                        password: 'hashed_password', // Sensitive field
                        role: 'resident'
                    },
                    tokens: {
                        access: 'access_token_123',
                        refresh: 'refresh_token_456'
                    },
                    isAuthenticated: true,
                    loading: false,
                    error: null
                }
            }))
        };
        next = jest.fn();
        invoke = (action) => authMiddleware(store)(next)(action);
        localStorage.clear();
    });

    test('secure: should NOT persist tokens and should sanitize user data', () => {
        const action = { type: 'auth/login/fulfilled' };
        invoke(action);

        const savedAuth = JSON.parse(localStorage.getItem('auth'));

        // 1. Tokens should NOT be persisted
        expect(savedAuth.tokens).toBeUndefined();

        // 2. User object SHOULD be sanitized
        // Check fields that SHOULD be there
        expect(savedAuth.user).toBeDefined();
        expect(savedAuth.user.username).toBe('test');
        expect(savedAuth.user.role).toBe('resident');

        // Check fields that should NOT be there (sanitized)
        expect(savedAuth.user.password).toBeUndefined();

        // 3. isAuthenticated should be preserved
        expect(savedAuth.isAuthenticated).toBe(true);
    });
});
