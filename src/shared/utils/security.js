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
 * Checks if a key is considered sensitive.
 *
 * @param {string} key - The key to check
 * @returns {boolean} - True if sensitive
 */
export const isSensitiveKey = (key) => {
    if (typeof key !== 'string') return false;
    const lowerKey = key.toLowerCase();
    const sensitivePatterns = [
        'password',
        'otp',
        'token',
        'secret',
        'access',
        'refresh',
        'credit_card',
        'cvv',
        'pin'
    ];
    return sensitivePatterns.some(pattern => lowerKey.includes(pattern));
};

/**
 * Recursively masks sensitive data in objects and arrays.
 *
 * @param {any} data - The data to redact
 * @returns {any} - The redacted data
 */
export const redactSensitiveData = (data) => {
    if (!data) return data;

    if (Array.isArray(data)) {
        return data.map(item => redactSensitiveData(item));
    }

    if (typeof data === 'object' && data !== null) {
        const redacted = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                if (isSensitiveKey(key)) {
                    redacted[key] = '***REDACTED***';
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
