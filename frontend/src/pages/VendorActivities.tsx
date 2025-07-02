"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Calendar, MapPin, Activity } from "lucide-react"
import { fetchVendorActivities } from "../store/slices/vendorSlice"
import type { AppDispatch, RootState } from "../store/store"

const VendorActivities = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { activities, loading } = useSelector((state: RootState) => state.vendors)
  const [selectedDate, setSelectedDate] = useState("")

  useEffect(() => {
    dispatch(fetchVendorActivities())
  }, [dispatch])

  // Mock data for demonstration
  const mockActivities = [
    {
      _id: "1",
      vendor_id: "vendor1",
      vendorEmail: "vendor1@example.com",
      date: "2024-01-15",
      location: "Delhi",
      items: [
        { product_id: "1", productName: "Rice", quantity: 50, price: 40, total: 2000 },
        { product_id: "2", productName: "Wheat", quantity: 30, price: 35, total: 1050 },
      ],
      totalAmount: 3050,
    },
    {
      _id: "2",
      vendor_id: "vendor2",
      vendorEmail: "vendor2@example.com",
      date: "2024-01-15",
      location: "Mumbai",
      items: [
        { product_id: "3", productName: "Tomatoes", quantity: 25, price: 80, total: 2000 },
        { product_id: "4", productName: "Onions", quantity: 20, price: 60, total: 1200 },
      ],
      totalAmount: 3200,
    },
    {
      _id: "3",
      vendor_id: "vendor1",
      vendorEmail: "vendor1@example.com",
      date: "2024-01-14",
      location: "Delhi",
      items: [
        { product_id: "5", productName: "Milk", quantity: 15, price: 60, total: 900 },
        { product_id: "6", productName: "Apples", quantity: 10, price: 150, total: 1500 },
      ],
      totalAmount: 2400,
    },
  ]

  const displayActivities = activities.length > 0 ? activities : mockActivities

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vendor Activities</h1>
        <p className="text-gray-600 mt-1">Track vendor daily activities and transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">All Vendors</option>
              <option value="vendor1">vendor1@example.com</option>
              <option value="vendor2">vendor2@example.com</option>
            </select>
          </div>
          <div>
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
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Vendor Activities</h2>
          </div>
          <p className="text-gray-600 text-sm mt-1">Daily activities and transactions by vendors</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayActivities.map((activity) => (
              <div key={activity._id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {activity.vendorEmail.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{activity.vendorEmail}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">₹{activity.totalAmount}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activity.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.productName}</h4>
                          <p className="text-sm text-gray-600">
                            {item.quantity} kg × ₹{item.price}
                          </p>
                        </div>
                        <span className="font-semibold text-gray-900">₹{item.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorActivities
