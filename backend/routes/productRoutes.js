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
   getVendorsByProduct 
} = require("../controllers/productController")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")
const multer = require("multer")
const path = require("path")

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"))
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and JPG files are allowed"))
    }
    cb(null, true)
  },
})
// Validation rules
const productValidation = [
  body("name").trim().isLength({ min: 1, max: 100 }).withMessage("Product name must be between 1 and 100 characters"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("category")
    .isIn(["vegetables", "fruits", "dairy", "masala", "dry fruits", "pulses"])
    .withMessage("Please select a valid category"),
  body("stock_unit").isIn(["kg", "litre", "piece", "gram"]).withMessage("Please select a valid stock unit"),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
]
// Routes
router.get("/", getProducts)
router.get("/stats", auth, adminAuth, getProductStats)
router.get("/:id", getProductById)
router.post("/", auth, adminAuth, upload.single("image"), productValidation, createProduct)
router.put(
  "/:id",
  auth,
  adminAuth,
  upload.single("image"), // <-- add multer for file upload
  updateProduct
) // Update product
router.delete("/:id", auth, adminAuth, deleteProduct) // Delete product
router.put("/:id/status", auth, adminAuth, toggleProductStatus) // Toggle product status
router.get("/:id/vendors", getVendorsByProduct);
module.exports = router
