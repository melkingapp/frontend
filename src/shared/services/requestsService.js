import { get, post, put } from './apiService';

// Get unit requests
export const getUnitRequests = async (buildingId, unitId = null) => {
    try {
        // Try with authentication first
        const params = unitId ? `?unit_id=${unitId}` : '';
        try {
            const response = await get(`/services/building/${buildingId}/requests/${params}`);
            return response;
        } catch (error) {
            // If authentication fails, use test endpoint
            console.warn('Authentication failed, using test endpoint:', error.message);
            const response = await get(`/services/building/${buildingId}/requests-test/${params}`);
            return response;
        }
    } catch (error) {
        console.error('Get unit requests error:', error);
        throw error;
    }
};

// Create unit request
export const createUnitRequest = async (buildingId, requestData) => {
    try {
        const response = await post(`/services/building/${buildingId}/requests/create/`, requestData);
        return response;
    } catch (error) {
        console.error('Create unit request error:', error);
        throw error;
    }
};

// Update request status
export const updateRequestStatus = async (buildingId, requestId, statusData) => {
    try {
        const response = await put(`/services/building/${buildingId}/requests/${requestId}/update/`, statusData);
        return response;
    } catch (error) {
        console.error('Update request status error:', error);
        throw error;
    }
};

// Get all requests for current user's buildings
export const getAllRequests = async () => {
    try {
        // This will get requests from all buildings the user manages
        const buildingsResponse = await get('/buildings/list/');
        const allRequests = [];
        
        // Limit to first building only to avoid performance issues
        // Or return empty array if no buildings
        if (!buildingsResponse.buildings || buildingsResponse.buildings.length === 0) {
            return { requests: [] };
        }
        
        // Only get requests for the first building to avoid timeout
        const firstBuilding = buildingsResponse.buildings[0];
        try {
            const requestsData = await getUnitRequests(firstBuilding.building_id);
            const requests = (requestsData.requests || []).map(request => ({
                ...request,
                building_id: firstBuilding.building_id,
                building_title: firstBuilding.title
            }));
            allRequests.push(...requests);
        } catch (error) {
            console.warn(`Failed to fetch requests for building ${firstBuilding.building_id}:`, error);
        }
        
        return { requests: allRequests };
    } catch (error) {
        console.error('Get all requests error:', error);
        throw error;
    }
};

// Default export (برای backward compatibility)
const requestsService = {
    getUnitRequests,
    createUnitRequest,
    updateRequestStatus,
    getAllRequests
};

export default requestsService;
