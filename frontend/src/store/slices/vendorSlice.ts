import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { vendorsAPI } from "../../services/api"

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
  createdAt: string
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
  const data = await vendorsAPI.getVendorActivities()
  return data.data || data
})

export const createVendorActivity = createAsyncThunk(
  "vendors/createActivity",
  async (activityData: any) => {
    const data = await vendorsAPI.createVendorActivity(activityData)
    return data.data || data
  },
)

const vendorSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
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
      .addCase(createVendorActivity.fulfilled, (state, action) => {
        state.activities.push(action.payload)
      })
  },
})

export const { clearError } = vendorSlice.actions
export default vendorSlice.reducer
