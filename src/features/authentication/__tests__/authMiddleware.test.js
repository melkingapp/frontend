import authMiddleware from '../authMiddleware';

describe('authMiddleware', () => {
    let store;
    let next;
    let invoke;

    beforeEach(() => {
        // Mock localStorage
        const localStorageMock = (function() {
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

        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        // Mock store with sensitive data
        store = {
            getState: jest.fn(() => ({
                auth: {
                    user: {
                        id: 1,
                        username: 'testuser',
                        password_hash: 'secret_hash', // Sensitive field that should not be stored
                        role: 'resident'
                    },
                    tokens: {
                        access: 'access_token_123',
                        refresh: 'refresh_token_456'
                    },
                    isAuthenticated: true
                }
            })),
            dispatch: jest.fn()
        };

        next = jest.fn();
        invoke = (action) => authMiddleware(store)(next)(action);
    });

    it('should save sanitized auth state WITHOUT tokens and sensitive fields', () => {
        const action = { type: 'auth/loginUser/fulfilled' };
        invoke(action);

        expect(window.localStorage.setItem).toHaveBeenCalledWith('auth', expect.any(String));

        const savedAuth = JSON.parse(window.localStorage.setItem.mock.calls[0][1]);

        // Assert that tokens are removed
        expect(savedAuth.tokens.access).toBeNull();
        expect(savedAuth.tokens.refresh).toBeNull();

        // Assert that sensitive user fields are removed (sanitized)
        expect(savedAuth.user.username).toBe('testuser'); // Allowed field
        expect(savedAuth.user.password_hash).toBeUndefined(); // Should be removed
        expect(savedAuth.user.role).toBe('resident'); // Allowed field
    });
});
