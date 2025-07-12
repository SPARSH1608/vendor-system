const express = require("express")
const { body } = require("express-validator")
const {
  getVendorProducts,
  getAvailableProducts,
  addVendorProduct,
  removeVendorProduct,
  updateVendorProduct,
} = require("../controllers/vendorProductController")
const auth = require("../middleware/auth")
const vendorAuth = require("../middleware/vendorAuth")
const VendorProduct = require("../models/VendorProduct")

const router = express.Router()

// Validation rules
const addProductValidation = [
  body("product_id").isMongoId().withMessage("Please provide a valid product ID"),
  body("stock_quantity").optional().isInt({ min: 0 }).withMessage("Stock quantity must be a non-negative integer"),
]

const updateProductValidation = [
  body("stock_quantity").isInt({ min: 0 }).withMessage("Stock quantity must be a non-negative integer"),
]

// Routes
router.get("/products", auth, vendorAuth, getVendorProducts)
router.get("/available-products", auth, vendorAuth, getAvailableProducts)
router.post("/products", auth, vendorAuth, addProductValidation, addVendorProduct)
router.put("/products/:productId", auth, vendorAuth, updateProductValidation, updateVendorProduct)
router.delete("/products/:productId", auth, vendorAuth, removeVendorProduct)

// POST /api/vendors/products-by-vendors
router.post("/products-by-vendors", async (req, res) => {
  try {
    const { vendorIds } = req.body
    if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({ success: false, message: "No vendorIds provided" })
    }
    const products = await VendorProduct.find({ vendor_id: { $in: vendorIds } })
      .populate("product_id")
      .populate("vendor_id", "email")
    res.json({ success: true, data: products })
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" })
  }
})

module.exports = router

