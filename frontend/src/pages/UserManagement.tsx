"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Search, UserCheck, UserX, Shield } from "lucide-react"
import { fetchUsers, updateUserRole, toggleUserStatus } from "../store/slices/userSlice"
import { vendorsAPI } from "../services/api";
import type { AppDispatch, RootState } from "../store/store"
import ConfirmationModal from "../components/ConfirmationModal"
import VendorProductsModal from "../components/VendorProductsModal"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useTranslation } from "react-i18next"

const UserManagement = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>()
  const { users, loading } = useSelector((state: RootState) => state.users)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [roleModalUser, setRoleModalUser] = useState<{ id: string; newRole: string; email: string } | null>(null)
  const [search, setSearch] = useState("")
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [downloading, setDownloading] = useState(false)
  const [showVendorProductsModal, setShowVendorProductsModal] = useState(false);
  const [selectedVendorProducts, setSelectedVendorProducts] = useState([]);
  const [selectedVendorName, setSelectedVendorName] = useState("");

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

  const getRoleLabel = (role: string) => {
    // Fix: Always use "vendor" as key for translation, not the value from t("vendor")
    if (role === "vendor") return t("vendor");
    if(role === "super_admin") return t("super_admin");
    if (role === "admin") return t("admin");
    if (role === "user") return t("user");
    return role;
  };

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
      // Use the API function instead of fetch
      const data = await vendorsAPI.getVendorProductsByIds(selectedVendors)
      if (!data.success) throw new Error(t("failedToFetchProducts"))

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
        [t("vendor")]: email,
        [t("products")]: products.join(", "),
      }))

      const ws = XLSX.utils.json_to_sheet(allProducts, { header: [t("vendor"), t("products")] })
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, t("vendorProductsSheet"))
      XLSX.writeFile(wb, "vendor_products.xlsx")
    } catch (err) {
      alert(t("failedToDownloadProducts"))
    }
    setDownloading(false)
  }

  // Download selected vendors' products as PDF
  const handleDownloadProductsPDF = async () => {
    setDownloading(true);
    try {
      // Prepare vendor data (IDs and names)
      const selectedVendorData = vendorUsers
        .filter((vendor) => selectedVendors.includes(vendor._id))
        .map((vendor) => ({ id: vendor._id, name: vendor.name }));

      // Use the API function instead of fetch
      const data = await vendorsAPI.getVendorProductsForPDF(selectedVendorData);
      if (!data.success) throw new Error(t("failedToFetchProducts"));

      // Group products by vendor name
      const vendorMap: Record<string, string[]> = {};
      data.data.forEach((prod: any) => {
        const name = prod.vendor_id?.name || t("unknownVendor");
        const productName = prod.product_id?.name || "";
        if (!vendorMap[name]) vendorMap[name] = [];
        vendorMap[name].push(productName);
      });

      // Prepare rows: one row per vendor, products comma-separated
      const rows = Object.entries(vendorMap).map(([name, products]) => [
        name,
        products.join(", "),
      ]);
      const head = [[t("vendorName"), t("products")]];

      const doc = new jsPDF();
      doc.text(t("vendorProductsTitle"), 14, 16);
      autoTable(doc, {
        startY: 22,
        head,
        body: rows,
        styles: { fontSize: 12 },
        headStyles: { fillColor: [22, 163, 74] },
      });
      doc.save("vendor_products.pdf");
    } catch (err) {
      alert(t("failedToDownloadProductsPDF"));
    }
    setDownloading(false);
  }

  const handleViewVendorProducts = async (vendor) => {
    setSelectedVendorName(vendor.name);
    try {
      const data = await vendorsAPI.getVendorProductsById(vendor._id);
      let products = [];
      if (data.success && Array.isArray(data.data)) {
        products = data.data.filter(Boolean); // Remove nulls
      }
      setSelectedVendorProducts(products); // Always set an array
      setShowVendorProductsModal(true);
    } catch (err) {
      setSelectedVendorProducts([]); // Show empty state on error
      setShowVendorProductsModal(true);
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("userManagementTitle")}</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">{t("userManagementDesc")}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t("searchUsers")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Users Table / Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {t("allUsers")} ({filteredUsers.length})
            </h2>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">{t("viewAndManageUsers")}</p>
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
                    <th className="px-4 py-3"></th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">{t("phone")}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">{t("name")}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">{t("role")}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">{t("status")}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">{t("actions")}</th>
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
                      <td className="px-4 py-3">{user.phone}</td>
                      <td className="px-4 py-3">{user.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                          {user.isActive ? t("active") : t("inactive")}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-y-1 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
                        {user.role === "user" && (
                          <button
                            onClick={() => handleRoleRequest(user._id, "vendor", user.email)}
                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-900"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>{t("makeVendor")}</span>
                          </button>
                        )}
                        {user.role === "vendor" && (
                          <button
                            onClick={() => handleRoleRequest(user._id, "user", user.email)}
                            className="inline-flex items-center space-x-1 text-orange-600 hover:text-orange-900"
                          >
                            <UserX className="w-4 h-4" />
                            <span>{t("removeVendor")}</span>
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
                          {user.isActive ? t("deactivate") : t("activate")}
                        </button>
                        {user.role === "vendor" && (
                          <button
                            onClick={() => handleViewVendorProducts(user)}
                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-900"
                          >
                            <span>{t("viewProducts")}</span>
                          </button>
                        )}
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
                    <span className="font-semibold text-gray-900">{user.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>{getRoleLabel(user.role)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{t("phone")}: {user.phone}</span>
                    <span className={`px-2 py-1 rounded-full ${getStatusColor(user.isActive)}`}>
                      {user.isActive ? t("active") : t("inactive")}
                    </span>
                  </div>
                  {/* Add vendor checkbox for mobile */}
                  {user.role === "vendor" && (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        checked={selectedVendors.includes(user._id)}
                        onChange={() => handleVendorSelect(user._id)}
                        className="accent-blue-600"
                      />
                      <span className="text-xs text-gray-700">{t("selectVendor")}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-2 mt-2">
                    {user.role === "user" && (
                      <button
                        onClick={() => handleRoleRequest(user._id, "vendor", user.email)}
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-900 text-xs"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{t("makeVendor")}</span>
                      </button>
                    )}
                    {user.role === "vendor" && (
                      <button
                        onClick={() => handleRoleRequest(user._id, "user", user.email)}
                        className="inline-flex items-center space-x-1 text-orange-600 hover:text-orange-900 text-xs"
                      >
                        <UserX className="w-4 h-4" />
                        <span>{t("removeVendor")}</span>
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
                      {user.isActive ? t("deactivate") : t("activate")}
                    </button>
                    {/* View Products button for vendor on mobile */}
                    {user.role === "vendor" && (
                      <button
                        onClick={() => handleViewVendorProducts(user)}
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-900 text-xs"
                      >
                        <span>{t("viewProducts")}</span>
                      </button>
                    )}
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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          disabled={selectedVendors.length === 0 || downloading}
          onClick={handleDownloadProductsPDF}
        >
          {downloading ? t("downloading") : t("downloadProductsPDF")}
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
            ? t("confirmRoleChange", {
                action: roleModalUser.newRole === "vendor" ? t("convert") : t("revert"),
                email: roleModalUser.email,
                role: t(roleModalUser.newRole),
              })
            : ""
        }
        isProcessing={loading}
      />

      {/* Vendor Products Modal */}
      {showVendorProductsModal && (
        <VendorProductsModal
          isOpen={showVendorProductsModal}
          onClose={() => setShowVendorProductsModal(false)}
          products={selectedVendorProducts}
          vendorName={selectedVendorName}
        />
      )}
    </div>
  )
}

export default UserManagement
