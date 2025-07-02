const mongoose = require("mongoose")

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Location name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Location name cannot exceed 100 characters"],
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Generate location code before saving
locationSchema.pre("save", function (next) {
  if (!this.code) {
    this.code = this.name.substring(0, 3).toUpperCase()
  }
  next()
})

module.exports = mongoose.model("Location", locationSchema)
