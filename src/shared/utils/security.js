// Security utilities
// 🛡️ Sentinel Protection

/**
 * Sanitizes the user object to remove sensitive information before storage.
 * Whitelists only safe fields needed for the frontend.
 *
 * @param {Object} user - The raw user object from the API
 * @returns {Object|null} - The sanitized user object
 */
export const sanitizeUser = (user) => {
    if (!user) return null;

    // Explicit whitelist of allowed fields
    // We strictly extract only what is needed to prevent leaks of hidden API fields
    // (e.g. password_hash, security_answers, internal_flags, PII not meant for client)
    const {
        id,
        username,
        email,
        first_name,
        last_name,
        phone_number,
        role,
        is_active,
        date_joined // Used in Profile.jsx
    } = user;

    return {
        id,
        username,
        email,
        first_name,
        last_name,
        phone_number,
        role,
        is_active,
        date_joined
    };
};
