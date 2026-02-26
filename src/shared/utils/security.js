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
 * Checks if a key is sensitive (e.g., password, token).
 * @param {string} key - The key to check
 * @returns {boolean} - True if sensitive, false otherwise
 */
export const isSensitiveKey = (key) => {
    if (typeof key !== 'string') return false;
    const lowerKey = key.toLowerCase();
    const sensitivePatterns = [
        'password',
        'token',
        'otp',
        'secret',
        'credit_card',
        'ssn',
        'auth',
        'access',
        'refresh',
        'card_number',
        'verification_code',
        'national_id'
    ];
    return sensitivePatterns.some(pattern => lowerKey.includes(pattern));
};

/**
 * Recursively redacts sensitive data from an object or array.
 * handles circular references.
 * @param {any} data - The data to redact
 * @param {WeakSet} seen - Set of seen objects to handle circular references
 * @returns {any} - The redacted data
 */
export const redactSensitiveData = (data, seen = new WeakSet()) => {
    if (data === null || data === undefined) return data;
    if (typeof data !== 'object') return data;

    // Handle circular references
    if (seen.has(data)) return '[Circular]';
    seen.add(data);

    if (Array.isArray(data)) {
        return data.map(item => redactSensitiveData(item, seen));
    }

    const redacted = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            if (isSensitiveKey(key)) {
                redacted[key] = '[REDACTED]';
            } else {
                redacted[key] = redactSensitiveData(data[key], seen);
            }
        }
    }
    return redacted;
};

export default {
    sanitizeUser,
    isSensitiveKey,
    redactSensitiveData
};
