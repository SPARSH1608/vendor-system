"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Package, TrendingUp } from 'lucide-react'

interface Transaction {
  _id: string
  date: string
  location: string
  items: Array<{
    productName: string
    quantity: number
    price: number
    total: number
  }>
  totalAmount: number
  status: string
}

const VendorTransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    location: "All Locations"
  })

  const locations = ["All Locations", "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata"]

  // Mock data for demonstration
  const mockTransactions: Transaction[] = [
    {
      _id: "1",
      date: "2024-01-15",
      location: "Delhi",
      items: [
        { productName: "Basmati Rice", quantity: 50, price: 120, total: 6000 },
        { productName: "Wheat", quantity: 30, price: 35, total: 1050 }
      ],
      totalAmount: 7050,
      status: "completed"
    },
    {
      _id: "2",
      date: "2024-01-14",
      location: "Delhi",
      items: [
        { productName: "Organic Tomatoes", quantity: 25, price: 80, total: 2000 },
        { productName: "Red Apples", quantity: 15, price: 150, total: 2250 }
      ],
      totalAmount: 4250,
      status: "completed"
    },
    {
      _id: "3",
      date: "2024-01-13",
      location: "Mumbai",
      items: [
        { productName: "Fresh Milk", quantity: 20, price: 60, total: 1200 },
        { productName: "Onions", quantity: 35, price: 60, total: 2100 }
      ],
      totalAmount: 3300,
      status: "completed"
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTransactions(mockTransactions)
      setLoading(false)
    }, 1000)
  }, [])

  const getStats = () => {
    const totalTransactions = transactions.length
    const completedTransactions = transactions.filter(t => t.status === "completed").length
    const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0)
    
    return {
      totalTransactions,
      completedTransactions,
      totalRevenue
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    const startDate = filters.startDate ? new Date(filters.startDate) : null
    const endDate = filters.endDate ? new Date(filters.endDate) : null
    
    const dateMatch = (!startDate || transactionDate >= startDate) && 
                     (!endDate || transactionDate <= endDate)
    const locationMatch = filters.location === "All Locations" || 
                         transaction.location === filters.location
    
    return dateMatch && locationMatch
  })

  const stats = getStats()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-1">View your complete transaction history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
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
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
          <p className="text-gray-600 text-sm mt-1">Your transaction history with detailed information</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTransactions.map((transaction) => (
              <div key={transaction._id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                        {transaction.location}
                      </span>
                    </div>
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                      {transaction.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">₹{transaction.totalAmount}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transaction.items.map((item, index) => (
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

        {filteredTransactions.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorTransactionHistory
