import ApiService from "./api";
import { API_CONFIG } from "../../config/api";

const SettingsService = {
    // Building Settings
    getBuildingSettings: async (buildingId) => {
        return ApiService.get(API_CONFIG.ENDPOINTS.BUILDING_SETTINGS(buildingId));
    },
    updateBuildingSettings: async (buildingId, data) => {
        return ApiService.put(API_CONFIG.ENDPOINTS.BUILDING_SETTINGS_UPDATE(buildingId), data);
    },

    // Building Documents
    getBuildingDocuments: async (buildingId) => {
        return ApiService.get(API_CONFIG.ENDPOINTS.BUILDING_DOCUMENTS(buildingId));
    },
    uploadBuildingDocument: async (buildingId, data) => {
        return ApiService.uploadFile(API_CONFIG.ENDPOINTS.BUILDING_DOCUMENTS_UPLOAD(buildingId), data);
    },
    deleteBuildingDocument: async (buildingId, documentId) => {
        return ApiService.delete(API_CONFIG.ENDPOINTS.BUILDING_DOCUMENTS_DELETE(buildingId, documentId));
    },

    // Notification Settings
    getNotificationSettings: async () => {
        return ApiService.get(API_CONFIG.ENDPOINTS.NOTIFICATION_SETTINGS);
    },
    updateNotificationSettings: async (data) => {
        return ApiService.put(API_CONFIG.ENDPOINTS.NOTIFICATION_SETTINGS_UPDATE, data);
    },

    // Unit Resident Count
    updateUnitResidentCount: async (buildingId, unitId, data) => {
        return ApiService.patch(API_CONFIG.ENDPOINTS.UNIT_RESIDENT_COUNT_UPDATE(buildingId, unitId), data);
    },
};

export default SettingsService;
