const express = require("express")
const { body } = require("express-validator")
const {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  toggleLocationStatus,
  getLocationStats,
} = require("../controllers/locationController")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")

const router = express.Router()

// Validation rules
const locationValidation = [
  body("name").trim().isLength({ min: 1, max: 100 }).withMessage("Location name must be between 1 and 100 characters"),
  body("code")
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage("Location code must be between 2 and 10 characters"),
  body("coordinates.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("coordinates.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
]

// Routes
router.get("/", auth, getLocations)
router.get("/stats", auth, adminAuth, getLocationStats)
router.get("/:id", auth, getLocationById)
router.post("/", auth, adminAuth, locationValidation, createLocation)
router.put("/:id", auth, adminAuth, locationValidation, updateLocation)
router.put("/:id/status", auth, adminAuth, toggleLocationStatus)
router.delete("/:id", auth, adminAuth, deleteLocation)

module.exports = router
