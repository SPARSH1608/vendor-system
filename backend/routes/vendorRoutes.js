const express = require("express")
const { body } = require("express-validator")
const {
  getVendorActivities,
  getMyActivities,
  createVendorActivity,
  updateVendorActivity,
  deleteVendorActivity,
  getVendorStats,
  getProductsByVendor,
  getProductsByVendors,
} = require("../controllers/vendorController")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")
const vendorAuth = require("../middleware/vendorAuth")

const router = express.Router()

// Validation rules
const activityValidation = [
  body("date").isISO8601().withMessage("Please provide a valid date"),
  body("location").trim().isLength({ min: 1, max: 100 }).withMessage("Location must be between 1 and 100 characters"),
  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
  body("items.*.product_id").isMongoId().withMessage("Please provide a valid product ID"),
  body("items.*.quantity").isFloat({ min: 0.1 }).withMessage("Quantity must be greater than 0"),
]

// Routes
router.get("/activities", auth, getVendorActivities)
router.get("/my-activities", auth, getMyActivities)
router.get("/stats", auth, getVendorStats)
router.post("/activities", auth, activityValidation, createVendorActivity)
router.put("/activities/:id", auth, activityValidation, updateVendorActivity)
router.delete("/activities/:id", auth, vendorAuth, deleteVendorActivity)
router.get("/:id/products", auth, getProductsByVendor)
router.post("/products-by-vendors", auth, getProductsByVendors)

module.exports = router
