
import authMiddleware from '../authMiddleware';
// We need to mock the security utils to verify they are called,
// OR we can use the real implementation to verify the end result.
// Using real implementation is better for integration testing the logic.
import { sanitizeUser } from '../../../shared/utils/security';

// Mock store
const createMockStore = (state) => ({
    getState: () => state,
    dispatch: jest.fn(),
});

describe('authMiddleware', () => {
    let store;
    let next;
    let invoke;

    beforeEach(() => {
        // Mock localStorage
        const localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
        };

        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        // Default mock store
        store = createMockStore({
            auth: {
                user: { id: 1, username: 'test' },
                tokens: { access: 'token', refresh: 'refresh' },
                isAuthenticated: true,
                loading: false,
                error: null
            }
        });
        next = jest.fn();
        invoke = (action) => authMiddleware(store)(next)(action);
    });

    test('should save auth state to localStorage on auth/ actions', () => {
        const action = { type: 'auth/login/fulfilled' };
        invoke(action);

        expect(next).toHaveBeenCalledWith(action);
        expect(window.localStorage.setItem).toHaveBeenCalledWith('auth', expect.any(String));
    });

    test('should NOT save auth state to localStorage on non-auth/ actions', () => {
        const action = { type: 'other/action' };
        invoke(action);

        expect(next).toHaveBeenCalledWith(action);
        expect(window.localStorage.setItem).not.toHaveBeenCalled();
    });

    test('should sanitize user data and exclude sensitive fields', () => {
        const sensitiveState = {
            auth: {
                user: {
                    id: 1,
                    username: 'admin',
                    password: 'hashed_secret', // Sensitive!
                    internal_notes: 'secret' // Sensitive!
                },
                tokens: { access: 'secret_token', refresh: 'secret_refresh' }, // Sensitive!
                isAuthenticated: true,
                loading: true, // Transient
                error: 'some error' // Transient
            }
        };

        store = createMockStore(sensitiveState);
        const action = { type: 'auth/updateProfile/fulfilled' };

        invoke(action);

        const storedData = JSON.parse(window.localStorage.setItem.mock.calls[0][1]);

        // Asserting the SECURE behavior
        expect(storedData.user.id).toBe(1);
        expect(storedData.user.username).toBe('admin');

        // Should NOT contain sensitive fields
        expect(storedData.user).not.toHaveProperty('password');
        expect(storedData.user).not.toHaveProperty('internal_notes');

        // Should NOT contain tokens (in the auth blob)
        expect(storedData).not.toHaveProperty('tokens');

        // Should NOT contain transient fields
        expect(storedData).not.toHaveProperty('loading');
        expect(storedData).not.toHaveProperty('error');

        // Should contain isAuthenticated
        expect(storedData.isAuthenticated).toBe(true);
    });
});
