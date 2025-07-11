"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Package, FileText, TrendingUp, Plus, Eye, Settings } from "lucide-react"

interface DashboardStats {
  myProducts: number
  totalBills: number
  paidBills: number
  totalRevenue: number
}

interface Product {
  _id: string
  product_id: {
    name: string
    price: number
    stock_unit: string
  }
  stock_quantity: number
}

interface Bill {
  _id: string
  billNumber: string
  customer: {
    name: string
  }
  totalAmount: number
  status: string
  createdAt: string
}

const VendorDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    myProducts: 0,
    totalBills: 0,
    paidBills: 0,
    totalRevenue: 0,
  })
  const [myProducts, setMyProducts] = useState<Product[]>([])
  const [recentBills, setRecentBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      // Fetch stats
      const statsResponse = await fetch("/api/vendors/bills/stats", { headers })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats({
          myProducts: 0, // Will be updated after fetching products
          totalBills: statsData.data.totalBills,
          paidBills: statsData.data.paidBills,
          totalRevenue: statsData.data.totalRevenue,
        })
      }

      // Fetch vendor products
      const productsResponse = await fetch("/api/vendors/products", { headers })
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setMyProducts(productsData.data.slice(0, 3)) // Show only first 3
        setStats((prev) => ({ ...prev, myProducts: productsData.data.length }))
      }

      // Fetch recent bills
      const billsResponse = await fetch("/api/vendors/bills?limit=3", { headers })
      if (billsResponse.ok) {
        const billsData = await billsResponse.json()
        setRecentBills(billsData.data)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

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
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Welcome back! Manage your products and customer bills.
          </p>
        </div>
        <button
          onClick={() => navigate("/vendor/bills/create")}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Bill</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">My Products</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.myProducts}</p>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">Products I'm selling</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Bills</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalBills}</p>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">All customer bills</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Paid Bills</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.paidBills}</p>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">Completed transactions</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Revenue</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">Total earnings</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">My Products</h2>
              </div>
              <button
                onClick={() => navigate("/vendor/products")}
                className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
              >
                Manage Products
              </button>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">Products you've selected to sell</p>
          </div>

          <div className="p-4 sm:p-6 flex-1">
            {myProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No products selected yet</p>
                <button
                  onClick={() => navigate("/vendor/products")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Select Products →
                </button>
              </div>
            ) : (
              // Responsive product cards grid
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
                {myProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-gray-50 rounded-lg p-3 flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-2 shadow-sm"
                  >
                    <img
                      src={product.product_id?.image || "/placeholder-product.png"}
                      alt={product.product_id.name}
                      className="h-16 w-16 object-cover rounded-md border border-gray-200 bg-white mb-2 sm:mb-0"
                      loading="lazy"
                      onError={e => { e.currentTarget.src = "/placeholder-product.png" }}
                    />
                    <div className="flex-1 w-full sm:ml-3 text-center sm:text-left">
                      <h4 className="font-medium text-gray-900">{product.product_id.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        ₹{product.product_id.price} per {product.product_id.stock_unit} • Stock: {product.stock_quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 mt-2 sm:mt-0">₹{product.product_id.price}</span>
                  </div>
                ))}
                {myProducts.length >= 3 && (
                  <button
                    onClick={() => navigate("/vendor/products")}
                    className="col-span-2 w-full text-center py-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All Products →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Bills */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Bills</h2>
              </div>
              <button
                onClick={() => navigate("/vendor/bills")}
                className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
              >
                View All Bills
              </button>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">Latest customer bills</p>
          </div>

          <div className="p-4 sm:p-6 flex-1">
            {recentBills.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No bills created yet</p>
                <button
                  onClick={() => navigate("/vendor/bills/create")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create First Bill →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBills.map((bill) => (
                  <div key={bill._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{bill.customer.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {bill.billNumber} • {formatDate(bill.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(bill.status)}`}>{bill.status}</span>
                      <span className="font-semibold text-gray-900">₹{bill.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions - smaller icons and no scroll on mobile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <p className="text-gray-600 text-xs sm:text-sm mb-6">Commonly used vendor functions</p>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <button
            onClick={() => navigate("/vendor/products")}
            className="flex flex-col items-center p-2 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5 sm:w-7 sm:h-7 text-gray-600 mb-1 sm:mb-2" />
            <span className="font-medium text-gray-900 text-[11px] sm:text-sm">Manage Products</span>
          </button>
          <button
            onClick={() => navigate("/vendor/bills/create")}
            className="flex flex-col items-center p-2 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-5 h-5 sm:w-7 sm:h-7 text-gray-600 mb-1 sm:mb-2" />
            <span className="font-medium text-gray-900 text-[11px] sm:text-sm">Create Bill</span>
          </button>
          <button
            onClick={() => navigate("/vendor/bills")}
            className="flex flex-col items-center p-2 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-5 h-5 sm:w-7 sm:h-7 text-gray-600 mb-1 sm:mb-2" />
            <span className="font-medium text-gray-900 text-[11px] sm:text-sm">View Bills</span>
          </button>
          <button
            onClick={() => navigate("/vendor/history")}
            className="flex flex-col items-center p-2 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7 text-gray-600 mb-1 sm:mb-2" />
            <span className="font-medium text-gray-900 text-[11px] sm:text-sm">Transaction History</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default VendorDashboard
