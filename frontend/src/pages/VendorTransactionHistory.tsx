"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Package, TrendingUp, X } from "lucide-react"
import { vendorsAPI } from "../services/api"

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
}

const VendorTransactionHistory = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    location: "All Locations",
  })

  const locations = ["All Locations", "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata"]

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true)
      try {
        const params: any = {}
        if (filters.startDate) params.startDate = filters.startDate
        if (filters.endDate) params.endDate = filters.endDate
        if (filters.location && filters.location !== "All Locations") params.location = filters.location

        const res = await vendorsAPI.getMyActivities(params)
        setActivities(res.data)
      } catch (err) {
        setActivities([])
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
    // eslint-disable-next-line
  }, [filters])

  const getStats = () => {
    const totalTransactions = activities.length
    const totalRevenue = activities.reduce((sum, a) => sum + a.totalAmount, 0)
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
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">View your complete transaction history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6">
        <div className="bg-white rounded-xl p-3 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Transactions</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mt-2">
            <Package className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.completedTransactions}</p>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mt-2">
            <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mt-2">
            <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={clearFilters}
            className="flex items-center text-sm text-gray-500 hover:text-red-600"
            disabled={
              !filters.startDate && !filters.endDate && filters.location === "All Locations"
            }
          >
            <X className="w-4 h-4 mr-1" />
            Clear Filters
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Transactions</h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Your transaction history with detailed information</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <div key={activity._id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(activity.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                        {activity.location}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">₹{activity.totalAmount}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activity.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <span className="font-semibold text-gray-900 mt-2 sm:mt-0">₹{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activities.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorTransactionHistory
