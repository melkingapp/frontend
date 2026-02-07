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
 * @param {string} key - The key to check
 * @returns {boolean} - True if the key is sensitive
 */
export const isSensitiveKey = (key) => {
    if (!key || typeof key !== 'string') return false;
    const lowerKey = key.toLowerCase();
    const sensitiveTerms = [
        'password',
        'token',
        'secret',
        'auth',
        'credit',
        'card',
        'cvv',
        'mobile',
        'phone',
        'email',
        'otp'
    ];
    return sensitiveTerms.some(term => lowerKey.includes(term));
};

/**
 * Recursively redacts sensitive data from an object or array.
 * @param {any} data - The data to redact
 * @returns {any} - The redacted data
 */
export const redactSensitiveData = (data) => {
    if (!data) return data;

    if (Array.isArray(data)) {
        return data.map(item => redactSensitiveData(item));
    }

    if (typeof data === 'object') {
        // Handle FormData (not directly serializable, but often logged)
        if (typeof FormData !== 'undefined' && data instanceof FormData) {
            return '[FormData]';
        }

        const redacted = {};
        for (const [key, value] of Object.entries(data)) {
            if (isSensitiveKey(key)) {
                redacted[key] = '***REDACTED***';
            } else {
                redacted[key] = redactSensitiveData(value);
            }
        }
        return redacted;
    }

    // Handle JSON strings (sometimes logged as strings)
    if (typeof data === 'string') {
         try {
            // Only try to parse if it looks like an object/array
            if ((data.trim().startsWith('{') && data.trim().endsWith('}')) ||
                (data.trim().startsWith('[') && data.trim().endsWith(']'))) {
                const parsed = JSON.parse(data);
                return JSON.stringify(redactSensitiveData(parsed));
            }
        } catch (e) {
            // Not JSON, ignore
        }
    }

    return data;
};

export default {
    sanitizeUser,
    sanitizeString,
    isSensitiveKey,
    redactSensitiveData
};
