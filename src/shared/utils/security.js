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
 * Sanitizes building data to ensure only allowed fields are stored.
 *
 * @param {Object} building - The raw building object
 * @returns {Object} - The sanitized building object
 */
export const sanitizeBuildingData = (building) => {
    if (!building) return null;

    const allowedFields = [
        'id',
        'building_id',
        'title',
        'name',
        'address',
        'city',
        'state',
        'zip_code',
        'units_count',
        'floors_count',
        'description',
        'manager_name',
        'role', // resident or manager
        'created_at',
        'image'
    ];

    const sanitized = {};

    allowedFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(building, field)) {
            sanitized[field] = building[field];
        }
    });

    return sanitized;
};

/**
 * Sanitizes request data to ensure only allowed fields are stored.
 *
 * @param {Object} request - The raw request object
 * @returns {Object} - The sanitized request object
 */
export const sanitizeRequestData = (request) => {
    if (!request) return null;

    const allowedFields = [
        'id',
        'request_type',
        'status',
        'created_at',
        'updated_at',
        'building', // Usually an object or ID
        'building_id',
        'unit', // Usually an object or ID
        'unit_id',
        'user', // Usually just user ID or name in list views
        'description',
        'response_note'
    ];

    const sanitized = {};

    allowedFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(request, field)) {
            // Recursive sanitization for nested objects could be added here if needed
            // For now, we trust that building/unit/user in requests are minimal summaries
            // But if they are full objects, we might want to flatten or sanitize them too.
            // Given the typical API response, they are often IDs or simple objects.

            if (field === 'building' && typeof request[field] === 'object' && request[field] !== null) {
                 sanitized[field] = sanitizeBuildingData(request[field]);
            } else {
                 sanitized[field] = request[field];
            }
        }
    });

    return sanitized;
};

export default {
    sanitizeUser,
    sanitizeString,
    sanitizeBuildingData,
    sanitizeRequestData
};
