const Product = require("../models/Product")
const { validationResult } = require("express-validator")

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, isActive, search, sortBy = "createdAt", sortOrder = "desc" } = req.query

    // Build query
    const query = {}

    if (category && category !== "all") {
      query.category = category
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true"
    }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const products = await Product.find(query)
      .populate("created_by", "email")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Product.countDocuments(query)

    res.json({
      success: true,
      data: products,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get products error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("created_by", "email")

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("Get product by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin only)
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const productData = {
      ...req.body,
      created_by: req.user.userId,
    }

    // Handle image upload or URL
    if (req.file) {
      productData.image = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` // Full URL for uploaded image
    } else if (req.body.image) {
      productData.image = req.body.image // Use image URL
    }

    const product = await Product.create(productData)
    await product.populate("created_by", "email")

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    })
  } catch (error) {
    console.error("Create product error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    // Handle image upload or URL
    if (req.file) {
      product.image = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    } else if (req.body.image) {
      product.image = req.body.image
    }

    // Update other fields
    product.name = req.body.name || product.name
    product.description = req.body.description || product.description
    product.price = req.body.price || product.price
    product.category = req.body.category || product.category
    product.stock_unit = req.body.stock_unit || product.stock_unit

    // FIX: update isActive correctly (allow false)
    if (typeof req.body.isActive !== "undefined") {
      product.isActive = req.body.isActive
    }

    await product.save()

    res.json({ success: true, message: "Product updated successfully", data: product })
  } catch (error) {
    console.error("Update product error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    await Product.findByIdAndDelete(req.params.id)

    res.json({ success: true, message: "Product deleted successfully" })
  } catch (error) {
    console.error("Delete product error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

// @desc    Toggle product status
// @route   PUT /api/products/:id/status
// @access  Private (Admin only)
const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    product.isActive = !product.isActive
    await product.save()

    res.json({ success: true, message: `Product ${product.isActive ? "activated" : "deactivated"} successfully`, data: product })
  } catch (error) {
    console.error("Toggle product status error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Private (Admin only)
const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments()
    const activeProducts = await Product.countDocuments({ isActive: true })

    // Get products by category
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
        },
      },
    ])

    // Get recent products (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentProducts = await Product.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    })

    res.json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        inactiveProducts: totalProducts - activeProducts,
        productsByCategory,
        recentProducts,
      },
    })
  } catch (error) {
    console.error("Get product stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProductStats,
}
