/* global jest, describe, it, expect, beforeEach */
import authMiddleware from '../authMiddleware';

describe('authMiddleware security', () => {
    let store;
    let next;
    let action;

    beforeEach(() => {
        // Mock store
        store = {
            getState: jest.fn(() => ({
                auth: {
                    user: {
                        id: 1,
                        username: 'testuser',
                        email: 'test@example.com',
                        first_name: 'Test',
                        last_name: 'User',
                        phone_number: '1234567890',
                        role: 'admin',
                        is_active: true,
                        profile_image: null,
                        building_id: 2,
                        unit_id: 3,
                        password: 'supersecretpassword123', // should be sanitized
                        is_superuser: true // should be sanitized
                    },
                    tokens: {
                        access: 'secret_access_token_123', // should be removed
                        refresh: 'secret_refresh_token_456' // should be removed
                    },
                    isAuthenticated: true,
                    loading: false,
                    error: null,
                }
            }))
        };

        // Mock next middleware
        next = jest.fn((action) => action);

        // Clear localStorage mock before each test
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('should strip sensitive tokens and sanitize user data when saving to localStorage on auth/ actions', () => {
        action = { type: 'auth/login' };

        authMiddleware(store)(next)(action);

        expect(next).toHaveBeenCalledWith(action);

        const savedAuthStr = localStorage.getItem('auth');
        expect(savedAuthStr).toBeTruthy();

        const savedAuth = JSON.parse(savedAuthStr);

        // 1. Tokens should be nullified
        expect(savedAuth.tokens).toEqual({ access: null, refresh: null });
        expect(savedAuth.tokens.access).toBeNull();
        expect(savedAuth.tokens.refresh).toBeNull();

        // 2. User data should be sanitized (password and internal metadata removed)
        expect(savedAuth.user.password).toBeUndefined();
        expect(savedAuth.user.is_superuser).toBeUndefined();

        // 3. Allowed user fields should remain
        expect(savedAuth.user).toEqual({
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            phone_number: '1234567890',
            role: 'admin',
            is_active: true,
            profile_image: null,
            building_id: 2,
            unit_id: 3
        });

        // 4. Other auth state should remain
        expect(savedAuth.isAuthenticated).toBe(true);
        expect(savedAuth.loading).toBe(false);
        expect(savedAuth.error).toBeNull();
    });

    it('should not modify localStorage for non-auth actions', () => {
        action = { type: 'other/action' };

        authMiddleware(store)(next)(action);

        expect(next).toHaveBeenCalledWith(action);

        const savedAuthStr = localStorage.getItem('auth');
        expect(savedAuthStr).toBeNull();
    });
});
