
import { redactSensitiveData } from './security';

describe('redactSensitiveData', () => {
    test('should return same data if not object or array', () => {
        expect(redactSensitiveData(null)).toBe(null);
        expect(redactSensitiveData(undefined)).toBe(undefined);
        expect(redactSensitiveData('string')).toBe('string');
        expect(redactSensitiveData(123)).toBe(123);
    });

    test('should redact sensitive keys in object', () => {
        const input = {
            username: 'user',
            password: 'secretpassword',
            otp: '12345',
            other: 'value'
        };
        const output = redactSensitiveData(input);
        expect(output.username).toBe('user');
        expect(output.password).toBe('***REDACTED***');
        expect(output.otp).toBe('***REDACTED***');
        expect(output.other).toBe('value');
    });

    test('should redact nested sensitive keys', () => {
        const input = {
            user: {
                name: 'Alice',
                access_token: 'xyz',
                meta: {
                    refresh_token: 'abc'
                }
            }
        };
        const output = redactSensitiveData(input);
        expect(output.user.name).toBe('Alice');
        expect(output.user.access_token).toBe('***REDACTED***');
        expect(output.user.meta.refresh_token).toBe('***REDACTED***');
    });

    test('should redact keys in arrays', () => {
        const input = [
            { id: 1, password: 'p1' },
            { id: 2, secret_key: 's2' }
        ];
        const output = redactSensitiveData(input);
        expect(output[0].password).toBe('***REDACTED***');
        expect(output[1].secret_key).toBe('***REDACTED***');
    });

    test('should handle case insensitivity and partial matches', () => {
        const input = {
            userPassword: '123',
            api_SECRET: '456'
        };
        const output = redactSensitiveData(input);
        expect(output.userPassword).toBe('***REDACTED***');
        expect(output.api_SECRET).toBe('***REDACTED***');
    });

    test('should not mutate original object', () => {
        const input = { password: '123' };
        const output = redactSensitiveData(input);
        expect(output).not.toBe(input);
        expect(input.password).toBe('123');
    });
});
