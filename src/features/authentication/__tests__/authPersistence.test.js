import { describe, test, expect, beforeEach, jest } from '@jest/globals';

describe('Auth Persistence', () => {
    let authMiddleware;
    let storeMock;
    let nextMock;
    let localStorageMock;

    beforeEach(async () => {
        jest.clearAllMocks();

        // Mock localStorage
        localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
        };

        Object.defineProperty(global, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        // Import the middleware
        // We use relative path
        const module = await import('../authMiddleware.js');
        authMiddleware = module.default;

        storeMock = {
            getState: jest.fn()
        };
        nextMock = jest.fn(action => action);
    });

    test('authMiddleware should sanitize auth state and sync tokens to localStorage', () => {
        const mockAuth = {
            user: { id: 1, name: 'Test' },
            tokens: { access: 'secret_access', refresh: 'secret_refresh' },
            loading: true,
            error: 'Some error',
            isAuthenticated: true
        };

        storeMock.getState.mockReturnValue({ auth: mockAuth });

        const action = { type: 'auth/login/fulfilled' };

        // Execute middleware
        authMiddleware(storeMock)(nextMock)(action);

        // Verify tokens are written to specific keys
        expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'secret_access');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'secret_refresh');

        // Verify auth object is sanitized
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth', expect.any(String));

        const savedDataCalls = localStorageMock.setItem.mock.calls.filter(call => call[0] === 'auth');
        const savedData = JSON.parse(savedDataCalls[0][1]);

        // Check sanitization
        expect(savedData.user).toEqual(mockAuth.user);
        expect(savedData.tokens.access).toBeNull();
        expect(savedData.tokens.refresh).toBeNull();
        expect(savedData.loading).toBe(false);
        expect(savedData.error).toBeNull();
    });

    test('authMiddleware should clear tokens on logout', () => {
        const mockAuth = {
            user: { },
            tokens: { access: null, refresh: null },
            loading: false,
            error: null
        };
        storeMock.getState.mockReturnValue({ auth: mockAuth });

        const action = { type: 'auth/logout' };
        authMiddleware(storeMock)(nextMock)(action);

        expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    test('authMiddleware should NOT update localStorage for non-auth actions', () => {
        const action = { type: 'building/fetch/fulfilled' };
        authMiddleware(storeMock)(nextMock)(action);
        // Should not call setItem for 'auth'
        expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
});
