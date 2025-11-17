const sanitizeBaseUrl = (value) => {
    if (!value) return null;
    return value.trim().replace(/\/+$/, '');
};

const inferBaseUrlFromWindow = () => {
    if (typeof window === 'undefined' || !window.location) {
        return 'https://melkingapp.ir/api/v1';
    }

    const origin = window.location.origin.replace(/\/+$/, '');
    return `${origin}/api/v1`;
};

const runtimeBaseUrl = sanitizeBaseUrl(import.meta.env?.VITE_API_BASE_URL);
const BASE_URL = runtimeBaseUrl || inferBaseUrlFromWindow();

// تنظیمات API
export const API_CONFIG = {
    BASE_URL,
    ENDPOINTS: {
        // Authentication
        LOGIN: '/auth/login/',
        REFRESH: '/auth/refresh/',
        
        // Buildings
        BUILDINGS: '/buildings/',
        BUILDING_UNITS: (buildingId) => `/buildings/${buildingId}/units/`,
        BUILDING_UNIT_DETAIL: (buildingId, unitId) => `/buildings/${buildingId}/units/${unitId}/`,
        BUILDING_UNIT_UPDATE: (buildingId, unitId) => `/buildings/${buildingId}/units/${unitId}/update/`,
        BUILDING_UNIT_RENTAL_STATUS: (buildingId, unitId) => `/buildings/${buildingId}/units/${unitId}/rental-status/`,
        
        // Rental Requests
        RENTAL_REQUESTS_CREATE: '/buildings/rental-requests/create/',
        RENTAL_REQUESTS_TENANT: '/buildings/rental-requests/tenant/',
        RENTAL_REQUESTS_OWNER: '/buildings/rental-requests/owner/',
        RENTAL_REQUESTS_MANAGER: (buildingId) => `/buildings/${buildingId}/rental-requests/`,
        RENTAL_REQUEST_OWNER_ACTION: (requestId) => `/buildings/rental-requests/${requestId}/owner-action/`,
        RENTAL_REQUEST_MANAGER_ACTION: (requestId) => `/buildings/rental-requests/${requestId}/manager-action/`,
        
        // Membership Requests
        MEMBERSHIP_REQUESTS_CREATE: '/buildings/resident-requests/create/',
        MEMBERSHIP_REQUESTS_RESIDENT: '/buildings/resident-requests/',
        MEMBERSHIP_REQUESTS_BUILDING: (buildingId) => `/buildings/${buildingId}/resident-requests/`,
        MEMBERSHIP_REQUEST_UPDATE_STATUS: (requestId) => `/buildings/resident-requests/${requestId}/update-status/`,
        
        // Settings
        BUILDING_SETTINGS: (buildingId) => `/buildings/${buildingId}/settings/`,
        BUILDING_SETTINGS_UPDATE: (buildingId) => `/buildings/${buildingId}/settings/update/`,
        BUILDING_DOCUMENTS: (buildingId) => `/buildings/${buildingId}/documents/`,
        BUILDING_DOCUMENTS_UPLOAD: (buildingId) => `/buildings/${buildingId}/documents/upload/`,
        BUILDING_DOCUMENTS_DELETE: (buildingId, documentId) => `/buildings/${buildingId}/documents/${documentId}/delete/`,
        NOTIFICATION_SETTINGS: '/notification/settings/',
        NOTIFICATION_SETTINGS_UPDATE: '/notification/settings/update/',
        UNIT_RESIDENT_COUNT_UPDATE: (buildingId, unitId) => `/buildings/${buildingId}/units/${unitId}/update-resident-count/`,
    }
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => `${BASE_URL}${endpoint}`;

// Helper function to get headers with auth token
export const getAuthHeaders = (token) => {
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
};
