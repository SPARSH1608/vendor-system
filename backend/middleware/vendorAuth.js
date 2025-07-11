const vendorAuth = (req, res, next) => {
  console.log("Admin auth middleware called", req.user)
  if (req.user.role !== "vendor") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Vendor role required.",
    })
  }
  next()
}

module.exports = vendorAuth
