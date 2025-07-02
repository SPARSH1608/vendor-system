const vendorAuth = (req, res, next) => {
  if (req.user.role !== "vendor") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Vendor role required.",
    })
  }
  next()
}

module.exports = vendorAuth
