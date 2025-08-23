import { Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Activity,
  FileText,
  Package,
  MapPin,
  History,
  Receipt,
  Globe
} from "lucide-react"
import type { RootState } from "../../store/store"
import { useTranslation } from "react-i18next"

const Sidebar = () => {
  const location = useLocation()
  const { user } = useSelector((state: RootState) => state.auth)
  const { i18n } = useTranslation();

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

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white shadow-sm border-r border-gray-200 z-40">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
          {/* Language Switcher as menu item */}
          <li>
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg">
              <Globe className="w-5 h-5 text-gray-500" />
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 rounded text-sm font-medium ${i18n.language === 'en' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                English
              </button>
              <button
                onClick={() => changeLanguage('gu')}
                className={`px-2 py-1 rounded text-sm font-medium ${i18n.language === 'gu' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                ગુજરાતી
              </button>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
