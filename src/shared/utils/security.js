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
 * Sanitizes building data to ensure only allowed fields are stored.
 * This prevents data leaks of internal building metadata or other residents' info.
 *
 * @param {Object} building - The raw building object from API
 * @returns {Object} - The sanitized building object
 */
export const sanitizeBuildingData = (building) => {
    if (!building) return null;

    const allowedFields = [
        'id',
        'building_id',
        'title',
        'building_title',
        'building_code',
        'address',
        'unit_info',
        'unit_number',
        'floor',
        'area',
        'resident_count',
        'role',
        'approved_at',
        'has_parking',
        'parking_count',
        'is_active',
        'manager_name', // If public
        'created_at'
    ];

    const sanitized = {};

    allowedFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(building, field)) {
            // Recursively sanitize unit_info if it exists
            if (field === 'unit_info' && typeof building[field] === 'object' && building[field] !== null) {
                sanitized[field] = sanitizeUnitInfo(building[field]);
            } else {
                sanitized[field] = building[field];
            }
        }
    });

    return sanitized;
};

/**
 * Sanitizes unit info object
 * @param {Object} unitInfo
 * @returns {Object}
 */
const sanitizeUnitInfo = (unitInfo) => {
    const allowedFields = [
        'unit_number',
        'floor',
        'area',
        'resident_count',
        'has_parking',
        'parking_count',
        'role'
    ];

    const sanitized = {};
    allowedFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(unitInfo, field)) {
            sanitized[field] = unitInfo[field];
        }
    });
    return sanitized;
};

/**
 * Sanitizes request data to ensure only allowed fields are stored.
 *
 * @param {Object} request - The raw request object from API
 * @returns {Object} - The sanitized request object
 */
export const sanitizeRequestData = (request) => {
    if (!request) return null;

    const allowedFields = [
        'id',
        'request_id',
        'building',
        'building_id',
        'building_title',
        'building_code',
        'unit_number',
        'floor',
        'area',
        'resident_count',
        'role',
        'status',
        'created_at',
        'updated_at',
        'has_parking',
        'parking_count',
        'description', // User content
        'response_message' // Admin response
    ];

    const sanitized = {};

    allowedFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(request, field)) {
            // Sanitize string fields that might contain user input
            if ((field === 'description' || field === 'response_message') && typeof request[field] === 'string') {
                sanitized[field] = sanitizeString(request[field]);
            } else {
                sanitized[field] = request[field];
            }
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

export default {
    sanitizeUser,
    sanitizeBuildingData,
    sanitizeRequestData,
    sanitizeString
};
