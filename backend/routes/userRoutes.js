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
  body("role").isIn(["admin", "vendor", "user","super_admin"]).withMessage("Role must be admin, vendor, or user"),
]

// Routes
router.get("/", auth, getUsers)
router.get("/stats", auth, getUserStats)
router.get("/:id", auth, getUserById)
router.put("/:id/role", auth, roleValidation, updateUserRole)
router.put("/:id/status", auth, toggleUserStatus)
router.delete("/:id", auth, deleteUser)

module.exports = router
