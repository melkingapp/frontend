import authMiddleware from '../authMiddleware';

describe('authMiddleware', () => {
    let store;
    let next;
    let invoke;

    beforeEach(() => {
        localStorage.clear();
        store = {
            getState: jest.fn(),
        };
        next = jest.fn((action) => action);
        invoke = (action) => authMiddleware(store)(next)(action);
    });

    test('should persist sanitized user data to localStorage', () => {
        const sensitiveUser = {
            id: 1,
            username: 'test_user',
            email: 'test@example.com',
            password_hash: 'secret_hash_value', // Sensitive field
            internal_api_key: 'secret_api_key', // Sensitive field
            role: 'resident',
            is_active: true
        };

        const authState = {
            user: sensitiveUser,
            tokens: { access: 'token123', refresh: 'refresh123' },
            isAuthenticated: true,
            loading: false,
            error: null
        };

        store.getState.mockReturnValue({ auth: authState });

        const action = { type: 'auth/loginUser/fulfilled' };
        invoke(action);

        const storedAuth = JSON.parse(localStorage.getItem('auth'));

        // Ensure sensitive fields are removed
        expect(storedAuth.user).toHaveProperty('username', 'test_user');
        expect(storedAuth.user).not.toHaveProperty('password_hash');
        expect(storedAuth.user).not.toHaveProperty('internal_api_key');

        // Ensure tokens are still present
        expect(storedAuth).toHaveProperty('tokens');
        expect(storedAuth.tokens).toEqual(authState.tokens);
    });

    test('should only persist necessary fields (user, tokens, isAuthenticated)', () => {
         const authState = {
            user: { id: 1, username: 'user' },
            tokens: { access: 'token123', refresh: 'refresh123' },
            isAuthenticated: true,
            loading: true, // Should not be persisted as true (or at all)
            error: 'Some error' // Should not be persisted
        };

        store.getState.mockReturnValue({ auth: authState });

        const action = { type: 'auth/someAction' };
        invoke(action);

        const storedAuth = JSON.parse(localStorage.getItem('auth'));

        // These fields are transient and should not be persisted
        expect(storedAuth).not.toHaveProperty('loading');
        expect(storedAuth).not.toHaveProperty('error');
        expect(storedAuth).toHaveProperty('isAuthenticated', true);
    });
});
