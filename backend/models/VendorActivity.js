const mongoose = require("mongoose")

const vendorActivitySchema = new mongoose.Schema(
  {
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vendor ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
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
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  },
)

// Calculate total amount before saving
vendorActivitySchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce((sum, item) => {
    item.total = item.quantity * item.price
    return sum + item.total
  }, 0)
  next()
})

// Index for better query performance
vendorActivitySchema.index({ vendor_id: 1, date: -1 })
vendorActivitySchema.index({ date: -1 })
vendorActivitySchema.index({ location: 1 })

module.exports = mongoose.model("VendorActivity", vendorActivitySchema)
