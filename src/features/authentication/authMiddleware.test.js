import authMiddleware from './authMiddleware';
import { jest, expect, describe, beforeEach, it } from '@jest/globals';

describe('authMiddleware', () => {
    let store;
    let next;
    let action;

    beforeEach(() => {
        // Explicitly mock localStorage using the imported jest
        Object.defineProperty(global, 'localStorage', {
            value: {
                getItem: jest.fn(),
                setItem: jest.fn(),
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
                        password: 'hashed_password_123', // Sensitive data
                        email: 'test@example.com',
                        role: 'resident'
                    },
                    tokens: {
                        access: 'secret_access_token_123', // Sensitive data
                        refresh: 'secret_refresh_token_456' // Sensitive data
                    },
                    isAuthenticated: true
                }
            }))
        };
        next = jest.fn((action) => action);
    });

    it('should NOT persist tokens and sensitive user data to localStorage', () => {
        action = { type: 'auth/login/fulfilled' };
        authMiddleware(store)(next)(action);

        expect(global.localStorage.setItem).toHaveBeenCalledTimes(1);
        const [key, value] = global.localStorage.setItem.mock.calls[0];

        expect(key).toBe('auth');

        const storedAuth = JSON.parse(value);

        // Tokens should be nullified in storage
        expect(storedAuth.tokens.access).toBeNull();
        expect(storedAuth.tokens.refresh).toBeNull();

        // User should be sanitized
        expect(storedAuth.user.password).toBeUndefined();
        expect(storedAuth.user.username).toBe('testuser');
        expect(storedAuth.user.email).toBe('test@example.com');

        // isAuthenticated should remain
        expect(storedAuth.isAuthenticated).toBe(true);
    });
});
