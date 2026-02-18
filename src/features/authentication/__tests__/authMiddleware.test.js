import authMiddleware from '../authMiddleware';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        clear: () => { store = {}; },
        removeItem: (key) => { delete store[key]; }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('authMiddleware', () => {
    let store;
    let next;
    let invoke;

    beforeEach(() => {
        store = {
            getState: jest.fn(),
            dispatch: jest.fn()
        };
        next = jest.fn();
        invoke = (action) => authMiddleware(store)(next)(action);
        window.localStorage.clear();
    });

    it('should save sanitized auth state to localStorage on auth/ actions', () => {
        const authState = {
            user: { id: 1, username: 'test' },
            tokens: { access: '123', refresh: '456' },
            isAuthenticated: true,
            loading: true, // Should be ignored
            error: 'some error' // Should be ignored
        };

        store.getState.mockReturnValue({ auth: authState });

        invoke({ type: 'auth/login/fulfilled' });

        const savedAuth = JSON.parse(window.localStorage.getItem('auth'));

        // Assert structure
        expect(savedAuth).toHaveProperty('user');
        expect(savedAuth).toHaveProperty('tokens');
        expect(savedAuth).toHaveProperty('isAuthenticated');

        // Assert user content
        expect(savedAuth.user).toEqual({ id: 1, username: 'test' });

        // Assert transient state is REMOVED
        expect(savedAuth).not.toHaveProperty('loading');
        expect(savedAuth).not.toHaveProperty('error');
    });

    it('should NOT save sensitive/extra fields in user object', () => {
        const sensitiveUser = {
            id: 1,
            username: 'test',
            password: 'secret_password', // Sensitive
            internal_flags: { is_admin: true }, // Extra
            credit_card: '1234' // Sensitive
        };

        const authState = {
            user: sensitiveUser,
            tokens: { access: '123', refresh: '456' },
            isAuthenticated: true,
            loading: false,
            error: null
        };

        store.getState.mockReturnValue({ auth: authState });

        invoke({ type: 'auth/login/fulfilled' });

        const savedAuth = JSON.parse(window.localStorage.getItem('auth'));

        // Assert sensitive fields are GONE
        expect(savedAuth.user).not.toHaveProperty('password');
        expect(savedAuth.user).not.toHaveProperty('internal_flags');
        expect(savedAuth.user).not.toHaveProperty('credit_card');

        // Assert allowed fields persist
        expect(savedAuth.user).toHaveProperty('id', 1);
        expect(savedAuth.user).toHaveProperty('username', 'test');
    });
});
