const adminAuth = (req, res, next) => {
  console.log("Admin auth middleware called", req.user)
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    })
  }
  next()
}

module.exports = adminAuth
