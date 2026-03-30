// Utility functions for API configuration
// این فایل برای مدیریت URL های API از متغیرهای محیطی استفاده می‌کند

// Mock implementation for tests
const getEnvVar = (key, defaultValue) => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return defaultValue;
  }

  // Safely access import.meta.env
  // We use new Function to avoid static analysis errors in Jest
  try {
    const metaEnv = new Function('return import.meta.env')();
    return metaEnv[key] || defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const isDev = () => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return false;
  }

  try {
    const metaEnv = new Function('return import.meta.env')();
    return metaEnv.DEV;
  } catch (e) {
    return false;
  }
};

/**
 * دریافت BASE_URL از متغیر محیطی یا استفاده از مقدار پیش‌فرض
 * @returns {string} Base URL for API requests
 */
export const getApiBaseUrl = () => {
  // Check if we are in a test environment (Jest)
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return 'http://localhost:8000/api/v1';
  }

  // در development، اولویت با localhost است
  try {
    const envUrl = getEnvVar('VITE_API_BASE_URL');
    if (envUrl) {
      return envUrl;
    }

    // اگر در development هستیم و متغیر محیطی تنظیم نشده، از localhost استفاده کن
    if (isDev()) {
      return 'http://localhost:8000/api/v1';
    }
  } catch (e) {
    // If import.meta is not available (e.g. in some test environments), fallback to default
  }
  
  // در production از URL پیش‌فرض استفاده کن
  return 'https://melkingapp.ir/api/v1';
};

/**
 * دریافت MEDIA_URL از متغیر محیطی یا استفاده از مقدار پیش‌فرض
 * اگر VITE_MEDIA_BASE_URL تنظیم نشده باشد، از VITE_API_BASE_URL استفاده می‌کند
 * @returns {string} Base URL for media files
 */
export const getMediaBaseUrl = () => {
  // Check if we are in a test environment (Jest)
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return 'http://localhost:8000';
  }

  try {
    const mediaBaseUrl = getEnvVar('VITE_MEDIA_BASE_URL');
    // اگر VITE_MEDIA_BASE_URL تنظیم شده باشد، از آن استفاده می‌کنیم
    if (mediaBaseUrl) {
      return mediaBaseUrl;
    }

    const apiBaseUrl = getEnvVar('VITE_API_BASE_URL', 'https://melkingapp.ir/api/v1');
    // در غیر این صورت، از VITE_API_BASE_URL استفاده می‌کنیم و /api/v1 را حذف می‌کنیم
    if (apiBaseUrl.endsWith('/api/v1')) {
      return apiBaseUrl.replace('/api/v1', '');
    }

    // اگر /api/v1 نداشت، همان را برمی‌گردانیم
    return apiBaseUrl;
  } catch (e) {
    return 'https://melkingapp.ir';
  }
};

/**
 * دریافت BASE_URL بدون /api/v1 برای استفاده در موارد خاص
 * @returns {string} Base URL without API path
 */
export const getBaseUrl = () => {
  const apiBaseUrl = getApiBaseUrl();
  // اگر شامل /api/v1 است، آن را حذف کن
  if (apiBaseUrl.endsWith('/api/v1')) {
    return apiBaseUrl.replace('/api/v1', '');
  }
  // در غیر این صورت، از MEDIA_BASE_URL استفاده کن
  return getMediaBaseUrl();
};
