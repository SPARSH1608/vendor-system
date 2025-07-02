import { configureStore } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import authReducer from "./slices/authSlice"
import productSlice from "./slices/productSlice"
import userSlice from "./slices/userSlice"
import vendorSlice from "./slices/vendorSlice"
import invoiceSlice from "./slices/invoiceSlice"

const persistConfig = {
  key: "root",
  storage,
}

const persistedReducer = persistReducer(persistConfig, authReducer)

export const store = configureStore({
  reducer: {
    auth: persistedReducer,
    products: productSlice,
    users: userSlice,
    vendors: vendorSlice,
    invoices: invoiceSlice,
  },
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store