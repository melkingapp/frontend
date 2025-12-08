import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPendingPayments, approvePayment as approvePaymentService, rejectPayment as rejectPaymentService, validatePayments as validatePaymentsService, inquireBill as inquireBillService } from '../../../../shared/services/billingService';

// Async thunks
export const fetchPendingPayments = createAsyncThunk(
  'payments/fetchPendingPayments',
  async ({ buildingId = null, status = 'pending' }, { rejectWithValue }) => {
    try {
      console.log("🔥 fetchPendingPayments - Building ID:", buildingId, "Status:", status);
      const response = await getPendingPayments(buildingId, status);
      console.log("🔥 fetchPendingPayments - API response:", response);
      return response;
    } catch (error) {
      console.error("🔥 fetchPendingPayments - Error:", error);
      return rejectWithValue(error.message || 'خطا در دریافت پرداخت‌ها');
    }
  }
);

export const approvePayment = createAsyncThunk(
  'payments/approvePayment',
  async (paymentId, { rejectWithValue }) => {
    try {
      console.log("🔥 approvePayment - Payment ID:", paymentId);
      const response = await approvePaymentService(paymentId);
      console.log("🔥 approvePayment - API response:", response);
      return { paymentId, response };
    } catch (error) {
      console.error("🔥 approvePayment - Error:", error);
      return rejectWithValue(error.message || 'خطا در تایید پرداخت');
    }
  }
);

export const rejectPayment = createAsyncThunk(
  'payments/rejectPayment',
  async ({ paymentId, reason = '' }, { rejectWithValue }) => {
    try {
      console.log("🔥 rejectPayment - Payment ID:", paymentId, "Reason:", reason);
      const response = await rejectPaymentService(paymentId, reason);
      console.log("🔥 rejectPayment - API response:", response);
      return { paymentId, response };
    } catch (error) {
      console.error("🔥 rejectPayment - Error:", error);
      return rejectWithValue(error.message || 'خطا در رد پرداخت');
    }
  }
);

export const validatePayments = createAsyncThunk(
  'payments/validatePayments',
  async ({ paymentIds, buildingId = null }, { rejectWithValue }) => {
    try {
      const response = await validatePayments(paymentIds, buildingId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'خطا در اعتبارسنجی پرداخت‌ها');
    }
  }
);

export const inquireBill = createAsyncThunk(
  'payments/inquireBill',
  async ({ billId, paymentId }, { rejectWithValue }) => {
    try {
      const response = await inquireBill(billId, paymentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'خطا در استعلام قبض');
    }
  }
);

// Initial state
const initialState = {
  payments: [],
  validationResults: null,
  billInquiry: null,
  loading: false,
  error: null,
  filters: {
    status: 'pending',
    buildingId: null
  }
};

// Slice
const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearValidationResults: (state) => {
      state.validationResults = null;
    },
    clearBillInquiry: (state) => {
      state.billInquiry = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updatePaymentStatus: (state, action) => {
      const { paymentId, status } = action.payload;
      const payment = state.payments.find(p => p.id === paymentId);
      if (payment) {
        payment.status = status;
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch pending payments
    builder
      .addCase(fetchPendingPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.payments || [];
      })
      .addCase(fetchPendingPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Approve payment
    builder
      .addCase(approvePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approvePayment.fulfilled, (state, action) => {
        state.loading = false;
        const { paymentId } = action.payload;
        const payment = state.payments.find(p => p.id === paymentId);
        if (payment) {
          payment.status = 'paid';
        }
        console.log("🔥 Payment approved:", action.payload);
      })
      .addCase(approvePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("🔥 Payment approval failed:", action.payload);
      });

    // Reject payment
    builder
      .addCase(rejectPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectPayment.fulfilled, (state, action) => {
        state.loading = false;
        const { paymentId } = action.payload;
        const payment = state.payments.find(p => p.id === paymentId);
        if (payment) {
          payment.status = 'cancelled';
        }
        console.log("🔥 Payment rejected:", action.payload);
      })
      .addCase(rejectPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("🔥 Payment rejection failed:", action.payload);
      });

    // Validate payments
    builder
      .addCase(validatePayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validatePayments.fulfilled, (state, action) => {
        state.loading = false;
        state.validationResults = action.payload;
      })
      .addCase(validatePayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Inquire bill
    builder
      .addCase(inquireBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inquireBill.fulfilled, (state, action) => {
        state.loading = false;
        state.billInquiry = action.payload;
      })
      .addCase(inquireBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearValidationResults,
  clearBillInquiry,
  setFilters,
  updatePaymentStatus
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
