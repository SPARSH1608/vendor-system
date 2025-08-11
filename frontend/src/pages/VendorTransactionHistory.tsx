"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Package, TrendingUp, X } from "lucide-react"
import { vendorsAPI } from "../services/api"
import { useTranslation } from "react-i18next"

interface ActivityItem {
  product_id: string
  productName: string
  quantity: number
  price: number
  total: number
}

interface Activity {
  _id: string
  date: string
  location: string
  items: ActivityItem[]
  totalAmount: number
  vendorEmail?: string // <-- Add this line
}

const VendorTransactionHistory = () => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    location: "All Locations",
  })
  const [resetKey, setResetKey] = useState(0) // For resetting inputs

const locations = [
  "Dr. Babasaheb Ambedkar Open University Campus",
  "Shri Bhagwat Vidyapeeth Temple",
  "Atma vikasa parisara",
  "Navjeevan Trust Campus",
  "Gayatri Temple Trust Campus",
  "Sristi Campus",
  "Vallabh Vidyanagar",
]

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true)
      try {
        // Fetch all activities (no filters sent to backend)
        const res = await vendorsAPI.getMyActivities({})
        setActivities(res.data)
      } catch (err) {
        setActivities([])
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
    // eslint-disable-next-line
  }, [resetKey])

  // Filter activities on frontend
  const filteredActivities = activities.filter((activity) => {
    // Date filter
    let pass = true
    if (filters.startDate) {
      pass = pass && new Date(activity.date) >= new Date(filters.startDate)
    }
    if (filters.endDate) {
      pass = pass && new Date(activity.date) <= new Date(filters.endDate)
    }
    // Location filter
    if (filters.location && filters.location !== "All Locations") {
      pass = pass && activity.location === filters.location
    }
    return pass
  })

  const getStats = () => {
    const totalTransactions = filteredActivities.length
    const totalRevenue = filteredActivities.reduce((sum, a) => sum + a.totalAmount, 0)
    const completedTransactions = totalTransactions
    return {
      totalTransactions,
      completedTransactions,
      totalRevenue,
    }
  }

  const stats = getStats()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      location: "All Locations",
    })
    setResetKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6 px-0 sm:px-4 md:px-8 lg:px-12 w-full max-w-none mx-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("transactionHistoryTitle")}</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">{t("transactionHistoryDesc")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <p className="text-xs sm:text-sm font-medium text-gray-600">{t("totalTransactions")}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mt-2">
            <Package className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <p className="text-xs sm:text-sm font-medium text-gray-600">{t("completed")}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completedTransactions}</p>
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mt-2">
            <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <p className="text-xs sm:text-sm font-medium text-gray-600">{t("totalRevenue")}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mt-2">
            <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-lg font-semibold text-gray-900">{t("filters")}</h2>
          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="flex items-center text-sm text-gray-500 hover:text-red-600 border border-gray-200 px-3 py-1 rounded"
              disabled={
                !filters.startDate && !filters.endDate && filters.location === t("allLocations")
              }
              type="button"
            >
              <X className="w-4 h-4 mr-1" />
              {t("clearFilters")}
            </button>
            <button
              onClick={() => setResetKey(prev => prev + 1)}
              className="flex items-center text-sm text-gray-500 hover:text-blue-600 border border-gray-200 px-3 py-1 rounded"
              type="button"
            >
              {t("reset")}
            </button>
          </div>
        </div>
        <form
          className="flex flex-col sm:flex-row gap-4"
          onSubmit={e => {
            e.preventDefault()
            setFilters({
              startDate: (e.target as any).startDate.value,
              endDate: (e.target as any).endDate.value,
              location: (e.target as any).location.value,
            })
          }}
          key={resetKey}
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("startDate")}</label>
            <input
              type="date"
              name="startDate"
              defaultValue={filters.startDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("endDate")}</label>
            <input
              type="date"
              name="endDate"
              defaultValue={filters.endDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("location")}</label>
            <select
              name="location"
              defaultValue={filters.location}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={t("allLocations")}>{t("allLocations")}</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("apply")}
            </button>
          </div>
        </form>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t("transactions")}</h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">{t("transactionHistorySectionDesc")}</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 p-4 sm:p-6">
            {filteredActivities.map((activity) => (
              <div
                key={activity._id}
                className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(activity.date)}
                    </span>
                    <span className="flex items-center text-xs sm:text-sm">
                      <MapPin className="w-4 h-4 text-gray-600 mr-1" />
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                        {activity.location}
                      </span>
                    </span>
                    {activity.vendorEmail && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                        {activity.vendorEmail}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {activity.items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-100 rounded-lg p-3 flex flex-col gap-1 shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-gray-900 truncate">{item.productName}</h4>
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                            {t("qty")}: {item.quantity}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-600">
                          <span>{t("unitPrice")}: ₹{item.price}</span>
                          <span>{t("total")}: <span className="font-semibold text-gray-900">₹{item.total}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between min-w-[120px]">
                  <span className="text-lg sm:text-2xl font-bold text-blue-700">₹{activity.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredActivities.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t("noTransactionsFound")}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorTransactionHistory
