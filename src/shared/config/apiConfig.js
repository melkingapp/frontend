import { getApiBaseUrl } from '../utils/apiConfig';

// API Configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/register/',
    LOGIN: '/login/',
    REFRESH: '/refresh/',
    PROFILE: '/profile/',
    UPDATE_PROFILE: '/profile/update/',
    CHANGE_PASSWORD: '/profile/change-password/',
  },
  
  // Buildings
  BUILDINGS: {
    REGISTER: '/buildings/register/',
    LIST: '/buildings/list/',
    DETAIL: (id) => `/buildings/${id}/`,
    UPDATE: (id) => `/buildings/${id}/update/`,
    DELETE: (id) => `/buildings/${id}/delete/`,
    UNITS: (id) => `/buildings/${id}/units/`,
    CREATE_UNIT: (id) => `/buildings/${id}/units/create/`,
    UNIT_DETAIL: (buildingId, unitId) => `/buildings/${buildingId}/units/${unitId}/`,
    UPDATE_UNIT: (buildingId, unitId) => `/buildings/${buildingId}/units/${unitId}/update/`,
    DELETE_UNIT: (buildingId, unitId) => `/buildings/${buildingId}/units/${unitId}/delete/`,
  },
  
  // Billing/Finance
  BILLING: {
    REGISTER_EXPENSE: '/billing/register-expense/',
    UPDATE_EXPENSE: '/billing/update-expense/',
    DELETE_EXPENSE: '/billing/delete-expense/',
    REGISTER_CHARGE: '/billing/register-charge/',
    PAY_BILL: '/billing/pay-bill/',
    FINANCIAL_SUMMARY: '/billing/financial-summary/',
    TRANSACTIONS: '/billing/transactions/',
    TRANSACTION_DETAIL: (id) => `/billing/transactions/${id}/`,
    EXPENSE_TYPES: '/billing/expense-types/',
    PENDING_PAYMENTS: '/billing/pending-payments/',
    APPROVE_PAYMENT: '/billing/approve-payment/',
    REJECT_PAYMENT: '/billing/reject-payment/',
    VALIDATE_PAYMENTS: '/billing/validate-payments/',
    INQUIRE_BILL: '/billing/inquire-bill/',
  },
  
  // Letters/Notifications
  LETTERS: {
    REGISTER: '/letters/register/',
    BUILDING_LETTERS: (id) => `/letters/building/${id}/`,
    DETAIL: (id) => `/letters/${id}/`,
    UPDATE: (id) => `/letters/${id}/update/`,
    DELETE: (id) => `/letters/${id}/delete/`,
  },
  
  // Services
  SERVICES: {
    BUILDING_SERVICES: (id) => `/services/building/${id}/`,
    CREATE: (id) => `/services/building/${id}/create/`,
    DETAIL: (buildingId, serviceId) => `/services/building/${buildingId}/${serviceId}/`,
    UPDATE: (buildingId, serviceId) => `/services/building/${buildingId}/${serviceId}/update/`,
    DELETE: (buildingId, serviceId) => `/services/building/${buildingId}/${serviceId}/delete/`,
    TYPES: '/services/types/',
  },
  
  // Surveys/Polls
  SURVEYS: {
    BUILDING_SURVEYS: (id) => `/surveys/building/${id}/`,
    CREATE: (id) => `/surveys/building/${id}/create/`,
    DETAIL: (buildingId, surveyId) => `/surveys/building/${buildingId}/${surveyId}/`,
    UPDATE: (buildingId, surveyId) => `/surveys/building/${buildingId}/${surveyId}/update/`,
    DELETE: (buildingId, surveyId) => `/surveys/building/${buildingId}/${surveyId}/delete/`,
    RESPONSES: (buildingId, surveyId) => `/surveys/building/${buildingId}/${surveyId}/responses/`,
    SUBMIT: (buildingId, surveyId) => `/surveys/building/${buildingId}/${surveyId}/submit/`,
    STATISTICS: (buildingId, surveyId) => `/surveys/building/${buildingId}/${surveyId}/statistics/`,
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطا در اتصال به سرور',
  UNAUTHORIZED: 'احراز هویت الزامی است',
  FORBIDDEN: 'دسترسی غیرمجاز',
  NOT_FOUND: 'منبع یافت نشد',
  SERVER_ERROR: 'خطای سرور',
  VALIDATION_ERROR: 'داده‌های ورودی نامعتبر',
  UNKNOWN_ERROR: 'خطای نامشخص',
};
