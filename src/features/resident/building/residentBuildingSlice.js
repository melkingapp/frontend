import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getResidentRequests, getApprovedBuildings, getBuildingDetails } from '../../../shared/services/residentRequestsService';

// Token refresh helper
const handleTokenRefresh = async (dispatch) => {
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || (window.location.protocol === 'https:' ? 'https://melkingapp.ir/api/v1' : 'http://melkingapp.ir/api/v1')}/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            console.log('Token refreshed successfully');
            return true;
        } else {
            throw new Error('Token refresh failed');
        }
    } catch (error) {
        console.error('Token refresh error:', error);
        throw error;
    }
};

// Async thunks
export const fetchResidentRequests = createAsyncThunk(
    'residentBuilding/fetchResidentRequests',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await getResidentRequests();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchApprovedBuildings = createAsyncThunk(
    'residentBuilding/fetchApprovedBuildings',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getApprovedBuildings();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchApprovedBuildingsDetails = createAsyncThunk(
    'residentBuilding/fetchApprovedBuildingsDetails',
    async (buildingIds, { rejectWithValue, dispatch }) => {
        try {
            console.log('Fetching building details for IDs:', buildingIds);
            
            const fetchBuildingDetails = async (buildingId) => {
                try {
                    const response = await getBuildingDetails(buildingId);
                    return response;
                } catch (error) {
                    console.error(`Failed to fetch building ${buildingId}:`, error);
                    return null;
                }
            };
            
            const buildingPromises = buildingIds.map(async (buildingId) => {
                try {
                    return await fetchBuildingDetails(buildingId);
                } catch (error) {
                    console.error(`Failed to fetch building ${buildingId}:`, error);
                    return null;
                }
            });
            
            const buildings = await Promise.all(buildingPromises);
            const validBuildings = buildings.filter(building => building !== null);
            console.log('Valid buildings fetched:', validBuildings);
            return validBuildings;
        } catch (error) {
            console.error('Error in fetchApprovedBuildingsDetails:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Load data from localStorage
const getInitialData = () => {
    try {
        const savedBuilding = localStorage.getItem('selectedResidentBuilding');
        const savedRequests = localStorage.getItem('residentRequests');
        const savedBuildings = localStorage.getItem('residentBuildings');
        return {
            selectedBuilding: savedBuilding ? JSON.parse(savedBuilding) : null,
            requests: savedRequests ? JSON.parse(savedRequests) : [],
            buildings: savedBuildings ? JSON.parse(savedBuildings) : [],
        };
    } catch {
        return {
            selectedBuilding: null,
            requests: [],
            buildings: [],
        };
    }
};

const initialData = getInitialData();

const initialState = {
    requests: initialData.requests,
    approvedBuildings: initialData.buildings,
    selectedBuilding: initialData.selectedBuilding,
    loading: false,
    error: null,
};

const residentBuildingSlice = createSlice({
    name: 'residentBuilding',
    initialState,
    reducers: {
        setSelectedBuilding: (state, action) => {
            state.selectedBuilding = action.payload;
            // Save to localStorage
            try {
                localStorage.setItem('selectedResidentBuilding', JSON.stringify(action.payload));
            } catch (error) {
                console.error('Failed to save selected building to localStorage:', error);
            }
        },
        clearSelectedBuilding: (state) => {
            state.selectedBuilding = null;
            // Remove from localStorage
            try {
                localStorage.removeItem('selectedResidentBuilding');
            } catch (error) {
                console.error('Failed to remove selected building from localStorage:', error);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch resident requests
            .addCase(fetchResidentRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResidentRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload.requests || [];
                // Save requests to localStorage
                try {
                    localStorage.setItem('residentRequests', JSON.stringify(action.payload.requests || []));
                } catch (error) {
                    console.error('Failed to save requests to localStorage:', error);
                }
            })
            .addCase(fetchResidentRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch approved buildings
            .addCase(fetchApprovedBuildings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApprovedBuildings.fulfilled, (state, action) => {
                state.loading = false;
                state.approvedBuildings = action.payload.buildings || [];
            })
            .addCase(fetchApprovedBuildings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch approved buildings details
            .addCase(fetchApprovedBuildingsDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApprovedBuildingsDetails.fulfilled, (state, action) => {
                state.loading = false;
                // Merge new buildings with existing ones
                const existingIds = state.approvedBuildings.map(b => b.building_id || b.id);
                const newBuildings = action.payload.filter(b => !existingIds.includes(b.building_id || b.id));
                state.approvedBuildings = [...state.approvedBuildings, ...newBuildings];
                
                // Save buildings to localStorage
                try {
                    localStorage.setItem('residentBuildings', JSON.stringify(state.approvedBuildings));
                } catch (error) {
                    console.error('Failed to save buildings to localStorage:', error);
                }
            })
            .addCase(fetchApprovedBuildingsDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Handle refresh approved buildings
            .addCase(refreshApprovedBuildings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(refreshApprovedBuildings.fulfilled, (state, action) => {
                state.loading = false;
                // Replace buildings with fresh data from BuildingUser table
                const newBuildings = action.payload || [];
                state.approvedBuildings = newBuildings;
                
                // If selected building is no longer in the list, clear it
                if (state.selectedBuilding && !newBuildings.find(b => 
                    (b.building_id || b.id) === (state.selectedBuilding.building_id || state.selectedBuilding.id)
                )) {
                    state.selectedBuilding = null;
                    localStorage.removeItem('selectedResidentBuilding');
                }
                
                // Don't auto-select - let user choose or keep existing selection
                // Only restore from localStorage if no selection exists
                if (!state.selectedBuilding) {
                    try {
                        const savedBuilding = localStorage.getItem('selectedResidentBuilding');
                        if (savedBuilding) {
                            const parsedBuilding = JSON.parse(savedBuilding);
                            // Check if saved building still exists in new buildings
                            const buildingExists = newBuildings.find(b => 
                                (b.building_id || b.id) === (parsedBuilding.building_id || parsedBuilding.id)
                            );
                            if (buildingExists) {
                                state.selectedBuilding = parsedBuilding;
                            }
                        }
                    } catch (error) {
                        console.error('Failed to restore selected building from localStorage:', error);
                    }
                }
                
                // Save updated state to localStorage
                try {
                    localStorage.setItem('residentBuildings', JSON.stringify(newBuildings));
                } catch (error) {
                    console.error('Failed to save buildings to localStorage:', error);
                }
            })
            .addCase(refreshApprovedBuildings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(maintainApprovedBuildings.fulfilled, (state, action) => {
                console.log('🔄 Maintained approved buildings:', action.payload.length);
                // Don't change state, just maintain current buildings
            });
    },
});

// Action to refresh approved buildings (for when user is removed from a building)
export const refreshApprovedBuildings = createAsyncThunk(
    'residentBuilding/refreshApprovedBuildings',
    async (_, { rejectWithValue, dispatch, getState }) => {
        try {
            console.log('🔄 Refreshing approved buildings...');
            
            // Get buildings directly from the building list API (which uses BuildingUser table)
            const response = await getApprovedBuildings();
            const buildings = response.results || response;
            
            console.log('🏢 Buildings received from API:', buildings);
            console.log('📊 Number of buildings:', buildings.length);
            
            if (buildings.length > 0) {
                buildings.forEach((building, index) => {
                    console.log(`  ${index + 1}. ${building.title} (ID: ${building.building_id || building.id})`);
                });
                return buildings;
            } else {
                console.log('⚠️ No buildings found from API - using current state as fallback...');
                
                // Fallback: Use current approved buildings from state if available
                const state = getState();
                const currentApprovedBuildings = state.residentBuilding.approvedBuildings;
                
                if (currentApprovedBuildings && currentApprovedBuildings.length > 0) {
                    console.log('🔄 Using current state as fallback:', currentApprovedBuildings.length, 'buildings');
                    return currentApprovedBuildings;
                }
                
                console.log('⚠️ No fallback available - returning empty array');
                return [];
            }
        } catch (error) {
            console.error('❌ Error refreshing approved buildings:', error);
            
            // Fallback: Use current state if API fails
            try {
                const state = getState();
                const currentApprovedBuildings = state.residentBuilding.approvedBuildings;
                
                if (currentApprovedBuildings && currentApprovedBuildings.length > 0) {
                    console.log('🔄 API failed, using current state as fallback:', currentApprovedBuildings.length, 'buildings');
                    return currentApprovedBuildings;
                }
            } catch (stateError) {
                console.error('❌ State fallback also failed:', stateError);
            }
            
            return rejectWithValue(error.message);
        }
    }
);

// Action to maintain current approved buildings (fallback when API fails)
export const maintainApprovedBuildings = createAsyncThunk(
    'residentBuilding/maintainApprovedBuildings',
    async (_, { getState }) => {
        const state = getState();
        const currentApprovedBuildings = state.residentBuilding.approvedBuildings;
        
        console.log('🔄 Maintaining current approved buildings:', currentApprovedBuildings.length);
        
        if (currentApprovedBuildings && currentApprovedBuildings.length > 0) {
            return currentApprovedBuildings;
        }
        
        return [];
    }
);

export const { setSelectedBuilding, clearSelectedBuilding } = residentBuildingSlice.actions;

// Selectors
export const selectResidentRequests = (state) => state.residentBuilding.requests;
export const selectApprovedBuildings = (state) => state.residentBuilding.approvedBuildings;
export const selectSelectedResidentBuilding = (state) => state.residentBuilding.selectedBuilding;
export const selectResidentBuildingLoading = (state) => state.residentBuilding.loading;
export const selectResidentBuildingError = (state) => state.residentBuilding.error;

export default residentBuildingSlice.reducer;
