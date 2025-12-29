import { get, post, put, deleteRequest } from './apiService';

// Register new building
export const registerBuilding = async (buildingData) => {
    try {
        console.log("🔥 BuildingsService: ========== Building Registration Request ==========");
        console.log("🔥 BuildingsService: Endpoint: /buildings/register/");
        console.log("🔥 BuildingsService: Request Data:", JSON.stringify(buildingData, null, 2));
        console.log("🔥 BuildingsService: Data Types:", {
            title: typeof buildingData.title,
            usage_type: typeof buildingData.usage_type,
            property_type: typeof buildingData.property_type,
            unit_count: typeof buildingData.unit_count,
            is_owner_resident: typeof buildingData.is_owner_resident,
            resident_floor: typeof buildingData.resident_floor,
            fund_balance: typeof buildingData.fund_balance,
            fund_sheba_number: typeof buildingData.fund_sheba_number,
            blocks_count: typeof buildingData.blocks_count,
        });
        console.log("🔥 BuildingsService: Data Values:", {
            title: buildingData.title,
            usage_type: buildingData.usage_type,
            property_type: buildingData.property_type,
            unit_count: buildingData.unit_count,
            is_owner_resident: buildingData.is_owner_resident,
            resident_floor: buildingData.resident_floor,
            fund_balance: buildingData.fund_balance,
            fund_sheba_number: buildingData.fund_sheba_number,
            blocks_count: buildingData.blocks_count,
        });
        
        const response = await post('/buildings/register/', buildingData);
        
        console.log("✅ BuildingsService: Building registered successfully");
        console.log("✅ BuildingsService: Response:", JSON.stringify(response, null, 2));
        console.log("🔥 BuildingsService: =================================================");
        
        return response;
    } catch (error) {
        console.error("❌ BuildingsService: ========== Building Registration Error ==========");
        console.error("❌ BuildingsService: Error Type:", error.constructor.name);
        console.error("❌ BuildingsService: Error Message:", error.message);
        
        // Use enhanced error message if available
        const errorMessage = error.userMessage || error.extractedMessage || error.message;
        console.error("❌ BuildingsService: User-Friendly Error:", errorMessage);
        
        if (error.response) {
            console.error("❌ BuildingsService: Response Status:", error.response.status);
            console.error("❌ BuildingsService: Response Status Text:", error.response.statusText);
            console.error("❌ BuildingsService: Response Headers:", error.response.headers);
            
            const responseData = error.response.data;
            const isHtmlResponse = typeof responseData === 'string' && 
                                 (responseData.trim().startsWith('<!DOCTYPE') || 
                                  responseData.trim().startsWith('<html'));
            
            if (isHtmlResponse) {
                console.error("❌ BuildingsService: HTML Response Detected");
                console.error("❌ BuildingsService: HTML Preview (first 1000 chars):", 
                    responseData.substring(0, 1000));
                
                // Try to extract title from HTML
                const titleMatch = responseData.match(/<title>(.*?)<\/title>/i);
                if (titleMatch) {
                    console.error("❌ BuildingsService: HTML Error Title:", titleMatch[1]);
                }
            } else {
                console.error("❌ BuildingsService: JSON Error Response:", 
                    JSON.stringify(responseData, null, 2));
            }
        } else if (error.request) {
            console.error("❌ BuildingsService: No response received");
            console.error("❌ BuildingsService: Request:", error.request);
        } else {
            console.error("❌ BuildingsService: Error setting up request:", error.message);
        }
        
        console.error("❌ BuildingsService: Full Error Object:", error);
        console.error("🔥 BuildingsService: =================================================");
        
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
    transferBuildingManagement
};

export default buildingsService;
