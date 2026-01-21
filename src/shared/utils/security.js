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
 * Checks if a key string suggests sensitive data.
 * @param {string} key - The key to check
 * @returns {boolean} - True if sensitive
 */
export const isSensitiveKey = (key) => {
    if (typeof key !== 'string') return false;
    const lowerKey = key.toLowerCase();
    const sensitiveKeywords = ['password', 'otp', 'token', 'secret', 'access', 'refresh', 'credit_card', 'cvv', 'pin'];
    return sensitiveKeywords.some(keyword => lowerKey.includes(keyword));
};

/**
 * Recursively redacts sensitive keys in an object or array.
 * @param {any} data - The data to redact
 * @returns {any} - The redacted data (new copy)
 */
export const redactSensitiveData = (data) => {
    if (!data) return data;

    // Handle Arrays
    if (Array.isArray(data)) {
        return data.map(item => redactSensitiveData(item));
    }

    // Handle Objects (but not null, which is handled by !data check above)
    if (typeof data === 'object') {
        // Don't redact specialized objects like File or Blob
        if (typeof File !== 'undefined' && data instanceof File) return data;
        if (typeof Blob !== 'undefined' && data instanceof Blob) return data;

        const redacted = { ...data };
        for (const key in redacted) {
            if (Object.prototype.hasOwnProperty.call(redacted, key)) {
                if (isSensitiveKey(key)) {
                    redacted[key] = '***REDACTED***';
                } else if (typeof redacted[key] === 'object') {
                    redacted[key] = redactSensitiveData(redacted[key]);
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
    isSensitiveKey,
    redactSensitiveData
};
