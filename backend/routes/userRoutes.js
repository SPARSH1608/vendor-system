const express = require("express")
const { body } = require("express-validator")
const {
  getUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getUserStats,
} = require("../controllers/userController")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")

const router = express.Router()

// Validation rules
const roleValidation = [
  body("role").isIn(["admin", "vendor", "user"]).withMessage("Role must be admin, vendor, or user"),
]

// Routes
router.get("/", auth, adminAuth, getUsers)
router.get("/stats", auth, adminAuth, getUserStats)
router.get("/:id", auth, adminAuth, getUserById)
router.put("/:id/role", auth, adminAuth, roleValidation, updateUserRole)
router.put("/:id/status", auth, adminAuth, toggleUserStatus)
router.delete("/:id", auth, adminAuth, deleteUser)

module.exports = router
