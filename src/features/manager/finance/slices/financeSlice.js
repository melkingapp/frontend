import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
    getFinancialSummary, 
    getTransactions, 
    getTransactionDetails, 
    getExpenseTypes,
    getPendingPayments,
    approvePayment as approvePaymentService,
    rejectPayment as rejectPaymentService,
    validatePayments as validatePaymentsService,
    inquireBill as inquireBillService,
    getBuildingBalance,
    getBalanceTransactions,
    addBalanceTransaction as addBalanceTransactionService,
    updateBalanceTransaction as updateBalanceTransactionService,
    deleteBalanceTransaction as deleteBalanceTransactionService,
    getBalanceTransactionDetails,
    exportBalanceData as exportBalanceDataService,
    getCurrentFundBalance,
    registerExpense as registerExpenseService,
    payBill as payBillService,
    uploadExpenseAttachment as uploadExpenseAttachmentService,
    getExpenseAllocation as getExpenseAllocationService
} from "../../../../shared/services/billingService";

// Async thunks for billing/finance operations
export const fetchFinancialSummary = createAsyncThunk(
    "finance/fetchFinancialSummary",
    async ({ buildingId, expenseType }, { rejectWithValue }) => {
        try {
            const response = await getFinancialSummary(buildingId, expenseType);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTransactions = createAsyncThunk(
    "finance/fetchTransactions",
    async (filters, { rejectWithValue }) => {
        try {
            const response = await getTransactions(filters);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTransactionDetails = createAsyncThunk(
    "finance/fetchTransactionDetails",
    async (transactionId, { rejectWithValue }) => {
        try {
            const response = await getTransactionDetails(transactionId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const registerExpense = createAsyncThunk(
    "finance/registerExpense",
    async (expenseData, { rejectWithValue }) => {
        try {
            const response = await registerExpenseService(expenseData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateExpense = createAsyncThunk(
    "finance/updateExpense",
    async (expenseData, { rejectWithValue }) => {
        try {
            const { updateExpense } = await import("../../../../shared/services/billingService");
            const response = await updateExpense(expenseData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteExpense = createAsyncThunk(
    "finance/deleteExpense",
    async (expenseId, { rejectWithValue }) => {
        try {
            const { deleteExpense } = await import("../../../../shared/services/billingService");
            const response = await deleteExpense(expenseId);
            return { ...response, expenseId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchExpenseAllocation = createAsyncThunk(
    "finance/fetchExpenseAllocation",
    async (sharedBillId, { rejectWithValue }) => {
        try {
            const response = await getExpenseAllocationService(sharedBillId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const payBill = createAsyncThunk(
    "finance/payBill",
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await payBillService(paymentData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchExpenseTypes = createAsyncThunk(
    "finance/fetchExpenseTypes",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getExpenseTypes();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const uploadExpenseAttachment = createAsyncThunk(
    "finance/uploadExpenseAttachment",
    async ({ expenseId, file }, { rejectWithValue }) => {
        try {
            const response = await uploadExpenseAttachmentService(expenseId, file);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchPendingPayments = createAsyncThunk(
    "finance/fetchPendingPayments",
    async ({ buildingId, status }, { rejectWithValue }) => {
        try {
            const response = await getPendingPayments(buildingId, status);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const approvePayment = createAsyncThunk(
    "finance/approvePayment",
    async (paymentId, { rejectWithValue }) => {
        try {
            const response = await approvePaymentService(paymentId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const rejectPayment = createAsyncThunk(
    "finance/rejectPayment",
    async ({ paymentId, reason }, { rejectWithValue }) => {
        try {
            const response = await rejectPaymentService(paymentId, reason);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const validatePayments = createAsyncThunk(
    "finance/validatePayments",
    async ({ paymentIds, buildingId }, { rejectWithValue }) => {
        try {
            const response = await validatePaymentsService(paymentIds, buildingId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const inquireBill = createAsyncThunk(
    "finance/inquireBill",
    async ({ billId, paymentId }, { rejectWithValue }) => {
        try {
            const response = await inquireBillService(billId, paymentId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Building Balance Async Thunks
export const fetchBuildingBalance = createAsyncThunk(
    "finance/fetchBuildingBalance",
    async ({ buildingId, dateFrom, dateTo }, { rejectWithValue }) => {
        try {
            const filters = {
                date_from: dateFrom,
                date_to: dateTo
            };
            const response = await getBuildingBalance(buildingId, filters);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchBalanceTransactions = createAsyncThunk(
    "finance/fetchBalanceTransactions",
    async ({ buildingId, dateFrom, dateTo, transactionType }, { rejectWithValue }) => {
        try {
            const filters = {
                date_from: dateFrom,
                date_to: dateTo,
                transaction_type: transactionType
            };
            const response = await getBalanceTransactions(buildingId, filters);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addBalanceTransaction = createAsyncThunk(
    "finance/addBalanceTransaction",
    async (transactionData, { rejectWithValue }) => {
        try {
            const response = await addBalanceTransactionService(transactionData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateBalanceTransaction = createAsyncThunk(
    "finance/updateBalanceTransaction",
    async ({ transactionId, transactionData }, { rejectWithValue }) => {
        try {
            const response = await updateBalanceTransactionService(transactionId, transactionData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteBalanceTransaction = createAsyncThunk(
    "finance/deleteBalanceTransaction",
    async (transactionId, { rejectWithValue }) => {
        try {
            const response = await deleteBalanceTransactionService(transactionId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchBalanceTransactionDetails = createAsyncThunk(
    "finance/fetchBalanceTransactionDetails",
    async (transactionId, { rejectWithValue }) => {
        try {
            const response = await getBalanceTransactionDetails(transactionId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const exportBalanceData = createAsyncThunk(
    "finance/exportBalanceData",
    async ({ buildingId, filters }, { rejectWithValue }) => {
        try {
            const response = await exportBalanceDataService(buildingId, filters);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCurrentFundBalance = createAsyncThunk(
    "finance/fetchCurrentFundBalance",
    async (buildingId, { rejectWithValue }) => {
        try {
            const response = await getCurrentFundBalance(buildingId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    financialSummary: null,
    transactions: [],
    transactionDetails: null,
    expenseTypes: [],
    pendingPayments: [],
    attachments: {},
    // Building Balance state
    buildingBalance: null,
    balanceTransactions: [],
    balanceTransactionDetails: null,
    currentFundBalance: null,
    loading: false,
    error: null,
    filters: {
        building_id: null,
        status: null,
        expense_type: null,
        date_from: null,
        date_to: null,
    },
};

const financeSlice = createSlice({
    name: "finance",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = {
                building_id: null,
                status: null,
                expense_type: null,
                date_from: null,
                date_to: null,
            };
        },
        clearTransactionDetails: (state) => {
            state.transactionDetails = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch financial summary
            .addCase(fetchFinancialSummary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFinancialSummary.fulfilled, (state, action) => {
                state.loading = false;
                // Only store serializable data
                state.financialSummary = action.payload.summary || action.payload;
                state.error = null;
            })
            .addCase(fetchFinancialSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch transactions
            .addCase(fetchTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.loading = false;
                // Handle both array and object responses
                if (Array.isArray(action.payload)) {
                    state.transactions = action.payload;
                } else if (action.payload.results) {
                    state.transactions = action.payload.results;
                } else if (action.payload.transactions) {
                    state.transactions = action.payload.transactions;
                } else {
                    // Ensure we only store serializable data
                    state.transactions = Array.isArray(action.payload) ? action.payload : [];
                }
                state.error = null;
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch transaction details
            .addCase(fetchTransactionDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactionDetails.fulfilled, (state, action) => {
                state.loading = false;
                // Only store serializable data
                state.transactionDetails = action.payload.transaction || action.payload;
                state.error = null;
            })
            .addCase(fetchTransactionDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Register expense
            .addCase(registerExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerExpense.fulfilled, (state, action) => {
                state.loading = false;
                // Add new expense to transactions list
                if (Array.isArray(state.transactions)) {
                    // Only add the expense data, not the entire response
                    const expenseData = action.payload.expense || action.payload;
                    state.transactions.unshift(expenseData);
                }
                state.error = null;
            })
            .addCase(registerExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update expense
            .addCase(updateExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateExpense.fulfilled, (state, action) => {
                state.loading = false;
                // Update expense in transactions list
                if (Array.isArray(state.transactions)) {
                    const index = state.transactions.findIndex(
                        t => t.id === action.payload.shared_bill_id
                    );
                    if (index !== -1) {
                        // Merge updated data with existing transaction
                        state.transactions[index] = {
                            ...state.transactions[index],
                            ...action.payload.expense
                        };
                    }
                }
                state.error = null;
            })
            .addCase(updateExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete expense
            .addCase(deleteExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteExpense.fulfilled, (state, action) => {
                state.loading = false;
                // Remove expense from transactions list
                if (Array.isArray(state.transactions)) {
                    state.transactions = state.transactions.filter(
                        t => t.id !== action.payload.expenseId
                    );
                }
                state.error = null;
            })
            .addCase(deleteExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch expense allocation
            .addCase(fetchExpenseAllocation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExpenseAllocation.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchExpenseAllocation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Pay bill
            .addCase(payBill.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(payBill.fulfilled, (state, action) => {
                state.loading = false;
                // Update transaction status in the list
                if (Array.isArray(state.transactions)) {
                    const transactionIndex = state.transactions.findIndex(
                        t => t.id === action.payload.bill_id
                    );
                    if (transactionIndex !== -1) {
                        state.transactions[transactionIndex].status = 'paid';
                        state.transactions[transactionIndex].payment_id = action.payload.payment_id;
                    }
                }
                state.error = null;
            })
            .addCase(payBill.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch expense types
            .addCase(fetchExpenseTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExpenseTypes.fulfilled, (state, action) => {
                state.loading = false;
                // Only store serializable data
                state.expenseTypes = action.payload.types || action.payload;
                state.error = null;
            })
            .addCase(fetchExpenseTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Upload expense attachment
            .addCase(uploadExpenseAttachment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadExpenseAttachment.fulfilled, (state, action) => {
                state.loading = false;
                // Only store serializable data
                const attachmentData = action.payload.attachment || action.payload;
                state.attachments[attachmentData.expense_id] = attachmentData;
                state.error = null;
            })
            .addCase(uploadExpenseAttachment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch pending payments
            .addCase(fetchPendingPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPendingPayments.fulfilled, (state, action) => {
                state.loading = false;
                // Only store serializable data
                state.pendingPayments = action.payload.payments || action.payload;
                state.error = null;
            })
            .addCase(fetchPendingPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Approve payment
            .addCase(approvePayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approvePayment.fulfilled, (state, action) => {
                state.loading = false;
                // Update payment status in pending payments
                const paymentIndex = state.pendingPayments.findIndex(
                    p => p.id === action.payload.payment_id
                );
                if (paymentIndex !== -1) {
                    state.pendingPayments[paymentIndex].status = 'approved';
                }
                state.error = null;
            })
            .addCase(approvePayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Reject payment
            .addCase(rejectPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectPayment.fulfilled, (state, action) => {
                state.loading = false;
                // Update payment status in pending payments
                const paymentIndex = state.pendingPayments.findIndex(
                    p => p.id === action.payload.payment_id
                );
                if (paymentIndex !== -1) {
                    state.pendingPayments[paymentIndex].status = 'rejected';
                }
                state.error = null;
            })
            .addCase(rejectPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Validate payments
            .addCase(validatePayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(validatePayments.fulfilled, (state, action) => {
                state.loading = false;
                // Update validated payments status
                action.payload.validated_payments?.forEach(validatedPayment => {
                    const paymentIndex = state.pendingPayments.findIndex(
                        p => p.id === validatedPayment.id
                    );
                    if (paymentIndex !== -1) {
                        state.pendingPayments[paymentIndex].status = validatedPayment.status;
                    }
                });
                state.error = null;
            })
            .addCase(validatePayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Inquire bill
            .addCase(inquireBill.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(inquireBill.fulfilled, (state, action) => {
                state.loading = false;
                // Update bill status in transactions
                const transactionIndex = state.transactions.findIndex(
                    t => t.id === action.payload.bill_id
                );
                if (transactionIndex !== -1) {
                    state.transactions[transactionIndex].status = action.payload.status;
                }
                state.error = null;
            })
            .addCase(inquireBill.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Building Balance reducers
            // Fetch building balance
            .addCase(fetchBuildingBalance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBuildingBalance.fulfilled, (state, action) => {
                state.loading = false;
                // Only store serializable data
                state.buildingBalance = action.payload.balance || action.payload;
                state.error = null;
            })
            .addCase(fetchBuildingBalance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch balance transactions
            .addCase(fetchBalanceTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBalanceTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.balanceTransactions = action.payload.transactions || action.payload;
                state.error = null;
            })
            .addCase(fetchBalanceTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add balance transaction
            .addCase(addBalanceTransaction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addBalanceTransaction.fulfilled, (state, action) => {
                state.loading = false;
                // Only store serializable data
                const transactionData = action.payload.transaction || action.payload;
                state.balanceTransactions.unshift(transactionData);
                state.error = null;
            })
            .addCase(addBalanceTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update balance transaction
            .addCase(updateBalanceTransaction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBalanceTransaction.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.balanceTransactions.findIndex(
                    t => t.id === action.payload.id
                );
                if (index !== -1) {
                    // Only store serializable data
                    const transactionData = action.payload.transaction || action.payload;
                    state.balanceTransactions[index] = transactionData;
                }
                state.error = null;
            })
            .addCase(updateBalanceTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete balance transaction
            .addCase(deleteBalanceTransaction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBalanceTransaction.fulfilled, (state, action) => {
                state.loading = false;
                state.balanceTransactions = state.balanceTransactions.filter(
                    t => t.id !== action.payload.id
                );
                state.error = null;
            })
            .addCase(deleteBalanceTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch balance transaction details
            .addCase(fetchBalanceTransactionDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBalanceTransactionDetails.fulfilled, (state, action) => {
                state.loading = false;
                // Only store serializable data
                state.balanceTransactionDetails = action.payload.transaction || action.payload;
                state.error = null;
            })
            .addCase(fetchBalanceTransactionDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Export balance data
            .addCase(exportBalanceData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(exportBalanceData.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(exportBalanceData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch current fund balance
            .addCase(fetchCurrentFundBalance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCurrentFundBalance.fulfilled, (state, action) => {
                state.loading = false;
                // Only store serializable data
                state.currentFundBalance = action.payload.balance || action.payload;
                state.error = null;
            })
            .addCase(fetchCurrentFundBalance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, setFilters, clearFilters, clearTransactionDetails } = financeSlice.actions;

// Selectors
export const selectFinancialSummary = (state) => state.finance.financialSummary;
export const selectTransactions = (state) => state.finance.transactions;
export const selectTransactionDetails = (state) => state.finance.transactionDetails;
export const selectExpenseTypes = (state) => state.finance.expenseTypes;
export const selectPendingPayments = (state) => state.finance.pendingPayments;
export const selectAttachments = (state) => state.finance.attachments;
export const selectFinanceLoading = (state) => state.finance.loading;
export const selectFinanceError = (state) => state.finance.error;
export const selectFinanceFilters = (state) => state.finance.filters;

// Building Balance selectors
export const selectBuildingBalance = (state) => state.finance.buildingBalance;
export const selectBalanceTransactions = (state) => state.finance.balanceTransactions;
export const selectBalanceTransactionDetails = (state) => state.finance.balanceTransactionDetails;
export const selectCurrentFundBalance = (state) => state.finance.currentFundBalance;

export default financeSlice.reducer;
