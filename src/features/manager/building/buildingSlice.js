import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
    getBuildingsList, 
    registerBuilding, 
    updateBuilding as updateBuildingService, 
    deleteBuilding as deleteBuildingService,
    getBuildingUnits,
    createUnit as createUnitService,
    getUnitDetails,
    updateUnit as updateUnitService,
    deleteUnit as deleteUnitService
} from "../../../shared/services/buildingsService";

export const fetchBuildings = createAsyncThunk(
    "building/fetchBuildings",
    async (buildingId, { rejectWithValue }) => {
        try {
            const response = await getBuildingsList(buildingId);
            return response.results || response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createBuilding = createAsyncThunk(
    "building/createBuilding",
    async (buildingData, { rejectWithValue }) => {
        try {
            console.log("🔥 Sending building data:", buildingData);
            const response = await registerBuilding(buildingData);
            console.log("🔥 Building API response:", response);
            return response.building;
        } catch (error) {
            console.error("❌ Building creation error:", error);
            console.error("❌ Error details:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });
            
            // Extract error message from response
            const errorMessage = error.response?.data?.error || 
                               error.response?.data?.detail || 
                               error.response?.data?.message ||
                               JSON.stringify(error.response?.data) ||
                               error.message;
            
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateBuilding = createAsyncThunk(
    "building/updateBuilding",
    async ({ buildingId, buildingData }, { rejectWithValue }) => {
        try {
            const response = await updateBuildingService(buildingId, buildingData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteBuilding = createAsyncThunk(
    "building/deleteBuilding",
    async (buildingId, { rejectWithValue }) => {
        try {
            await deleteBuildingService(buildingId);
            return buildingId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchBuildingDetails = createAsyncThunk(
    "building/fetchBuildingDetails",
    async (buildingId, { rejectWithValue }) => {
        try {
            const response = await getBuildingDetails(buildingId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchBuildingUnits = createAsyncThunk(
    "building/fetchBuildingUnits",
    async (buildingId, { rejectWithValue }) => {
        try {
            const response = await getBuildingUnits(buildingId);
            return { buildingId, units: response };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createUnit = createAsyncThunk(
    "building/createUnit",
    async ({ buildingId, unitData }, { rejectWithValue }) => {
        try {
            const response = await createUnitService(buildingId, unitData);
            return { buildingId, unit: response };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateUnit = createAsyncThunk(
    "building/updateUnit",
    async ({ buildingId, unitId, unitData }, { rejectWithValue }) => {
        try {
            const response = await updateUnitService(buildingId, unitId, unitData);
            return { buildingId, unitId, unit: response };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteUnit = createAsyncThunk(
    "building/deleteUnit",
    async ({ buildingId, unitId }, { rejectWithValue }) => {
        try {
            await deleteUnitService(buildingId, unitId);
            return { buildingId, unitId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const savedSelectedId = localStorage.getItem("selectedBuildingId");

const buildingSlice = createSlice({
    name: "building",
    initialState: {
        data: [],
        units: {},
        loading: false,
        error: null,
        isCreated: false,
        selectedBuildingId: savedSelectedId ? Number(savedSelectedId) : null,
        selectedBuilding: null,
    },
    reducers: {
        resetBuildingState: (state) => {
            state.data = [];
            state.units = {};
            state.isCreated = false;
            state.error = null;
            state.selectedBuildingId = null;
            state.selectedBuilding = null;
            localStorage.removeItem("selectedBuildingId");
        },
        setSelectedBuilding: (state, action) => {
            state.selectedBuildingId = action.payload;
            localStorage.setItem("selectedBuildingId", action.payload);
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch buildings
            .addCase(fetchBuildings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBuildings.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(fetchBuildings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create building
            .addCase(createBuilding.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBuilding.fulfilled, (state, action) => {
                console.log("🔥 Building created successfully:", action.payload);
                state.loading = false;
                state.data.push(action.payload);
                state.isCreated = true;
                state.error = null;
                console.log("🔥 Updated buildings list:", state.data);
            })
            .addCase(createBuilding.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update building
            .addCase(updateBuilding.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBuilding.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.data.findIndex(building => building.building_id === action.payload.building_id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateBuilding.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete building
            .addCase(deleteBuilding.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBuilding.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter(building => building.building_id !== action.payload);
                if (state.selectedBuildingId === action.payload) {
                    state.selectedBuildingId = null;
                    state.selectedBuilding = null;
                    localStorage.removeItem("selectedBuildingId");
                }
                state.error = null;
            })
            .addCase(deleteBuilding.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch building details
            .addCase(fetchBuildingDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBuildingDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedBuilding = action.payload;
                state.error = null;
            })
            .addCase(fetchBuildingDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch building units
            .addCase(fetchBuildingUnits.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBuildingUnits.fulfilled, (state, action) => {
                state.loading = false;
                // Extract units array from the response
                const units = action.payload.units?.units || action.payload.units || [];
                state.units[action.payload.buildingId] = units;
                state.error = null;
            })
            .addCase(fetchBuildingUnits.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create unit
            .addCase(createUnit.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUnit.fulfilled, (state, action) => {
                state.loading = false;
                if (!state.units[action.payload.buildingId]) {
                    state.units[action.payload.buildingId] = [];
                }
                state.units[action.payload.buildingId].push(action.payload.unit);
                state.error = null;
            })
            .addCase(createUnit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update unit
            .addCase(updateUnit.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUnit.fulfilled, (state, action) => {
                state.loading = false;
                if (state.units[action.payload.buildingId]) {
                    const index = state.units[action.payload.buildingId].findIndex(
                        unit => unit.id === action.payload.unitId
                    );
                    if (index !== -1) {
                        state.units[action.payload.buildingId][index] = action.payload.unit;
                    }
                }
                state.error = null;
            })
            .addCase(updateUnit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete unit
            .addCase(deleteUnit.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUnit.fulfilled, (state, action) => {
                state.loading = false;
                if (state.units[action.payload.buildingId]) {
                    state.units[action.payload.buildingId] = state.units[action.payload.buildingId].filter(
                        unit => unit.id !== action.payload.unitId
                    );
                }
                state.error = null;
            })
            .addCase(deleteUnit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetBuildingState, setSelectedBuilding, clearError } = buildingSlice.actions;

// Selectors
export const selectSelectedBuilding = (state) => {
    const id = state.building.selectedBuildingId;
    return state.building.data.find((b) => b.building_id === id) || state.building.selectedBuilding;
};

export const selectBuildingUnits = (state, buildingId) => {
    return state.building.units[buildingId] || [];
};

export const selectBuildingById = (state, buildingId) => {
    return state.building.data.find((b) => b.building_id === buildingId);
};

export const selectBuildingsLoading = (state) => state.building.loading;
export const selectBuildingsError = (state) => state.building.error;

export default buildingSlice.reducer;