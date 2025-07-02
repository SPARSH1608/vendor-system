"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Search, UserCheck, UserX, Shield } from "lucide-react"
import { fetchUsers, updateUserRole } from "../store/slices/userSlice"
import type { AppDispatch, RootState } from "../store/store"

const UserManagement = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { users, loading, pagination } = useSelector((state: RootState) => state.users)

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage }))
  }, [dispatch, currentPage])

  const handleRoleChange = (userId: string, newRole: string) => {
    dispatch(updateUserRole({ userId, role: newRole }))
  }

  const getRoleColor = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-600",
      vendor: "bg-blue-100 text-blue-600",
      user: "bg-gray-100 text-gray-600",
    }
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-600"
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
  }

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const current = pagination?.current || 1
  const pages = pagination?.pages || 1
  const total = pagination?.total || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">All Users ({total})</h2>
          </div>
          <p className="text-gray-600 text-sm mt-1">View and manage all registered users</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          user.isActive
                        )}`}
                      >
                        {user.isActive ? "active" : "inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {user.role === "user" && (
                        <button
                          onClick={() => handleRoleChange(user._id, "vendor")}
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-900"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Make Vendor</span>
                        </button>
                      )}
                      {user.role === "vendor" && (
                        <button
                          onClick={() => handleRoleChange(user._id, "user")}
                          className="inline-flex items-center space-x-1 text-orange-600 hover:text-orange-900"
                        >
                          <UserX className="w-4 h-4" />
                          <span>Remove Vendor</span>
                        </button>
                      )}
                      <button
                        className={`px-3 py-1 text-xs rounded ${
                          user.isActive
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-green-100 text-green-600 hover:bg-green-200"
                        }`}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center space-x-2 mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {current} of {pages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pages))}
          disabled={currentPage === pages}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default UserManagement
