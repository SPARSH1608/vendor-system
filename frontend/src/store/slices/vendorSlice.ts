import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { vendorsAPI } from "../../services/api";

export const fetchVendorActivities = createAsyncThunk(
  "vendors/fetchVendorActivities",
  async (params, { rejectWithValue }) => {
    try {
      const response = await vendorsAPI.getVendorActivities(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch vendor activities");
    }
  }
);

const vendorSlice = createSlice({
  name: "vendors",
  initialState: {
    activities: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorActivities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVendorActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.data;
      })
      .addCase(fetchVendorActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default vendorSlice.reducer;
