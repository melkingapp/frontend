import { get, post, put, deleteRequest } from './apiService';

// Get building services
export const getBuildingServices = async (buildingId) => {
    try {
        try {
            // Try with authentication first
            const response = await get(`/services/building/${buildingId}/`);
            return response;
        } catch (error) {
            // If authentication fails, use test endpoint
            console.warn('Authentication failed, using test endpoint:', error.message);
            const response = await get(`/services/building/${buildingId}/test/`);
            return response;
        }
    } catch (error) {
        console.error('Get building services error:', error);
        throw error;
    }
};

// Get service details
export const getServiceDetail = async (buildingId, serviceId) => {
    try {
        const response = await get(`/services/building/${buildingId}/${serviceId}/`);
        return response;
    } catch (error) {
        console.error('Get service detail error:', error);
        throw error;
    }
};

// Create service
export const createService = async (buildingId, serviceData) => {
    try {
        // Check if there's an attachment
        if (serviceData.attachment) {
            // Use FormData for file upload
            const formData = new FormData();
            formData.append('title', serviceData.title);
            formData.append('description', serviceData.description);
            formData.append('longDesc', serviceData.longDesc || '');
            formData.append('service_type', serviceData.service_type);
            formData.append('unit_id', serviceData.unit_id);
            formData.append('target', serviceData.target);
            formData.append('contact', serviceData.contact || '');
            formData.append('attachment', serviceData.attachment);
            
            try {
                // نیازی به تنظیم دستی Content-Type نیست - axios به صورت خودکار با boundary تنظیم می‌کند
                const response = await post(`/services/building/${buildingId}/create/`, formData);
                return response;
            } catch (error) {
                // If authentication fails, use test endpoint
                console.warn('Authentication failed, using test endpoint:', error.message);
                
                try {
                    // نیازی به تنظیم دستی Content-Type نیست - axios به صورت خودکار با boundary تنظیم می‌کند
                    const response = await post(`/services/building/${buildingId}/create/test/`, formData);
                    return response;
                } catch (testError) {
                    console.error("🔥 Test endpoint also failed:", testError);
                    throw testError;
                }
            }
        } else {
            // Use JSON for data without attachment
            try {
                const response = await post(`/services/building/${buildingId}/create/`, serviceData);
                return response;
            } catch (error) {
                // If authentication fails, use test endpoint
                console.warn('Authentication failed, using test endpoint:', error.message);
                
                try {
                    const response = await post(`/services/building/${buildingId}/create/test/`, serviceData);
                    return response;
                } catch (testError) {
                    console.error("🔥 Test endpoint also failed:", testError);
                    throw testError;
                }
            }
        }
    } catch (error) {
        console.error('Create service error:', error);
        throw error;
    }
};

// Update service
export const updateService = async (buildingId, serviceId, serviceData) => {
    try {
        const response = await put(`/services/building/${buildingId}/${serviceId}/update/`, serviceData);
        return response;
    } catch (error) {
        console.error('Update service error:', error);
        throw error;
    }
};

// Delete service
export const deleteService = async (buildingId, serviceId) => {
    try {
        const response = await deleteRequest(`/services/building/${buildingId}/${serviceId}/delete/`);
        return response;
    } catch (error) {
        console.error('Delete service error:', error);
        throw error;
    }
};

// Update service status
export const updateServiceStatus = async (buildingId, serviceId, status) => {
    try {
        const response = await patch(`/services/building/${buildingId}/${serviceId}/status/`, { status });
        return response;
    } catch (error) {
        console.error('Update service status error:', error);
        throw error;
    }
};

// Default export (برای backward compatibility)
const servicesService = {
    getBuildingServices,
    getServiceDetail,
    createService,
    updateService,
    deleteService,
    updateServiceStatus
};

export default servicesService;
