import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiConfig';

// Configuration
const baseURL = getApiBaseUrl();

// Helper function to extract error message from HTML response
const extractErrorMessage = (error) => {
    // If we have a proper JSON error response
    if (error.response?.data) {
        const data = error.response.data;
        
        // Check if it's a string (HTML response)
        if (typeof data === 'string') {
            // Check if it's HTML
            if (data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html')) {
                // Try to extract title or error message from HTML
                const titleMatch = data.match(/<title>(.*?)<\/title>/i);
                if (titleMatch) {
                    return `خطای سرور: ${titleMatch[1]}`;
                }
                
                // Check for common error patterns
                if (data.includes('Bad Request')) {
                    return 'درخواست نامعتبر است. لطفاً اطلاعات را بررسی کنید.';
                }
                if (data.includes('Upstream Error')) {
                    return 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.';
                }
                if (data.includes('Cloudflare')) {
                    return 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.';
                }
                
                return 'خطا در ارتباط با سرور. پاسخ نامعتبر دریافت شد.';
            }
            
            // If it's a plain string error message
            return data;
        }
        
        // If it's an object, try to extract error message
        if (typeof data === 'object') {
            return data.error || 
                   data.detail || 
                   data.message || 
                   (data.non_field_errors && data.non_field_errors[0]) ||
                   (typeof data === 'object' && Object.keys(data).length > 0 
                    ? JSON.stringify(data) 
                    : 'خطای نامشخص');
        }
    }
    
    // Fallback error messages
    if (error.response?.status === 400) {
        return 'درخواست نامعتبر است. لطفاً اطلاعات را بررسی کنید.';
    }
    if (error.response?.status === 401) {
        return 'احراز هویت نامعتبر است. لطفاً دوباره وارد شوید.';
    }
    if (error.response?.status === 403) {
        return 'شما دسترسی لازم را ندارید.';
    }
    if (error.response?.status === 404) {
        return 'منبع مورد نظر یافت نشد.';
    }
    if (error.response?.status === 500) {
        return 'خطای داخلی سرور. لطفاً دوباره تلاش کنید.';
    }
    
    return error.message || 'خطای نامشخص در ارتباط با سرور';
};

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
        // If data is FormData, let axios set Content-Type automatically with boundary
        if (config.data instanceof FormData) {
            // حذف Content-Type برای اجازه دادن به axios برای تنظیم خودکار boundary
            delete config.headers['Content-Type'];
            
            // بررسی Authorization token
            const authToken = config.headers.Authorization;
            const hasAuthToken = !!authToken && authToken.startsWith('Bearer ');
            
            // هشدار در صورت نبودن token
            if (!hasAuthToken) {
                console.error('❌ WARNING: Authorization token is missing!');
            }
            
            // هشدار در صورت تنظیم دستی Content-Type
            if (config.headers['Content-Type'] && config.headers['Content-Type'].includes('application/json')) {
                console.error('❌ WARNING: Content-Type is set to application/json for FormData! This will cause issues.');
            }
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

        // Enhanced error logging for debugging
        if (error.response) {
            const isHtmlResponse = typeof error.response.data === 'string' && 
                                 (error.response.data.trim().startsWith('<!DOCTYPE') || 
                                  error.response.data.trim().startsWith('<html'));
            
            if (isHtmlResponse) {
                console.error('🚨 HTML Error Response Received:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    url: originalRequest?.url,
                    method: originalRequest?.method,
                    dataPreview: error.response.data.substring(0, 200) + '...'
                });
            } else {
                console.error('🚨 JSON Error Response:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    url: originalRequest?.url,
                    method: originalRequest?.method,
                    data: error.response.data
                });
            }
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Check if error is about invalid token type
            const errorMessage = extractErrorMessage(error);
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

        // Enhance error object with extracted message
        if (error.response) {
            error.extractedMessage = extractErrorMessage(error);
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
        // Fallback to localhost for /resident page on network/CORS errors
        const isResidentPage = window.location.pathname.includes('/resident');
        // Check if it's a network/CORS error (no response means request didn't reach server)
        const isNetworkError = !error.response && (
                              error.code === 'ERR_NETWORK' || 
                              error.message?.includes('Network Error') ||
                              error.message?.includes('NetworkError') ||
                              error.message?.includes('fetch resource')
                            );
        
        // Also fallback for CORS errors that have status but are CORS-related
        const isCorsError = error.response?.status === 401 && 
                           (error.message?.includes('CORS') || 
                            error.message?.includes('Access-Control-Allow-Origin'));
        
        if (isResidentPage && (isNetworkError || isCorsError)) {
            console.log('🔄 Network/CORS error on resident page, trying localhost fallback...');
            const localhostBaseURL = 'http://localhost:8000/api/v1';
            const localhostURL = `${localhostBaseURL}${url}`;
            
            try {
                const token = getAccessToken();
                const localhostConfig = {
                    ...config,
                    baseURL: localhostBaseURL,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        ...config.headers,
                    }
                };
                
                const localhostResponse = await axios.get(localhostURL, localhostConfig);
                console.log('✅ Localhost fallback successful');
                return localhostResponse.data;
            } catch (localhostError) {
                console.error('❌ Localhost fallback also failed:', localhostError);
                // If localhost also fails, try to return empty data instead of throwing
                if (isNetworkError) {
                    console.log('⚠️ Returning empty data to prevent error display');
                    return { requests: [], count: 0 };
                }
                // Continue to throw original error for non-network errors
            }
        }
        
        const errorMessage = error.extractedMessage || extractErrorMessage(error);
        console.error(`❌ GET ${url} error:`, errorMessage);
        error.userMessage = errorMessage;
        throw error;
    }
};

export const post = async (url, data = {}, config = {}) => {
    try {
        const response = await client.post(url, data, config);
        return response.data;
    } catch (error) {
        // Fallback to localhost for /resident page on network/CORS errors
        const isResidentPage = window.location.pathname.includes('/resident');
        // Check if it's a network/CORS error (no response means request didn't reach server)
        const isNetworkError = !error.response && (
                              error.code === 'ERR_NETWORK' || 
                              error.message?.includes('Network Error') ||
                              error.message?.includes('NetworkError') ||
                              error.message?.includes('fetch resource')
                            );
        
        // Also fallback for CORS errors that have status but are CORS-related
        const isCorsError = error.response?.status === 401 && 
                           (error.message?.includes('CORS') || 
                            error.message?.includes('Access-Control-Allow-Origin'));
        
        if (isResidentPage && (isNetworkError || isCorsError)) {
            console.log('🔄 Network/CORS error on resident page, trying localhost fallback...');
            const localhostBaseURL = 'http://localhost:8000/api/v1';
            const localhostURL = `${localhostBaseURL}${url}`;
            
            try {
                const token = getAccessToken();
                const localhostConfig = {
                    ...config,
                    baseURL: localhostBaseURL,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        ...config.headers,
                    }
                };
                
                const localhostResponse = await axios.post(localhostURL, data, localhostConfig);
                console.log('✅ Localhost fallback successful');
                return localhostResponse.data;
            } catch (localhostError) {
                console.error('❌ Localhost fallback also failed:', localhostError);
                // If localhost also fails, try to return empty data instead of throwing
                if (isNetworkError) {
                    console.log('⚠️ Returning empty data to prevent error display');
                    return { requests: [], count: 0 };
                }
                // Continue to throw original error for non-network errors
            }
        }
        
        // Enhanced error logging
        const errorMessage = error.extractedMessage || extractErrorMessage(error);
        
        console.error(`❌ POST ${url} error:`, {
            message: errorMessage,
            status: error.response?.status,
        });
        
        // Attach extracted message to error for easier access
        error.userMessage = errorMessage;
        throw error;
    }
};

export const put = async (url, data = {}, config = {}) => {
    try {
        const response = await client.put(url, data, config);
        return response.data;
    } catch (error) {
        const errorMessage = error.extractedMessage || extractErrorMessage(error);
        console.error(`❌ PUT ${url} error:`, errorMessage);
        error.userMessage = errorMessage;
        throw error;
    }
};

export const patch = async (url, data = {}, config = {}) => {
    try {
        const response = await client.patch(url, data, config);
        return response.data;
    } catch (error) {
        // Fallback to localhost for /resident page on network/CORS errors
        const isResidentPage = window.location.pathname.includes('/resident');
        // Check if it's a network/CORS error (no response means request didn't reach server)
        const isNetworkError = !error.response && (
                              error.code === 'ERR_NETWORK' || 
                              error.message?.includes('Network Error') ||
                              error.message?.includes('NetworkError') ||
                              error.message?.includes('fetch resource')
                            );
        
        // Also fallback for CORS errors that have status but are CORS-related
        const isCorsError = error.response?.status === 401 && 
                           (error.message?.includes('CORS') || 
                            error.message?.includes('Access-Control-Allow-Origin'));
        
        if (isResidentPage && (isNetworkError || isCorsError)) {
            console.log('🔄 Network/CORS error on resident page, trying localhost fallback...');
            const localhostBaseURL = 'http://localhost:8000/api/v1';
            const localhostURL = `${localhostBaseURL}${url}`;
            
            try {
                const token = getAccessToken();
                const localhostConfig = {
                    ...config,
                    baseURL: localhostBaseURL,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        ...config.headers,
                    }
                };
                
                const localhostResponse = await axios.patch(localhostURL, data, localhostConfig);
                console.log('✅ Localhost fallback successful');
                return localhostResponse.data;
            } catch (localhostError) {
                console.error('❌ Localhost fallback also failed:', localhostError);
                // If localhost also fails, try to return empty data instead of throwing
                if (isNetworkError) {
                    console.log('⚠️ Returning empty data to prevent error display');
                    return { requests: [], count: 0 };
                }
                // Continue to throw original error for non-network errors
            }
        }
        
        const errorMessage = error.extractedMessage || extractErrorMessage(error);
        console.error(`❌ PATCH ${url} error:`, errorMessage);
        error.userMessage = errorMessage;
        throw error;
    }
};

export const deleteRequest = async (url, config = {}) => {
    try {
        const response = await client.delete(url, config);
        return response.data;
    } catch (error) {
        const errorMessage = error.extractedMessage || extractErrorMessage(error);
        console.error(`❌ DELETE ${url} error:`, errorMessage);
        error.userMessage = errorMessage;
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
