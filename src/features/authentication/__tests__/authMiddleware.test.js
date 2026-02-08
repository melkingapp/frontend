/* global jest, describe, test, expect, beforeEach, global, require */
import { configureStore } from '@reduxjs/toolkit';
import authMiddleware from '../authMiddleware';
import authReducer, { login, resetAuthState } from '../authSlice';
import { jest } from '@jest/globals';

// Mock dependencies if needed
jest.mock('../../../shared/services/authService', () => {
    const { jest } = require('@jest/globals');
    return {
        login: jest.fn().mockResolvedValue({ success: true }),
        logout: jest.fn(),
        register: jest.fn(),
        refreshToken: jest.fn(),
    };
});

jest.mock('../../../shared/services/profileService', () => {
    const { jest } = require('@jest/globals');
    return {
        getProfile: jest.fn(),
        updateProfile: jest.fn(),
        changePassword: jest.fn(),
    };
});

describe('authMiddleware', () => {
    let store;
    let localStorageSetItemSpy;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup localStorage mock
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

        // Define property on global object to override potential existing mock
        Object.defineProperty(global, 'localStorage', {
            value: localStorageMock
        });

        localStorageSetItemSpy = global.localStorage.setItem;

        store = configureStore({
            reducer: {
                auth: authReducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(authMiddleware),
        });
    });

    test('should store SANITIZED user data and NULL tokens in localStorage (Security Fix Verification)', () => {
        // Arrange
        const sensitiveUser = {
            id: 1,
            username: 'testuser',
            password_hash: 'secret_hash', // Sensitive data!
            social_security_number: '123-45-6789', // Sensitive data!
            role: 'manager'
        };

        const tokens = {
            access: 'access_token_123',
            refresh: 'refresh_token_456'
        };

        // Act
        // We manually dispatch the login action with the payload structure expected by the reducer
        store.dispatch(login({
            user: sensitiveUser,
            tokens: tokens
        }));

        // Assert
        // Check what was stored in localStorage under 'auth' key
        expect(localStorageSetItemSpy).toHaveBeenCalledWith('auth', expect.any(String));

        // Find the call that set 'auth'
        const storedCall = localStorageSetItemSpy.mock.calls.find(call => call[0] === 'auth');

        if (!storedCall) {
            throw new Error('localStorage.setItem("auth", ...) was not called');
        }

        const storedValue = JSON.parse(storedCall[1]);

        // Verify that sensitive data is NOT present (Fix Verification)
        expect(storedValue.user).not.toHaveProperty('password_hash');
        expect(storedValue.user).not.toHaveProperty('social_security_number');

        // Verify that legitimate fields are preserved
        expect(storedValue.user).toHaveProperty('username', 'testuser');
        expect(storedValue.user).toHaveProperty('role', 'manager');

        // Verify that tokens are NOT present (Redundant storage removal)
        expect(storedValue.tokens).toEqual({
            access: null,
            refresh: null
        });
    });
});
