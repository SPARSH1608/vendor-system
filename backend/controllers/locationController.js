const Location = require("../models/Location")
const { validationResult } = require("express-validator")

// @desc    Get all locations
// @route   GET /api/locations
// @access  Private
const getLocations = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, search } = req.query

    // Build query
    const query = {}

    if (isActive !== undefined) {
      query.isActive = isActive === "true"
    }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { code: { $regex: search, $options: "i" } }]
    }

    const locations = await Location.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Location.countDocuments(query)

    res.json({
      success: true,
      data: locations,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get locations error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get location by ID
// @route   GET /api/locations/:id
// @access  Private
const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      })
    }

    res.json({
      success: true,
      data: location,
    })
  } catch (error) {
    console.error("Get location by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Create location
// @route   POST /api/locations
// @access  Private (Admin only)
const createLocation = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const location = await Location.create(req.body)

    res.status(201).json({
      success: true,
      message: "Location created successfully",
      data: location,
    })
  } catch (error) {
    console.error("Create location error:", error)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Location with this name or code already exists",
      })
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Update location
// @route   PUT /api/locations/:id
// @access  Private (Admin only)
const updateLocation = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const location = await Location.findById(req.params.id)
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      })
    }

    // Update location
    Object.assign(location, req.body)
    await location.save()

    res.json({
      success: true,
      message: "Location updated successfully",
      data: location,
    })
  } catch (error) {
    console.error("Update location error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Delete location
// @route   DELETE /api/locations/:id
// @access  Private (Admin only)
const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      })
    }

    await Location.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Location deleted successfully",
    })
  } catch (error) {
    console.error("Delete location error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Toggle location status
// @route   PUT /api/locations/:id/status
// @access  Private (Admin only)
const toggleLocationStatus = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      })
    }

    location.isActive = !location.isActive
    await location.save()

    res.json({
      success: true,
      message: `Location ${location.isActive ? "activated" : "deactivated"} successfully`,
      data: location,
    })
  } catch (error) {
    console.error("Toggle location status error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get location statistics
// @route   GET /api/locations/stats
// @access  Private (Admin only)
const getLocationStats = async (req, res) => {
  try {
    const totalLocations = await Location.countDocuments()
    const activeLocations = await Location.countDocuments({ isActive: true })

    res.json({
      success: true,
      data: {
        totalLocations,
        activeLocations,
        inactiveLocations: totalLocations - activeLocations,
      },
    })
  } catch (error) {
    console.error("Get location stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  toggleLocationStatus,
  getLocationStats,
}
