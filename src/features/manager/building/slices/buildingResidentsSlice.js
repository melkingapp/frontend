import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching building residents
export const fetchBuildingResidents = createAsyncThunk(
    'buildingResidents/fetchBuildingResidents',
    async (buildingId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('access_token');
            const baseURL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                ? 'http://127.0.0.1:8000'
                : 'https://melkingapp.ir';
            const response = await fetch(`${baseURL}/api/v1/buildings/${buildingId}/resident-requests/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.error || 'خطا در دریافت لیست ساکنان');
            }

            // Log the received data for debugging
            console.log('Building residents API response:', data);
            console.log('All requests:', data.requests);
            
            // Filter only approved residents
            const approvedResidents = (data.requests || []).filter(request => {
                console.log('Request data:', request);
                console.log('User data:', {
                    resident_name: request.resident_name,
                    resident_username: request.resident_username,
                    resident_phone: request.resident_phone,
                    status: request.status
                });
                return request.status === 'approved' || request.status === 'owner_approved' || request.status === 'manager_approved';
            });
            
            console.log('Approved residents:', approvedResidents);
            return approvedResidents;
        } catch (error) {
            return rejectWithValue('خطا در دریافت لیست ساکنان');
        }
    }
);

// Async thunk for updating resident status (remove from building)
export const updateResidentStatus = createAsyncThunk(
    'buildingResidents/updateResidentStatus',
    async ({ requestId, status }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('access_token');
            const baseURL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                ? 'http://127.0.0.1:8000'
                : 'https://melkingapp.ir';
            const response = await fetch(`${baseURL}/api/v1/buildings/resident-requests/${requestId}/update-status/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.error || 'خطا در به‌روزرسانی وضعیت');
            }

            return { requestId, status, data: data.request };
        } catch (error) {
            return rejectWithValue('خطا در به‌روزرسانی وضعیت');
        }
    }
);

const initialState = {
    residents: [],
    loading: false,
    error: null,
    updatingResident: null,
};

const buildingResidentsSlice = createSlice({
    name: 'buildingResidents',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearResidents: (state) => {
            state.residents = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch building residents
            .addCase(fetchBuildingResidents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBuildingResidents.fulfilled, (state, action) => {
                state.loading = false;
                state.residents = action.payload;
                state.error = null;
            })
            .addCase(fetchBuildingResidents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Update resident status
            .addCase(updateResidentStatus.pending, (state, action) => {
                state.updatingResident = action.meta.arg.requestId;
            })
            .addCase(updateResidentStatus.fulfilled, (state, action) => {
                state.updatingResident = null;
                
                // If status is rejected, remove from residents list
                if (action.payload.status === 'rejected') {
                    state.residents = state.residents.filter(
                        resident => resident.request_id !== action.payload.requestId
                    );
                }
            })
            .addCase(updateResidentStatus.rejected, (state, action) => {
                state.updatingResident = null;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearResidents } = buildingResidentsSlice.actions;

// Selectors
export const selectBuildingResidents = (state) => state.buildingResidents.residents;
export const selectBuildingResidentsLoading = (state) => state.buildingResidents.loading;
export const selectBuildingResidentsError = (state) => state.buildingResidents.error;
export const selectUpdatingResident = (state) => state.buildingResidents.updatingResident;

export default buildingResidentsSlice.reducer;
