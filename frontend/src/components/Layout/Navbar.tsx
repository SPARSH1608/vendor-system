"use client"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { LogOut, User, LayoutDashboard, ShoppingCart, Users, Activity, FileText, Package, History, Receipt, Menu } from "lucide-react"
import type { RootState } from "../../store/store"
import { logout } from "../../store/slices/authSlice"
import { useState } from "react"
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    dispatch(logout())
    navigate("/")
  }

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang); // Persist language preference
  };

  const adminMenuItems = [
    { icon: LayoutDashboard, label: t("dashboard"), path: "/admin" },
    { icon: ShoppingCart, label: t("products"), path: "/admin/products" },
    { icon: Users, label: t("users"), path: "/admin/users" },
    { icon: Activity, label: t("activities"), path: "/admin/activities" },
    { icon: FileText, label: t("invoices"), path: "/admin/invoices" },
    { icon: FileText, label: t("invoiceList"), path: "/admin/invoice-list" },
  ]

  const vendorMenuItems = [
    { icon: LayoutDashboard, label: t("dashboard"), path: "/vendor" },
    { icon: Package, label: t("products"), path: "/vendor/products" },
    { icon: Receipt, label: t("bills"), path: "/vendor/bills" },
    { icon: History, label: t("history"), path: "/vendor/history" },
  ]

  const menuItems = user?.role === "admin" ? adminMenuItems : vendorMenuItems

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="px-2 sm:px-6 py-4 flex items-center justify-between">
        {/* Images and Title */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <img
            src="https://gian.org/wp-content/uploads/2024/08/gian.jpg"
            alt="Logo 1"
            className="w-8 h-8 rounded object-contain bg-white"
          />
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnsSHBxVQJpV1qqrPjyFlUJ6bUhAZ0nq4yeg&s"
            alt="Logo 2"
            className="w-8 h-8 rounded object-cover"
          />
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEXCCyN4RO_CWkUg6qLXchagzkVPMPWDZ-Zg&s"
            alt="Logo 3"
            className="w-8 h-8 rounded object-cover"
          />
          <span className="text-lg sm:text-xl font-semibold text-gray-900">Sristi KhedutHaat</span>
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
          {/* Language Switcher as menu item */}
          <div className="flex items-center space-x-1 px-2 py-2 rounded-lg text-sm font-medium">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              English
            </button>
            <button
              onClick={() => changeLanguage('gu')}
              className={`px-2 py-1 rounded ${i18n.language === 'gu' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              ગુજરાતી
            </button>
          </div>
        </div>
        {/* User Info, Logout */}
        <div className="hidden sm:flex items-center space-x-4 ml-4">
          <User className="w-5 h-5 text-gray-600" />
          <span className="text-xs sm:text-sm text-gray-700">{user?.email}</span>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded capitalize">{user?.role}</span>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors ml-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs sm:text-sm">{t("logout")}</span>
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="sm:hidden px-2 pb-2 flex flex-col h-[calc(100vh-64px)] bg-white z-[9999]">
          <div className="flex-1 overflow-y-auto flex flex-col gap-1">
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
            {/* Language Switcher as menu item */}
            <div className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium mt-1">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                English
              </button>
              <button
                onClick={() => changeLanguage('gu')}
                className={`px-2 py-1 rounded ${i18n.language === 'gu' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                ગુજરાતી
              </button>
            </div>
            <div className="flex items-center space-x-2 mt-2 border-t pt-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-xs text-gray-700">{user?.email}</span>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded capitalize">{user?.role}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors ml-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs">{t("logout")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
