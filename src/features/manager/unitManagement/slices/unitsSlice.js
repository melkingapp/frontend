import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import unitsApi from "../../../../shared/services/unitsApi";

// Async thunks
export const fetchUnits = createAsyncThunk(
  "units/fetchUnits",
  async (buildingId, { rejectWithValue }) => {
    try {
      console.log("🔥 fetchUnits - Building ID:", buildingId);
      const response = await unitsApi.getBuildingUnits(buildingId);
      console.log("🔥 fetchUnits - API response:", response);
      return response.units || [];
    } catch (error) {
      console.error("🔥 fetchUnits - Error:", error);
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchUnitDetail = createAsyncThunk(
  "units/fetchUnitDetail",
  async ({ buildingId, unitId }, { rejectWithValue }) => {
    try {
      const response = await unitsApi.getUnitDetail(buildingId, unitId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createUnit = createAsyncThunk(
  "units/createUnit",
  async ({ buildingId, unitData }, { rejectWithValue }) => {
    try {
      const response = await unitsApi.createUnit(buildingId, unitData);
      if (response.success === false) {
        return rejectWithValue(response.error || 'خطا در ایجاد واحد');
      }
      return response.unit;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || 'خطا در ایجاد واحد');
    }
  }
);

export const updateUnit = createAsyncThunk(
  "units/updateUnit",
  async ({ buildingId, unitId, unitData }, { rejectWithValue }) => {
    try {
      const response = await unitsApi.updateUnit(buildingId, unitId, unitData);
      return response.unit;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteUnit = createAsyncThunk(
  "units/deleteUnit",
  async ({ buildingId, unitId }, { rejectWithValue }) => {
    try {
      const response = await unitsApi.deleteUnit(buildingId, unitId);
      if (response.success === false) {
        return rejectWithValue(response.error || 'خطا در حذف واحد');
      }
      return unitId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || 'خطا در حذف واحد');
    }
  }
);

export const createManagerUnit = createAsyncThunk(
  "units/createManagerUnit",
  async (buildingId, { rejectWithValue }) => {
    try {
      const response = await unitsApi.createManagerUnit(buildingId);
      if (response.success) {
        return response.manager_unit;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const unitsSlice = createSlice({
  name: "units",
  initialState: {
    units: [],
    selectedUnit: null,
    loading: false,
    error: null,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedUnit: (state, action) => {
      state.selectedUnit = action.payload;
    },
    clearSelectedUnit: (state) => {
      state.selectedUnit = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch units
      .addCase(fetchUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.units = action.payload;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch unit detail
      .addCase(fetchUnitDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnitDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUnit = action.payload;
      })
      .addCase(fetchUnitDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create unit
      .addCase(createUnit.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.createLoading = false;
        state.units.push(action.payload);
      })
      .addCase(createUnit.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      
      // Update unit
      .addCase(updateUnit.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateUnit.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.units.findIndex(unit => unit.units_id === action.payload.units_id);
        if (index !== -1) {
          state.units[index] = action.payload;
        }
        if (state.selectedUnit && state.selectedUnit.units_id === action.payload.units_id) {
          state.selectedUnit = action.payload;
        }
      })
      .addCase(updateUnit.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      
      // Delete unit
      .addCase(deleteUnit.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteUnit.fulfilled, (state, action) => {
        state.deleteLoading = false;
        // Filter out the deleted unit by both units_id and id to handle different ID formats
        state.units = state.units.filter(unit => 
          unit.units_id !== action.payload && unit.id !== action.payload
        );
        if (state.selectedUnit && 
            (state.selectedUnit.units_id === action.payload || state.selectedUnit.id === action.payload)) {
          state.selectedUnit = null;
        }
      })
      .addCase(deleteUnit.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })
      
      // Create manager unit
      .addCase(createManagerUnit.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createManagerUnit.fulfilled, (state, action) => {
        state.createLoading = false;
        state.units.push(action.payload);
      })
      .addCase(createManagerUnit.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSelectedUnit, clearSelectedUnit } = unitsSlice.actions;
export default unitsSlice.reducer;
