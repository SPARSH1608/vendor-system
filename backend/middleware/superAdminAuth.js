const jwt = require("jsonwebtoken")
const User = require("../models/User")

const superAdminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password")

    if (!user || user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super admin rights required."
      })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token."
    })
  }
}

module.exports = superAdminAuth