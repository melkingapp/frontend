import axios from 'axios';

// Configuration - Use environment variable or auto-detect
const getBaseURL = () => {
    // First priority: Environment variable
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Second priority: Check if we're in development (localhost)
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        
        if (isLocalhost) {
            // Development: use localhost:8000
            return 'http://localhost:8000/api/v1';
        } else {
            // Production: use server IP with port 9000
            return 'http://171.22.25.201:9000/api/v1';
        }
    }
    
    // Fallback
    return 'http://localhost:8000/api/v1';
};

const baseURL = getBaseURL();

console.log('🔧 API Configuration:', {
    'Environment': import.meta.env.MODE,
    'baseURL': baseURL,
    'VITE_API_BASE_URL': import.meta.env.VITE_API_BASE_URL
});

// Create axios instance
const client = axios.create({
    baseURL: baseURL,
    timeout: 30000, // Increased timeout to 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
client.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
client.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Check if error is about invalid token type
            const errorMessage = error.response?.data?.detail || 
                                error.response?.data?.message || 
                                error.response?.data?.error || 
                                '';
            const isInvalidTokenType = errorMessage?.toLowerCase().includes('token not valid') || 
                                      errorMessage?.toLowerCase().includes('invalid token');

            // If it's an invalid token type error, don't try to refresh, just redirect
            if (isInvalidTokenType) {
                console.log('🚨 Invalid token type error - clearing auth and redirecting to login...');
                clearTokens();
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                await refreshToken();
                const newToken = getAccessToken();
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return client(originalRequest);
                } else {
                    throw new Error('No token after refresh');
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                clearTokens();
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Token management functions
export const getAccessToken = () => {
    return localStorage.getItem('access_token');
};

export const getRefreshToken = () => {
    return localStorage.getItem('refresh_token');
};

export const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
};

export const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
};

export const refreshToken = async () => {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await axios.post(`${baseURL}/refresh/`, {
            refresh: refreshTokenValue,
        });

        const { access, refresh: newRefreshToken } = response.data;
        localStorage.setItem('access_token', access);
        // اگر refresh token جدید برگردانده شد، آن را هم ذخیره کن
        if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
        }
        return access;
    } catch (error) {
        console.error('Token refresh error:', error);
        // اگر خطای "token not valid" است، tokens را clear کن
        const errorMessage = error.response?.data?.detail || 
                            error.response?.data?.message || 
                            error.response?.data?.error || 
                            '';
        if (errorMessage?.toLowerCase().includes('token not valid') || 
            errorMessage?.toLowerCase().includes('invalid token')) {
            clearTokens();
        }
        throw error;
    }
};

// HTTP methods
export const get = async (url, config = {}) => {
    try {
        const response = await client.get(url, config);
        return response.data;
    } catch (error) {
        console.error(`GET ${url} error:`, error);
        throw error;
    }
};

export const post = async (url, data = {}, config = {}) => {
    try {
        const response = await client.post(url, data, config);
        return response.data;
    } catch (error) {
        console.error(`POST ${url} error:`, error);
        throw error;
    }
};

export const put = async (url, data = {}, config = {}) => {
    try {
        const response = await client.put(url, data, config);
        return response.data;
    } catch (error) {
        console.error(`PUT ${url} error:`, error);
        throw error;
    }
};

export const patch = async (url, data = {}, config = {}) => {
    try {
        const response = await client.patch(url, data, config);
        return response.data;
    } catch (error) {
        console.error(`PATCH ${url} error:`, error);
        throw error;
    }
};

export const deleteRequest = async (url, config = {}) => {
    try {
        const response = await client.delete(url, config);
        return response.data;
    } catch (error) {
        console.error(`DELETE ${url} error:`, error);
        throw error;
    }
};

// Utility functions
export const isAuthenticated = () => {
    return !!getAccessToken();
};

// Default export (برای backward compatibility)
const apiService = {
    get,
    post,
    put,
    patch,
    delete: deleteRequest,
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    refreshToken,
    isAuthenticated
};

export default apiService;
