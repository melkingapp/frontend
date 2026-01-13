import DOMPurify from 'dompurify';

/**
 * Sanitizes user data to ensure only allowed fields are stored/processed.
 * This prevents data leaks (e.g., storing hashed passwords or internal metadata in localStorage).
 *
 * @param {Object} user - The raw user object from API
 * @returns {Object} - The sanitized user object
 */
export const sanitizeUser = (user) => {
    if (!user) return null;

    // Define allowed fields (Whitelist)
    const allowedFields = [
        'id',
        'username',
        'email',
        'first_name',
        'last_name',
        'phone_number',
        'role',
        'is_active',
        'profile_image',
        'building_id', // If applicable
        'unit_id'      // If applicable
    ];

    const sanitized = {};

    allowedFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(user, field)) {
            sanitized[field] = user[field];
        }
    });

    return sanitized;
};

/**
 * Sanitizes a string input to prevent XSS attacks.
 * Uses DOMPurify to strip dangerous HTML tags and attributes.
 *
 * @param {string} input - The raw input string
 * @returns {string} - The sanitized string
 */
export const sanitizeString = (input) => {
    if (typeof input !== 'string') return input;
    return DOMPurify.sanitize(input);
};

/**
 * Redacts sensitive keys from an object for safe logging.
 * Recursively masks keys like password, token, otp, secret, etc.
 *
 * @param {Object} data - The object to sanitize
 * @returns {Object} - A new object with sensitive keys redacted
 */
export const redactSensitiveData = (data) => {
    if (!data) return data;
    if (typeof data !== 'object') return data;

    if (Array.isArray(data)) {
        return data.map(item => redactSensitiveData(item));
    }

    // Handle specific object types we don't want to traverse deeply
    if (data instanceof Date) return data;
    if (data instanceof RegExp) return data;
    if ((typeof File !== 'undefined' && data instanceof File) ||
        (typeof Blob !== 'undefined' && data instanceof Blob)) {
        return '[File/Blob]';
    }

    const sensitiveKeys = [
        'password',
        'token',
        'access',
        'refresh',
        'otp',
        'secret',
        'authorization',
        'cookie',
        'cvv',
        'credit_card'
    ];

    const redacted = {};

    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const lowerKey = key.toLowerCase();
            const value = data[key];

            if (sensitiveKeys.some(k => lowerKey.includes(k))) {
                redacted[key] = '[REDACTED]';
            } else {
                redacted[key] = redactSensitiveData(value);
            }
        }
    }
    return redacted;
};

export default {
    sanitizeUser,
    sanitizeString,
    redactSensitiveData
};
