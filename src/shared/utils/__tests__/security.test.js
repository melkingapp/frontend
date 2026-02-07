import { isSensitiveKey, redactSensitiveData } from '../security';
import { describe, it, expect } from '@jest/globals';

describe('Security Utils', () => {
    describe('isSensitiveKey', () => {
        it('identifies sensitive keys correctly', () => {
            expect(isSensitiveKey('password')).toBe(true);
            expect(isSensitiveKey('user_password')).toBe(true);
            expect(isSensitiveKey('accessToken')).toBe(true);
            expect(isSensitiveKey('secret_key')).toBe(true);
            expect(isSensitiveKey('credit_card')).toBe(true);
            expect(isSensitiveKey('email')).toBe(true);
            expect(isSensitiveKey('phone_number')).toBe(true);
        });

        it('identifies non-sensitive keys correctly', () => {
            expect(isSensitiveKey('username')).toBe(false);
            expect(isSensitiveKey('id')).toBe(false);
            expect(isSensitiveKey('created_at')).toBe(false);
            expect(isSensitiveKey('description')).toBe(false);
        });

        it('is case insensitive', () => {
            expect(isSensitiveKey('PASSWORD')).toBe(true);
            expect(isSensitiveKey('Token')).toBe(true);
        });
    });

    describe('redactSensitiveData', () => {
        it('redacts sensitive fields in a flat object', () => {
            const input = {
                username: 'john_doe',
                password: 'secret_password',
                email: 'john@example.com'
            };
            const expected = {
                username: 'john_doe',
                password: '***REDACTED***',
                email: '***REDACTED***'
            };
            expect(redactSensitiveData(input)).toEqual(expected);
        });

        it('redacts sensitive fields in nested objects', () => {
            const input = {
                user: {
                    name: 'John',
                    credentials: {
                        password: '123',
                        token: 'abc'
                    }
                }
            };
            const expected = {
                user: {
                    name: 'John',
                    credentials: {
                        password: '***REDACTED***',
                        token: '***REDACTED***'
                    }
                }
            };
            expect(redactSensitiveData(input)).toEqual(expected);
        });

        it('redacts sensitive fields in arrays', () => {
            const input = [
                { id: 1, token: 'abc' },
                { id: 2, password: 'xyz' }
            ];
            const expected = [
                { id: 1, token: '***REDACTED***' },
                { id: 2, password: '***REDACTED***' }
            ];
            expect(redactSensitiveData(input)).toEqual(expected);
        });

        it('handles null and undefined', () => {
            expect(redactSensitiveData(null)).toBeNull();
            expect(redactSensitiveData(undefined)).toBeUndefined();
        });

        it('handles primitives', () => {
            expect(redactSensitiveData(123)).toBe(123);
            expect(redactSensitiveData('hello')).toBe('hello');
            expect(redactSensitiveData(true)).toBe(true);
        });

        it('handles JSON strings', () => {
            const input = JSON.stringify({ password: '123', name: 'test' });
            const output = redactSensitiveData(input);
            const parsed = JSON.parse(output);
            expect(parsed).toEqual({ password: '***REDACTED***', name: 'test' });
        });
    });
});
