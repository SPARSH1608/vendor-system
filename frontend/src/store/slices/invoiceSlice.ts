import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface Invoice {
  _id: string
  vendor_id: string
  vendorEmail: string
  dateRange: {
    start: string
    end: string
  }
  items: Array<{
    productName: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  tax: number
  totalAmount: number
  qrCode?: string
  createdAt: string
}

interface InvoiceState {
  invoices: Invoice[]
  currentInvoice: Invoice | null
  loading: boolean
  error: string | null
}

const initialState: InvoiceState = {
  invoices: [],
  currentInvoice: null,
  loading: false,
  error: null,
}

export const generateInvoice = createAsyncThunk(
  "invoices/generate",
  async (invoiceData: { vendorId?: string; startDate: string; endDate: string }) => {
    const response = await fetch("/api/invoices/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(invoiceData),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    return data
  },
)

const invoiceSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateInvoice.pending, (state) => {
        state.loading = true
      })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        state.loading = false
        state.currentInvoice = action.payload
      })
      .addCase(generateInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to generate invoice"
      })
  },
})

export const { clearCurrentInvoice } = invoiceSlice.actions
export default invoiceSlice.reducer
