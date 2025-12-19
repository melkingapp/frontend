/**
 * Security utilities for the application.
 * Focuses on data sanitization and preventing sensitive data leaks.
 */

// Whitelist of allowed user fields for local storage
export const USER_STORAGE_ALLOWLIST = [
    'id',
    'username',
    'email',
    'first_name',
    'last_name',
    'phone_number',
    'role',
    'is_active',
    'profile_image', // Often needed for UI
    'is_admin'       // Often needed for UI permissions
];

/**
 * Sanitizes the user object to only include whitelisted fields.
 * This prevents sensitive data (like hashed passwords, internal IDs, etc.)
 * from being stored in localStorage.
 *
 * @param {Object} user - The user object to sanitize
 * @returns {Object} - The sanitized user object
 */
export const sanitizeUser = (user) => {
    if (!user) return null;

    const sanitized = {};

    USER_STORAGE_ALLOWLIST.forEach(field => {
        if (user.hasOwnProperty(field)) {
            sanitized[field] = user[field];
        }
    });

    return sanitized;
};
