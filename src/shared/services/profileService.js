import { get, put, post } from './apiService';

// Get user profile
export const getProfile = async () => {
    try {
        const response = await get('/profile/');
        return response;
    } catch (error) {
        console.error('Get profile error:', error);
        throw error;
    }
};

// Update user profile
export const updateProfile = async (profileData) => {
    try {
        const response = await put('/profile/update/', profileData);
        return response;
    } catch (error) {
        console.error('Update profile error:', error);
        throw error;
    }
};

// Change password
export const changePassword = async (passwordData) => {
    try {
        const response = await post('/profile/change-password/', passwordData);
        return response;
    } catch (error) {
        console.error('Change password error:', error);
        throw error;
    }
};

// Default export (برای backward compatibility)
const profileService = {
    getProfile,
    updateProfile,
    changePassword
};

export default profileService;
