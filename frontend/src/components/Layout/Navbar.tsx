"use client"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { LogOut, User, LayoutDashboard, ShoppingCart, Users, Activity, FileText, Package } from "lucide-react"
import type { RootState } from "../../store/store"
import { logout } from "../../store/slices/authSlice"

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    dispatch(logout())
    navigate("/")
  }

  const adminMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: ShoppingCart, label: "Products", path: "/admin/products" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: Activity, label: "Activities", path: "/admin/activities" },
    { icon: FileText, label: "Invoices", path: "/admin/invoices" },
  ]

  const vendorMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/vendor" },
    { icon: Package, label: "My Products", path: "/vendor/products" },
    { icon: Activity, label: "Daily Activity", path: "/vendor/activity" },
    { icon: FileText, label: "Transaction History", path: "/vendor/history" },
  ]

  const menuItems = user?.role === "admin" ? adminMenuItems : vendorMenuItems

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">VM</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">Vendor Management</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 text-sm font-medium ${
                  isActive ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* User Info and Logout */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">{user?.email}</span>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded capitalize">{user?.role}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
