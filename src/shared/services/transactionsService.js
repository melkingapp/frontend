import { get } from './apiService';

// Get all transactions
export const getTransactions = async (filters = {}) => {
    try {
        // Try with authentication first
        const params = new URLSearchParams();
        if (filters.building_id) params.append('building_id', filters.building_id);
        if (filters.status) params.append('status', filters.status);
        if (filters.expense_type) params.append('expense_type', filters.expense_type);
        if (filters.date_from) params.append('date_from', filters.date_from);
        if (filters.date_to) params.append('date_to', filters.date_to);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        try {
            const response = await get(`/billing/transactions/${queryString}`);
            return response;
        } catch (error) {
            // If authentication fails, use test endpoint
            console.warn('Authentication failed, using test endpoint:', error.message);
            const response = await get(`/billing/transactions-test/${queryString}`);
            return response;
        }
    } catch (error) {
        console.error('Get transactions error:', error);
        throw error;
    }
};

// Get unit transactions
export const getUnitTransactions = async (unitNumber, buildingId = null) => {
    try {
        // Try with authentication first
        const params = new URLSearchParams();
        if (buildingId) params.append('building_id', buildingId);
        if (unitNumber) params.append('unit_number', unitNumber);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        try {
            const response = await get(`/billing/unit-transactions/${queryString}`);
            return response;
        } catch (error) {
            // If authentication fails, use test endpoint
            console.warn('Authentication failed, using test endpoint:', error.message);
            const response = await get(`/billing/unit-transactions-test/${queryString}`);
            return response;
        }
    } catch (error) {
        console.error('Get unit transactions error:', error);
        throw error;
    }
};

// Get unit financial transactions (complete financial flow)
export const getUnitFinancialTransactions = async (unitId, dateFrom = null, dateTo = null) => {
    try {
        const params = new URLSearchParams();
        if (unitId) params.append('unit_id', unitId);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await get(`/billing/unit-financial-transactions/${queryString}`);
        return response;
    } catch (error) {
        console.error('Get unit financial transactions error:', error);
        throw error;
    }
};

// Get transaction detail
export const getTransactionDetail = async (transactionId) => {
    try {
        const response = await get(`/billing/transactions/${transactionId}/`);
        return response;
    } catch (error) {
        console.error('Get transaction detail error:', error);
        throw error;
    }
};

// Default export (برای backward compatibility)
const transactionsService = {
    getTransactions,
    getUnitTransactions,
    getUnitFinancialTransactions,
    getTransactionDetail
};

export default transactionsService;
