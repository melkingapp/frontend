import { redactSensitiveData, isSensitiveKey, sanitizeUser, sanitizeString } from '../security';

describe('security utils', () => {
    describe('isSensitiveKey', () => {
        it('should return true for sensitive keys', () => {
            expect(isSensitiveKey('password')).toBe(true);
            expect(isSensitiveKey('access_token')).toBe(true);
            expect(isSensitiveKey('refresh_token')).toBe(true);
            expect(isSensitiveKey('otp')).toBe(true);
            expect(isSensitiveKey('secret')).toBe(true);
        });

        it('should return true for case-insensitive matches', () => {
            expect(isSensitiveKey('PASSWORD')).toBe(true);
            expect(isSensitiveKey('Access_Token')).toBe(true);
        });

        it('should return false for non-sensitive keys', () => {
            expect(isSensitiveKey('username')).toBe(false);
            expect(isSensitiveKey('id')).toBe(false);
            expect(isSensitiveKey('email')).toBe(false);
        });
    });

    describe('redactSensitiveData', () => {
        it('should redact sensitive fields in a flat object', () => {
            const data = {
                username: 'user1',
                password: 'secretpassword',
                token: '123456'
            };
            const expected = {
                username: 'user1',
                password: '[REDACTED]',
                token: '[REDACTED]'
            };
            expect(redactSensitiveData(data)).toEqual(expected);
        });

        it('should redact sensitive fields in a nested object', () => {
            const data = {
                user: {
                    name: 'John',
                    credentials: {
                        password: '123'
                    }
                }
            };
            const expected = {
                user: {
                    name: 'John',
                    credentials: {
                        password: '[REDACTED]'
                    }
                }
            };
            expect(redactSensitiveData(data)).toEqual(expected);
        });

        it('should redact sensitive fields in an array of objects', () => {
            const data = [
                { id: 1, token: 'abc' },
                { id: 2, token: 'def' }
            ];
            const expected = [
                { id: 1, token: '[REDACTED]' },
                { id: 2, token: '[REDACTED]' }
            ];
            expect(redactSensitiveData(data)).toEqual(expected);
        });

        it('should handle null and undefined', () => {
            expect(redactSensitiveData(null)).toBeNull();
            expect(redactSensitiveData(undefined)).toBeUndefined();
        });

        it('should not modify non-object values', () => {
            expect(redactSensitiveData('string')).toBe('string');
            expect(redactSensitiveData(123)).toBe(123);
        });
    });

    describe('sanitizeUser', () => {
        it('should whitelist allowed fields', () => {
            const user = {
                id: 1,
                username: 'test',
                password: 'hashedpassword',
                extra: 'data'
            };
            const expected = {
                id: 1,
                username: 'test'
            };
            expect(sanitizeUser(user)).toEqual(expected);
        });
    });
});
