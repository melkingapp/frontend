/**
 * Security utility functions to prevent data leaks.
 */

/**
 * Whitelists allowed fields for the user object to be stored in localStorage.
 * Prevents sensitive data (like password hashes, internal flags, etc.) from being persisted.
 *
 * @param {Object} user - The raw user object from the API.
 * @returns {Object} - The sanitized user object.
 */
export const sanitizeUser = (user) => {
    if (!user) return null;

    // Define allowed fields (Whitelist approach)
    const allowedFields = [
        'id',
        'username',
        'email',
        'first_name',
        'last_name',
        'phone_number',
        'role',
        'is_active',
        // Add other necessary UI fields here, but exclude sensitive ones
    ];

    const sanitized = {};
    allowedFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(user, field)) {
            sanitized[field] = user[field];
        }
    });

    return sanitized;
};
