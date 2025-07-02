const express = require("express")
const { body } = require("express-validator")
const { register, login, getMe, updatePassword } = require("../controllers/authController")
const auth = require("../middleware/auth")

const router = express.Router()

// Validation rules
const registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("phone").isMobilePhone().withMessage("Please provide a valid phone number"),
]

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
]

const passwordValidation = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
]

// Routes
router.post("/register", registerValidation, register)
router.post("/login", loginValidation, login)
router.get("/me", auth, getMe)
router.put("/password", auth, passwordValidation, updatePassword)

module.exports = router
