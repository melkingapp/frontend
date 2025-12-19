
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sanitizeUser, USER_STORAGE_ALLOWLIST } from './security';

describe('sanitizeUser', () => {
    it('should return null if user is null', () => {
        expect(sanitizeUser(null)).toBeNull();
    });

    it('should only include whitelisted fields', () => {
        const sensitiveUser = {
            id: 1,
            username: 'testuser',
            password: 'hashed_password_secret', // 🚨 Should be removed
            email: 'test@example.com',
            internal_flag: 'secret_flag', // 🚨 Should be removed
            role: 'manager'
        };

        const sanitized = sanitizeUser(sensitiveUser);

        expect(sanitized).toEqual({
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            role: 'manager'
        });

        expect(sanitized).not.toHaveProperty('password');
        expect(sanitized).not.toHaveProperty('internal_flag');
    });

    it('should handle all whitelisted fields', () => {
        const fullUser = {
            id: 123,
            username: 'jdoe',
            email: 'jdoe@example.com',
            first_name: 'John',
            last_name: 'Doe',
            phone_number: '09123456789',
            role: 'resident',
            is_active: true,
            profile_image: '/path/to/image.jpg',
            is_admin: false,
            extra_field: 'should_not_be_here'
        };

        const sanitized = sanitizeUser(fullUser);

        USER_STORAGE_ALLOWLIST.forEach(field => {
            expect(sanitized).toHaveProperty(field);
        });

        expect(sanitized).not.toHaveProperty('extra_field');
    });
});
