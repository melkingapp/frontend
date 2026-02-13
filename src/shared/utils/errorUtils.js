/**
 * استخراج پیام خطا از error object
 * @param {Error|string|object} error - خطای دریافتی
 * @returns {string} - پیام خطا
 */
export function extractErrorMessage(error) {
  if (!error) {
    return 'خطای ناشناخته';
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  // بررسی error.message
  if (error?.message) {
    return error.message;
  }
  
  // بررسی error.data
  if (error?.data) {
    if (typeof error.data === 'string') {
      return error.data;
    }
    if (error.data.error) {
      return error.data.error;
    }
    if (error.data.detail) {
      return error.data.detail;
    }
    if (error.data.message) {
      return error.data.message;
    }
  }
  
  // بررسی error.response.data
  if (error?.response?.data) {
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    if (error.response.data.error) {
      return error.response.data.error;
    }
    if (error.response.data.detail) {
      return error.response.data.detail;
    }
    if (error.response.data.message) {
      return error.response.data.message;
    }
  }
  
  return 'خطای ناشناخته';
}

/**
 * نمایش toast خطا با پیام مناسب
 * @param {Error|string|object} error - خطای دریافتی
 * @param {object} options - گزینه‌های اضافی برای toast
 */
import { toast } from 'sonner';

export function showErrorToast(error, options = {}) {
  const errorMessage = extractErrorMessage(error);
  
  return toast.error(errorMessage, {
    duration: 5000,
    ...options
  });
}

