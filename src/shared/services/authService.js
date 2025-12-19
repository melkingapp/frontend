import { post, setTokens, clearTokens, isAuthenticated as apiIsAuthenticated } from './apiService';
import { sanitizeUser } from '../utils/security';

// Send OTP
export const sendOtp = async (phoneNumber, role) => {
    try {
        const response = await post('/send-otp/', {
            phone_number: phoneNumber,
            role: role
        });
        return response;
    } catch (error) {
        console.error('Send OTP error:', error);
        throw error;
    }
};

// Verify OTP
export const verifyOtp = async (phoneNumber, role, otp) => {
    try {
        const response = await post('/verify-otp/', {
            phone_number: phoneNumber,
            role: role,
            otp: otp
        });
        return response;
    } catch (error) {
        console.error('Verify OTP error:', error);
        throw error;
    }
};

// Login with tokens
export const login = async (accessToken, refreshToken, userData) => {
    try {
        setTokens(accessToken, refreshToken);
        // 🛡️ Sentinel Security Fix: Sanitize user data before storing in localStorage
        // This prevents leaking sensitive backend fields (like internal flags or PII not needed on client)
        const sanitizedUser = sanitizeUser(userData);
        localStorage.setItem('user', JSON.stringify(sanitizedUser));
        return { success: true };
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Logout
export const logout = async () => {
    try {
        clearTokens();
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

// Check authentication status
export const isAuthenticated = () => {
    return apiIsAuthenticated();
};

// Get current user
export const getCurrentUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
};

// Refresh token
export const refreshToken = async (refreshTokenValue) => {
    try {
        const response = await post('/refresh/', {
            refresh: refreshTokenValue
        });
        return response;
    } catch (error) {
        console.error('Refresh token error:', error);
        throw error;
    }
};

// Register user
export const register = async (userData) => {
    try {
        const response = await post('/register/', userData);
        return response;
    } catch (error) {
        console.error('Register error:', error);
        throw error;
    }
};

// Default export (برای backward compatibility)
const authService = {
    sendOtp,
    verifyOtp,
    login,
    logout,
    refreshToken,
    register,
    isAuthenticated,
    getCurrentUser
};

export default authService;
