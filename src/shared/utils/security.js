/**
 * Security utility functions to prevent data leaks
 */

/**
 * Whitelist of allowed user fields to be stored in client-side storage
 */
const ALLOWED_USER_FIELDS = [
    'id',
    'username',
    'email',
    'first_name',
    'last_name',
    'phone_number',
    'role',
    'is_active',
    'avatar',
    'profile_image' // Assuming potential alternative name
];

/**
 * Sanitizes the user object to only include whitelisted fields.
 * This prevents sensitive data (like password hashes, internal IDs, etc.)
 * from being stored in LocalStorage or Redux state.
 *
 * @param {Object} user - The raw user object
 * @returns {Object} - The sanitized user object
 */
export const sanitizeUser = (user) => {
    if (!user || typeof user !== 'object') {
        return user;
    }

    const sanitized = {};

    ALLOWED_USER_FIELDS.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(user, field)) {
            sanitized[field] = user[field];
        }
    });

    return sanitized;
};

/**
 * Sanitizes the entire auth state before persistence.
 *
 * @param {Object} authState - The Redux auth state
 * @returns {Object} - The sanitized auth state
 */
export const sanitizeAuth = (authState) => {
    if (!authState) return authState;

    return {
        ...authState,
        user: sanitizeUser(authState.user)
    };
};
