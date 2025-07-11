const generateQR = require("../utils/generateQR")
const { validationResult } = require("express-validator")

// @desc    Generate QR code
// @route   POST /api/qr/generate
// @access  Private
const generateQRCode = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { data, size = 200 } = req.body

    const qrCode = await generateQR(data, { width: size, height: size })

    res.json({
      success: true,
      message: "QR code generated successfully",
      data: {
        qrCode,
        size,
      },
    })
  } catch (error) {
    console.error("Generate QR code error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Generate payment QR code
// @route   POST /api/qr/payment
// @access  Private
const generatePaymentQR = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { amount, vendorEmail, invoiceNumber, description } = req.body

    const paymentData = {
      type: "payment",
      amount,
      vendorEmail,
      invoiceNumber,
      description,
      timestamp: new Date().toISOString(),
    }

    const qrCode = await generateQR(JSON.stringify(paymentData))

    res.json({
      success: true,
      message: "Payment QR code generated successfully",
      data: {
        qrCode,
        paymentData,
      },
    })
  } catch (error) {
    console.error("Generate payment QR code error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  generateQRCode,
  generatePaymentQR,
}
