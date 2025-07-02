const express = require("express")
const { body } = require("express-validator")
const {
  generateInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  downloadInvoicePDF,
  getInvoiceStats,
} = require("../controllers/invoiceController")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")

const router = express.Router()

// Validation rules
const invoiceValidation = [
  body("startDate").isISO8601().withMessage("Please provide a valid start date"),
  body("endDate").isISO8601().withMessage("Please provide a valid end date"),
  body("type").optional().isIn(["single", "multiple", "all"]).withMessage("Type must be single, multiple, or all"),
  body("vendorId").optional().isMongoId().withMessage("Please provide a valid vendor ID"),
]

const statusValidation = [
  body("status").isIn(["draft", "sent", "paid", "overdue"]).withMessage("Status must be draft, sent, paid, or overdue"),
]

// Routes
router.get("/", auth, adminAuth, getInvoices)
router.get("/stats", auth, adminAuth, getInvoiceStats)
router.get("/:id", auth, getInvoiceById)
router.get("/:id/pdf", auth, downloadInvoicePDF)
router.post("/generate", auth, adminAuth, invoiceValidation, generateInvoice)
router.put("/:id/status", auth, adminAuth, statusValidation, updateInvoiceStatus)

module.exports = router
