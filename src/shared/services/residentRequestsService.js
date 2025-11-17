import { get, post, patch } from './apiService';

// Get resident requests
export const getResidentRequests = async () => {
    try {
        const response = await get('/buildings/resident-requests/');
        return response;
    } catch (error) {
        console.error('Get resident requests error:', error);
        throw error;
    }
};

// Create resident request
export const createResidentRequest = async (requestData) => {
    try {
        const response = await post('/buildings/resident-requests/create/', requestData);
        return response;
    } catch (error) {
        console.error('Create resident request error:', error);
        throw error;
    }
};

// Update resident request status
export const updateResidentRequestStatus = async (requestId, statusData) => {
    try {
        const response = await patch(`/buildings/resident-requests/${requestId}/update-status/`, statusData);
        return response;
    } catch (error) {
        console.error('Update resident request status error:', error);
        throw error;
    }
};

// Get building resident requests
export const getBuildingResidentRequests = async (buildingId) => {
    try {
        const response = await get(`/buildings/${buildingId}/resident-requests/`);
        return response;
    } catch (error) {
        console.error('Get building resident requests error:', error);
        throw error;
    }
};

// Get approved buildings
export const getApprovedBuildings = async () => {
    try {
        const response = await get('/buildings/list/');
        return response;
    } catch (error) {
        console.error('Get approved buildings error:', error);
        throw error;
    }
};

// Get building details
export const getBuildingDetails = async (buildingId) => {
    try {
        console.log('Fetching building details for ID:', buildingId);
        const response = await get(`/buildings/${buildingId}/`);
        console.log('Building details response:', response);
        return response;
    } catch (error) {
        console.error('Get building details error:', error);
        throw error;
    }
};

// Default export (برای backward compatibility)
const residentRequestsService = {
    getResidentRequests,
    createResidentRequest,
    updateResidentRequestStatus,
    getBuildingResidentRequests,
    getApprovedBuildings,
    getBuildingDetails
};

export default residentRequestsService;
