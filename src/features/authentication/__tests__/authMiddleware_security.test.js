/* global describe, it, expect, beforeEach, jest */
import authMiddleware from '../authMiddleware';
import { sanitizeUser } from '../../../shared/utils/security';

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
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('authMiddleware Security', () => {
    let store;
    let next;
    let action;

    beforeEach(() => {
        window.localStorage.clear();
        jest.clearAllMocks();

        store = {
            getState: jest.fn().mockReturnValue({
                auth: {
                    user: {
                        id: 1,
                        username: 'testuser',
                        email: 'test@example.com',
                        password: 'supersecretpassword', // This should be sanitized
                        role: 'manager'
                    },
                    tokens: {
                        access: 'secret_access_token',
                        refresh: 'secret_refresh_token'
                    },
                    isAuthenticated: true
                }
            })
        };

        next = jest.fn();
    });

    it('should sanitize user and strip tokens before saving to localStorage on auth/ actions', () => {
        action = { type: 'auth/login' };

        authMiddleware(store)(next)(action);

        expect(next).toHaveBeenCalledWith(action);
        expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);

        // Assert the exact arguments passed to setItem
        const setItemCallArgs = window.localStorage.setItem.mock.calls[0];
        expect(setItemCallArgs[0]).toBe('auth');

        // Parse the stored JSON to verify its contents
        const storedAuth = JSON.parse(setItemCallArgs[1]);

        // Verify user is sanitized (e.g., password is removed)
        expect(storedAuth.user).toEqual(sanitizeUser(store.getState().auth.user));
        expect(storedAuth.user.password).toBeUndefined();

        // Ensure tokens are explicitly stripped
        expect(storedAuth.tokens).toEqual({ access: null, refresh: null });

        // Ensure other auth states (like isAuthenticated) remain intact
        expect(storedAuth.isAuthenticated).toBe(true);
    });

    it('should ignore non-auth actions', () => {
        action = { type: 'other/action' };

        authMiddleware(store)(next)(action);

        expect(next).toHaveBeenCalledWith(action);
        expect(window.localStorage.setItem).not.toHaveBeenCalled();
    });
});
