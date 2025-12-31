// Utility functions for API configuration
// این فایل برای مدیریت URL های API از متغیرهای محیطی استفاده می‌کند

/**
 * دریافت BASE_URL از متغیر محیطی یا استفاده از مقدار پیش‌فرض
 * @returns {string} Base URL for API requests
 */
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'https://melkingapp.ir/api/v1';
};

/**
 * دریافت MEDIA_URL از متغیر محیطی یا استفاده از مقدار پیش‌فرض
 * اگر VITE_MEDIA_BASE_URL تنظیم نشده باشد، از VITE_API_BASE_URL استفاده می‌کند
 * @returns {string} Base URL for media files
 */
export const getMediaBaseUrl = () => {
  // اگر VITE_MEDIA_BASE_URL تنظیم شده باشد، از آن استفاده می‌کنیم
  if (import.meta.env.VITE_MEDIA_BASE_URL) {
    return import.meta.env.VITE_MEDIA_BASE_URL;
  }
  
  // در غیر این صورت، از VITE_API_BASE_URL استفاده می‌کنیم و /api/v1 را حذف می‌کنیم
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://melkingapp.ir/api/v1';
  if (apiBaseUrl.endsWith('/api/v1')) {
    return apiBaseUrl.replace('/api/v1', '');
  }
  
  // اگر /api/v1 نداشت، همان را برمی‌گردانیم
  return apiBaseUrl;
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

