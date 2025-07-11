import { useEffect, useState } from "react"
import { Users, ShoppingCart, TrendingUp, Clock } from "lucide-react"
import { adminAPI } from "../services/api"

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const res = await adminAPI.getDashboardStats()
        setStats(res.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>
  }
  if (!stats) {
    return <div className="text-gray-500 text-center py-8">No data available.</div>
  }

  const statCards = [
    {
      title: "Total Vendors",
      value: stats.totalVendors,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Vendors",
      value: stats.activeVendors,
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Activities",
      value: stats.totalActivities,
      icon: ShoppingCart,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Monthly Revenue",
      value: `₹${stats.monthlyRevenue?.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-orange-100 text-orange-600",
    },
  ]

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Welcome back! Here's what's happening with your vendor management system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex items-center justify-between"
          >
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${stat.color}`}
            >
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4 sm:mb-6">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Activities</h2>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
            Latest system activities and updates
          </p>
          <div className="space-y-3 sm:space-y-4">
            {stats.recentActivities?.map((activity: any, index: number) => (
              <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">{activity.type}</p>
                  <p className="text-xs sm:text-sm text-gray-600">by {activity.user}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Vendors */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4 sm:mb-6">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Top Performing Vendors</h2>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
            Vendors with highest revenue this month
          </p>
          <div className="space-y-3 sm:space-y-4">
            {stats.topVendors?.map((vendor: any, index: number) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-0">
                  <span className="text-xs sm:text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">{`#${index + 1}`}</span>
                  <div>
                    <p className="font-medium text-xs sm:text-sm text-gray-900">{vendor.vendorEmail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-xs sm:text-sm text-gray-900">
                    ₹{vendor.totalRevenue?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">{vendor.totalActivities} transactions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
