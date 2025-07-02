import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { invoicesAPI } from "../../services/api"

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
    const data = await invoicesAPI.generateInvoice(invoiceData)
    return data.data || data
  },
)

export const fetchInvoices = createAsyncThunk("invoices/fetchInvoices", async () => {
  const data = await invoicesAPI.getInvoices()
  return data.data || data
})

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
