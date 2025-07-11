const mongoose = require("mongoose")

const vendorProductSchema = new mongoose.Schema(
  {
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vendor ID is required"],
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stock_quantity: {
      type: Number,
      default: 0,
      min: [0, "Stock quantity cannot be negative"],
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to prevent duplicate vendor-product combinations
vendorProductSchema.index({ vendor_id: 1, product_id: 1 }, { unique: true })

module.exports = mongoose.model("VendorProduct", vendorProductSchema)
