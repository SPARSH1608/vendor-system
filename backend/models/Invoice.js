const mongoose = require("mongoose")

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.type === "single"
      },
    },
    type: {
      type: String,
      enum: ["single", "multiple", "all"],
      default: "single",
    },
    dateRange: {
      start: {
        type: Date,
        required: [true, "Start date is required"],
      },
      end: {
        type: Date,
        required: [true, "End date is required"],
      },
    },
    items: [
      {
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        total: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 10, // 10% tax
      min: 0,
      max: 100,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    qrCode: {
      type: String,
      default: null,
    },
    pdfPath: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue"],
      default: "draft",
    },
    generated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Generate invoice number before saving
invoiceSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const today = new Date()
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, "")
    // Use two separate objects for start and end of day
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)
    const count = await mongoose.model("Invoice").countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
    this.invoiceNumber = `INV-${datePart}-${String(count + 1).padStart(4, "0")}`
  }

  // Calculate totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0)
  this.tax = (this.subtotal * this.taxRate) / 100
  this.totalAmount = this.subtotal + this.tax

  next()
})

// Index for better query performance
invoiceSchema.index({ vendor_id: 1, createdAt: -1 })
invoiceSchema.index({ invoiceNumber: 1 })
invoiceSchema.index({ status: 1 })
invoiceSchema.index({ "dateRange.start": 1, "dateRange.end": 1 })

module.exports = mongoose.model("Invoice", invoiceSchema)
