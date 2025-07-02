import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface Product {
  _id: string
  name: string
  description?: string
  price: number
  category: "vegetables" | "fruits" | "dairy" | "masala" | "dry fruits" | "pulses"
  stock_unit: string
  image?: string
  isActive: boolean
  created_by: string
  createdAt: string
  updatedAt: string
}

interface ProductState {
  products: Product[]
  loading: boolean
  error: string | null
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
}

export const fetchProducts = createAsyncThunk("products/fetchProducts", async () => {
  const response = await fetch("/api/products")
  const data = await response.json()
  if (!response.ok) throw new Error(data.message)
  return data
})

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData: Omit<Product, "_id" | "created_by" | "createdAt" | "updatedAt">) => {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(productData),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data
  },
)

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData }: { id: string; productData: Partial<Product> }) => {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(productData),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data
  },
)

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch products"
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload)
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p._id === action.payload._id)
        if (index !== -1) {
          state.products[index] = action.payload
        }
      })
  },
})

export const { clearError } = productSlice.actions
export default productSlice.reducer
