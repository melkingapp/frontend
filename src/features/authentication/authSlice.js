import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { register, login as loginService, refreshToken as refreshTokenService, logout as logoutService } from "../../shared/services/authService";
import { getProfile, updateProfile as updateProfileService, changePassword as changePasswordService } from "../../shared/services/profileService";
import { sanitizeUser } from "../../shared/utils/security";

// Async thunks for API calls
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await register(userData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await loginService(credentials);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (refreshTokenValue, { rejectWithValue }) => {
        try {
            const response = await refreshTokenService(refreshTokenValue);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchUserProfile = createAsyncThunk(
    'auth/fetchUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getProfile();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'auth/updateUserProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await updateProfileService(profileData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async (passwordData, { rejectWithValue }) => {
        try {
            const response = await changePasswordService(passwordData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    user: {
        id: null,
        username: null,
        email: null,
        first_name: null,
        last_name: null,
        phone_number: null,
        role: null,
        is_active: false,
    },
    tokens: {
        access: null,
        refresh: null,
    },
    isAuthenticated: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.user = sanitizeUser(action.payload.user);
            state.tokens = action.payload.tokens;
            state.isAuthenticated = true;
            state.error = null;
        },
        logout: (state) => {
            state.user = {
                id: null,
                username: null,
                email: null,
                first_name: null,
                last_name: null,
                phone_number: null,
                role: null,
                is_active: false,
            };
            state.tokens = {
                access: null,
                refresh: null,
            };
            state.isAuthenticated = false;
            state.error = null;
            logoutService();
            
            // Clear all localStorage data related to the app
            import('../../shared/utils/storeReset').then(({ resetAllAppData }) => {
                resetAllAppData();
            });
        },
        clearError: (state) => {
            state.error = null;
        },
        updateTokens: (state, action) => {
            state.tokens = action.payload;
        },
        forceLogout: (state) => {
            // Force logout due to authentication failure
            console.log('🚨 Force logout triggered');
            state.user = {
                id: null,
                username: null,
                email: null,
                first_name: null,
                last_name: null,
                phone_number: null,
                role: null,
                is_active: false,
            };
            state.tokens = {
                access: null,
                refresh: null,
            };
            state.isAuthenticated = false;
            state.error = 'Session expired. Please login again.';
            
            // Clear all localStorage data related to the app
            import('../../shared/utils/storeReset').then(({ resetAllAppData }) => {
                resetAllAppData();
            });
        },
        resetAuthState: (state) => {
            // Reset to initial state
            state.user = initialState.user;
            state.tokens = initialState.tokens;
            state.isAuthenticated = initialState.isAuthenticated;
            state.loading = initialState.loading;
            state.error = initialState.error;
        },
    },
    extraReducers: (builder) => {
        builder
            // Register user
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = sanitizeUser(action.payload.user);
                state.tokens = action.payload.tokens;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Login user
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = sanitizeUser(action.payload.user);
                state.tokens = action.payload.tokens;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Refresh token
            .addCase(refreshToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.loading = false;
                state.tokens = action.payload.tokens;
                state.error = null;
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                // If refresh fails, logout user
                state.isAuthenticated = false;
                state.tokens = { access: null, refresh: null };
            })
            // Fetch user profile
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = sanitizeUser(action.payload);
                state.error = null;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update user profile
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                // We sanitize the merged result to ensure no pollution happens
                state.user = sanitizeUser({ ...state.user, ...action.payload });
                state.error = null;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Change password
            .addCase(changePassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { login, logout, clearError, updateTokens, forceLogout, resetAuthState } = authSlice.actions;
export default authSlice.reducer;