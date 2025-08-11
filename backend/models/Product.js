const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Dry Fruits",
          "Masala",
          "Uncultivated",
          "Pulses",
          "Aruvedic",
          "Ghee",
          "Mukhvas",
          "Vegetable",
          "Fruits",
          "Flour",
          "Jaggery",
          "Others",
          "Millets",
          "Grains",
          "Juice",
          "Healthy Diets",
          "Sugar",
          "Honey",
        ],
        message: "Please select a valid category",
      },
    },
    stock_unit: {
      type: String,
      required: [true, "Stock unit is required"],
      enum: {
        values: ["kg", "litre", "piece", "gram"],
        message: "Please select a valid stock unit",
      },
    },
    image: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
productSchema.index({ category: 1, isActive: 1 })
productSchema.index({ created_by: 1 })
productSchema.index({ name: "text", description: "text" })

module.exports = mongoose.model("Product", productSchema)
