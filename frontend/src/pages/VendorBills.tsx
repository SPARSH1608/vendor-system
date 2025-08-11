"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, Eye, Edit, FileText } from "lucide-react"
import { vendorsAPI } from "../services/api"
import { useTranslation } from "react-i18next"

interface Bill {
  _id: string
  billNumber: string
  customer: {
    name: string
    email: string
    phone: string
  }
  items: Array<{
    productName: string
    quantity: number
    price: number
    total: number
  }>
  totalAmount: number
  status: "draft" | "unpaid" | "paid"
  createdAt: string
}

interface BillStats {
  totalBills: number
  paidBills: number
  unpaidBills: number
  draftBills: number
  totalRevenue: number
}

const VendorBills = () => {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const [bills, setBills] = useState<Bill[]>([])
  const [stats, setStats] = useState<BillStats>({
    totalBills: 0,
    paidBills: 0,
    unpaidBills: 0,
    draftBills: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [showBillModal, setShowBillModal] = useState(false)

  const statusOptions = [
    t("allStatus"),
    "draft",
    "unpaid",
    "paid"
  ]

  useEffect(() => {
    fetchBills()
    fetchStats()
  }, [])

  const fetchBills = async () => {
    setLoading(true)
    try {
      const data = await vendorsAPI.getVendorBills()
      setBills(data.data)
    } catch (error) {
      console.error("Error fetching bills:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await vendorsAPI.getVendorBillStats()
      setStats(data.data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === t("allStatus") || bill.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-600"
      case "unpaid":
        return "bg-red-100 text-red-600"
      case "draft":
        return "bg-gray-100 text-gray-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const viewBillDetails = (bill: Bill) => {
    setSelectedBill(bill)
    setShowBillModal(true)
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("myBillsTitle")}</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">{t("myBillsDesc")}</p>
        </div>
        <button
          onClick={() => navigate("/vendor/bills/create")}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>{t("createNewBill")}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center flex flex-col items-center">
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalBills}</p>
          <p className="text-xs sm:text-sm text-gray-600">{t("totalBills")}</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center flex flex-col items-center">
          <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.paidBills}</p>
          <p className="text-xs sm:text-sm text-gray-600">{t("paid")}</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center flex flex-col items-center">
          <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.unpaidBills}</p>
          <p className="text-xs sm:text-sm text-gray-600">{t("unpaid")}</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center flex flex-col items-center">
          <p className="text-lg sm:text-2xl font-bold text-gray-600">{stats.draftBills}</p>
          <p className="text-xs sm:text-sm text-gray-600">{t("draft")}</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center flex flex-col items-center">
          <p className="text-lg sm:text-2xl font-bold text-blue-600">₹{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs sm:text-sm text-gray-600">{t("revenue")}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t("searchBillsPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status === "draft" || status === "unpaid" || status === "paid" ? t(status) : status}
            </option>
          ))}
        </select>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{t("noBillsFound")}</p>
            <button
              onClick={() => navigate("/vendor/bills/create")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {t("createFirstBill")}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredBills.map((bill) => (
              <div key={bill._id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-2">
                      <h3 className="font-semibold text-gray-900">{bill.customer.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(bill.status)}`}>{t(bill.status)}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                      <p>{t("email")}: {bill.customer.email}</p>
                      <p>{t("phone")}: {bill.customer.phone}</p>
                      <p>
                        {t("billId")}: {bill.billNumber} • {t("date")}: {formatDate(bill.createdAt)}
                      </p>
                      <p className="truncate">{t("items")}: {bill.items.map((item) => `${item.productName} (${item.quantity})`).join(", ")}</p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-end sm:items-end space-x-4 sm:space-x-0 sm:space-y-2">
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{bill.totalAmount}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{bill.items.length} {t("itemsShort")}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewBillDetails(bill)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {bill.status === "draft" && (
                        <button
                          onClick={() => navigate(`/vendor/bills/edit/${bill._id}`)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <select
                        value={bill.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value
                          try {
                            await vendorsAPI.updateBillStatus(bill._id, newStatus)
                            fetchBills()
                            fetchStats()
                          } catch (err) {
                            alert(t("errorUpdatingStatus"))
                          }
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm"
                        style={{ minWidth: 90 }}
                      >
                        <option value="draft">{t("draft")}</option>
                        <option value="unpaid">{t("unpaid")}</option>
                        <option value="paid">{t("paid")}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bill Details Modal */}
      {showBillModal && selectedBill && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t("billDetailsTitle")}</h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {t("billId")}: {selectedBill.billNumber} • {t("createdOn")}: {formatDate(selectedBill.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(selectedBill.status)}`}>
                    {t(selectedBill.status)}
                  </span>
                  <button onClick={() => setShowBillModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{t("customerInfoTitle")}</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-xs sm:text-sm">
                  <p>
                    <strong>{t("name")}:</strong> {selectedBill.customer.name}
                  </p>
                  <p>
                    <strong>{t("email")}:</strong> {selectedBill.customer.email}
                  </p>
                  <p>
                    <strong>{t("phone")}:</strong> {selectedBill.customer.phone}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{t("itemsTitle")}</h3>
                <div className="space-y-2">
                  {selectedBill.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-gray-600">
                          {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <span className="font-semibold">₹{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                  <span>{t("totalAmount")}:</span>
                  <span>₹{selectedBill.totalAmount}</span>
                </div>
              </div>

              {/* Status Change */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{t("changeBillStatusTitle")}</h3>
                <select
                  value={selectedBill.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value
                    try {
                      const data = await vendorsAPI.updateBillStatus(selectedBill._id, newStatus)
                      setSelectedBill(data.data)
                      fetchBills()
                      fetchStats()
                    } catch (err) {
                      alert(t("errorUpdatingStatus"))
                    }
                  }}
                  className="border border-gray-300 rounded px-3 py-2 text-xs sm:text-sm"
                >
                  <option value="draft">{t("draft")}</option>
                  <option value="unpaid">{t("unpaid")}</option>
                  <option value="paid">{t("paid")}</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
                <button
                  onClick={() => setShowBillModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("close")}
                </button>
                {selectedBill.status === "draft" && (
                  <button
                    onClick={() => {
                      setShowBillModal(false)
                      navigate(`/vendor/bills/edit/${selectedBill._id}`)
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t("editBill")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorBills
