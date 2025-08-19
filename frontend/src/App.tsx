import type React from "react"
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "./store/store"
import { useSelector } from "react-redux"
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
import VendorBills from "./pages/VendorBills"
import CreateBill from "./pages/CreateBill"
import VendorTransactionHistory from "./pages/VendorTransactionHistory"
import VendorLocations from "./pages/VendorLocations"
import InactiveAccountPage from "./pages/InactiveAccountPage"
import PendingApprovalPage from "./pages/PendingApprovalPage"
import InvoiceList from "./pages/InvoiceList"
import SuperAdminUserManagement from "./pages/SuperAdminUserManagement"

// Layout
import Layout from "./components/Layout/Layout"

function AppRoutes() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  
  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />
    }

    // If user is not active, show inactive page
    if (user && user.isActive === false) {
      return <InactiveAccountPage />
    }

    // If user is active but role is 'user', show pending page
    if (user && user.isActive && user.role === "user") {
      return <PendingApprovalPage />
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role || "")) {
      return <Navigate to="/unauthorized" />
    }

    return <>{children}</>
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<LoginPage/>  }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pending" element={<PendingApprovalPage />} />

      {/* Super Admin Routes */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminUserManagement />
          </ProtectedRoute>
        }
      />

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
      <Route
        path="/admin/invoice-list"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <InvoiceList />
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
        path="/vendor/bills"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <Layout>
              <VendorBills />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/bills/create"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <Layout>
              <CreateBill />
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
    

      {/* Catch-all: any other route, check user status */}
      <Route
        path="*"
        element={
          <ProtectedRoute allowedRoles={[]}>
            <Navigate to="/" />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </Provider>
  )
}

export default App
