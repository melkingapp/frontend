/**
 * Utility functions for handling file URLs
 * این فایل برای یکسان‌سازی نحوه ساخت URL کامل فایل‌ها استفاده می‌شود
 */

import { getMediaBaseUrl } from './apiConfig';

/**
 * ساخت URL کامل برای فایل‌های media
 * این تابع چک می‌کند که آیا URL کامل است یا نه و در صورت نیاز MEDIA_URL را اضافه می‌کند
 * 
 * @param {string|null|undefined} url - URL فایل (می‌تواند relative یا absolute باشد)
 * @returns {string|null} URL کامل فایل یا null اگر url خالی باشد
 * 
 * @example
 * getFullMediaUrl('/media/billing/attachments/file.jpg') 
 * // Returns: 'https://melkingapp.ir/media/billing/attachments/file.jpg'
 * 
 * @example
 * getFullMediaUrl('https://melkingapp.ir/media/billing/attachments/file.jpg')
 * // Returns: 'https://melkingapp.ir/media/billing/attachments/file.jpg' (بدون تغییر)
 * 
 * @example
 * getFullMediaUrl(null) 
 * // Returns: null
 */
export const getFullMediaUrl = (url) => {
  // اگر URL خالی یا null باشد
  if (!url) {
    return null;
  }

  // اگر URL به صورت string نباشد، تبدیل به string می‌کنیم
  const urlString = String(url).trim();

  // اگر URL خالی باشد
  if (!urlString) {
    return null;
  }

  // اگر URL کامل باشد (با http یا https شروع می‌شود) یا data URL باشد، بدون تغییر برمی‌گردانیم
  if (urlString.startsWith('http://') || 
      urlString.startsWith('https://') || 
      urlString.startsWith('data:')) {
    return urlString;
  }

  // اگر URL با / شروع نشود، / را اضافه می‌کنیم
  const normalizedUrl = urlString.startsWith('/') ? urlString : `/${urlString}`;

  // دریافت MEDIA_URL و حذف trailing slash
  const mediaBaseUrl = getMediaBaseUrl().replace(/\/$/, '');

  // ساخت URL کامل
  const fullUrl = `${mediaBaseUrl}${normalizedUrl}`;
  
  // لاگ برای دیباگ (فقط در development)
  if (import.meta.env.DEV) {
    console.log('[getFullMediaUrl]', {
      input: url,
      normalizedUrl,
      mediaBaseUrl,
      fullUrl
    });
  }
  
  return fullUrl;
};

/**
 * بررسی اینکه آیا URL کامل است یا نه
 * 
 * @param {string|null|undefined} url - URL برای بررسی
 * @returns {boolean} true اگر URL کامل باشد، false در غیر این صورت
 */
export const isAbsoluteUrl = (url) => {
  if (!url) {
    return false;
  }

  const urlString = String(url).trim();
  return urlString.startsWith('http://') || 
         urlString.startsWith('https://') || 
         urlString.startsWith('data:');
};

