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

// Sensitive keys to be redacted
const SENSITIVE_KEYS = [
    'password',
    'token',
    'otp',
    'secret',
    'credit_card',
    'ssn',
    'auth',
    'access',
    'refresh'
];

/**
 * Checks if a key is considered sensitive.
 * @param {string} key
 * @returns {boolean}
 */
export const isSensitiveKey = (key) => {
    if (!key || typeof key !== 'string') return false;
    const lowerKey = key.toLowerCase();
    return SENSITIVE_KEYS.some(k => lowerKey.includes(k));
};

/**
 * Recursively masks sensitive data in an object or array.
 * Useful for logging or storing data safely.
 *
 * @param {any} data - The data to redact
 * @param {WeakSet} seen - To handle circular references
 * @returns {any} - The redacted data
 */
export const redactSensitiveData = (data, seen = new WeakSet()) => {
    if (!data || typeof data !== 'object') return data;

    if (seen.has(data)) return '[Circular]';
    seen.add(data);

    if (Array.isArray(data)) {
        return data.map(item => redactSensitiveData(item, seen));
    }

    const redacted = {};
    for (const [key, value] of Object.entries(data)) {
        if (isSensitiveKey(key)) {
            redacted[key] = '***REDACTED***';
        } else {
            redacted[key] = redactSensitiveData(value, seen);
        }
    }
    return redacted;
};

export default {
    sanitizeUser,
    sanitizeString,
    redactSensitiveData,
    isSensitiveKey
};
