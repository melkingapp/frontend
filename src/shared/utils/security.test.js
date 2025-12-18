
import { describe, it, expect } from 'vitest';
import { sanitizeUser } from '../utils/security';

describe('Security Utils', () => {
    describe('sanitizeUser', () => {
        it('should allow whitelisted fields', () => {
            const user = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                phone_number: '09123456789',
                role: 'resident',
                is_active: true
            };
            const sanitized = sanitizeUser(user);
            expect(sanitized).toEqual(user);
        });

        it('should remove sensitive fields', () => {
            const user = {
                id: 1,
                username: 'testuser',
                password: 'hashedpassword123',
                internal_flag: 'secret',
                credit_card: '1234-5678'
            };
            const sanitized = sanitizeUser(user);
            expect(sanitized).toEqual({
                id: 1,
                username: 'testuser'
            });
            expect(sanitized.password).toBeUndefined();
            expect(sanitized.internal_flag).toBeUndefined();
            expect(sanitized.credit_card).toBeUndefined();
        });

        it('should handle null or undefined input', () => {
            expect(sanitizeUser(null)).toBeNull();
            expect(sanitizeUser(undefined)).toBeNull();
        });
    });
});
