import React, { useState, useEffect } from 'react'
import { usersAPI } from '../services/api'
import { useSelector } from 'react-redux'
import { Search, Shield, UserCheck, UserX, Trash2, Users, UserCog } from 'lucide-react'

interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: 'user' | 'vendor' | 'admin' | 'super_admin'
  status: 'active' | 'inactive' | 'suspended'
  isActive: boolean
  createdAt: string
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  vendors: number
  admins: number
  regularUsers: number
  recentUsers: number
}

const SuperAdminUserManagement = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]) // Store all users
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  // Get current user's role from Redux store
  const { user: currentUser } = useSelector((state: any) => state.auth)
  const isSuperAdmin = currentUser?.role === 'super_admin'

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // Fetch all users without filters - let frontend handle filtering
      const response = await usersAPI.getUsers({})
      setAllUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await usersAPI.getUserStats()
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        await usersAPI.updateUserRole(userId, { role: newRole }); // Correct API call
        await fetchUsers();
        await fetchStats();
      } catch (error: any) {
        console.error('Error updating role:', error)
        alert('Failed to update user role: ' + (error.response?.data?.message || 'Unknown error'))
      }
    }
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this user?`)) {
      try {
        await usersAPI.updateUserStatus(userId, newStatus); // Correct API call
        await fetchUsers();
        await fetchStats();
      } catch (error: any) {
        console.error('Error updating status:', error);
        alert('Failed to update user status: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  }

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (window.confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      try {
        await usersAPI.deleteUser(userId)
        await fetchUsers()
        await fetchStats()
      } catch (error: any) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user: ' + (error.response?.data?.message || 'Unknown error'))
      }
    }
  }

  // Function to get available roles based on current user's role
  const getAvailableRoles = () => {
    if (isSuperAdmin) {
      return [
        { value: "user", label: "User" },
        { value: "vendor", label: "Vendor" },
        { value: "admin", label: "Admin" }
      ]
    } else {
      return [
        { value: "user", label: "User" },
        { value: "vendor", label: "Vendor" }
      ]
    }
  }

  // Function to check if current user can edit this user's role
  const canEditUserRole = (userToEdit: User) => {
    // Can't edit super admin
    if (userToEdit.role === 'super_admin') return false
    
    // Super admin can edit anyone (except super admin)
    if (isSuperAdmin) return true
    
    // Regular admin can only edit users and vendors, not other admins
    if (currentUser?.role === 'admin' && userToEdit.role === 'admin') return false
    
    return true
  }

  const getRoleColor = (role: string) => {
    const colors = {
      super_admin: "bg-purple-100 text-purple-600",
      admin: "bg-red-100 text-red-600",
      vendor: "bg-blue-100 text-blue-600",
      user: "bg-gray-100 text-gray-600",
    }
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-600"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-600",
      inactive: "bg-red-100 text-red-600",
      suspended: "bg-yellow-100 text-yellow-600",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-600"
  }

  // Apply frontend filters
  const filteredUsers = allUsers.filter(user => {
    // Search filter
    const matchesSearch = search === "" || 
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search)

    // Role filter
    const matchesRole = selectedRole === "all" || user.role === selectedRole

    // Status filter
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  // Clear all filters
  const clearFilters = () => {
    setSearch("")
    setSelectedRole("all")
    setSelectedStatus("all")
  }

  // Check if any filter is active
  const hasActiveFilters = search !== "" || selectedRole !== "all" || selectedStatus !== "all"

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
              </h1>
            </div>
            <button
              onClick={() => {
                // Add logout logic here
                localStorage.removeItem('authToken'); // Example: Clear auth token
                window.location.href = '/login'; // Redirect to login page
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            {isSuperAdmin
              ? 'Manage all users, roles, and system access'
              : 'Manage users and vendors'}
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vendors</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.vendors}</p>
                </div>
                <UserCog className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
                </div>
                <Shield className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="vendor">Vendors</option>
              <option value="admin">Admins</option>
              {isSuperAdmin && <option value="super_admin">Super Admins</option>}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
              <h2 className="text-xl font-semibold text-gray-900">
                User Management
              </h2>
              <div className="text-sm text-gray-500">
                Showing {filteredUsers.length} of {allUsers.length} users
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!canEditUserRole(user) ? (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                              user.role
                            )}`}
                          >
                            {user.role.replace('_', ' ')}
                          </span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1 rounded-full border-none ${getRoleColor(
                              user.role
                            )}`}
                          >
                            {getAvailableRoles().map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {user.role !== 'super_admin' && isSuperAdmin && (
                            <>
                              {user.isActive ? (
                                <button
                                  onClick={() => handleStatusChange(user._id, false)}
                                  className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors"
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStatusChange(user._id, true)}
                                  className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors"
                                >
                                  Activate
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {hasActiveFilters ? 'No users match your filters.' : 'No users found.'}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Clear filters to see all users
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SuperAdminUserManagement