import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import productSlice from "./slices/productSlice";
import userSlice from "./slices/userSlice";
import vendorSlice from "./slices/vendorSlice"; // Import vendorSlice
import invoiceSlice from "./slices/invoiceSlice"; // Import invoiceSlice
import vendorProductReducer from "./slices/vendorProductSlice"; // Import vendorProductReducer

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedReducer,
    products: productSlice,
    users: userSlice,
    vendors: vendorSlice, // Add vendorSlice to the store
    invoices: invoiceSlice, // Add invoiceSlice to the store
    vendorProducts: vendorProductReducer, // Add vendorProductReducer to the store
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"], // Ignore redux-persist actions
        ignoredPaths: ["auth.error"], // Ignore non-serializable values in specific paths
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;