import { redactSensitiveData, isSensitiveKey } from '../security';

describe('Security Utils', () => {
    describe('isSensitiveKey', () => {
        it('should identify sensitive keys', () => {
            expect(isSensitiveKey('password')).toBe(true);
            expect(isSensitiveKey('user_password')).toBe(true);
            expect(isSensitiveKey('access_token')).toBe(true);
            expect(isSensitiveKey('refreshToken')).toBe(true);
            expect(isSensitiveKey('otp_code')).toBe(true);
            expect(isSensitiveKey('credit_card_number')).toBe(true);
        });

        it('should return false for non-sensitive keys', () => {
            expect(isSensitiveKey('username')).toBe(false);
            expect(isSensitiveKey('email')).toBe(false);
            expect(isSensitiveKey('id')).toBe(false);
            expect(isSensitiveKey('created_at')).toBe(false);
        });

        it('should handle non-string inputs', () => {
            expect(isSensitiveKey(null)).toBe(false);
            expect(isSensitiveKey(undefined)).toBe(false);
            expect(isSensitiveKey(123)).toBe(false);
        });
    });

    describe('redactSensitiveData', () => {
        it('should redact sensitive fields in a flat object', () => {
            const data = {
                username: 'john_doe',
                password: 'secret_password',
                email: 'john@example.com'
            };
            const redacted = redactSensitiveData(data);
            expect(redacted).toEqual({
                username: 'john_doe',
                password: '[REDACTED]',
                email: 'john@example.com'
            });
        });

        it('should redact sensitive fields in nested objects', () => {
            const data = {
                user: {
                    name: 'John',
                    credentials: {
                        password: '123',
                        token: 'abc'
                    }
                }
            };
            const redacted = redactSensitiveData(data);
            expect(redacted).toEqual({
                user: {
                    name: 'John',
                    credentials: {
                        password: '[REDACTED]',
                        token: '[REDACTED]'
                    }
                }
            });
        });

        it('should redact sensitive fields in arrays', () => {
            const data = [
                { id: 1, password: 'p1' },
                { id: 2, token: 't2' }
            ];
            const redacted = redactSensitiveData(data);
            expect(redacted).toEqual([
                { id: 1, password: '[REDACTED]' },
                { id: 2, token: '[REDACTED]' }
            ]);
        });

        it('should handle circular references', () => {
            const obj = { name: 'circular' };
            obj.self = obj;

            const redacted = redactSensitiveData(obj);
            expect(redacted.name).toBe('circular');
            expect(redacted.self).toBe('[Circular Reference]');
        });

        it('should handle null and undefined', () => {
            expect(redactSensitiveData(null)).toBe(null);
            expect(redactSensitiveData(undefined)).toBe(undefined);
        });

        it('should preserve primitives', () => {
            expect(redactSensitiveData('string')).toBe('string');
            expect(redactSensitiveData(123)).toBe(123);
            expect(redactSensitiveData(true)).toBe(true);
        });
    });
});
