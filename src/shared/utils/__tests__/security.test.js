import { sanitizeUser, sanitizeString } from '../security';

describe('Security Utils', () => {
    describe('sanitizeUser', () => {
        it('should remove sensitive fields from user object', () => {
            const sensitiveUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                internal_flags: 'secret',
                token: 'abcdef',
                role: 'admin',
                phone_number: '1234567890',
                random_extra: 'data'
            };

            const sanitized = sanitizeUser(sensitiveUser);

            expect(sanitized).toEqual({
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                role: 'admin',
                phone_number: '1234567890'
            });

            expect(sanitized).not.toHaveProperty('password');
            expect(sanitized).not.toHaveProperty('internal_flags');
            expect(sanitized).not.toHaveProperty('token');
            expect(sanitized).not.toHaveProperty('random_extra');
        });

        it('should handle null user', () => {
            expect(sanitizeUser(null)).toBeNull();
        });

        it('should keep all allowed fields', () => {
            const fullUser = {
                id: 1,
                username: 'user',
                email: 'email',
                first_name: 'first',
                last_name: 'last',
                phone_number: 'phone',
                role: 'role',
                is_active: true,
                profile_image: 'img',
                building_id: 1,
                unit_id: 2
            };

            const sanitized = sanitizeUser(fullUser);
            expect(sanitized).toEqual(fullUser);
        });
    });

    describe('sanitizeString', () => {
        it('should remove script tags', () => {
            const malicious = '<script>alert("xss")</script>Hello';
            expect(sanitizeString(malicious)).toBe('Hello');
        });

        it('should remove dangerous attributes', () => {
            const malicious = '<img src=x onerror=alert(1)>';
            expect(sanitizeString(malicious)).toBe('<img src="x">');
        });

        it('should handle non-string inputs', () => {
            expect(sanitizeString(123)).toBe(123);
            expect(sanitizeString(null)).toBeNull();
        });
    });
});
