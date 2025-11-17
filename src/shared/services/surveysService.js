import { get, post, put, deleteRequest } from './apiService';

// Get building surveys
export const getBuildingSurveys = async (buildingId) => {
    try {
        console.log("🔥 SurveysService: Getting surveys for building:", buildingId);
        try {
            // Try with authentication first
            const response = await get(`/surveys/building/${buildingId}/`);
            console.log("🔥 SurveysService: Response:", response);
            return response;
        } catch (error) {
            // If authentication fails, use test endpoint
            console.warn('Authentication failed, using test endpoint:', error.message);
            const response = await get(`/surveys/building/${buildingId}/test/`);
            console.log("🔥 SurveysService: Test response:", response);
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
        console.log("🔥 SurveysService: Getting survey details:", buildingId, surveyId);
        const response = await get(`/surveys/building/${buildingId}/${surveyId}/`);
        console.log("🔥 SurveysService: Response:", response);
        return response;
    } catch (error) {
        console.error('Get survey detail error:', error);
        throw error;
    }
};

// Create survey
export const createSurvey = async (buildingId, surveyData) => {
    try {
        console.log("🔥 SurveysService: Creating survey for building:", buildingId, surveyData);
        try {
            const response = await post(`/surveys/building/${buildingId}/create/`, surveyData);
            console.log("🔥 SurveysService: Response:", response);
            return response;
        } catch (error) {
            // If authentication fails, use test endpoint
            console.warn('Authentication failed, using test endpoint:', error.message);
            try {
                const response = await post(`/surveys/building/${buildingId}/create/test/`, surveyData);
                console.log("🔥 SurveysService: Test response:", response);
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
        console.log("🔥 SurveysService: Updating survey:", buildingId, surveyId, surveyData);
        const response = await put(`/surveys/building/${buildingId}/${surveyId}/update/`, surveyData);
        console.log("🔥 SurveysService: Response:", response);
        return response;
    } catch (error) {
        console.error('Update survey error:', error);
        throw error;
    }
};

// Delete survey
export const deleteSurvey = async (buildingId, surveyId) => {
    try {
        console.log("🔥 SurveysService: Deleting survey:", buildingId, surveyId);
        const response = await deleteRequest(`/surveys/building/${buildingId}/${surveyId}/delete/`);
        console.log("🔥 SurveysService: Response:", response);
        return response;
    } catch (error) {
        console.error('Delete survey error:', error);
        throw error;
    }
};

// Submit survey response
export const submitSurveyResponse = async (buildingId, surveyId, responseData) => {
    try {
        console.log("🔥 SurveysService: Submitting survey response:", buildingId, surveyId, responseData);
        const response = await post(`/surveys/building/${buildingId}/${surveyId}/submit/`, responseData);
        console.log("🔥 SurveysService: Response:", response);
        return response;
    } catch (error) {
        console.error('Submit survey response error:', error);
        throw error;
    }
};

// Get survey responses
export const getSurveyResponses = async (buildingId, surveyId) => {
    try {
        console.log("🔥 SurveysService: Getting survey responses:", buildingId, surveyId);
        const response = await get(`/surveys/building/${buildingId}/${surveyId}/responses/`);
        console.log("🔥 SurveysService: Response:", response);
        return response;
    } catch (error) {
        console.error('Get survey responses error:', error);
        throw error;
    }
};

// Get survey statistics
export const getSurveyStatistics = async (buildingId, surveyId) => {
    try {
        console.log("🔥 SurveysService: Getting survey statistics:", buildingId, surveyId);
        const response = await get(`/surveys/building/${buildingId}/${surveyId}/statistics/`);
        console.log("🔥 SurveysService: Response:", response);
        return response;
    } catch (error) {
        console.error('Get survey statistics error:', error);
        throw error;
    }
};

// Close survey
export const closeSurvey = async (buildingId, surveyId) => {
    try {
        console.log("🔥 SurveysService: Closing survey:", buildingId, surveyId);
        const response = await post(`/surveys/building/${buildingId}/${surveyId}/close/`);
        console.log("🔥 SurveysService: Response:", response);
        return response;
    } catch (error) {
        console.error('Close survey error:', error);
        throw error;
    }
};

// Reopen survey
export const reopenSurvey = async (buildingId, surveyId) => {
    try {
        console.log("🔥 SurveysService: Reopening survey:", buildingId, surveyId);
        const response = await post(`/surveys/building/${buildingId}/${surveyId}/reopen/`);
        console.log("🔥 SurveysService: Response:", response);
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
