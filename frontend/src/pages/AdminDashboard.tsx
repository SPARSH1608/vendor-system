import Navbar from "../components/Layout/Navbar"
import { Users, ShoppingCart, TrendingUp, Clock } from "lucide-react"

const AdminDashboard = () => {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      change: "+12% from last month",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Vendors",
      value: "89",
      change: "+5% from last month",
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Products",
      value: "456",
      change: "+8% from last month",
      icon: ShoppingCart,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Monthly Revenue",
      value: "₹2,34,567",
      change: "+15% from last month",
      icon: TrendingUp,
      color: "bg-orange-100 text-orange-600",
    },
  ]

  const recentActivities = [
    {
      type: "New vendor registered",
      user: "vendor@example.com",
      time: "2 minutes ago",
      color: "bg-blue-500",
    },
    {
      type: "Product added",
      user: "admin@example.com",
      time: "15 minutes ago",
      color: "bg-green-500",
    },
    {
      type: "Invoice generated",
      user: "vendor2@example.com",
      time: "1 hour ago",
      color: "bg-purple-500",
    },
    {
      type: "User role updated",
      user: "user@example.com",
      time: "2 hours ago",
      color: "bg-orange-500",
    },
    {
      type: "Product status changed",
      user: "admin@example.com",
      time: "3 hours ago",
      color: "bg-red-500",
    },
  ]

  const topVendors = [
    {
      rank: "#1",
      name: "Vendor A",
      email: "vendora@example.com",
      revenue: "₹45,230",
      transactions: "127 transactions",
    },
    {
      rank: "#2",
      name: "Vendor B",
      email: "vendorb@example.com",
      revenue: "₹38,750",
      transactions: "98 transactions",
    },
    {
      rank: "#3",
      name: "Vendor C",
      email: "vendorc@example.com",
      revenue: "₹32,100",
      transactions: "86 transactions",
    },
    {
      rank: "#4",
      name: "Vendor D",
      email: "vendord@example.com",
      revenue: "₹28,900",
      transactions: "74 transactions",
    },
  ]

  return (
    <div>
      {/* <Navbar /> */}
      <div className="space-y-8 mt-16 px-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your vendor management system.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-6">
              <Clock className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
            </div>
            <p className="text-gray-600 text-sm mb-6">Latest system activities and updates</p>

            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full ${activity.color} mt-2`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                    <p className="text-sm text-gray-600">by {activity.user}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Vendors */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Top Performing Vendors</h2>
            </div>
            <p className="text-gray-600 text-sm mb-6">Vendors with highest revenue this month</p>

            <div className="space-y-4">
              {topVendors.map((vendor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">{vendor.rank}</span>
                    <div>
                      <p className="font-medium text-gray-900">{vendor.name}</p>
                      <p className="text-sm text-gray-600">{vendor.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{vendor.revenue}</p>
                    <p className="text-sm text-gray-600">{vendor.transactions}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
