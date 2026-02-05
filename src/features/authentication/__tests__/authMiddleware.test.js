
import authMiddleware from '../authMiddleware';

describe('authMiddleware', () => {
    let store;
    let next;
    let invoke;

    beforeEach(() => {
        store = {
            getState: jest.fn(),
        };
        next = jest.fn((action) => action);
        invoke = (action) => authMiddleware(store)(next)(action);

        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                setItem: jest.fn(),
                getItem: jest.fn(),
            },
            writable: true
        });
    });

    it('should NOT persist sensitive or unnecessary data to localStorage', () => {
        const sensitiveState = {
            auth: {
                user: { id: 1, name: 'Test User' },
                tokens: { access: 'token123', refresh: 'refresh123' },
                isAuthenticated: true,
                loading: true, // Should not be persisted
                error: 'Some error', // Should not be persisted
                paymentInfo: 'Credit Card', // Hypothetical sensitive data
                resetToken: 'secret123' // Hypothetical sensitive data
            }
        };

        store.getState.mockReturnValue(sensitiveState);

        const action = { type: 'auth/login/fulfilled' };
        invoke(action);

        expect(window.localStorage.setItem).toHaveBeenCalledWith('auth', expect.any(String));

        const storedData = JSON.parse(window.localStorage.setItem.mock.calls[0][1]);

        // Assertions for what SHOULD be there
        expect(storedData).toHaveProperty('user');
        expect(storedData).toHaveProperty('tokens');
        expect(storedData).toHaveProperty('isAuthenticated');

        // 🛡️ SECURITY CHECK:
        // These assertions fail on the current vulnerable code
        expect(storedData).not.toHaveProperty('loading');
        expect(storedData).not.toHaveProperty('error');
        expect(storedData).not.toHaveProperty('paymentInfo');
        expect(storedData).not.toHaveProperty('resetToken');
    });
});
