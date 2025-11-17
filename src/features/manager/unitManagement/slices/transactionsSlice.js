import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getTransactions as getTransactionsService, getUnitTransactions as getUnitTransactionsService, getTransactionDetail as getTransactionDetailService } from "../../../../shared/services/transactionsService";

// Async thunks
export const fetchTransactions = createAsyncThunk(
  "transactions/fetchTransactions",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await getTransactionsService(filters);
      return response.transactions || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchUnitTransactions = createAsyncThunk(
  "transactions/fetchUnitTransactions",
  async ({ unitNumber, buildingId }, { rejectWithValue }) => {
    try {
      const response = await getUnitTransactionsService(unitNumber, buildingId);
      return response.transactions || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchTransactionDetail = createAsyncThunk(
  "transactions/fetchTransactionDetail",
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await getTransactionDetailService(transactionId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const transactionsSlice = createSlice({
  name: "transactions",
  initialState: {
    transactions: [],
    unitTransactions: [],
    selectedTransaction: null,
    loading: false,
    unitLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedTransaction: (state, action) => {
      state.selectedTransaction = action.payload;
    },
    clearSelectedTransaction: (state) => {
      state.selectedTransaction = null;
    },
    clearUnitTransactions: (state) => {
      state.unitTransactions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch unit transactions
      .addCase(fetchUnitTransactions.pending, (state) => {
        state.unitLoading = true;
        state.error = null;
      })
      .addCase(fetchUnitTransactions.fulfilled, (state, action) => {
        state.unitLoading = false;
        state.unitTransactions = action.payload;
      })
      .addCase(fetchUnitTransactions.rejected, (state, action) => {
        state.unitLoading = false;
        state.error = action.payload;
      })
      
      // Fetch transaction detail
      .addCase(fetchTransactionDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTransaction = action.payload;
      })
      .addCase(fetchTransactionDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSelectedTransaction, clearSelectedTransaction, clearUnitTransactions } = transactionsSlice.actions;
export default transactionsSlice.reducer;
