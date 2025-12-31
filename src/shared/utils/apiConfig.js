// Utility functions for API configuration
// این فایل برای مدیریت URL های API از متغیرهای محیطی استفاده می‌کند

/**
 * دریافت BASE_URL از متغیر محیطی یا استفاده از مقدار پیش‌فرض
 * @returns {string} Base URL for API requests
 */
export const getApiBaseUrl = () => {
  // در development، اولویت با localhost است
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // اگر در development هستیم و متغیر محیطی تنظیم نشده، از localhost استفاده کن
  if (import.meta.env.DEV) {
    return 'http://localhost:8000/api/v1';
  }
  
  // در production از URL پیش‌فرض استفاده کن
  return 'https://melkingapp.ir/api/v1';
};

/**
 * دریافت MEDIA_URL از متغیر محیطی یا استفاده از مقدار پیش‌فرض
 * @returns {string} Base URL for media files
 */
export const getMediaBaseUrl = () => {
  return import.meta.env.VITE_MEDIA_BASE_URL || 'https://melkingapp.ir';
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

