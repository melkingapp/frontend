import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProfile, updateProfile as updateProfileService, changePassword as changePasswordService } from '../../shared/services/profileService';

// Async thunks
export const fetchProfile = createAsyncThunk(
    'profile/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getProfile();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'خطا در دریافت پروفایل');
        }
    }
);

export const updateProfile = createAsyncThunk(
    'profile/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await updateProfileService(profileData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'خطا در به‌روزرسانی پروفایل');
        }
    }
);

export const changePassword = createAsyncThunk(
    'profile/changePassword',
    async (passwordData, { rejectWithValue }) => {
        try {
            const response = await changePasswordService(passwordData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'خطا در تغییر رمز عبور');
        }
    }
);

const initialState = {
    profile: null,
    loading: false,
    error: null,
    updateLoading: false,
    updateError: null,
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        clearProfile: (state) => {
            state.profile = null;
            state.error = null;
            state.updateError = null;
        },
        clearErrors: (state) => {
            state.error = null;
            state.updateError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Profile
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
                state.error = null;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Update Profile
            .addCase(updateProfile.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.profile = action.payload.user;
                state.updateError = null;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload;
            })
            
            // Change Password
            .addCase(changePassword.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.updateLoading = false;
                state.updateError = null;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload;
            });
    },
});

export const { clearProfile, clearErrors } = profileSlice.actions;

// Selectors
export const selectProfile = (state) => state.profile.profile;
export const selectProfileLoading = (state) => state.profile.loading;
export const selectProfileError = (state) => state.profile.error;
export const selectUpdateLoading = (state) => state.profile.updateLoading;
export const selectUpdateError = (state) => state.profile.updateError;

export default profileSlice.reducer;
