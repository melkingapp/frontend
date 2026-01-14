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
 * Recursively redacts sensitive keys in an object.
 * Useful for logging to prevent leaking secrets.
 *
 * @param {Object} data - The data to redact.
 * @returns {Object} - The redacted data.
 */
export const redactSensitiveData = (data) => {
    if (!data || typeof data !== 'object') {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => redactSensitiveData(item));
    }

    // List of keys that indicate sensitive data
    const sensitiveKeys = [
        'password',
        'otp',
        'token',
        'access',
        'refresh',
        'secret',
        'authorization',
        'credit_card',
        'cvv',
        'card_number',
        'code' // Often used for OTP
    ];

    const redacted = { ...data };

    for (const key in redacted) {
        if (Object.prototype.hasOwnProperty.call(redacted, key)) {
            const lowerKey = key.toLowerCase();

            // Check if key contains any sensitive keyword
            // Use precise checking to avoid over-redaction (e.g. 'access_level' might be ok, but 'access_token' not)
            // But for safety, 'access' and 'refresh' usually imply tokens in this context.
            // Let's be slightly more specific for 'code' to avoid redacting 'postal_code' or similar if checking purely includes.

            let isSensitive = false;

            if (lowerKey === 'otp' || lowerKey === 'password' || lowerKey === 'token' || lowerKey === 'secret') {
                isSensitive = true;
            } else if (lowerKey.includes('token') || lowerKey.includes('password') || lowerKey.includes('secret')) {
                isSensitive = true;
            } else if (lowerKey === 'access' || lowerKey === 'refresh') {
                // Specific to JWT
                isSensitive = true;
            } else if (lowerKey === 'code' && (String(redacted[key]).length === 5 || String(redacted[key]).length === 6)) {
                 // Heuristic for OTP code vs other codes
                 // Better to be safe? 'code' is generic.
                 // In auth context it's OTP. In others it might be generic.
                 // Let's skip 'code' for generic generic matching and rely on context or strict naming if possible.
                 // But in `LoginForm`, it sends `code` or `otp`.
                 // Let's stick to the list but maybe refine logic.
                 isSensitive = true;
            } else if (['authorization'].includes(lowerKey)) {
                isSensitive = true;
            }

            if (isSensitive) {
                redacted[key] = '***REDACTED***';
            } else if (typeof redacted[key] === 'object') {
                redacted[key] = redactSensitiveData(redacted[key]);
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
