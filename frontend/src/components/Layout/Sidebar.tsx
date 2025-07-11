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
} from "lucide-react"
import type { RootState } from "../../store/store"

const Sidebar = () => {
  const location = useLocation()
  const { user } = useSelector((state: RootState) => state.auth)

  const adminMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: ShoppingCart, label: "Products", path: "/admin/products" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: Activity, label: "Activities", path: "/admin/activities" },
    { icon: FileText, label: "Invoices", path: "/admin/invoices" },
    { icon: FileText, label: "Invoice List", path: "/admin/invoice-list" }, // <-- Add this line
  ]

  const vendorMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/vendor" },
    { icon: Package, label: "Products", path: "/vendor/products" },
    { icon: Receipt, label: "Bills", path: "/vendor/bills" },
    { icon: History, label: "History", path: "/vendor/history" },
  ]

  const menuItems = user?.role === "admin" ? adminMenuItems : vendorMenuItems

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
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
