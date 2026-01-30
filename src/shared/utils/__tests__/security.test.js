import { describe, it, expect } from '@jest/globals';
import { redactSensitiveData, isSensitiveKey } from '../security';

describe('Security Utils', () => {
    describe('isSensitiveKey', () => {
        it('should identify sensitive keys', () => {
            expect(isSensitiveKey('password')).toBe(true);
            expect(isSensitiveKey('user_password')).toBe(true);
            expect(isSensitiveKey('otp')).toBe(true);
            expect(isSensitiveKey('accessToken')).toBe(true);
            expect(isSensitiveKey('refreshToken')).toBe(true);
            expect(isSensitiveKey('credit_card')).toBe(true);
        });

        it('should not identify non-sensitive keys', () => {
            expect(isSensitiveKey('username')).toBe(false);
            expect(isSensitiveKey('email')).toBe(false);
            expect(isSensitiveKey('id')).toBe(false);
        });
    });

    describe('redactSensitiveData', () => {
        it('should redact sensitive fields in an object', () => {
            const data = {
                username: 'johndoe',
                password: 'secretpassword',
                email: 'john@example.com'
            };
            const redacted = redactSensitiveData(data);
            expect(redacted.username).toBe('johndoe');
            expect(redacted.password).toBe('***REDACTED***');
            expect(redacted.email).toBe('john@example.com');
        });

        it('should redact sensitive fields in nested objects', () => {
            const data = {
                user: {
                    name: 'John',
                    credentials_container: {
                        access_token: '12345',
                        refresh_token: '67890'
                    }
                }
            };
            const redacted = redactSensitiveData(data);
            expect(redacted.user.name).toBe('John');
            expect(redacted.user.credentials_container.access_token).toBe('***REDACTED***');
            expect(redacted.user.credentials_container.refresh_token).toBe('***REDACTED***');
        });

        it('should redact sensitive fields in arrays of objects', () => {
            const data = [
                { id: 1, secret_code: '123' },
                { id: 2, secret_code: '456' }
            ];
            const redacted = redactSensitiveData(data);
            expect(redacted[0].secret_code).toBe('***REDACTED***');
            expect(redacted[1].secret_code).toBe('***REDACTED***');
        });
    });
});
