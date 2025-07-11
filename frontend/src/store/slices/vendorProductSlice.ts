import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { vendorsAPI } from "../../services/api";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  stock_unit: string;
  image?: string;
  isSelected: boolean;
}

interface VendorProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  selectedCount: number;
}

const initialState: VendorProductState = {
  products: [],
  loading: false,
  error: null,
  selectedCount: 0,
};

export const fetchVendorProducts = createAsyncThunk(
  "vendorProducts/fetchVendorProducts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await vendorsAPI.getVendorProducts();
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch vendor products");
    }
  }
);

export const selectVendorProduct = createAsyncThunk(
  "vendorProducts/selectVendorProduct",
  async (productId: string, { rejectWithValue }) => {
    try {
      await vendorsAPI.selectVendorProduct(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to select product");
    }
  }
);

export const deselectVendorProduct = createAsyncThunk(
  "vendorProducts/deselectVendorProduct",
  async (productId: string, { rejectWithValue }) => {
    try {
      await vendorsAPI.deselectVendorProduct(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to deselect product");
    }
  }
);

const vendorProductSlice = createSlice({
  name: "vendorProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.selectedCount = action.payload.filter((p: Product) => p.isSelected).length;
      })
      .addCase(fetchVendorProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(selectVendorProduct.fulfilled, (state, action) => {
        state.products = state.products.map((p) =>
          p._id === action.payload ? { ...p, isSelected: true } : p
        );
        state.selectedCount += 1;
      })
      .addCase(deselectVendorProduct.fulfilled, (state, action) => {
        state.products = state.products.map((p) =>
          p._id === action.payload ? { ...p, isSelected: false } : p
        );
        state.selectedCount -= 1;
      });
  },
});

export default vendorProductSlice.reducer;