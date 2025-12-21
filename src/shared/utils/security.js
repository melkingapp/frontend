/**
 * Security utility functions
 */

/**
 * Sanitizes user object to remove sensitive data before storage
 * Whitelists only safe fields to be persisted
 * @param {Object} user - The user object to sanitize
 * @returns {Object} - Sanitized user object
 */
export const sanitizeUser = (user) => {
    if (!user) return null;

    // Whitelist allowed fields
    // This prevents storing hashed_password, internal flags, or excessive PII in localStorage
    const allowedFields = [
        'id',
        'username',
        'email',
        'first_name',
        'last_name',
        'phone_number',
        'role',
        'is_active',
        'avatar', // If avatars are used
        'preferences' // If non-sensitive preferences exist
    ];

    const sanitized = {};

    allowedFields.forEach(field => {
        if (user[field] !== undefined) {
            sanitized[field] = user[field];
        }
    });

    return sanitized;
};
