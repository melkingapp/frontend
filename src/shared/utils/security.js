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
 * Check if a key is sensitive
 * @param {string} key
 * @returns {boolean}
 */
export const isSensitiveKey = (key) => {
    if (!key || typeof key !== 'string') return false;
    const lowerKey = key.toLowerCase();
    const SENSITIVE_KEYS = [
        'password', 'otp', 'token', 'secret', 'access', 'refresh',
        'credit_card', 'cvv', 'pin', 'authorization'
    ];
    return SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive));
};

/**
 * Recursively redacts sensitive keys in an object or array.
 * Replaces values with "***REDACTED***".
 *
 * @param {any} data - The data to redact
 * @returns {any} - The redacted data
 */
export const redactSensitiveData = (data) => {
    if (!data) return data;
    if (typeof data !== 'object') return data;

    // Handle Array
    if (Array.isArray(data)) {
        return data.map(item => redactSensitiveData(item));
    }

    // Handle Object
    // Avoid mutating the original object if possible, but shallow copy + recursion is safer
    const redacted = { ...data };

    Object.keys(redacted).forEach(key => {
        if (isSensitiveKey(key)) {
            redacted[key] = '***REDACTED***';
        } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
            redacted[key] = redactSensitiveData(redacted[key]);
        }
    });

    return redacted;
};

export default {
    sanitizeUser,
    sanitizeString,
    redactSensitiveData,
    isSensitiveKey
};
