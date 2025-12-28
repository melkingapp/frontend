/**
 * Convert English transaction/payment types to Persian
 * @param {string} type - English type string
 * @param {Object} item - Transaction item for additional context
 * @returns {string} - Persian type string
 */
export const getPersianType = (type, item = null) => {
  // Special handling for charge types - check if item has charge_type first
  if (item && item.charge_type) {
    const chargeTypeMap = {
      'current': 'شارژ جاری',
      'construction': 'شارژ عمرانی',
      'parking': 'شارژ پارکینگ',
      'elevator': 'شارژ آسانسور',
      'other': 'شارژ سایر'
    };
    return chargeTypeMap[item.charge_type] || 'شارژ';
  }

  // Special handling for charge types
  if (type === 'charge' || type === 'Charge' || type === 'شارژ') {
    return 'شارژ';
  }

  const typeMap = {
    // Basic types
    'شارژ': 'شارژ',
    'charge': 'شارژ',
    'Charge': 'شارژ',
    
    // Bills
    'electricity': 'قبض برق',
    'Electricity': 'قبض برق',
    'electricity_bill': 'قبض برق',
    'قبض برق': 'قبض برق',
    
    'water': 'قبض آب',
    'Water': 'قبض آب',
    'water_bill': 'قبض آب',
    'قبض آب': 'قبض آب',
    
    'gas': 'قبض گاز',
    'Gas': 'قبض گاز',
    'gas_bill': 'قبض گاز',
    'قبض گاز': 'قبض گاز',
    
    // Services
    'maintenance': 'تعمیرات',
    'Maintenance': 'تعمیرات',
    'repair': 'تعمیرات',
    'Repair': 'تعمیرات',
    'تعمیرات': 'تعمیرات',
    
    'cleaning': 'نظافت',
    'Cleaning': 'نظافت',
    'نظافت': 'نظافت',
    
    'security': 'امنیت',
    'Security': 'امنیت',
    'امنیت': 'امنیت',
    
    'camera': 'دوربین',
    'Camera': 'دوربین',
    'دوربین': 'دوربین',
    
    'parking': 'پارکینگ',
    'Parking': 'پارکینگ',
    'پارکینگ': 'پارکینگ',
    
    // Additional expense types
    'rent': 'اجاره',
    'Rent': 'اجاره',
    'اجاره': 'اجاره',
    
    'service': 'خدمات',
    'Service': 'خدمات',
    'Services': 'خدمات',
    'خدمات': 'خدمات',
    
    // Purchases
    'purchases': 'اقلام خریدنی',
    'Purchases': 'اقلام خریدنی',
    'اقلام خریدنی': 'اقلام خریدنی',
    
    // Other
    'other': 'سایر',
    'Other': 'سایر',
    'سایر': 'سایر',
    
    // Extra Payment
    'extra_payment': 'پرداخت اضافی',
    'Extra Payment': 'پرداخت اضافی',
    'پرداخت اضافی': 'پرداخت اضافی',
    
    // Categories
    'shared_bill': 'قبض مشترک',
    'Shared_bill': 'قبض مشترک',
    'قبض مشترک': 'قبض مشترک',
    
    'individual_invoice': 'فاکتور فردی',
    'فاکتور فردی': 'فاکتور فردی',
    
    // Transaction types
    'invoice': 'فاکتور',
    'Invoice': 'فاکتور',
    'فاکتور': 'فاکتور',
    
    'payment': 'پرداخت',
    'Payment': 'پرداخت',
    'پرداخت': 'پرداخت',
    
    'debt': 'بدهی',
    'Debt': 'بدهی',
    'بدهی': 'بدهی',
  };
  
  return typeMap[type] || type;
};

/**
 * Convert English status to Persian
 * @param {string} status - English status string
 * @returns {string} - Persian status string
 */
export const getPersianStatus = (status) => {
  const statusMap = {
    'paid': 'پرداخت شده',
    'Paid': 'پرداخت شده',
    'پرداخت شده': 'پرداخت شده',
    'پرداخت‌شده': 'پرداخت شده',
    
    'pending': 'منتظر پرداخت',
    'Pending': 'منتظر پرداخت',
    'منتظر پرداخت': 'منتظر پرداخت',
    'منتظر': 'منتظر پرداخت',
    
    'cancelled': 'لغو شده',
    'Cancelled': 'لغو شده',
    'لغو شده': 'لغو شده',
    
    'overdue': 'سررسید گذشته',
    'Overdue': 'سررسید گذشته',
    'سررسید گذشته': 'سررسید گذشته',
    
    'approved': 'تایید شده',
    'Approved': 'تایید شده',
    'تایید شده': 'تایید شده',
    
    'rejected': 'تایید نشده',
    'Rejected': 'تایید نشده',
    'تایید نشده': 'تایید نشده',
    
    'awaiting_manager': 'منتظر تایید مدیر',
    'Awaiting_manager': 'منتظر تایید مدیر',
    'منتظر تایید مدیر': 'منتظر تایید مدیر',
    
    'excellent': 'ممتاز',
    'Excellent': 'ممتاز',
    'ممتاز': 'ممتاز',
  };
  
  return statusMap[status] || status;
};

/**
 * Get status color class for styling
 * @param {string} status - Status string
 * @returns {string} - Tailwind CSS color class
 */
export const getStatusColor = (status) => {
  const persianStatus = getPersianStatus(status);
  
  switch (persianStatus) {
    case "پرداخت شده":
      return "text-green-600";
    case "منتظر پرداخت":
      return "text-red-600";
    case "لغو شده":
      return "text-red-600";
    case "سررسید گذشته":
      return "text-orange-600";
    case "تایید شده":
      return "text-blue-600";
    case "تایید نشده":
      return "text-red-600";
    case "ممتاز":
      return "text-yellow-600";
    case "منتظر تایید مدیر":
      return "text-yellow-600";
    default:
      return "text-gray-600";
  }
};

/**
 * Get status background color class for styling
 * @param {string} status - Status string
 * @returns {string} - Tailwind CSS background color class
 */
export const getStatusBgColor = (status) => {
  const persianStatus = getPersianStatus(status);
  
  switch (persianStatus) {
    case "پرداخت شده":
      return "bg-green-100 text-green-700";
    case "منتظر پرداخت":
      return "bg-red-100 text-red-700";
    case "لغو شده":
      return "bg-red-100 text-red-700";
    case "سررسید گذشته":
      return "bg-orange-100 text-orange-700";
    case "تایید شده":
      return "bg-blue-100 text-blue-700";
    case "تایید نشده":
      return "bg-red-100 text-red-700";
    case "ممتاز":
      return "bg-yellow-100 text-yellow-700";
    case "منتظر تایید مدیر":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

/**
 * Convert distribution method to Persian
 * @param {string} method - Distribution method string
 * @returns {string} - Persian distribution method
 */
export const getPersianDistributionMethod = (method) => {
  const methodMap = {
    // English values from backend (synchronized with models.py)
    'equal': 'تقسیم مساوی',
    'Equal Distribution': 'تقسیم مساوی',
    'per_person': 'بر اساس تعداد نفر',
    'Per Person': 'بر اساس تعداد نفر',
    'area': 'بر اساس متراژ',
    'Area Based': 'بر اساس متراژ',
    'parking': 'پارکینگ',
    'Parking': 'پارکینگ',
    'usage_based': 'بر اساس مصرف',
    'Usage Based': 'بر اساس مصرف',
    'custom': 'سفارشی',
    'Custom': 'سفارشی',
    'proportional': 'نسبتی',
    'Proportional': 'نسبتی',
    
    // Legacy values (for backward compatibility)
    'area_based': 'بر اساس متراژ',
    'person_based': 'بر اساس تعداد نفر',
    
    // Persian values (already translated)
    'تقسیم مساوی': 'تقسیم مساوی',
    'بر اساس متراژ': 'بر اساس متراژ',
    'بر اساس مصرف': 'بر اساس مصرف',
    'سفارشی': 'سفارشی',
    'نسبتی': 'نسبتی',
    'پارکینگ': 'پارکینگ',
    'بر اساس تعداد نفر': 'بر اساس تعداد نفر',
    
    // Default fallbacks
    'بر اساس واحد': 'بر اساس واحد',
  };
  
  return methodMap[method] || method || 'نامشخص';
};
