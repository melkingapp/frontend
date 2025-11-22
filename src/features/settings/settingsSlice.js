import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import SettingsService from '../../shared/services/settingsService';

const initialState = {
    buildingSettings: null,
    buildingDocuments: [],
    notificationSettings: null,
    loading: false,
    error: null,
};

// Async Thunks
export const fetchBuildingSettings = createAsyncThunk(
    'settings/fetchBuildingSettings',
    async (buildingId, { rejectWithValue }) => {
        try {
            const response = await SettingsService.getBuildingSettings(buildingId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateBuildingSettings = createAsyncThunk(
    'settings/updateBuildingSettings',
    async ({ buildingId, data }, { rejectWithValue }) => {
        try {
            const response = await SettingsService.updateBuildingSettings(buildingId, data);
            // Handle different response structures
            if (response?.data?.building) {
                return response.data.building;
            } else if (response?.data) {
                return response.data;
            } else if (response?.building) {
                return response.building;
            } else {
                return response;
            }
        } catch (error) {
            // Handle different error structures
            const errorData = error?.response?.data || error?.data || error;
            return rejectWithValue(errorData);
        }
    }
);

export const fetchBuildingDocuments = createAsyncThunk(
    'settings/fetchBuildingDocuments',
    async (buildingId, { rejectWithValue }) => {
        try {
            const response = await SettingsService.getBuildingDocuments(buildingId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const uploadBuildingDocument = createAsyncThunk(
    'settings/uploadBuildingDocument',
    async ({ buildingId, data }, { rejectWithValue }) => {
        try {
            const response = await SettingsService.uploadBuildingDocument(buildingId, data);
            return response.data.document;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteBuildingDocument = createAsyncThunk(
    'settings/deleteBuildingDocument',
    async ({ buildingId, documentId }, { rejectWithValue }) => {
        try {
            await SettingsService.deleteBuildingDocument(buildingId, documentId);
            return documentId;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchNotificationSettings = createAsyncThunk(
    'settings/fetchNotificationSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await SettingsService.getNotificationSettings();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateNotificationSettings = createAsyncThunk(
    'settings/updateNotificationSettings',
    async (data, { rejectWithValue }) => {
        try {
            const response = await SettingsService.updateNotificationSettings(data);
            return response.data.settings;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateUnitResidentCount = createAsyncThunk(
    'settings/updateUnitResidentCount',
    async ({ buildingId, unitId, data }, { rejectWithValue }) => {
        try {
            const response = await SettingsService.updateUnitResidentCount(buildingId, unitId, data);
            return response.data.unit;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        clearSettingsError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Building Settings
            .addCase(fetchBuildingSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBuildingSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.buildingSettings = action.payload;
            })
            .addCase(fetchBuildingSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Building Settings
            .addCase(updateBuildingSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBuildingSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.buildingSettings = action.payload;
            })
            .addCase(updateBuildingSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Building Documents
            .addCase(fetchBuildingDocuments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBuildingDocuments.fulfilled, (state, action) => {
                state.loading = false;
                state.buildingDocuments = action.payload;
            })
            .addCase(fetchBuildingDocuments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Upload Building Document
            .addCase(uploadBuildingDocument.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadBuildingDocument.fulfilled, (state, action) => {
                state.loading = false;
                state.buildingDocuments.push(action.payload);
            })
            .addCase(uploadBuildingDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete Building Document
            .addCase(deleteBuildingDocument.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBuildingDocument.fulfilled, (state, action) => {
                state.loading = false;
                state.buildingDocuments = state.buildingDocuments.filter(
                    (doc) => doc.document_id !== action.payload
                );
            })
            .addCase(deleteBuildingDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Notification Settings
            .addCase(fetchNotificationSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotificationSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.notificationSettings = action.payload;
            })
            .addCase(fetchNotificationSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Notification Settings
            .addCase(updateNotificationSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateNotificationSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.notificationSettings = action.payload;
            })
            .addCase(updateNotificationSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Unit Resident Count
            .addCase(updateUnitResidentCount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUnitResidentCount.fulfilled, (state) => {
                state.loading = false;
                // Optionally update the unit in a larger units state if needed
                // For now, just clear loading
            })
            .addCase(updateUnitResidentCount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearSettingsError } = settingsSlice.actions;

export default settingsSlice.reducer;
