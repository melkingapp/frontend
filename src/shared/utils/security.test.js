
import { isSensitiveKey, redactSensitiveData } from './security';

describe('Security Utils', () => {
  describe('isSensitiveKey', () => {
    test('identifies sensitive keys', () => {
      expect(isSensitiveKey('password')).toBe(true);
      expect(isSensitiveKey('user_password')).toBe(true);
      expect(isSensitiveKey('accessToken')).toBe(true);
      expect(isSensitiveKey('otp_code')).toBe(true);
      expect(isSensitiveKey('secret')).toBe(true);
    });

    test('identifies safe keys', () => {
      expect(isSensitiveKey('username')).toBe(false);
      expect(isSensitiveKey('email')).toBe(false);
      expect(isSensitiveKey('id')).toBe(false);
    });
  });

  describe('redactSensitiveData', () => {
    test('redacts sensitive fields in object', () => {
      const input = {
        username: 'john',
        password: 'secret_password',
        profile: {
          email: 'john@example.com',
          accessToken: 'jwt_token'
        }
      };
      const output = redactSensitiveData(input);
      expect(output.username).toBe('john');
      expect(output.password).toBe('***REDACTED***');
      expect(output.profile.email).toBe('john@example.com');
      expect(output.profile.accessToken).toBe('***REDACTED***');
    });

    test('handles arrays', () => {
      const input = [
        { id: 1, token: 'abc' },
        { id: 2, secret: 'xyz' }
      ];
      const output = redactSensitiveData(input);
      expect(output[0].token).toBe('***REDACTED***');
      expect(output[1].secret).toBe('***REDACTED***');
    });

    test('handles nested nulls and primitives', () => {
        const input = { a: null, b: 123, c: 'text' };
        const output = redactSensitiveData(input);
        expect(output).toEqual(input);
    });
  });
});
