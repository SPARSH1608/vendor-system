const express = require("express")
const { body } = require("express-validator")
const {
  getVendorBills,
  getAllBills,
  getBillById,
  createBill,
  updateBill,
  updateBillStatus,
  deleteBill,
  getBillStats,
} = require("../controllers/billController")
const auth = require("../middleware/auth")
const vendorAuth = require("../middleware/vendorAuth")
const adminAuth = require("../middleware/adminAuth")

const router = express.Router()

// Validation rules
const billValidation = [
  body("customer.name").trim().isLength({ min: 1 }).withMessage("Customer name is required"),
  body("customer.email").isEmail().withMessage("Please provide a valid customer email"),
  body("customer.phone").isMobilePhone().withMessage("Please provide a valid customer phone number"),
  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
  body("items.*.product_id").isMongoId().withMessage("Please provide valid product IDs"),
  body("items.*.quantity").isFloat({ min: 0.1 }).withMessage("Quantity must be greater than 0"),
  body("location").trim().isLength({ min: 1 }).withMessage("Location is required"),
  body("status").optional().isIn(["draft", "unpaid", "paid"]).withMessage("Invalid status"),
  body("taxRate").optional().isFloat({ min: 0, max: 100 }).withMessage("Tax rate must be between 0 and 100"),
]

const statusValidation = [
  body("status").isIn(["draft", "unpaid", "paid"]).withMessage("Status must be draft, unpaid, or paid"),
]

// Vendor routes
router.get("/vendors/bills", auth, vendorAuth, getVendorBills)
router.get("/vendors/bills/stats", auth, vendorAuth, getBillStats)
router.post("/vendors/bills", auth, vendorAuth, billValidation, createBill)
router.put("/vendors/bills/:id", auth, vendorAuth, billValidation, updateBill)
router.put("/vendors/bills/:id/status", auth, vendorAuth, statusValidation, updateBillStatus)
router.delete("/vendors/bills/:id", auth, vendorAuth, deleteBill)

// Admin routes
router.get("/bills", auth, getAllBills)

// Shared routes
router.get("/bills/:id", auth, getBillById)

module.exports = router
