import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
    getBuildingSurveys, 
    getSurveyDetail, 
    createSurvey as createSurveyService, 
    updateSurvey as updateSurveyService, 
    deleteSurvey as deleteSurveyService, 
    submitSurveyResponse as submitSurveyResponseService, 
    getSurveyResponses, 
    getSurveyStatistics, 
    closeSurvey as closeSurveyService, 
    reopenSurvey as reopenSurveyService 
} from "../../../../shared/services/surveysService";

// Async thunks for surveys
export const fetchBuildingSurveys = createAsyncThunk(
    "surveys/fetchBuildingSurveys",
    async (buildingId, { rejectWithValue }) => {
        try {
            console.log("🔥 fetchBuildingSurveys - Building ID:", buildingId);
            const response = await getBuildingSurveys(buildingId);
            console.log("🔥 fetchBuildingSurveys - API response:", response);
            return response;
        } catch (error) {
            console.error("🔥 fetchBuildingSurveys - Error:", error);
            return rejectWithValue(error.message || 'خطا در دریافت نظرسنجی‌ها');
        }
    }
);

export const fetchSurveyDetails = createAsyncThunk(
    "surveys/fetchSurveyDetails",
    async ({ buildingId, surveyId }, { rejectWithValue }) => {
        try {
            const response = await getSurveyDetail(buildingId, surveyId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createSurvey = createAsyncThunk(
    "surveys/createSurvey",
    async ({ buildingId, surveyData }, { rejectWithValue }) => {
        try {
            console.log("🔥 createSurvey - Building ID:", buildingId, "Data:", surveyData);
            const response = await createSurveyService(buildingId, surveyData);
            console.log("🔥 createSurvey - API response:", response);
            return response;
        } catch (error) {
            console.error("🔥 createSurvey - Error:", error);
            return rejectWithValue(error.message || 'خطا در ایجاد نظرسنجی');
        }
    }
);

export const updateSurvey = createAsyncThunk(
    "surveys/updateSurvey",
    async ({ buildingId, surveyId, surveyData }, { rejectWithValue }) => {
        try {
            const response = await updateSurveyService(buildingId, surveyId, surveyData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteSurvey = createAsyncThunk(
    "surveys/deleteSurvey",
    async ({ buildingId, surveyId }, { rejectWithValue }) => {
        try {
            await deleteSurveyService(buildingId, surveyId);
            return { buildingId, surveyId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchSurveyResponses = createAsyncThunk(
    "surveys/fetchSurveyResponses",
    async ({ buildingId, surveyId }, { rejectWithValue }) => {
        try {
            const response = await getSurveyResponses(buildingId, surveyId);
            return { surveyId, responses: response };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const submitSurveyResponse = createAsyncThunk(
    "surveys/submitSurveyResponse",
    async ({ buildingId, surveyId, responseData }, { rejectWithValue }) => {
        try {
            const response = await submitSurveyResponseService(buildingId, surveyId, responseData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchSurveyStatistics = createAsyncThunk(
    "surveys/fetchSurveyStatistics",
    async ({ buildingId, surveyId }, { rejectWithValue }) => {
        try {
            const response = await getSurveyStatistics(buildingId, surveyId);
            return { surveyId, statistics: response };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const closeSurvey = createAsyncThunk(
    "surveys/closeSurvey",
    async ({ buildingId, surveyId }, { rejectWithValue }) => {
        try {
            const response = await closeSurveyService(buildingId, surveyId);
            return { surveyId, response };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const reopenSurvey = createAsyncThunk(
    "surveys/reopenSurvey",
    async ({ buildingId, surveyId }, { rejectWithValue }) => {
        try {
            const response = await reopenSurveyService(buildingId, surveyId);
            return { surveyId, response };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    surveys: [],
    surveyDetails: null,
    surveyResponses: {},
    surveyStatistics: {},
    loading: false,
    error: null,
};

const surveysSlice = createSlice({
    name: "surveys",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSurveyDetails: (state) => {
            state.surveyDetails = null;
        },
        clearSurveyResponses: (state, action) => {
            if (action.payload) {
                delete state.surveyResponses[action.payload];
            } else {
                state.surveyResponses = {};
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch building surveys
            .addCase(fetchBuildingSurveys.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBuildingSurveys.fulfilled, (state, action) => {
                state.loading = false;
                // Handle both array and object responses
                state.surveys = Array.isArray(action.payload) 
                    ? action.payload 
                    : (action.payload.surveys || []);
                state.error = null;
            })
            .addCase(fetchBuildingSurveys.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch survey details
            .addCase(fetchSurveyDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSurveyDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.surveyDetails = action.payload;
                state.error = null;
            })
            .addCase(fetchSurveyDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create survey
            .addCase(createSurvey.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createSurvey.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.survey) {
                    state.surveys.unshift(action.payload.survey);
                }
                state.error = null;
            })
            .addCase(createSurvey.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update survey
            .addCase(updateSurvey.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSurvey.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.surveys.findIndex(survey => survey.id === action.payload.id);
                if (index !== -1) {
                    state.surveys[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateSurvey.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete survey
            .addCase(deleteSurvey.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSurvey.fulfilled, (state, action) => {
                state.loading = false;
                state.surveys = state.surveys.filter(survey => survey.id !== action.payload.surveyId);
                state.error = null;
            })
            .addCase(deleteSurvey.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch survey responses
            .addCase(fetchSurveyResponses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSurveyResponses.fulfilled, (state, action) => {
                state.loading = false;
                state.surveyResponses[action.payload.surveyId] = action.payload.responses;
                state.error = null;
            })
            .addCase(fetchSurveyResponses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Submit survey response
            .addCase(submitSurveyResponse.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitSurveyResponse.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(submitSurveyResponse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch survey statistics
            .addCase(fetchSurveyStatistics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSurveyStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.surveyStatistics[action.payload.surveyId] = action.payload.statistics;
                state.error = null;
            })
            .addCase(fetchSurveyStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Close survey
            .addCase(closeSurvey.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(closeSurvey.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.surveys.findIndex(survey => survey.id === action.payload.surveyId);
                if (index !== -1) {
                    state.surveys[index].status = 'closed';
                }
                state.error = null;
            })
            .addCase(closeSurvey.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Reopen survey
            .addCase(reopenSurvey.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(reopenSurvey.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.surveys.findIndex(survey => survey.id === action.payload.surveyId);
                if (index !== -1) {
                    state.surveys[index].status = 'active';
                }
                state.error = null;
            })
            .addCase(reopenSurvey.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearSurveyDetails, clearSurveyResponses } = surveysSlice.actions;

// Selectors
export const selectSurveys = (state) => state.surveys.surveys;
export const selectSurveyDetails = (state) => state.surveys.surveyDetails;
export const selectSurveyResponses = (state, surveyId) => state.surveys.surveyResponses[surveyId] || [];
export const selectSurveyStatistics = (state, surveyId) => state.surveys.surveyStatistics[surveyId] || null;
export const selectSurveysLoading = (state) => state.surveys.loading;
export const selectSurveysError = (state) => state.surveys.error;

export default surveysSlice.reducer;
