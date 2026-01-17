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
 * Sanitizes an object (e.g. request body) to mask sensitive fields like passwords, OTPs, etc.
 * Useful for logging.
 *
 * @param {Object|Array} data - The data to redact
 * @param {Array<string>} [keysToRedact] - List of keys to look for (partial match, case insensitive)
 * @returns {Object|Array} - The redacted data (new copy)
 */
export const redactSensitiveData = (data, keysToRedact = ['password', 'otp', 'token', 'secret', 'access', 'refresh', 'credit_card']) => {
    if (!data) return data;
    if (typeof data !== 'object') return data;

    // Handle Arrays
    if (Array.isArray(data)) {
        return data.map(item => redactSensitiveData(item, keysToRedact));
    }

    // Handle Objects
    const redacted = { ...data };
    Object.keys(redacted).forEach(key => {
        const lowerKey = key.toLowerCase();
        // Check if key contains any sensitive keyword
        if (keysToRedact.some(sensitive => lowerKey.includes(sensitive))) {
            redacted[key] = '***REDACTED***';
        } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
            redacted[key] = redactSensitiveData(redacted[key], keysToRedact);
        }
    });
    return redacted;
};

export const sanitizeRequestData = (data) => {
    return redactSensitiveData(data);
};

export const sanitizeBuildingData = (building) => {
    return redactSensitiveData(building);
};

export default {
    sanitizeUser,
    sanitizeString,
    redactSensitiveData,
    sanitizeRequestData,
    sanitizeBuildingData
};
