// API Configuration and Base Service
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 
    (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
      ? 'http://127.0.0.1:8000/api/v1'
      : `${window.location.protocol}//${window.location.host}/api/v1`),
  ENDPOINTS: {
    BUILDING_SETTINGS: (buildingId) => `/buildings/${buildingId}/settings/`,
    BUILDING_SETTINGS_UPDATE: (buildingId) => `/buildings/${buildingId}/settings/update/`,
    BUILDING_DOCUMENTS: (buildingId) => `/buildings/${buildingId}/documents/`,
    BUILDING_DOCUMENTS_UPLOAD: (buildingId) => `/buildings/${buildingId}/documents/upload/`,
    BUILDING_DOCUMENTS_DELETE: (buildingId, documentId) => `/buildings/${buildingId}/documents/${documentId}/delete/`,
    NOTIFICATION_SETTINGS: '/notification/settings/',
    NOTIFICATION_SETTINGS_UPDATE: '/notification/settings/update/',
    UNIT_RESIDENT_COUNT_UPDATE: (buildingId, unitId) => `/buildings/${buildingId}/units/${unitId}/update-resident-count/`,
  }
};

const API_BASE_URL = API_CONFIG.BASE_URL;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }


  // Refresh token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.error('No refresh token available');
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        // اگر refresh token جدید برگردانده شد، آن را هم ذخیره کن
        if (data.refresh) {
          localStorage.setItem('refresh_token', data.refresh);
        }
        console.log('Token refreshed successfully');
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Token refresh failed with status:', response.status, errorData);
        
        // Only redirect to login if it's a real authentication failure
        if (response.status === 401 || response.status === 403) {
          console.log('Authentication failed, redirecting to login...');
          this.clearAuthData();
          window.location.href = '/login';
        }
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // Don't redirect on network errors
      return false;
    }
  }

  // Clear authentication data
  clearAuthData() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth');
    console.log('Authentication data cleared');
  }

  // Clear all app data from localStorage
  clearAllAppData() {
    const keysToRemove = [
      'access_token',
      'refresh_token',
      'auth',
      'selectedResidentBuilding',
      'residentRequests',
      'residentBuildings',
      'selectedBuilding',
      'buildingUnits',
      'membershipRequests',
      'financeTransactions',
      'expenseTypes',
      'units',
      'bills',
      'notifications',
      'surveys',
      'services',
      'polls',
      'letters',
      'legal_ai',
      'chat',
      'rating',
      'billing'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('🧹 All app data cleared from localStorage');
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get fresh auth header (with token refresh if needed)
    const authHeader = await this.getFreshAuthHeader();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers,
      },
      timeout: 30000, // Increased timeout to 30 seconds
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        let errorMessage = data?.detail || data?.message || data?.error;
        
        // Log the full error response for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            data: data,
            url: url
          });
        }
        
        // Handle specific HTTP status codes
        switch (response.status) {
          case 401:
            // Check if error is about invalid token type
            const isInvalidTokenType = errorMessage?.toLowerCase().includes('token not valid') || 
                                      errorMessage?.toLowerCase().includes('invalid token');
            
            // Try to refresh token and retry once (unless it's an invalid token type error)
            if (!isInvalidTokenType && await this.refreshToken()) {
              console.log('Retrying request with refreshed token...');
              const retryConfig = {
                ...config,
                headers: {
                  ...config.headers,
                  ...await this.getFreshAuthHeader(),
                }
              };
              const retryResponse = await fetch(url, retryConfig);
              if (retryResponse.ok) {
                const retryData = retryResponse.headers.get('content-type')?.includes('application/json') 
                  ? await retryResponse.json() 
                  : await retryResponse.text();
                return { data: retryData, status: retryResponse.status };
              }
            }
            
            // If refresh failed or invalid token type, clear auth and redirect
            console.log('🚨 401 Unauthorized - clearing auth data and redirecting to login...');
            this.clearAuthData();
            window.dispatchEvent(new CustomEvent('api-unauthorized', {
              detail: { status: 401, url: url, error: errorMessage }
            }));
            
            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            
            errorMessage = errorMessage || 'Unauthorized';
            break;
          case 403:
            errorMessage = errorMessage || 'Forbidden';
            break;
          case 404:
            errorMessage = errorMessage || 'Not Found';
            break;
          case 500:
            errorMessage = errorMessage || 'Internal Server Error';
            break;
          default:
            errorMessage = errorMessage || `HTTP error! status: ${response.status}`;
        }
        
        // Create a more detailed error object
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        error.response = response;
        throw error;
      }

      return { data, status: response.status };
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Get fresh auth header (with automatic refresh)
  async getFreshAuthHeader() {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const exp = payload.exp * 1000;
        const now = Date.now();
        
        // If token expires in less than 5 minutes, refresh it
        if (exp - now < 5 * 60 * 1000) {
          console.log('Token expires soon, refreshing...');
          const refreshSuccess = await this.refreshToken();
          if (refreshSuccess) {
            // Get the new token after refresh
            const newToken = localStorage.getItem('access_token');
            return { Authorization: `Bearer ${newToken}` };
          } else {
            // If refresh failed, still try with current token
            console.log('Refresh failed, using current token');
          }
        }
        
        return { Authorization: `Bearer ${accessToken}` };
      } catch (e) {
        console.error('Invalid access token format:', e);
        // Clear invalid token
        localStorage.removeItem('access_token');
        return {};
      }
    }
    
    return {};
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // PATCH request
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // Upload file
  async uploadFile(endpoint, formData, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        ...await this.getFreshAuthHeader(),
        ...options.headers,
      },
      method: 'POST',
      body: formData,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data?.detail || data?.message;
        
        // Handle specific HTTP status codes
        switch (response.status) {
          case 401:
            errorMessage = errorMessage || 'Unauthorized';
            break;
          case 403:
            errorMessage = errorMessage || 'Forbidden';
            break;
          case 404:
            errorMessage = errorMessage || 'Not Found';
            break;
          case 500:
            errorMessage = errorMessage || 'Internal Server Error';
            break;
          default:
            errorMessage = errorMessage || `HTTP error! status: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      return { data, status: response.status };
    } catch (error) {
      console.error('File Upload Error:', error);
      throw error;
    }
  }
}

export default new ApiService();
