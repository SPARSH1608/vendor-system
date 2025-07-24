const User = require("../models/User")
const { validationResult } = require("express-validator")

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive, search } = req.query

    // Build query
    const query = {}

    if (role && role !== "all") {
      query.role = role
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true"
    }

    if (search) {
      query.$or = [{ email: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }]
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      data: users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("product_ids", "name category price")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Get user by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin or Super Admin)
const updateUserRole = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { role } = req.body
    const userId = req.params.id

    // Define allowed roles based on user's role
    let allowedRoles = []
    if (req.user.role === "super_admin") {
      allowedRoles = ["user", "vendor", "admin"]
    } else if (req.user.role === "admin") {
      allowedRoles = ["user", "vendor"]
    } else {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to change user roles",
      })
    }

    // Validate role based on user's permissions
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `You can only assign roles: ${allowedRoles.join(", ")}`,
      })
    }

    // Prevent changing super admin role
    if (role === "super_admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign super admin role",
      })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Prevent changing super admin's role
    if (user.role === "super_admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot change super admin role",
      })
    }

    // Regular admin cannot change admin role
    if (req.user.role === "admin" && user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "You cannot change admin user roles",
      })
    }

    user.role = role
    await user.save()

    res.json({
      success: true,
      message: "User role updated successfully",
      data: user,
    })
  } catch (error) {
    console.error("Update user role error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Update user status
// @route   PUT /api/users/:id/status
// @access  Private (Super Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body
    const userId = req.params.id

    // Only super admin can change status
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can change user status",
      })
    }

    // Validate status
    if (!["active", "inactive", "suspended"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Prevent changing super admin's status
    if (user.role === "super_admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot change super admin status",
      })
    }

    user.status = status
    await user.save()

    res.json({
      success: true,
      message: "User status updated successfully",
      data: user,
    })
  } catch (error) {
    console.error("Update user status error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Delete user (Enhanced for super admin)
// @route   DELETE /api/users/:id
// @access  Private (Super Admin only)
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id

    // Only super admin can delete users
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can delete users",
      })
    }

    // Prevent super admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Prevent deleting super admin
    if (user.role === "super_admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete super admin account",
      })
    }

    await User.findByIdAndDelete(userId)

    res.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin only)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const vendors = await User.countDocuments({ role: "vendor" })
    const admins = await User.countDocuments({ role: "admin" })

    // Get user registration trend (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    })

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        vendors,
        admins,
        regularUsers: totalUsers - vendors - admins,
        recentUsers,
      },
    })
  } catch (error) {
    console.error("Get user stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Toggle user status (for regular admin)
// @route   PUT /api/users/:id/status
// @access  Private (Admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    user.isActive = !user.isActive
    await user.save()

    res.json({
      success: true,
      message: "User status updated successfully",
      data: user,
    })
  } catch (error) {
    console.error("Toggle user status error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  toggleUserStatus,
  deleteUser,
  getUserStats,
}
