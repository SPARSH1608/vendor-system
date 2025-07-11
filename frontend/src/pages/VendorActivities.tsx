"use client"

import { useEffect, useState } from "react"
import { Calendar, MapPin, Activity as ActivityIcon } from "lucide-react"
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
  vendor_id: string
  vendorEmail: string
  date: string
  location: string
  items: ActivityItem[]
  totalAmount: number
}

const VendorActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVendor, setSelectedVendor] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [vendors, setVendors] = useState<{ id: string; email: string }[]>([])

  // Fetch vendor list for filter dropdown (optional, if you want dynamic vendor list)
  useEffect(() => {
    if (activities.length > 0) {
      const uniqueVendors = Array.from(
        new Map(
          activities.map((a) => [a.vendor_id, { id: a.vendor_id, email: a.vendorEmail }])
        ).values()
      )
      setVendors(uniqueVendors)
    }
  }, [activities])

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true)
      try {
        const params: any = {}
        if (selectedVendor) params.vendor = selectedVendor
        if (selectedDate) params.date = selectedDate
        const res = await vendorsAPI.getVendorActivities(params)
        setActivities(res.data)
      } catch (err) {
        setActivities([])
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
  }, [selectedVendor, selectedDate])

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Vendor Activities</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Track vendor daily activities and transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.email}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <ActivityIcon className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Vendor Activities</h2>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Daily activities and transactions by vendors</p>
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
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {activity.vendorEmail?.charAt(0).toUpperCase() || "V"}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 break-all">{activity.vendorEmail}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{activity.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">{activity.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mt-2 sm:mt-0">
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
            {activities.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No activities found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorActivities
