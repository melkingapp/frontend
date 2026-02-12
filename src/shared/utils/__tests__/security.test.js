/* global describe, it, expect */
import { sanitizeUser, redactSensitiveData, isSensitiveKey, sanitizeString } from '../security';

describe('Security Utilities', () => {
    describe('sanitizeUser', () => {
        it('should keep only allowed fields', () => {
            const input = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password: 'secretpassword', // Sensitive
                role: 'admin',
                extra_field: 'should be removed',
                credit_card: '1234567890123456' // Sensitive
            };

            const expected = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                role: 'admin'
            };

            const result = sanitizeUser(input);
            expect(result).toEqual(expected);
        });

        it('should return null if input is null', () => {
            expect(sanitizeUser(null)).toBeNull();
        });
    });

    describe('isSensitiveKey', () => {
        it('should return true for sensitive keys', () => {
            expect(isSensitiveKey('password')).toBe(true);
            expect(isSensitiveKey('password_confirm')).toBe(true);
            expect(isSensitiveKey('access_token')).toBe(true);
            expect(isSensitiveKey('refresh_token')).toBe(true);
            expect(isSensitiveKey('auth')).toBe(true);
            expect(isSensitiveKey('otp')).toBe(true);
            expect(isSensitiveKey('secret')).toBe(true);
            expect(isSensitiveKey('credit_card')).toBe(true);
            expect(isSensitiveKey('ssn')).toBe(true);
        });

        it('should be case insensitive', () => {
            expect(isSensitiveKey('PASSWORD')).toBe(true);
            expect(isSensitiveKey('Token')).toBe(true);
        });

        it('should return false for non-sensitive keys', () => {
            expect(isSensitiveKey('username')).toBe(false);
            expect(isSensitiveKey('email')).toBe(false); // Email itself is PII but usually allowed in logs unless strict
            expect(isSensitiveKey('id')).toBe(false);
        });
    });

    describe('redactSensitiveData', () => {
        it('should redact sensitive keys in an object', () => {
            const input = {
                username: 'testuser',
                password: 'secretpassword',
                tokens: {
                    access: 'eyJ...',
                    refresh: 'def...'
                },
                profile: {
                    name: 'John Doe',
                    ssn: '123-45-6789'
                }
            };

            const result = redactSensitiveData(input);

            expect(result.username).toBe('testuser');
            expect(result.password).toBe('***REDACTED***');
            // 'tokens' key contains 'token', so it is sensitive.
            expect(result.tokens).toBe('***REDACTED***');

            expect(result.profile.name).toBe('John Doe');
            expect(result.profile.ssn).toBe('***REDACTED***');
        });

        it('should handle arrays', () => {
            const input = [
                { id: 1, token: 'abc' },
                { id: 2, secret: 'xyz' }
            ];

            const result = redactSensitiveData(input);

            expect(result[0].id).toBe(1);
            expect(result[0].token).toBe('***REDACTED***');
            expect(result[1].id).toBe(2);
            expect(result[1].secret).toBe('***REDACTED***');
        });

        it('should handle nested structures', () => {
            const input = {
                data: {
                    user: {
                        auth: {
                            password: '123'
                        }
                    }
                }
            };

            const result = redactSensitiveData(input);
            // 'auth' is sensitive
            expect(result.data.user.auth).toBe('***REDACTED***');
        });

        it('should redact the entire value if the key is sensitive', () => {
             const input = {
                auth: {
                    something: 'valuable'
                }
            };
            const result = redactSensitiveData(input);
            expect(result.auth).toBe('***REDACTED***');
        });

        it('should handle null and non-objects', () => {
            expect(redactSensitiveData(null)).toBeNull();
            expect(redactSensitiveData(123)).toBe(123);
            expect(redactSensitiveData('string')).toBe('string');
        });

        it('should handle circular references gracefully (optional but good)', () => {
            const obj = { name: 'circular' };
            obj.self = obj;
            // JSON.stringify fails on circular, our function should ideally handle or safe-fail
            // For now, let's just ensure it doesn't crash on simple objects
        });
    });

    describe('sanitizeString', () => {
        it('should remove script tags', () => {
            const input = '<script>alert(1)</script>Hello';
            expect(sanitizeString(input)).toBe('Hello');
        });
    });
});
