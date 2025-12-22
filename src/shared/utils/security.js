/**
 * Security utilities
 */

/**
 * Whitelist of allowed user fields to prevent storing sensitive data (Data Leak prevention).
 * Based on authSlice initialState and usage.
 */
export const ALLOWED_USER_FIELDS = [
    'id',
    'username',
    'email',
    'first_name',
    'last_name',
    'phone_number',
    'role',
    'is_active',
    'avatar', // Potential extra field
    'profile_image' // Potential extra field
];

/**
 * Sanitizes the user object to only include allowed fields.
 * This prevents Mass Assignment leaks where backend might send more data than needed
 * (e.g. hashed_password, internal flags, etc.) and we persist it to localStorage.
 *
 * @param {Object} user - The raw user object from API
 * @returns {Object} - The sanitized user object
 */
export const sanitizeUser = (user) => {
    if (!user) return null;

    const sanitized = {};
    ALLOWED_USER_FIELDS.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(user, field)) {
            sanitized[field] = user[field];
        }
    });

    return sanitized;
};
