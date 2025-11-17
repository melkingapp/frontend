import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
    getBuildingServices, 
    getServiceDetail, 
    createService as createServiceService, 
    updateService as updateServiceService, 
    deleteService as deleteServiceService,
    updateServiceStatus as updateServiceStatusService
} from "../../../../shared/services/servicesService";

// Async thunks for services
export const fetchBuildingServices = createAsyncThunk(
    "services/fetchBuildingServices",
    async (buildingId, { rejectWithValue }) => {
        try {
            console.log("🔥 fetchBuildingServices - Building ID:", buildingId);
            const response = await getBuildingServices(buildingId);
            console.log("🔥 fetchBuildingServices - API response:", response);
            // Return only the services array
            return response.services || response;
        } catch (error) {
            console.error("🔥 fetchBuildingServices - Error:", error);
            return rejectWithValue(error.message || 'خطا در دریافت خدمات');
        }
    }
);

export const fetchServiceDetails = createAsyncThunk(
    "services/fetchServiceDetails",
    async ({ buildingId, serviceId }, { rejectWithValue }) => {
        try {
            const response = await getServiceDetail(buildingId, serviceId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createService = createAsyncThunk(
    "services/createService",
    async ({ buildingId, serviceData }, { rejectWithValue }) => {
        try {
            console.log("🔥 createService - Building ID:", buildingId, "Data:", serviceData);
            const response = await createServiceService(buildingId, serviceData);
            console.log("🔥 createService - API response:", response);
            // Return only the service data
            return response.service || response;
        } catch (error) {
            console.error("🔥 createService - Error:", error);
            return rejectWithValue(error.message || 'خطا در ایجاد سرویس');
        }
    }
);

export const updateService = createAsyncThunk(
    "services/updateService",
    async ({ buildingId, serviceId, serviceData }, { rejectWithValue }) => {
        try {
            const response = await updateServiceService(buildingId, serviceId, serviceData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteService = createAsyncThunk(
    "services/deleteService",
    async ({ buildingId, serviceId }, { rejectWithValue }) => {
        try {
            await deleteServiceService(buildingId, serviceId);
            return { buildingId, serviceId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateServiceStatus = createAsyncThunk(
    "services/updateServiceStatus",
    async ({ buildingId, serviceId, status }, { rejectWithValue }) => {
        try {
            const response = await updateServiceStatusService(buildingId, serviceId, status);
            return { serviceId, status, response };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    services: [],
    serviceDetails: null,
    loading: false,
    error: null,
};

const servicesSlice = createSlice({
    name: "services",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearServiceDetails: (state) => {
            state.serviceDetails = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch building services
            .addCase(fetchBuildingServices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBuildingServices.fulfilled, (state, action) => {
                state.loading = false;
                state.services = action.payload;
                state.error = null;
            })
            .addCase(fetchBuildingServices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch service details
            .addCase(fetchServiceDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchServiceDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.serviceDetails = action.payload;
                state.error = null;
            })
            .addCase(fetchServiceDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create service
            .addCase(createService.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createService.fulfilled, (state, action) => {
                state.loading = false;
                state.services.unshift(action.payload);
                state.error = null;
            })
            .addCase(createService.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update service
            .addCase(updateService.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateService.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.services.findIndex(service => service.id === action.payload.id);
                if (index !== -1) {
                    state.services[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateService.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete service
            .addCase(deleteService.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteService.fulfilled, (state, action) => {
                state.loading = false;
                state.services = state.services.filter(service => service.id !== action.payload.serviceId);
                state.error = null;
            })
            .addCase(deleteService.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update service status
            .addCase(updateServiceStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateServiceStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.services.findIndex(service => service.id === action.payload.serviceId);
                if (index !== -1) {
                    state.services[index].status = action.payload.status;
                }
                state.error = null;
            })
            .addCase(updateServiceStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearServiceDetails } = servicesSlice.actions;

// Selectors
export const selectServices = (state) => state.services.services;
export const selectServiceDetails = (state) => state.services.serviceDetails;
export const selectServicesLoading = (state) => state.services.loading;
export const selectServicesError = (state) => state.services.error;

export default servicesSlice.reducer;
