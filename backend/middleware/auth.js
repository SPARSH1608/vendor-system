const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    console.log("Auth middleware called", req.header("Authorization"))
    const token = req.header("Authorization")?.replace("Bearer ", "")
    console.log("Auth middleware token:", token)

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token, user not found",
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive, contact admin",
      })
    }

    if (user.role === "user") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Your role does not allow access to this resource.",
      })
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    }

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    })
  }
}

module.exports = auth
