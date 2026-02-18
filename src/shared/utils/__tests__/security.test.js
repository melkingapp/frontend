import { sanitizeUser, isSensitiveKey, redactSensitiveData } from '../security';

describe('Security Utils', () => {
    describe('sanitizeUser', () => {
        it('should return null if user is falsy', () => {
            expect(sanitizeUser(null)).toBeNull();
            expect(sanitizeUser(undefined)).toBeNull();
        });

        it('should return sanitized user object with only allowed fields', () => {
            const user = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                phone_number: '1234567890',
                role: 'resident',
                is_active: true,
                profile_image: 'image.jpg',
                building_id: 10,
                unit_id: 20,
                // Sensitive or extra fields that should be removed
                password: 'secret_password',
                token: 'secret_token',
                credit_card: '1234-5678-9012-3456',
                internal_metadata: { key: 'value' },
                extra_field: 'extra'
            };

            const sanitized = sanitizeUser(user);

            // Verify allowed fields are present
            expect(sanitized).toHaveProperty('id', 1);
            expect(sanitized).toHaveProperty('username', 'testuser');
            expect(sanitized).toHaveProperty('email', 'test@example.com');
            expect(sanitized).toHaveProperty('first_name', 'Test');
            expect(sanitized).toHaveProperty('last_name', 'User');
            expect(sanitized).toHaveProperty('phone_number', '1234567890');
            expect(sanitized).toHaveProperty('role', 'resident');
            expect(sanitized).toHaveProperty('is_active', true);
            expect(sanitized).toHaveProperty('profile_image', 'image.jpg');
            expect(sanitized).toHaveProperty('building_id', 10);
            expect(sanitized).toHaveProperty('unit_id', 20);

            // Verify sensitive/extra fields are removed
            expect(sanitized).not.toHaveProperty('password');
            expect(sanitized).not.toHaveProperty('token');
            expect(sanitized).not.toHaveProperty('credit_card');
            expect(sanitized).not.toHaveProperty('internal_metadata');
            expect(sanitized).not.toHaveProperty('extra_field');
        });

        it('should handle partial user objects correctly', () => {
            const user = {
                id: 1,
                username: 'partial',
                extra: 'should_be_removed'
            };

            const sanitized = sanitizeUser(user);

            expect(sanitized).toEqual({
                id: 1,
                username: 'partial'
            });
            expect(Object.keys(sanitized)).toHaveLength(2);
        });
    });

    describe('redactSensitiveData', () => {
        it('should mask sensitive keys in a flat object', () => {
            const data = {
                username: 'user',
                password: 'myPassword123',
                token: 'abc-123',
                safe_field: 'safe'
            };

            const redacted = redactSensitiveData(data);

            expect(redacted.username).toBe('user');
            expect(redacted.password).toBe('***REDACTED***');
            expect(redacted.token).toBe('***REDACTED***');
            expect(redacted.safe_field).toBe('safe');
        });

        it('should mask sensitive keys in nested objects', () => {
            const data = {
                user: {
                    name: 'John',
                    details: {
                        secret_code: '12345',
                        public_info: 'hello'
                    }
                }
            };

            const redacted = redactSensitiveData(data);

            expect(redacted.user.name).toBe('John');
            expect(redacted.user.details.secret_code).toBe('***REDACTED***');
            expect(redacted.user.details.public_info).toBe('hello');
        });

        it('should mask sensitive keys in arrays', () => {
            const data = [
                { id: 1, token: 'secret1' },
                { id: 2, token: 'secret2', name: 'visible' }
            ];

            const redacted = redactSensitiveData(data);

            expect(redacted[0].token).toBe('***REDACTED***');
            expect(redacted[1].token).toBe('***REDACTED***');
            expect(redacted[1].name).toBe('visible');
        });

        it('should handle circular references', () => {
            const obj = { name: 'circular' };
            obj.self = obj;

            const redacted = redactSensitiveData(obj);
            expect(redacted.name).toBe('circular');
            expect(redacted.self).toBe('[Circular]');
        });
    });

    describe('isSensitiveKey', () => {
         it('should identify sensitive keys', () => {
             expect(isSensitiveKey('password')).toBe(true);
             expect(isSensitiveKey('access_token')).toBe(true);
             expect(isSensitiveKey('user_secret')).toBe(true);
             expect(isSensitiveKey('credit_card')).toBe(true);
         });

         it('should identify non-sensitive keys', () => {
             expect(isSensitiveKey('username')).toBe(false);
             expect(isSensitiveKey('id')).toBe(false);
             expect(isSensitiveKey('email')).toBe(false); // Email is PII but usually visible in profile
         });
    });
});
