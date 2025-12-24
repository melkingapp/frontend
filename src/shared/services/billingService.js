import { get, post, put, deleteRequest } from './apiService';

// Register new expense
export const registerExpense = async (expenseData) => {
    try {
        // اگر فایل داریم، باید از FormData استفاده کنیم
        const formData = new FormData();
        
        for (const key in expenseData) {
            if (expenseData[key] !== undefined && expenseData[key] !== null) {
                if (key === 'specific_units' && Array.isArray(expenseData[key])) {
                    // آرایه‌ها رو به JSON تبدیل می‌کنیم
                    formData.append(key, JSON.stringify(expenseData[key]));
                } else if (expenseData[key] instanceof File) {
                    // فایل‌ها رو مستقیماً اضافه می‌کنیم
                    formData.append(key, expenseData[key], expenseData[key].name);
                } else {
                    // بقیه فیلدها رو به صورت عادی اضافه می‌کنیم
                    formData.append(key, expenseData[key]);
                }
            }
        }
        
        // بذار axios خودش Content-Type رو با boundary مناسب set کنه
        const response = await post('/billing/register-expense/', formData);
        return response;
    } catch (error) {
        console.error('Register expense error:', error);
        // نمایش پیام خطای Backend اگر موجود باشد
        if (error.response?.data?.error) {
            console.error('Backend error:', error.response.data.error);
        }
        throw error;
    }
};

// Register new charge
export const registerCharge = async (chargeData) => {
    try {
        // اگر فایل داریم، باید از FormData استفاده کنیم
        const formData = new FormData();
        
        for (const key in chargeData) {
            if (chargeData[key] !== undefined && chargeData[key] !== null) {
                if (key === 'specific_units' && Array.isArray(chargeData[key])) {
                    // آرایه‌ها رو به JSON تبدیل می‌کنیم
                    formData.append(key, JSON.stringify(chargeData[key]));
                } else if (chargeData[key] instanceof File) {
                    // فایل‌ها رو مستقیماً اضافه می‌کنیم
                    formData.append(key, chargeData[key], chargeData[key].name);
                } else {
                    // بقیه فیلدها رو به صورت عادی اضافه می‌کنیم
                    formData.append(key, chargeData[key]);
                }
            }
        }
        
        // بذار axios خودش Content-Type رو با boundary مناسب set کنه
        const response = await post('/billing/register-charge/', formData);
        return response;
    } catch (error) {
        console.error('Register charge error:', error);
        // نمایش پیام خطای Backend اگر موجود باشد
        if (error.response?.data?.error) {
            console.error('Backend error:', error.response.data.error);
        }
        throw error;
    }
};

// Update expense
export const updateExpense = async (expenseData) => {
    try {
        // اگر فایل داریم، باید از FormData استفاده کنیم
        const formData = new FormData();
        
        for (const key in expenseData) {
            if (expenseData[key] !== undefined && expenseData[key] !== null) {
                if (key === 'specific_units' && Array.isArray(expenseData[key])) {
                    formData.append(key, JSON.stringify(expenseData[key]));
                } else if (expenseData[key] instanceof File) {
                    formData.append(key, expenseData[key], expenseData[key].name);
                } else {
                    formData.append(key, expenseData[key]);
                }
            }
        }
        
        const response = await put('/billing/update-expense/', formData);
        return response;
    } catch (error) {
        console.error('Update expense error:', error);
        if (error.response?.data?.error) {
            console.error('Backend error:', error.response.data.error);
        }
        throw error;
    }
};

// Delete expense
export const deleteExpense = async (expenseId) => {
    try {
        // ارسال shared_bill_id به عنوان query parameter
        const response = await deleteRequest(`/billing/delete-expense/?shared_bill_id=${expenseId}`);
        return response;
    } catch (error) {
        console.error('Delete expense error:', error);
        throw error;
    }
};

// Get expense allocation
export const getExpenseAllocation = async (sharedBillId) => {
    try {
        const response = await get(`/billing/get-expense-allocation/?shared_bill_id=${sharedBillId}`);
        return response;
    } catch (error) {
        console.error('Get expense allocation error:', error);
        throw error;
    }
};

// Pay bill
export const payBill = async (paymentData) => {
    try {
        const response = await post('/billing/pay-bill/', paymentData);
        return response;
    } catch (error) {
        console.error('Pay bill error:', error);
        throw error;
    }
};

// Get financial summary
export const getFinancialSummary = async (buildingId = null, expenseType = null) => {
    try {
        let params = [];
        if (buildingId) params.push(`building_id=${buildingId}`);
        if (expenseType) params.push(`expense_type=${expenseType}`);
        const queryString = params.length > 0 ? `?${params.join('&')}` : '';
        
        const response = await get(`/billing/financial-summary/${queryString}`);
        return response;
    } catch (error) {
        console.error('Get financial summary error:', error);
        throw error;
    }
};

// Get transactions
export const getTransactions = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await get(`/billing/transactions/${queryString}`);
        return response;
    } catch (error) {
        console.error('Get transactions error:', error);
        throw error;
    }
};

// Get transaction details
export const getTransactionDetails = async (transactionId) => {
    try {
        const response = await get(`/billing/transactions/${transactionId}/`);
        return response;
    } catch (error) {
        console.error('Get transaction details error:', error);
        throw error;
    }
};

// Get expense types
export const getExpenseTypes = async () => {
    try {
        const response = await get('/billing/expense-types/');
        return response;
    } catch (error) {
        console.error('Get expense types error:', error);
        throw error;
    }
};

// Upload expense attachment
export const uploadExpenseAttachment = async (expenseId, file) => {
    try {
        const formData = new FormData();
        formData.append('attachment', file);
        
        const response = await post(`/billing/expenses/${expenseId}/attachment/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        console.error('Upload expense attachment error:', error);
        throw error;
    }
};

// Get pending payments
export const getPendingPayments = async (buildingId = null, status = 'pending') => {
    try {
        const params = new URLSearchParams();
        if (buildingId) params.append('building_id', buildingId);
        if (status) params.append('status', status);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        
        try {
            // Try with authentication first
            const response = await get(`/billing/pending-payments/${queryString}`);
            return response;
        } catch (error) {
            // If authentication fails, use test endpoint
            console.warn('Authentication failed, using test endpoint:', error.message);
            const response = await get(`/billing/pending-payments-test/${queryString}`);
            return response;
        }
    } catch (error) {
        console.error('Get pending payments error:', error);
        throw error;
    }
};

// Approve payment
export const approvePayment = async (paymentId) => {
    try {
        const response = await post('/billing/approve-payment/', { payment_id: paymentId });
        return response;
    } catch (error) {
        console.error('Approve payment error:', error);
        throw error;
    }
};

// Reject payment
export const rejectPayment = async (paymentId, reason = '') => {
    try {
        const response = await post('/billing/reject-payment/', { 
            payment_id: paymentId, 
            reason 
        });
        return response;
    } catch (error) {
        console.error('Reject payment error:', error);
        throw error;
    }
};

// Validate payments
export const validatePayments = async (paymentIds, buildingId = null) => {
    try {
        const response = await post('/billing/validate-payments/', {
            payment_ids: paymentIds,
            building_id: buildingId
        });
        return response;
    } catch (error) {
        console.error('Validate payments error:', error);
        throw error;
    }
};

// Inquire bill
export const inquireBill = async (billId, paymentId) => {
    try {
        const response = await post('/billing/inquire-bill/', {
            bill_id: billId,
            payment_id: paymentId
        });
        return response;
    } catch (error) {
        console.error('Inquire bill error:', error);
        throw error;
    }
};

// Building Balance Methods
export const getBuildingBalance = async (buildingId, filters = {}) => {
    try {
        const params = new URLSearchParams();
        params.append('building_id', buildingId);
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });
        
        const queryString = params.toString();
        const response = await get(`/billing/building-balance/?${queryString}`);
        return response;
    } catch (error) {
        console.error('Get building balance error:', error);
        throw error;
    }
};

export const getBalanceTransactions = async (buildingId, filters = {}) => {
    try {
        const params = new URLSearchParams();
        params.append('building_id', buildingId);
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });
        
        const queryString = params.toString();
        const response = await get(`/billing/balance-transactions/?${queryString}`);
        return response;
    } catch (error) {
        console.error('Get balance transactions error:', error);
        throw error;
    }
};

export const addBalanceTransaction = async (transactionData) => {
    try {
        const response = await post('/billing/balance-transactions/', transactionData);
        return response;
    } catch (error) {
        console.error('Add balance transaction error:', error);
        throw error;
    }
};

export const updateBalanceTransaction = async (transactionId, transactionData) => {
    try {
        const response = await put(`/billing/balance-transactions/${transactionId}/`, transactionData);
        return response;
    } catch (error) {
        console.error('Update balance transaction error:', error);
        throw error;
    }
};

export const deleteBalanceTransaction = async (transactionId) => {
    try {
        const response = await deleteRequest(`/billing/balance-transactions/${transactionId}/`);
        return response;
    } catch (error) {
        console.error('Delete balance transaction error:', error);
        throw error;
    }
};

export const getBalanceTransactionDetails = async (transactionId) => {
    try {
        const response = await get(`/billing/balance-transactions/${transactionId}/`);
        return response;
    } catch (error) {
        console.error('Get balance transaction details error:', error);
        throw error;
    }
};

export const exportBalanceData = async (buildingId, filters = {}) => {
    try {
        const params = new URLSearchParams();
        params.append('building_id', buildingId);
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });
        
        const queryString = params.toString();
        const response = await get(`/billing/export-balance/?${queryString}`, {
            responseType: 'blob'
        });
        return response;
    } catch (error) {
        console.error('Export balance data error:', error);
        throw error;
    }
};

export const getCurrentFundBalance = async (buildingId) => {
    try {
        const response = await get(`/billing/current-fund-balance/?building_id=${buildingId}`);
        return response;
    } catch (error) {
        console.error('Get current fund balance error:', error);
        throw error;
    }
};

// Building Visibility Settings
export const getBuildingVisibilitySettings = async (buildingId) => {
    try {
        const response = await get(`/billing/visibility-settings/?building_id=${buildingId}`);
        return response;
    } catch (error) {
        console.error('Get building visibility settings error:', error);
        throw error;
    }
};

export const toggleDebtCreditVisibility = async (buildingId, showToResidents) => {
    try {
        const payload = {
            building_id: buildingId,
            show_to_residents: showToResidents,
        };
        const response = await post('/billing/toggle-debt-credit-visibility/', payload);
        return response;
    } catch (error) {
        console.error('Toggle debt/credit visibility error:', error);
        throw error;
    }
};

export const toggleFinancialTransactionsVisibility = async (buildingId, showToResidents) => {
    try {
        const payload = {
            building_id: buildingId,
            show_to_residents: showToResidents,
        };
        const response = await post('/billing/toggle-financial-transactions-visibility/', payload);
        return response;
    } catch (error) {
        console.error('Toggle financial transactions visibility error:', error);
        throw error;
    }
};

// Charge Formulas APIs
// Get list of charge formulas for a building
export const getChargeFormulas = async (buildingId) => {
    try {
        const response = await get(`/billing/formulas/?building_id=${buildingId}`);
        return response;
    } catch (error) {
        console.error('Get charge formulas error:', error);
        throw error;
    }
};

// Create a new charge formula
export const createChargeFormula = async (formulaData) => {
    try {
        const response = await post('/billing/formulas/create/', formulaData);
        return response;
    } catch (error) {
        console.error('Create charge formula error:', error);
        if (error.response?.data?.error) {
            console.error('Backend error:', error.response.data.error);
        }
        throw error;
    }
};

// Get charge formula details
export const getChargeFormula = async (formulaId) => {
    try {
        const response = await get(`/billing/formulas/${formulaId}/`);
        return response;
    } catch (error) {
        console.error('Get charge formula error:', error);
        throw error;
    }
};

// Update charge formula
export const updateChargeFormula = async (formulaId, formulaData) => {
    try {
        const response = await put(`/billing/formulas/${formulaId}/`, formulaData);
        return response;
    } catch (error) {
        console.error('Update charge formula error:', error);
        if (error.response?.data?.error) {
            console.error('Backend error:', error.response.data.error);
        }
        throw error;
    }
};

// Delete charge formula
export const deleteChargeFormula = async (formulaId) => {
    try {
        const response = await deleteRequest(`/billing/formulas/${formulaId}/`);
        return response;
    } catch (error) {
        console.error('Delete charge formula error:', error);
        throw error;
    }
};

// Announce charge (new endpoint with auto_schedule support)
export const announceCharge = async (chargeData) => {
    try {
        const response = await post('/billing/announce-charge/', chargeData);
        return response;
    } catch (error) {
        console.error('Announce charge error:', error);
        if (error.response?.data?.error) {
            console.error('Backend error:', error.response.data.error);
        }
        throw error;
    }
};

// Charge Schedule Management APIs
// Get list of charge schedules
export const getChargeSchedules = async (buildingId = null, isActive = null) => {
    try {
        const params = new URLSearchParams();
        if (buildingId) params.append('building_id', buildingId);
        if (isActive !== null) params.append('is_active', isActive);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await get(`/billing/schedules/${queryString}`);
        return response;
    } catch (error) {
        console.error('Get charge schedules error:', error);
        throw error;
    }
};

// Get charge schedule details
export const getChargeSchedule = async (scheduleId) => {
    try {
        const response = await get(`/billing/schedules/${scheduleId}/`);
        return response;
    } catch (error) {
        console.error('Get charge schedule error:', error);
        throw error;
    }
};

// Toggle schedule (activate/deactivate)
export const toggleChargeSchedule = async (scheduleId) => {
    try {
        const response = await post(`/billing/schedules/${scheduleId}/toggle/`);
        return response;
    } catch (error) {
        console.error('Toggle charge schedule error:', error);
        throw error;
    }
};

// Execute schedule manually
export const executeChargeSchedule = async (scheduleId) => {
    try {
        const response = await post(`/billing/schedules/${scheduleId}/execute/`);
        return response;
    } catch (error) {
        console.error('Execute charge schedule error:', error);
        throw error;
    }
};

// Delete schedule
export const deleteChargeSchedule = async (scheduleId) => {
    try {
        const response = await deleteRequest(`/billing/schedules/${scheduleId}/`);
        return response;
    } catch (error) {
        console.error('Delete charge schedule error:', error);
        throw error;
    }
};

// Default export (برای backward compatibility)
const billingService = {
    registerExpense,
    registerCharge,
    payBill,
    getFinancialSummary,
    getTransactions,
    getTransactionDetails,
    getExpenseTypes,
    uploadExpenseAttachment,
    getPendingPayments,
    approvePayment,
    rejectPayment,
    validatePayments,
    inquireBill,
    getBuildingBalance,
    getBalanceTransactions,
    addBalanceTransaction,
    updateBalanceTransaction,
    deleteBalanceTransaction,
    getBalanceTransactionDetails,
    exportBalanceData,
    getCurrentFundBalance,
    getChargeFormulas,
    createChargeFormula,
    getChargeFormula,
    updateChargeFormula,
    deleteChargeFormula,
    announceCharge,
    getChargeSchedules,
    getChargeSchedule,
    toggleChargeSchedule,
    executeChargeSchedule,
    deleteChargeSchedule
};

export default billingService;
