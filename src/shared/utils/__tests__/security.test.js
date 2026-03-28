import { describe, it, expect } from '@jest/globals';
import { redactSensitiveData, isSensitiveKey } from '../security';

describe('Security Utils', () => {
    describe('isSensitiveKey', () => {
        it('identifies sensitive keys correctly', () => {
            expect(isSensitiveKey('password')).toBe(true);
            expect(isSensitiveKey('confirm_password')).toBe(true);
            expect(isSensitiveKey('otp')).toBe(true);
            expect(isSensitiveKey('access_token')).toBe(true);
            expect(isSensitiveKey('refreshToken')).toBe(true);
            expect(isSensitiveKey('credit_card_number')).toBe(true);
            expect(isSensitiveKey('secret')).toBe(true);
        });

        it('returns false for non-sensitive keys', () => {
            expect(isSensitiveKey('username')).toBe(false);
            expect(isSensitiveKey('email')).toBe(false);
            expect(isSensitiveKey('id')).toBe(false);
        });
    });

    describe('redactSensitiveData', () => {
        it('redacts sensitive fields in a flat object', () => {
            const input = {
                username: 'john',
                password: 'secret123',
                email: 'john@example.com'
            };
            const output = redactSensitiveData(input);
            expect(output).toEqual({
                username: 'john',
                password: '***REDACTED***',
                email: 'john@example.com'
            });
        });

        it('redacts sensitive fields in nested objects', () => {
            const input = {
                user: {
                    name: 'john',
                    auth: {
                        token: 'xyz123',
                        expiry: 1000
                    }
                }
            };
            const output = redactSensitiveData(input);
            expect(output).toEqual({
                user: {
                    name: 'john',
                    auth: {
                        token: '***REDACTED***',
                        expiry: 1000
                    }
                }
            });
        });

        it('redacts sensitive fields in arrays', () => {
            const input = [
                { id: 1, secret: 'A' },
                { id: 2, secret: 'B' }
            ];
            const output = redactSensitiveData(input);
            expect(output).toEqual([
                { id: 1, secret: '***REDACTED***' },
                { id: 2, secret: '***REDACTED***' }
            ]);
        });

        it('does not mutate original object', () => {
            const input = { password: '123' };
            const output = redactSensitiveData(input);
            expect(input.password).toBe('123');
            expect(output.password).toBe('***REDACTED***');
        });

        it('handles null and undefined', () => {
            expect(redactSensitiveData(null)).toBeNull();
            expect(redactSensitiveData(undefined)).toBeUndefined();
        });

        it('handles primitive values', () => {
            expect(redactSensitiveData('string')).toBe('string');
            expect(redactSensitiveData(123)).toBe(123);
        });
    });
});
