
import authMiddleware from '../authMiddleware';

describe('authMiddleware', () => {
    let store;
    let next;
    let action;
    let setItemMock;

    const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashed_password', // Sensitive!
        tokens: { access: 'secret_access_token', refresh: 'secret_refresh_token' }, // Sensitive!
        role: 'admin',
        is_active: true,
        extra_sensitive_field: 'secret'
    };

    const mockAuth = {
        user: mockUser,
        tokens: { access: 'secret_access_token', refresh: 'secret_refresh_token' },
        isAuthenticated: true,
        loading: false,
        error: null
    };

    beforeEach(() => {
        store = {
            getState: jest.fn(() => ({ auth: mockAuth }))
        };
        next = jest.fn();
        action = { type: 'auth/someAction' };

        // Mock localStorage
        setItemMock = jest.fn();
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(),
                setItem: setItemMock,
                removeItem: jest.fn(),
                clear: jest.fn()
            },
            writable: true
        });
    });

    test('should sanitize auth state before saving to localStorage', () => {
        authMiddleware(store)(next)(action);

        expect(setItemMock).toHaveBeenCalledTimes(1);
        const storedValue = JSON.parse(setItemMock.mock.calls[0][1]);

        // Verify sensitive data is removed from user object
        expect(storedValue.user).not.toHaveProperty('password');
        expect(storedValue.user).not.toHaveProperty('tokens');
        expect(storedValue.user).not.toHaveProperty('extra_sensitive_field');

        // Verify tokens are nullified in the state root
        expect(storedValue.tokens).toEqual({ access: null, refresh: null });

        // Verify allowed fields exist
        expect(storedValue.user).toHaveProperty('id', 1);
        expect(storedValue.user).toHaveProperty('username', 'testuser');
        expect(storedValue.isAuthenticated).toBe(true);
    });

    test('should not sanitize or save if action is not auth/', () => {
        action = { type: 'other/action' };
        authMiddleware(store)(next)(action);
        expect(setItemMock).not.toHaveBeenCalled();
    });
});
