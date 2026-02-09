import authMiddleware from '../authMiddleware';

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

        // Mock localStorage
        const localStorageMock = (() => {
            let store = {};
            return {
                getItem: jest.fn(key => store[key] || null),
                setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
                removeItem: jest.fn(key => { delete store[key]; }),
                clear: jest.fn(() => { store = {}; })
            };
        })();

        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });
    });

    it('should sanitize sensitive data before saving to localStorage', () => {
        const sensitiveState = {
            auth: {
                user: {
                    id: 1,
                    username: 'testuser',
                    password: 'secretPassword',
                    internal_flags: 'secret',
                    role: 'admin',
                    phone_number: '1234567890'
                },
                tokens: {
                    access: 'access_token_123',
                    refresh: 'refresh_token_456'
                },
                isAuthenticated: true,
                loading: true, // Should not be stored
                error: 'Some error' // Should not be stored
            }
        };

        store.getState.mockReturnValue(sensitiveState);

        const action = { type: 'auth/login/fulfilled' };
        invoke(action);

        expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);

        const callArgs = window.localStorage.setItem.mock.calls[0];
        expect(callArgs[0]).toBe('auth');

        const storedAuth = JSON.parse(callArgs[1]);

        // Assertions for sanitized data
        expect(storedAuth.user).toEqual({
            id: 1,
            username: 'testuser',
            role: 'admin',
            phone_number: '1234567890'
        });

        expect(storedAuth.user).not.toHaveProperty('password');
        expect(storedAuth.user).not.toHaveProperty('internal_flags');

        // Tokens should be null
        expect(storedAuth.tokens).toEqual({
            access: null,
            refresh: null
        });

        // Transient state should be cleared
        expect(storedAuth.loading).toBe(false);
        expect(storedAuth.error).toBeNull();

        // Auth state should be preserved
        expect(storedAuth.isAuthenticated).toBe(true);
    });
});
