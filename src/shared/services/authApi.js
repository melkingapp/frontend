import api from './api';

class AuthApiService {
  // Register new user
  async register(userData) {
    const { data } = await api.post('/register/', userData);
    return data;
  }

  // Login user
  async login(credentials) {
    const { data } = await api.post('/login/', credentials);
    return data;
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    const { data } = await api.post('/refresh/', { refresh: refreshToken });
    return data;
  }

  // Get user profile
  async getProfile() {
    const { data } = await api.get('/profile/');
    return data;
  }

  // Update user profile
  async updateProfile(profileData) {
    const { data } = await api.put('/profile/update/', profileData);
    return data;
  }

  // Change password
  async changePassword(passwordData) {
    const { data } = await api.post('/profile/change-password/', passwordData);
    return data;
  }

  // Logout (client-side only, server doesn't need logout endpoint for JWT)
  logout() {
    localStorage.removeItem('auth');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    return auth?.isAuthenticated && auth?.tokens?.access;
  }

  // Get stored tokens
  getTokens() {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    return auth?.tokens;
  }

  // Store authentication data
  storeAuth(authData) {
    localStorage.setItem('auth', JSON.stringify(authData));
  }

  // Get current user data
  getCurrentUser() {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    return auth?.user;
  }
}

export default new AuthApiService();
