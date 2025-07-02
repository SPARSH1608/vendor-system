const express = require("express")
const { body } = require("express-validator")
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProductStats,
  upload, // Import multer upload middleware
} = require("../controllers/productController")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")

const router = express.Router()

// Validation rules
const productValidation = [
  body("name").trim().isLength({ min: 1, max: 100 }).withMessage("Product name must be between 1 and 100 characters"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("category")
    .isIn(["vegetables", "fruits", "dairy", "masala", "dry fruits", "pulses"])
    .withMessage("Please select a valid category"),
  body("stock_unit").isIn(["kg", "litre", "piece", "gram"]).withMessage("Please select a valid stock unit"),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("image")
    .optional()
  
]

// Routes
router.get("/", getProducts)
router.get("/stats", auth, adminAuth, getProductStats)
router.get("/:id", getProductById)
router.post("/", auth, adminAuth, upload.single("image"), productValidation, createProduct) // Add upload middleware
router.put("/:id", auth, adminAuth, upload.single("image"), productValidation, updateProduct) // Add upload middleware
router.put("/:id/status", auth, adminAuth, toggleProductStatus)
router.delete("/:id", auth, adminAuth, deleteProduct)

module.exports = router
