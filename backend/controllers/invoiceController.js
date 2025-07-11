const Invoice = require("../models/Invoice")
const VendorActivity = require("../models/VendorActivity")
const User = require("../models/User")
const { validationResult } = require("express-validator")
const moment = require("moment")
const generatePDF = require("../utils/generatePDF")
const generateQR = require("../utils/generateQR")

// @desc    Generate invoice
// @route   POST /api/invoices/generate
// @access  Private (Admin only)
const generateInvoice = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { vendorId, startDate, endDate, type = "single" } = req.body

    // Build query for vendor activities
    const activityQuery = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }

    if (type === "single" && vendorId) {
      activityQuery.vendor_id = vendorId
    }

    // Get vendor activities
    const activities = await VendorActivity.find(activityQuery)
      .populate("vendor_id", "email phone")
      .populate("items.product_id", "name category")

    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No activities found for the specified criteria",
      })
    }

    // Group activities by vendor if generating for multiple vendors
    const vendorGroups = {}
    activities.forEach((activity) => {
      const vendorId = activity.vendor_id._id.toString()
      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = {
          vendor: activity.vendor_id,
          activities: [],
          totalAmount: 0,
        }
      }
      vendorGroups[vendorId].activities.push(activity)
      vendorGroups[vendorId].totalAmount += activity.totalAmount
    })

    const invoices = []

    // Generate invoice for each vendor
    for (const [vendorId, vendorData] of Object.entries(vendorGroups)) {
      // Aggregate items
      const itemsMap = {}
      vendorData.activities.forEach((activity) => {
        activity.items.forEach((item) => {
          const key = item.productName
          if (!itemsMap[key]) {
            itemsMap[key] = {
              productName: item.productName,
              quantity: 0,
              price: item.price,
              total: 0,
            }
          }
          itemsMap[key].quantity += item.quantity
          itemsMap[key].total += item.total
        })
      })

      const items = Object.values(itemsMap)
      const subtotal = items.reduce((sum, item) => sum + item.total, 0)
      const taxRate = 10 // 10% tax
      const tax = (subtotal * taxRate) / 100
      const totalAmount = subtotal + tax

      // Generate invoiceNumber manually
      const today = new Date()
      const datePart = today.toISOString().slice(0, 10).replace(/-/g, "")
      const startOfDay = new Date(today)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(today)
      endOfDay.setHours(23, 59, 59, 999)
      const count = await Invoice.countDocuments({
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      const invoiceNumber = `INV-${datePart}-${String(count + 1).padStart(4, "0")}`

      // Create invoice
      const invoiceData = {
        vendor_id: type === "single" ? vendorId : null,
        type,
        dateRange: {
          start: new Date(startDate),
          end: new Date(endDate),
        },
        items,
        subtotal,
        tax,
        taxRate,
        totalAmount,
        generated_by: req.user.userId,
        invoiceNumber, // <-- add here
      }

      const invoice = new Invoice(invoiceData)
      await invoice.save()
      await invoice.populate("vendor_id", "email phone")

      // Generate QR code for payment
      const qrData = {
        invoiceNumber: invoice.invoiceNumber,
        amount: totalAmount,
        vendorEmail: invoice.vendor_id?.email || "Multiple Vendors",
      }

      const qrCode = await generateQR(JSON.stringify(qrData))
      invoice.qrCode = qrCode
      await invoice.save()

      invoices.push({
        ...invoice.toObject(),
        vendorEmail: invoice.vendor_id?.email || "Multiple Vendors",
        location: vendorData.activities[0]?.location || "Multiple Locations",
      })
    }

    res.status(201).json({
      success: true,
      message: "Invoice(s) generated successfully",
      data: type === "single" ? invoices[0] : invoices,
    })
  } catch (error) {
    console.error("Generate invoice error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private (Admin only)
const getInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10, vendor_id, status, startDate, endDate } = req.query

    // Build query
    const query = {}

    if (vendor_id) {
      query.vendor_id = vendor_id
    }

    if (status) {
      query.status = status
    }

    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) {
        query.createdAt.$gte = new Date(startDate)
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate)
      }
    }

    const invoices = await Invoice.find(query)
      .populate("vendor_id", "email phone")
      .populate("generated_by", "email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Invoice.countDocuments(query)

    res.json({
      success: true,
      data: invoices,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get invoices error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("vendor_id", "email phone")
      .populate("generated_by", "email")

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      })
    }

    // Check if user has permission to view this invoice
    if (req.user.role === "vendor" && invoice.vendor_id._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this invoice",
      })
    }

    res.json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    console.error("Get invoice by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Update invoice status
// @route   PUT /api/invoices/:id/status
// @access  Private (Admin only)
const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body

    const invoice = await Invoice.findById(req.params.id)
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      })
    }

    invoice.status = status
    await invoice.save()
    await invoice.populate("vendor_id", "email phone")

    res.json({
      success: true,
      message: "Invoice status updated successfully",
      data: invoice,
    })
  } catch (error) {
    console.error("Update invoice status error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Download invoice PDF
// @route   GET /api/invoices/:id/pdf
// @access  Private
const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("vendor_id", "email phone")
      .populate("generated_by", "email")

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      })
    }

    // Check if user has permission to download this invoice
    if (req.user.role === "vendor" && invoice.vendor_id._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to download this invoice",
      })
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(invoice)

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      "Content-Length": pdfBuffer.length,
    })

    res.send(pdfBuffer)
  } catch (error) {
    console.error("Download invoice PDF error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get invoice statistics
// @route   GET /api/invoices/stats
// @access  Private (Admin only)
const getInvoiceStats = async (req, res) => {
  try {
    const totalInvoices = await Invoice.countDocuments()

    // Get invoices by status
    const invoicesByStatus = await Invoice.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ])

    // Get total revenue
    const totalRevenue = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ])

    // Get monthly revenue
    const monthlyRevenue = await Invoice.aggregate([
      {
        $match: {
          createdAt: {
            $gte: moment().startOf("month").toDate(),
            $lte: moment().endOf("month").toDate(),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ])

    res.json({
      success: true,
      data: {
        totalInvoices,
        invoicesByStatus,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
      },
    })
  } catch (error) {
    console.error("Get invoice stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  generateInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  downloadInvoicePDF,
  getInvoiceStats,
}
