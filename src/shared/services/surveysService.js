import { get, post, put, deleteRequest } from './apiService';

// Get building surveys
export const getBuildingSurveys = async (buildingId) => {
    try {
        try {
            // Try with authentication first
            const response = await get(`/surveys/building/${buildingId}/`);
            return response;
        } catch (error) {
            // If authentication fails, use test endpoint
            console.warn('Authentication failed, using test endpoint:', error.message);
            const response = await get(`/surveys/building/${buildingId}/test/`);
            return response;
        }
    } catch (error) {
        console.error('Get building surveys error:', error);
        throw error;
    }
};

// Get survey details
export const getSurveyDetail = async (buildingId, surveyId) => {
    try {
        const response = await get(`/surveys/building/${buildingId}/${surveyId}/`);
        return response;
    } catch (error) {
        console.error('Get survey detail error:', error);
        throw error;
    }
};

// Create survey
export const createSurvey = async (buildingId, surveyData) => {
    try {
        try {
            const response = await post(`/surveys/building/${buildingId}/create/`, surveyData);
            return response;
        } catch (error) {
            // If authentication fails, use test endpoint
            console.warn('Authentication failed, using test endpoint:', error.message);
            try {
                const response = await post(`/surveys/building/${buildingId}/create/test/`, surveyData);
                return response;
            } catch (testError) {
                console.error("🔥 Test endpoint also failed:", testError);
                throw testError;
            }
        }
    } catch (error) {
        console.error('Create survey error:', error);
        throw error;
    }
};

// Update survey
export const updateSurvey = async (buildingId, surveyId, surveyData) => {
    try {
        const response = await put(`/surveys/building/${buildingId}/${surveyId}/update/`, surveyData);
        return response;
    } catch (error) {
        console.error('Update survey error:', error);
        throw error;
    }
};

// Delete survey
export const deleteSurvey = async (buildingId, surveyId) => {
    try {
        const response = await deleteRequest(`/surveys/building/${buildingId}/${surveyId}/delete/`);
        return response;
    } catch (error) {
        console.error('Delete survey error:', error);
        throw error;
    }
};

// Submit survey response
export const submitSurveyResponse = async (buildingId, surveyId, responseData) => {
    try {
        const response = await post(`/surveys/building/${buildingId}/${surveyId}/submit/`, responseData);
        return response;
    } catch (error) {
        console.error('Submit survey response error:', error);
        throw error;
    }
};

// Get survey responses
export const getSurveyResponses = async (buildingId, surveyId) => {
    try {
        const response = await get(`/surveys/building/${buildingId}/${surveyId}/responses/`);
        return response;
    } catch (error) {
        console.error('Get survey responses error:', error);
        throw error;
    }
};

// Get survey statistics
export const getSurveyStatistics = async (buildingId, surveyId) => {
    try {
        const response = await get(`/surveys/building/${buildingId}/${surveyId}/statistics/`);
        return response;
    } catch (error) {
        console.error('Get survey statistics error:', error);
        throw error;
    }
};

// Close survey
export const closeSurvey = async (buildingId, surveyId) => {
    try {
        const response = await post(`/surveys/building/${buildingId}/${surveyId}/close/`);
        return response;
    } catch (error) {
        console.error('Close survey error:', error);
        throw error;
    }
};

// Reopen survey
export const reopenSurvey = async (buildingId, surveyId) => {
    try {
        const response = await post(`/surveys/building/${buildingId}/${surveyId}/reopen/`);
        return response;
    } catch (error) {
        console.error('Reopen survey error:', error);
        throw error;
    }
};

// Default export (برای backward compatibility)
const surveysService = {
    getBuildingSurveys,
    getSurveyDetail,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    submitSurveyResponse,
    getSurveyResponses,
    getSurveyStatistics,
    closeSurvey,
    reopenSurvey
};

export default surveysService;
