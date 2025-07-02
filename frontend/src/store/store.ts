import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import productReducer from "./slices/productSlice"
import invoiceReducer from "./slices/invoiceSlice"
import userReducer from "./slices/userSlice"
import vendorReducer from "./slices/vendorSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    invoices: invoiceReducer,
    users: userReducer,
    vendors: vendorReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
