"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Search, UserCheck, UserX, Shield } from "lucide-react"
import { fetchUsers, updateUserRole, toggleUserStatus } from "../store/slices/userSlice"
import type { AppDispatch, RootState } from "../store/store"
import ConfirmationModal from "../components/ConfirmationModal"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const UserManagement = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { users, loading } = useSelector((state: RootState) => state.users)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [roleModalUser, setRoleModalUser] = useState<{ id: string; newRole: string; email: string } | null>(null)
  const [search, setSearch] = useState("")
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  const handleRoleRequest = (userId: string, newRole: string, email: string) => {
    setRoleModalUser({ id: userId, newRole, email })
    setShowRoleModal(true)
  }

  const handleRoleChange = async () => {
    if (roleModalUser) {
      await dispatch(updateUserRole({ userId: roleModalUser.id, role: roleModalUser.newRole }))
      setShowRoleModal(false)
      setRoleModalUser(null)
      dispatch(fetchUsers())
    }
  }

  const handleToggleStatus = async (userId: string) => {
    await dispatch(toggleUserStatus(userId))
    dispatch(fetchUsers())
  }

  const getRoleColor = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-600",
      vendor: "bg-blue-100 text-blue-600",
      user: "bg-gray-100 text-gray-600",
    }
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-600"
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
  }

  // Filter users by search
  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.toLowerCase().includes(search.toLowerCase()))
  )

  // Only vendors for selection
  const vendorUsers = filteredUsers.filter(u => u.role === "vendor")

  // Handle vendor selection
  const handleVendorSelect = (vendorId: string) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    )
  }

  // Download selected vendors' products as Excel
  const handleDownloadProductsExcel = async () => {
    setDownloading(true)
    try {
      const res = await fetch("/api/vendors/products-by-vendors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ vendorIds: selectedVendors }),
      })
      const data = await res.json()
      if (!data.success) throw new Error("Failed to fetch products")

      // Group products by vendor email
      const vendorMap: Record<string, string[]> = {}
      data.data.forEach((prod: any) => {
        const email = prod.vendor_id?.email || ""
        const name = prod.product_id?.name || ""
        if (!vendorMap[email]) vendorMap[email] = []
        vendorMap[email].push(name)
      })

      // Prepare rows: one row per vendor, products comma-separated
      const allProducts = Object.entries(vendorMap).map(([email, products]) => ({
        Vendor: email,
        Products: products.join(", "),
      }))

      const ws = XLSX.utils.json_to_sheet(allProducts, { header: ["Vendor", "Products"] })
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Vendor Products")
      XLSX.writeFile(wb, "vendor_products.xlsx")
    } catch (err) {
      alert("Failed to download products.")
    }
    setDownloading(false)
  }

  // Download selected vendors' products as PDF
  const handleDownloadProductsPDF = async () => {
    setDownloading(true)
    try {
      const res = await fetch("/api/vendors/products-by-vendors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ vendorIds: selectedVendors }),
      })
      const data = await res.json()
      if (!data.success) throw new Error("Failed to fetch products")

      // Group products by vendor email
      const vendorMap: Record<string, string[]> = {}
      data.data.forEach((prod: any) => {
        const email = prod.vendor_id?.email || ""
        const name = prod.product_id?.name || ""
        if (!vendorMap[email]) vendorMap[email] = []
        vendorMap[email].push(name)
      })

      // Prepare rows: one row per vendor, products comma-separated
      const rows = Object.entries(vendorMap).map(([email, products]) => [
        email,
        products.join(", "),
      ])
      const head = [["Vendor", "Products"]]

      const doc = new jsPDF()
      doc.text("Vendor Products", 14, 16)
      autoTable(doc, {
        startY: 22,
        head,
        body: rows,
        styles: { fontSize: 12 },
        headStyles: { fillColor: [22, 163, 74] },
      })
      doc.save("vendor_products.pdf")
    } catch (err) {
      alert("Failed to download products PDF.")
    }
    setDownloading(false)
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage user roles and permissions</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Users Table / Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">All Users ({filteredUsers.length})</h2>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">View and manage all registered users</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Table for desktop, cards for mobile */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3"></th> {/* Checkbox column */}
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {user.role === "vendor" && (
                          <input
                            type="checkbox"
                            checked={selectedVendors.includes(user._id)}
                            onChange={() => handleVendorSelect(user._id)}
                            className="accent-blue-600"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                          {user.isActive ? "active" : "inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-y-1 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
                        {user.role === "user" && (
                          <button
                            onClick={() => handleRoleRequest(user._id, "vendor", user.email)}
                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-900"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>Make Vendor</span>
                          </button>
                        )}
                        {user.role === "vendor" && (
                          <button
                            onClick={() => handleRoleRequest(user._id, "user", user.email)}
                            className="inline-flex items-center space-x-1 text-orange-600 hover:text-orange-900"
                          >
                            <UserX className="w-4 h-4" />
                            <span>Remove Vendor</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          className={`px-3 py-1 text-xs rounded ${
                            user.isActive
                              ? "bg-red-100 text-red-600 hover:bg-red-200"
                              : "bg-green-100 text-green-600 hover:bg-green-200"
                          }`}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Cards for mobile */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <div key={user._id} className="py-4 px-2 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{user.email}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>{user.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Phone: {user.phone}</span>
                    <span className={`px-2 py-1 rounded-full ${getStatusColor(user.isActive)}`}>
                      {user.isActive ? "active" : "inactive"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    {user.role === "user" && (
                      <button
                        onClick={() => handleRoleRequest(user._id, "vendor", user.email)}
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-900 text-xs"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Make Vendor</span>
                      </button>
                    )}
                    {user.role === "vendor" && (
                      <button
                        onClick={() => handleRoleRequest(user._id, "user", user.email)}
                        className="inline-flex items-center space-x-1 text-orange-600 hover:text-orange-900 text-xs"
                      >
                        <UserX className="w-4 h-4" />
                        <span>Remove Vendor</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleStatus(user._id)}
                      className={`px-3 py-1 text-xs rounded ${
                        user.isActive
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-green-100 text-green-600 hover:bg-green-200"
                      }`}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Download Button */}
      <div className="flex justify-end mt-4 space-x-2">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
          disabled={selectedVendors.length === 0 || downloading}
          onClick={handleDownloadProductsExcel}
        >
          {downloading ? "Downloading..." : "Download Products Excel"}
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          disabled={selectedVendors.length === 0 || downloading}
          onClick={handleDownloadProductsPDF}
        >
          {downloading ? "Downloading..." : "Download Products PDF"}
        </button>
      </div>

      {/* Confirmation Modal for role change */}
      <ConfirmationModal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false)
          setRoleModalUser(null)
        }}
        onConfirm={handleRoleChange}
        message={
          roleModalUser
            ? `Are you sure you want to ${roleModalUser.newRole === "vendor" ? "convert" : "revert"} "${roleModalUser.email}" to ${roleModalUser.newRole}?`
            : ""
        }
        isProcessing={loading}
      />
    </div>
  )
}

export default UserManagement
