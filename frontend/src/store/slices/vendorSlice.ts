import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface VendorActivity {
  _id: string
  vendor_id: string
  vendorEmail: string
  date: string
  location: string
  items: Array<{
    product_id: string
    productName: string
    quantity: number
    price: number
    total: number
  }>
  totalAmount: number
}

interface VendorState {
  activities: VendorActivity[]
  loading: boolean
  error: string | null
}

const initialState: VendorState = {
  activities: [],
  loading: false,
  error: null,
}

export const fetchVendorActivities = createAsyncThunk("vendors/fetchActivities", async () => {
  const response = await fetch("/api/vendors/activities", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message)
  return data
})

const vendorSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorActivities.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchVendorActivities.fulfilled, (state, action) => {
        state.loading = false
        state.activities = action.payload
      })
      .addCase(fetchVendorActivities.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch vendor activities"
      })
  },
})

export default vendorSlice.reducer
