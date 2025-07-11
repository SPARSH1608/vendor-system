const mongoose = require("mongoose")

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      unique: true,
      required: true,
    },
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vendor ID is required"],
    },
    customer: {
      name: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Customer email is required"],
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: [true, "Customer phone is required"],
        trim: true,
      },
    },
    items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [0.1, "Quantity must be greater than 0"],
        },
        price: {
          type: Number,
          required: [true, "Price is required"],
          min: [0, "Price cannot be negative"],
        },
        total: {
          type: Number,
          required: true,
        },
        stock_unit: {
          type: String,
          required: true,
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
      default: 0,
      min: 0,
      max: 100,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "unpaid", "paid"],
      default: "draft",
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Generate bill number before saving
billSchema.pre("save", async function (next) {
  if (!this.billNumber) {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, "0")
    const count = await this.constructor.countDocuments({
      vendor_id: this.vendor_id,
      createdAt: {
        $gte: new Date(year, new Date().getMonth(), 1),
        $lt: new Date(year, new Date().getMonth() + 1, 1),
      },
    })
    this.billNumber = `BILL-${year}${month}-${String(count + 1).padStart(4, "0")}`
  }

  // Calculate totals
  this.subtotal = this.items.reduce((sum, item) => {
    item.total = item.quantity * item.price
    return sum + item.total
  }, 0)
  this.tax = (this.subtotal * this.taxRate) / 100
  this.totalAmount = this.subtotal + this.tax

  next()
})

// Index for better query performance
billSchema.index({ vendor_id: 1, createdAt: -1 })
billSchema.index({ billNumber: 1 })
billSchema.index({ status: 1 })
billSchema.index({ "customer.email": 1 })

module.exports = mongoose.model("Bill", billSchema)
