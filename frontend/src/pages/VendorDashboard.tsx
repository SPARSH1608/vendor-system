"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Package, TrendingUp } from "lucide-react"
import { useTranslation } from "react-i18next"

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
    image?: string
  }
  stock_quantity: number
}

const VendorDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    myProducts: 0,
    totalBills: 0,
    paidBills: 0,
    totalRevenue: 0,
  })
  const [myProducts, setMyProducts] = useState<Product[]>([])
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
        setMyProducts(productsData.data)
        setStats((prev) => ({ ...prev, myProducts: productsData.data.length }))
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 px-0 sm:px-2 md:px-4 lg:px-8 w-full max-w-none mx-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("vendorDashboardTitle")}</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {t("vendorDashboardDesc")}
          </p>
        </div>
        <button
          onClick={() => navigate("/vendor/products")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 w-full md:w-auto justify-center"
        >
          <Package className="w-5 h-5" />
          <span>{t("manageProducts")}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center w-full">
          <p className="text-xs sm:text-sm font-medium text-gray-600">{t("myProducts")}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.myProducts}</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center w-full">
          <p className="text-xs sm:text-sm font-medium text-gray-600">{t("totalBills")}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalBills}</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center w-full">
          <p className="text-xs sm:text-sm font-medium text-gray-600">{t("paidBills")}</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.paidBills}</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center w-full">
          <p className="text-xs sm:text-sm font-medium text-gray-600">{t("revenue")}</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Selected Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col w-full">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t("selectedProducts")}</h2>
          </div>
          <button
            onClick={() => navigate("/vendor/products")}
            className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
          >
            {t("manageProducts")}
          </button>
        </div>
        <div className="p-4 sm:p-6 flex-1">
          {myProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">{t("noProductsSelected")}</p>
              <button
                onClick={() => navigate("/vendor/products")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t("selectProducts")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
              {myProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-gray-50 rounded-lg p-3 flex flex-col items-center gap-2 shadow-sm border border-gray-200"
                >
                  <img
                    src={product.product_id?.image || "/placeholder-product.png"}
                    alt={product.product_id.name}
                    className="h-16 w-16 object-cover rounded-md border border-gray-200 bg-white"
                    loading="lazy"
                    onError={e => { e.currentTarget.src = "/placeholder-product.png" }}
                  />
                  <div className="flex-1 w-full text-center">
                    <h4 className="font-medium text-gray-900 truncate">{product.product_id.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      ₹{product.product_id.price} {t("perUnit", { unit: product.product_id.stock_unit })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VendorDashboard
