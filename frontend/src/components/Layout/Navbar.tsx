"use client"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { LogOut, User, LayoutDashboard, ShoppingCart, Users, Activity, FileText, Package, History, Receipt, Menu } from "lucide-react"
import type { RootState } from "../../store/store"
import { logout } from "../../store/slices/authSlice"
import { useState } from "react"

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

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
    { icon: FileText, label: "Invoice List", path: "/admin/invoice-list" },
  ]

  const vendorMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/vendor" },
    { icon: Package, label: "Products", path: "/vendor/products" },
    { icon: Receipt, label: "Bills", path: "/vendor/bills" },
    { icon: History, label: "History", path: "/vendor/history" },
  ]

  const menuItems = user?.role === "admin" ? adminMenuItems : vendorMenuItems

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="px-2 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">VM</span>
          </div>
          <span className="text-lg sm:text-xl font-semibold text-gray-900">Vendor Management</span>
        </div>
        {/* Hamburger for mobile */}
        <button
          className="sm:hidden ml-auto mr-2"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Open Menu"
        >
          <Menu className="w-7 h-7 text-gray-700" />
        </button>
        {/* Desktop Nav */}
        <div className="hidden sm:flex flex-1 items-center justify-center gap-1 sm:gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-2 py-2 rounded-lg transition-colors text-sm font-medium
                  ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"}
                `}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
        {/* User Info & Logout */}
        <div className="hidden sm:flex items-center space-x-2 ml-4">
          <User className="w-5 h-5 text-gray-600" />
          <span className="text-xs sm:text-sm text-gray-700">{user?.email}</span>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded capitalize">{user?.role}</span>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors ml-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Logout</span>
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="sm:hidden px-2 pb-2">
          <div className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium
                    ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"}
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div className="flex items-center space-x-2 mt-2 border-t pt-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-xs text-gray-700">{user?.email}</span>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded capitalize">{user?.role}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors ml-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
