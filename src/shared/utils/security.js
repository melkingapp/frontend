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

// List of keys that contain sensitive data
const SENSITIVE_KEYS = [
    'password',
    'token',
    'access',
    'refresh',
    'otp',
    'secret',
    'credit_card',
    'cvv',
    'ssn',
    'auth',
    'authorization',
    'api_key'
];

/**
 * Checks if a key is sensitive.
 * @param {string} key
 * @returns {boolean}
 */
export const isSensitiveKey = (key) => {
    if (!key || typeof key !== 'string') return false;
    const lowerKey = key.toLowerCase();
    return SENSITIVE_KEYS.some(k => lowerKey.includes(k));
};

/**
 * Recursively redacts sensitive data from an object or array.
 * @param {any} data
 * @returns {any} - The redacted data
 */
export const redactSensitiveData = (data) => {
    if (!data) return data;

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => redactSensitiveData(item));
    }

    // Handle objects
    if (typeof data === 'object') {
        // Skip File/Blob objects
        if (typeof File !== 'undefined' && data instanceof File) return data;
        if (typeof Blob !== 'undefined' && data instanceof Blob) return data;

        const redacted = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                if (isSensitiveKey(key)) {
                    redacted[key] = '[REDACTED]';
                } else {
                    redacted[key] = redactSensitiveData(data[key]);
                }
            }
        }
        return redacted;
    }

    return data;
};

export default {
    sanitizeUser,
    sanitizeString,
    redactSensitiveData,
    isSensitiveKey
};
