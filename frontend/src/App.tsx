import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
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
import VendorDashboard from "./pages/VendorDashbaord"
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
        path="/vendor"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <Layout>
              <VendorDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/pending-approval" element={<PendingApprovalPage />} />
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
