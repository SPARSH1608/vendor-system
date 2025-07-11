const VendorProduct = require("../models/VendorProduct")
const Product = require("../models/Product")
const { validationResult } = require("express-validator")

// @desc    Get vendor's selected products
// @route   GET /api/vendors/products
// @access  Private (Vendor only)
const getVendorProducts = async (req, res) => {
  try {
    const vendorProducts = await VendorProduct.find({ vendor_id: req.user.userId })
      .populate("product_id", "name description price category stock_unit image isActive")
      .sort({ createdAt: -1 })

    // Filter out inactive products
    const activeVendorProducts = vendorProducts.filter((vp) => vp.product_id && vp.product_id.isActive)

    res.json({
      success: true,
      data: activeVendorProducts,
    })
  } catch (error) {
    console.error("Get vendor products error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get all available products for vendor selection
// @route   GET /api/vendors/available-products
// @access  Private (Vendor only)
const getAvailableProducts = async (req, res) => {
  try {
    const { search, category } = req.query

    // Build query for products
    const query = { isActive: true }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    if (category && category !== "all") {
      query.category = category
    }

    const products = await Product.find(query).sort({ name: 1 })

    // Get vendor's selected products
    const vendorProducts = await VendorProduct.find({ vendor_id: req.user.userId }).select("product_id")
    const selectedProductIds = vendorProducts.map((vp) => vp.product_id.toString())

    // Mark products as selected
    const productsWithSelection = products.map((product) => ({
      ...product.toObject(),
      isSelected: selectedProductIds.includes(product._id.toString()),
    }))

    res.json({
      success: true,
      data: productsWithSelection,
    })
  } catch (error) {
    console.error("Get available products error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Add product to vendor's selection
// @route   POST /api/vendors/products
// @access  Private (Vendor only)
const addVendorProduct = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { product_id, stock_quantity = 0 } = req.body

    // Check if product exists and is active
    const product = await Product.findById(product_id)
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found or inactive",
      })
    }

    // Check if already selected
    const existingVendorProduct = await VendorProduct.findOne({
      vendor_id: req.user.userId,
      product_id,
    })

    if (existingVendorProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already selected",
      })
    }

    const vendorProduct = await VendorProduct.create({
      vendor_id: req.user.userId,
      product_id,
      stock_quantity,
    })

    await vendorProduct.populate("product_id", "name description price category stock_unit image")

    res.status(201).json({
      success: true,
      message: "Product added to your selection",
      data: vendorProduct,
    })
  } catch (error) {
    console.error("Add vendor product error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Remove product from vendor's selection
// @route   DELETE /api/vendors/products/:productId
// @access  Private (Vendor only)
const removeVendorProduct = async (req, res) => {
  try {
    const vendorProduct = await VendorProduct.findOneAndDelete({
      vendor_id: req.user.userId,
      product_id: req.params.productId,
    })

    if (!vendorProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found in your selection",
      })
    }

    res.json({
      success: true,
      message: "Product removed from your selection",
    })
  } catch (error) {
    console.error("Remove vendor product error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Update vendor product stock
// @route   PUT /api/vendors/products/:productId
// @access  Private (Vendor only)
const updateVendorProduct = async (req, res) => {
  try {
    const { stock_quantity } = req.body

    const vendorProduct = await VendorProduct.findOneAndUpdate(
      {
        vendor_id: req.user.userId,
        product_id: req.params.productId,
      },
      { stock_quantity },
      { new: true },
    ).populate("product_id", "name description price category stock_unit image")

    if (!vendorProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found in your selection",
      })
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      data: vendorProduct,
    })
  } catch (error) {
    console.error("Update vendor product error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  getVendorProducts,
  getAvailableProducts,
  addVendorProduct,
  removeVendorProduct,
  updateVendorProduct,
}
