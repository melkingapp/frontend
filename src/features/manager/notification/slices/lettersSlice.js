import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBuildingLetters, getLetterDetail, registerLetter as registerLetterService, updateLetter as updateLetterService, deleteLetter as deleteLetterService } from '../../../../shared/services/lettersService';

// Async thunks
export const fetchBuildingLetters = createAsyncThunk(
  'letters/fetchBuildingLetters',
  async (buildingId, { rejectWithValue }) => {
    try {
      console.log("🔥 fetchBuildingLetters - Building ID:", buildingId);
      const response = await getBuildingLetters(buildingId);
      console.log("🔥 fetchBuildingLetters - API response:", response);
      // Return only the letters array
      return response.letters || response;
    } catch (error) {
      console.error("🔥 fetchBuildingLetters - Error:", error);
      return rejectWithValue(error.message || 'خطا در دریافت اخبار');
    }
  }
);

export const fetchLetterDetail = createAsyncThunk(
  'letters/fetchLetterDetail',
  async (letterId, { rejectWithValue }) => {
    try {
      console.log("🔥 fetchLetterDetail - Letter ID:", letterId);
      const response = await getLetterDetail(letterId);
      console.log("🔥 fetchLetterDetail - API response:", response);
      return response;
    } catch (error) {
      console.error("🔥 fetchLetterDetail - Error:", error);
      return rejectWithValue(error.message || 'خطا در دریافت جزئیات خبر');
    }
  }
);

export const createLetter = createAsyncThunk(
  'letters/createLetter',
  async (letterData, { rejectWithValue }) => {
    try {
      console.log("🔥 createLetter - Letter data:", letterData);
      const response = await registerLetterService(letterData);
      console.log("🔥 createLetter - API response:", response);
      // Return only the letter data
      return response.letter || response;
    } catch (error) {
      console.error("🔥 createLetter - Error:", error);
      return rejectWithValue(error.message || 'خطا در ایجاد خبر');
    }
  }
);

export const updateLetter = createAsyncThunk(
  'letters/updateLetter',
  async ({ letterId, letterData }, { rejectWithValue }) => {
    try {
      console.log("🔥 updateLetter - Letter ID:", letterId, "Data:", letterData);
      const response = await updateLetterService(letterId, letterData);
      console.log("🔥 updateLetter - API response:", response);
      // Return only the letter data
      return response.letter || response;
    } catch (error) {
      console.error("🔥 updateLetter - Error:", error);
      return rejectWithValue(error.message || 'خطا در ویرایش خبر');
    }
  }
);

export const deleteLetter = createAsyncThunk(
  'letters/deleteLetter',
  async (letterId, { rejectWithValue }) => {
    try {
      console.log("🔥 deleteLetter - Letter ID:", letterId);
      const response = await deleteLetterService(letterId);
      console.log("🔥 deleteLetter - API response:", response);
      // Return the letter ID for removal
      return letterId;
    } catch (error) {
      console.error("🔥 deleteLetter - Error:", error);
      return rejectWithValue(error.message || 'خطا در حذف خبر');
    }
  }
);

// Initial state
const initialState = {
  letters: [],
  selectedLetter: null,
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

// Slice
const lettersSlice = createSlice({
  name: 'letters',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedLetter: (state, action) => {
      state.selectedLetter = action.payload;
    },
    clearSelectedLetter: (state) => {
      state.selectedLetter = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch building letters
    builder
      .addCase(fetchBuildingLetters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuildingLetters.fulfilled, (state, action) => {
        state.loading = false;
        state.letters = action.payload;
      })
      .addCase(fetchBuildingLetters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch letter detail
    builder
      .addCase(fetchLetterDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLetterDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedLetter = action.payload.letter;
      })
      .addCase(fetchLetterDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create letter
    builder
      .addCase(createLetter.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createLetter.fulfilled, (state, action) => {
        state.createLoading = false;
        state.letters.unshift(action.payload);
      })
      .addCase(createLetter.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      });

    // Update letter
    builder
      .addCase(updateLetter.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateLetter.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.letters.findIndex(letter => letter.letter_id === action.payload.letter_id);
        if (index !== -1) {
          state.letters[index] = action.payload;
        }
        if (state.selectedLetter && state.selectedLetter.letter_id === action.payload.letter_id) {
          state.selectedLetter = action.payload;
        }
      })
      .addCase(updateLetter.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      });

    // Delete letter
    builder
      .addCase(deleteLetter.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteLetter.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.letters = state.letters.filter(letter => letter.letter_id !== action.payload);
        if (state.selectedLetter && state.selectedLetter.letter_id === action.payload) {
          state.selectedLetter = null;
        }
      })
      .addCase(deleteLetter.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setSelectedLetter,
  clearSelectedLetter
} = lettersSlice.actions;

export default lettersSlice.reducer;