const express = require("express")
const { body } = require("express-validator")
const { generateQRCode, generatePaymentQR } = require("../controllers/qrController")
const auth = require("../middleware/auth")

const router = express.Router()

// Validation rules
const qrValidation = [
  body("data").notEmpty().withMessage("Data is required for QR code generation"),
  body("size").optional().isInt({ min: 100, max: 1000 }).withMessage("Size must be between 100 and 1000 pixels"),
]

const paymentQRValidation = [
  body("amount").isFloat({ min: 0.01 }).withMessage("Amount must be greater than 0"),
  body("vendorEmail").isEmail().withMessage("Please provide a valid vendor email"),
  body("invoiceNumber").notEmpty().withMessage("Invoice number is required"),
  body("description").optional().trim().isLength({ max: 200 }).withMessage("Description cannot exceed 200 characters"),
]

// Routes
router.post("/generate", auth, qrValidation, generateQRCode)
router.post("/payment", auth, paymentQRValidation, generatePaymentQR)

module.exports = router
