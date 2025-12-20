import { describe, it, expect } from 'vitest';
import { sanitizeUser, sanitizeAuth } from './security';

describe('Security Utils', () => {
    describe('sanitizeUser', () => {
        it('should strip unknown fields', () => {
            const rawUser = {
                id: 1,
                username: 'testuser',
                phone_number: '09123456789',
                password_hash: 'secret_hash',
                internal_notes: 'some sensitive note',
                role: 'manager',
                is_active: true
            };

            const sanitized = sanitizeUser(rawUser);

            expect(sanitized).toEqual({
                id: 1,
                username: 'testuser',
                phone_number: '09123456789',
                role: 'manager',
                is_active: true
            });
            expect(sanitized.password_hash).toBeUndefined();
            expect(sanitized.internal_notes).toBeUndefined();
        });

        it('should handle null or undefined', () => {
            expect(sanitizeUser(null)).toBeNull();
            expect(sanitizeUser(undefined)).toBeUndefined();
        });

        it('should handle empty object', () => {
            expect(sanitizeUser({})).toEqual({});
        });
    });

    describe('sanitizeAuth', () => {
        it('should sanitize the user object within auth state', () => {
            const authState = {
                isAuthenticated: true,
                tokens: { access: 'abc', refresh: 'xyz' },
                user: {
                    id: 1,
                    role: 'resident',
                    secret_field: 'HIDDEN'
                },
                loading: false
            };

            const sanitizedState = sanitizeAuth(authState);

            expect(sanitizedState.user).toEqual({
                id: 1,
                role: 'resident'
            });
            expect(sanitizedState.user.secret_field).toBeUndefined();
            expect(sanitizedState.tokens).toEqual(authState.tokens);
            expect(sanitizedState.isAuthenticated).toBe(true);
        });
    });
});
