import { get, post, put, deleteRequest } from './apiService';

// Register new building
export const registerBuilding = async (buildingData) => {
    try {
        console.log("🔥 BuildingsService: Sending request to /buildings/register/");
        console.log("🔥 BuildingsService: Data:", buildingData);
        const response = await post('/buildings/register/', buildingData);
        console.log("🔥 BuildingsService: Response:", response);
        return response;
    } catch (error) {
        console.error('Register building error:', error);
        throw error;
    }
};

// Get buildings list
export const getBuildingsList = async (buildingId = null) => {
    try {
        const params = buildingId ? `?building_id=${buildingId}` : '';
        const response = await get(`/buildings/list/${params}`);
        return response;
    } catch (error) {
        console.error('Get buildings list error:', error);
        throw error;
    }
};

// Get building details
export const getBuildingDetails = async (buildingId) => {
    try {
        const response = await get(`/buildings/${buildingId}/`);
        return response;
    } catch (error) {
        console.error('Get building details error:', error);
        throw error;
    }
};

// Update building
export const updateBuilding = async (buildingId, buildingData) => {
    try {
        const response = await put(`/buildings/${buildingId}/update/`, buildingData);
        return response;
    } catch (error) {
        console.error('Update building error:', error);
        throw error;
    }
};

// Delete building
export const deleteBuilding = async (buildingId) => {
    try {
        const response = await deleteRequest(`/buildings/${buildingId}/delete/`);
        return response;
    } catch (error) {
        console.error('Delete building error:', error);
        throw error;
    }
};

// Get building units
export const getBuildingUnits = async (buildingId) => {
    try {
        const response = await get(`/buildings/${buildingId}/units/`);
        return response;
    } catch (error) {
        console.error('Get building units error:', error);
        throw error;
    }
};

// Create new unit
export const createUnit = async (buildingId, unitData) => {
    try {
        const response = await post(`/buildings/${buildingId}/units/create/`, unitData);
        return response;
    } catch (error) {
        console.error('Create unit error:', error);
        throw error;
    }
};

// Get unit details
export const getUnitDetails = async (buildingId, unitId) => {
    try {
        const response = await get(`/buildings/${buildingId}/units/${unitId}/`);
        return response;
    } catch (error) {
        console.error('Get unit details error:', error);
        throw error;
    }
};

// Update unit
export const updateUnit = async (buildingId, unitId, unitData) => {
    try {
        const response = await put(`/buildings/${buildingId}/units/${unitId}/update/`, unitData);
        return response;
    } catch (error) {
        console.error('Update unit error:', error);
        throw error;
    }
};

// Delete unit
export const deleteUnit = async (buildingId, unitId) => {
    try {
        const response = await deleteRequest(`/buildings/${buildingId}/units/${unitId}/delete/`);
        return response;
    } catch (error) {
        console.error('Delete unit error:', error);
        throw error;
    }
};

// Transfer building management (PRD)
export const transferBuildingManagement = async (buildingId, data) => {
    try {
        const response = await post(`/buildings/${buildingId}/transfer-management/`, data);
        return response;
    } catch (error) {
        console.error('Transfer building management error:', error);
        throw error;
    }
};

// Get manager tasks (PRD)
export const getManagerTasks = async (buildingId) => {
    try {
        const response = await get(`/buildings/${buildingId}/manager-tasks/`);
        return response;
    } catch (error) {
        console.error('Get manager tasks error:', error);
        throw error;
    }
};

// Complete manager task (PRD)
export const completeManagerTask = async (buildingId, data) => {
    try {
        const response = await post(`/buildings/${buildingId}/manager-tasks/complete/`, data);
        return response;
    } catch (error) {
        console.error('Complete manager task error:', error);
        throw error;
    }
};

// Default export (برای backward compatibility)
const buildingsService = {
    registerBuilding,
    getBuildingsList,
    getBuildingDetails,
    updateBuilding,
    deleteBuilding,
    getBuildingUnits,
    createUnit,
    getUnitDetails,
    updateUnit,
    deleteUnit,
    transferBuildingManagement,
    getManagerTasks,
    completeManagerTask
};

export default buildingsService;
