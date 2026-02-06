import authMiddleware from '../authMiddleware';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock apiConfig to avoid import.meta.env error which causes SyntaxError in Jest
jest.mock('../../../shared/utils/apiConfig.js', () => ({
    getApiBaseUrl: () => 'http://mock-api.com',
    getMediaBaseUrl: () => 'http://mock-media.com',
    __esModule: true
}));

// Mock api.js to avoid import.meta.env error
jest.mock('../../../shared/services/api.js', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn(),
        uploadFile: jest.fn(),
        refreshToken: jest.fn(),
        clearAuthData: jest.fn(),
        clearAllAppData: jest.fn()
    }
}));

// Mock membershipSlice to avoid import.meta.env error
jest.mock('../../../features/membership/membershipSlice', () => () => ({}));

describe('authMiddleware Security', () => {
    let store;
    let next;
    let action;

    beforeEach(() => {
        store = {
            getState: jest.fn(() => ({
                auth: {
                    user: {
                        id: 1,
                        username: 'testuser',
                        password_hash: 'secret_hash', // Sensitive field
                        role: 'admin'
                    },
                    tokens: {
                        access: 'secret_access_token',
                        refresh: 'secret_refresh_token'
                    },
                    isAuthenticated: true,
                    loading: false,
                    error: null
                }
            }))
        };
        next = jest.fn((action) => action);
        // Clear localStorage before each test
        localStorage.clear();
        jest.resetModules();
    });

    it('persists sanitized user and strips tokens (SECURE BEHAVIOR)', () => {
        action = { type: 'auth/login/fulfilled' };
        authMiddleware(store)(next)(action);

        const storedAuth = JSON.parse(localStorage.getItem('auth'));

        // Verify that TOKENS are STRIPPED
        expect(storedAuth.tokens.access).toBeNull();
        expect(storedAuth.tokens.refresh).toBeNull();

        // Verify that SENSITIVE fields are REDACTED/NOT PRESENT
        // sanitizeUser whitelist: id, username, email, etc.
        expect(storedAuth.user.password_hash).toBeUndefined();
        expect(storedAuth.user.username).toBe('testuser');
    });

    it('rehydrates tokens from specific localStorage keys', async () => {
        // Setup localStorage with stripped auth blob but valid tokens
        const strippedAuth = {
            user: { id: 1, username: 'testuser' },
            tokens: { access: null, refresh: null },
            isAuthenticated: true
        };
        localStorage.setItem('auth', JSON.stringify(strippedAuth));
        localStorage.setItem('access_token', 'valid_access_token');
        localStorage.setItem('refresh_token', 'valid_refresh_token');

        // Isolate module to force re-execution of store.js
        let storeModule;
        await jest.isolateModulesAsync(async () => {
             // We need to mock the slices because they are imported in store.js
             // However, for this integration test, loading the real slices is fine
             // as long as they don't have side effects.
            storeModule = await import('../../../app/store.js');
        });

        const storeState = storeModule.default.getState();

        expect(storeState.auth.tokens.access).toBe('valid_access_token');
        expect(storeState.auth.tokens.refresh).toBe('valid_refresh_token');
        // We verify that isAuthenticated is preserved from the auth blob
        expect(storeState.auth.isAuthenticated).toBe(true);
    });
});
