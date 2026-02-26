import { isSensitiveKey, redactSensitiveData } from '../security';

describe('Security Utils', () => {
    describe('isSensitiveKey', () => {
        it('should identify sensitive keys', () => {
            const sensitiveKeys = [
                'password', 'password_confirmation', 'old_password',
                'token', 'access_token', 'refresh_token',
                'otp', 'verification_code',
                'secret', 'client_secret',
                'credit_card', 'card_number',
                'ssn', 'national_id',
                'auth', 'authorization'
            ];

            sensitiveKeys.forEach(key => {
                expect(isSensitiveKey(key)).toBe(true);
            });
        });

        it('should identify case-insensitive matches', () => {
            expect(isSensitiveKey('Password')).toBe(true);
            expect(isSensitiveKey('ACCESS_TOKEN')).toBe(true);
        });

        it('should ignore non-sensitive keys', () => {
            const safeKeys = ['username', 'email', 'id', 'name', 'title', 'description', 'created_at'];
            safeKeys.forEach(key => {
                expect(isSensitiveKey(key)).toBe(false);
            });
        });
    });

    describe('redactSensitiveData', () => {
        it('should redact sensitive fields in a flat object', () => {
            const data = {
                username: 'user1',
                password: 'secretpassword',
                email: 'test@example.com'
            };
            const redacted = redactSensitiveData(data);
            expect(redacted).toEqual({
                username: 'user1',
                password: '[REDACTED]',
                email: 'test@example.com'
            });
        });

        it('should redact sensitive fields in nested objects', () => {
            const data = {
                user: {
                    id: 1,
                    details: {
                        address: '123 Main St',
                        secret_code: 'hidden'
                    }
                }
            };
            const redacted = redactSensitiveData(data);
            expect(redacted).toEqual({
                user: {
                    id: 1,
                    details: {
                        address: '123 Main St',
                        secret_code: '[REDACTED]'
                    }
                }
            });
        });

        it('should redact sensitive fields in arrays', () => {
            const data = [
                { id: 1, password: 'p1' },
                { id: 2, password: 'p2' }
            ];
            const redacted = redactSensitiveData(data);
            expect(redacted).toEqual([
                { id: 1, password: '[REDACTED]' },
                { id: 2, password: '[REDACTED]' }
            ]);
        });

        it('should handle null and undefined', () => {
            expect(redactSensitiveData(null)).toBeNull();
            expect(redactSensitiveData(undefined)).toBeUndefined();
        });

        it('should handle circular references', () => {
            const obj = { name: 'circular' };
            obj.self = obj;

            const redacted = redactSensitiveData(obj);
            expect(redacted.name).toBe('circular');
            expect(redacted.self).toBe('[Circular]');
        });

        it('should handle non-object inputs', () => {
            expect(redactSensitiveData('string')).toBe('string');
            expect(redactSensitiveData(123)).toBe(123);
            expect(redactSensitiveData(true)).toBe(true);
        });
    });
});
