import { configureStore } from "@reduxjs/toolkit"
import authSlice from "./slices/authSlice"
import productSlice from "./slices/productSlice"
import userSlice from "./slices/userSlice"
import vendorSlice from "./slices/vendorSlice"
import invoiceSlice from "./slices/invoiceSlice"

export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productSlice,
    users: userSlice,
    vendors: vendorSlice,
    invoices: invoiceSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
