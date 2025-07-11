import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { invoicesAPI } from "../../services/api";

export const generateInvoice = createAsyncThunk(
  "invoices/generateInvoice",
  async (invoiceData, { rejectWithValue }) => {
    try {
      const response = await invoicesAPI.generateInvoice(invoiceData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to generate invoice");
    }
  }
);

const invoiceSlice = createSlice({
  name: "invoices",
  initialState: {
    currentInvoice: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(generateInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload.data;
      })
      .addCase(generateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default invoiceSlice.reducer;
