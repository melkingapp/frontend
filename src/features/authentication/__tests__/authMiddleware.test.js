import authMiddleware from '../authMiddleware';
import * as securityUtils from '../../../shared/utils/security';

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

// Spy on sanitizeUser
jest.spyOn(securityUtils, 'sanitizeUser').mockImplementation((user) => ({
    id: user.id,
    username: user.username,
    // explicitly excluding sensitive fields for test verification
}));

describe('authMiddleware', () => {
    let store;
    let next;
    let action;

    beforeEach(() => {
        // Reset mocks
        localStorageMock.setItem.mockClear();
        localStorageMock.getItem.mockClear();
        securityUtils.sanitizeUser.mockClear();

        // Mock store
        store = {
            getState: jest.fn(() => ({
                auth: {
                    user: {
                        id: 1,
                        username: 'testuser',
                        password: 'secretpassword', // Sensitive
                        social_security: '123-456-7890', // Sensitive
                    },
                    tokens: {
                        access: 'accessToken123', // Sensitive
                        refresh: 'refreshToken456', // Sensitive
                    },
                    isAuthenticated: true,
                    loading: false, // UI state
                    error: null, // UI state
                },
            })),
            dispatch: jest.fn(),
        };

        next = jest.fn();
    });

    it('should save sanitized auth state to localStorage on auth actions', () => {
        action = { type: 'auth/login/fulfilled', payload: {} };

        // Execute middleware
        authMiddleware(store)(next)(action);

        // Verify next(action) is called
        expect(next).toHaveBeenCalledWith(action);

        // Verify localStorage.setItem is called
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth', expect.any(String));

        const storedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);

        // Verify tokens are NOT stored
        expect(storedData).not.toHaveProperty('tokens');

        // Verify loading/error are NOT stored
        expect(storedData).not.toHaveProperty('loading');
        expect(storedData).not.toHaveProperty('error');

        // Verify user is stored and sanitized
        expect(storedData).toHaveProperty('user');
        expect(storedData.user).toEqual({
            id: 1,
            username: 'testuser',
        });

        // Verify sensitive fields are removed from user object
        expect(storedData.user).not.toHaveProperty('password');
        expect(storedData.user).not.toHaveProperty('social_security');

        // Verify sanitizeUser was called
        expect(securityUtils.sanitizeUser).toHaveBeenCalledWith(store.getState().auth.user);
    });

    it('should NOT save to localStorage for non-auth actions', () => {
        action = { type: 'other/action', payload: {} };

        authMiddleware(store)(next)(action);

        expect(next).toHaveBeenCalledWith(action);
        expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
});
