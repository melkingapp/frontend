import { redactSensitiveData } from '../security';
import { describe, it, expect } from '@jest/globals';

describe('redactSensitiveData', () => {
    it('should redact sensitive keys at the top level', () => {
        const input = {
            username: 'user',
            password: 'supersecretpassword',
            otp: '12345'
        };
        const expected = {
            username: 'user',
            password: '***REDACTED***',
            otp: '***REDACTED***'
        };
        expect(redactSensitiveData(input)).toEqual(expected);
    });

    it('should redact sensitive keys in nested objects', () => {
        const input = {
            user: {
                name: 'Alice',
                access_token: 'xyz-123',
                details: {
                    secret_code: 'hidden'
                }
            }
        };
        const expected = {
            user: {
                name: 'Alice',
                access_token: '***REDACTED***',
                details: {
                    secret_code: '***REDACTED***'
                }
            }
        };
        expect(redactSensitiveData(input)).toEqual(expected);
    });

    it('should redact sensitive keys in arrays of objects', () => {
        const input = [
            { id: 1, token: 'abc' },
            { id: 2, token: 'def' }
        ];
        const expected = [
            { id: 1, token: '***REDACTED***' },
            { id: 2, token: '***REDACTED***' }
        ];
        expect(redactSensitiveData(input)).toEqual(expected);
    });

    it('should not redact non-sensitive data', () => {
        const input = {
            title: 'Hello',
            description: 'World',
            count: 42
        };
        expect(redactSensitiveData(input)).toEqual(input);
    });

    it('should handle null or undefined', () => {
        expect(redactSensitiveData(null)).toBeNull();
        expect(redactSensitiveData(undefined)).toBeUndefined();
    });

    it('should redact based on partial match for certain keywords like secret', () => {
         const input = {
            my_secret_value: 'foo'
         };
         const expected = {
            my_secret_value: '***REDACTED***'
         };
         expect(redactSensitiveData(input)).toEqual(expected);
    });
});
