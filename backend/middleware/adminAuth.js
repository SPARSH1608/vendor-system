const adminAuth = (req, res, next) => {
  console.log("Admin auth middleware called", req.user.role)
  if (req.user.role !== "admin" || req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    })
  }
  next()
}

module.exports = adminAuth
