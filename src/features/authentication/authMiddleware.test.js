import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import authMiddleware from './authMiddleware';

describe('authMiddleware', () => {
    let store;
    let next;
    let action;

    beforeEach(() => {
        store = {
            getState: jest.fn(),
        };
        next = jest.fn();

        // Mock localStorage explicitly
        const localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
        };

        // We need to define it on the global object (window for jsdom)
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should NOT persist sensitive tokens to localStorage', () => {
        // Arrange
        const sensitiveState = {
            auth: {
                user: { id: 1, username: 'test', password: 'hashed_secret', email: 'test@example.com' },
                tokens: { access: 'secret_access_token', refresh: 'secret_refresh_token' },
                isAuthenticated: true
            }
        };
        store.getState.mockReturnValue(sensitiveState);
        action = { type: 'auth/login' };
        next.mockReturnValue('result');

        // Act
        authMiddleware(store)(next)(action);

        // Assert
        expect(window.localStorage.setItem).toHaveBeenCalledWith('auth', expect.any(String));

        const storedValue = JSON.parse(window.localStorage.setItem.mock.calls[0][1]);

        // Verify Security Fix
        expect(storedValue.tokens).toBeUndefined();
        expect(storedValue.user).toBeDefined();
        expect(storedValue.user.email).toBe('test@example.com');
        expect(storedValue.user.password).toBeUndefined(); // sanitizeUser should remove this
        expect(storedValue.isAuthenticated).toBe(true);
    });
});
