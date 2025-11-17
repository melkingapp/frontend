import { get, post } from './apiService';

// Check unit assignment
export const checkUnitAssignment = async () => {
    try {
        const response = await get('/buildings/units/check-assignment/');
        return response;
    } catch (error) {
        console.error('Check unit assignment error:', error);
        throw error;
    }
};

// Confirm unit assignment
export const confirmUnitAssignment = async (assignmentData) => {
    try {
        const response = await post('/buildings/units/confirm-assignment/', assignmentData);
        return response;
    } catch (error) {
        console.error('Confirm unit assignment error:', error);
        throw error;
    }
};

// Get rental requests for owner
export const getOwnerRentalRequests = async () => {
    try {
        const response = await get('/buildings/rental-requests/owner/');
        return response;
    } catch (error) {
        console.error('Get owner rental requests error:', error);
        throw error;
    }
};

// Owner action on rental request
export const ownerRentalRequestAction = async (requestId, actionData) => {
    try {
        const response = await post(`/buildings/rental-requests/${requestId}/owner-action/`, actionData);
        return response;
    } catch (error) {
        console.error('Owner rental request action error:', error);
        throw error;
    }
};

// Get rental requests for tenant
export const getTenantRentalRequests = async () => {
    try {
        const response = await get('/buildings/rental-requests/tenant/');
        return response;
    } catch (error) {
        console.error('Get tenant rental requests error:', error);
        throw error;
    }
};

// Create rental request
export const createRentalRequest = async (requestData) => {
    try {
        const response = await post('/buildings/rental-requests/create/', requestData);
        return response;
    } catch (error) {
        console.error('Create rental request error:', error);
        throw error;
    }
};

// Default export (برای backward compatibility)
const unitManagementService = {
    checkUnitAssignment,
    confirmUnitAssignment,
    getOwnerRentalRequests,
    ownerRentalRequestAction,
    getTenantRentalRequests,
    createRentalRequest
};

export default unitManagementService;
