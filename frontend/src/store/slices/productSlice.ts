import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productsAPI } from "../../services/api";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  stock_unit: string;
  image?: string;
  isActive: boolean;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    pages: number;
  };
  vendors: any[]; // Add this to store vendors for a product
  vendorsLoading: boolean; // Add this to track loading state for vendors
  vendorsError: string | null; // Add this to track errors for vendors
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    pages: 1,
  },
  vendors: [], // Add this to store vendors for a product
  vendorsLoading: false, // Add this to track loading state for vendors
  vendorsError: null, // Add this to track errors for vendors
};

// Fetch products
export const fetchProducts = createAsyncThunk("products/fetchProducts", async (params, { rejectWithValue }) => {
  try {
    const response = await productsAPI.getProducts(params);
    console.log("Fetched products:", response);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch products");
  }
});

// Create product
export const createProduct = createAsyncThunk("products/createProduct", async (productData: FormData, { rejectWithValue }) => {
  try {
    const response = await productsAPI.createProduct(productData);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to create product");
  }
});

// Update product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData }: { id: string; productData: FormData }, { rejectWithValue }) => {
    try {
      const response = await productsAPI.updateProduct(id, productData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update product");
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk("products/deleteProduct", async (productId: string, { rejectWithValue }) => {
  try {
    const response = await productsAPI.deleteProduct(productId);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to delete product");
  }
});

// Toggle product status
export const toggleProductStatus = createAsyncThunk(
  "products/toggleProductStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      // your API call here
    } catch (error: any) {
      // error handling
    }
  }
);

// Fetch vendors for a specific product
export const fetchVendorsByProduct = createAsyncThunk(
  "products/fetchVendorsByProduct",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getVendorsByProduct(productId);
      return response.data; // Assuming the API returns a `data` field with the vendors
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch vendors for the product");
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Fetch Vendors by Product
      .addCase(fetchVendorsByProduct.pending, (state) => {
        state.vendorsLoading = true;
        state.vendorsError = null;
      })
      .addCase(fetchVendorsByProduct.fulfilled, (state, action) => {
        console.log("Fetched vendors:", action.payload); // Debugging
        state.vendorsLoading = false;
        state.vendors = action.payload; // Ensure this updates the state
      })
      .addCase(fetchVendorsByProduct.rejected, (state, action) => {
        state.vendorsLoading = false;
        state.vendorsError = action.payload as string;
      })

      // Other cases...
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.meta.arg);
      });
  },
});

export const { clearError } = productSlice.actions;
export default productSlice.reducer;
