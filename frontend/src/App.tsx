import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { PersistGate } from "redux-persist/integration/react"
import { Provider, useSelector } from "react-redux"
import store, { persistor } from "./store/store" // Import store and persistor

import type { RootState } from "./store/store"

// Pages
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import AdminDashboard from "./pages/AdminDashboard"
import ProductManagement from "./pages/ProductManagement"
import UserManagement from "./pages/UserManagement"
import VendorActivities from "./pages/VendorActivities"
import InvoiceGenerator from "./pages/InvoiceGenerator"
import VendorDashboard from "./pages/VendorDashboard"
import VendorProducts from "./pages/VendorProducts"
import VendorDailyActivity from "./pages/VendorDailyActivities"
import VendorTransactionHistory from "./pages/VendorTransactionHistory"
import VendorLocations from "./pages/VendorLocations"
import PendingApprovalPage from "./pages/PendingApprovalPage"

// Layout
import Layout from "./components/Layout/Layout"

function AppRoutes() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role || "")) {
      return <Navigate to="/unauthorized" />
    }

    return <>{children}</>
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pending-approval" element={<PendingApprovalPage />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <ProductManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activities"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <VendorActivities />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/invoices"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <InvoiceGenerator />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Vendor Routes */}
      <Route
        path="/vendor"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <Layout>
              <VendorDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/products"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <Layout>
              <VendorProducts />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/activity"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <Layout>
              <VendorDailyActivity />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/history"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <Layout>
              <VendorTransactionHistory />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/locations"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <Layout>
              <VendorLocations />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </PersistGate>
    </Provider>
  )
}

export default App
