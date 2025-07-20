const VendorActivity = require("../models/VendorActivity")
const Product = require("../models/Product")
const User = require("../models/User")
const VendorProduct = require("../models/VendorProduct")
const { validationResult } = require("express-validator")
const moment = require("moment")

// @desc    Get vendor activities
// @route   GET /api/vendors/activities
// @access  Private (Admin only)
const getVendorActivities = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      vendor_id,
      location,
      startDate,
      endDate,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query

    // Build query
    const query = {}

    if (vendor_id) {
      query.vendor_id = vendor_id
    }

    if (location) {
      query.location = { $regex: location, $options: "i" }
    }

    if (startDate || endDate) {
      query.date = {}
      if (startDate) {
        query.date.$gte = new Date(startDate)
      }
      if (endDate) {
        query.date.$lte = new Date(endDate)
      }
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const activities = await VendorActivity.find(query)
      .populate("vendor_id", "name email phone") // Include vendor name, email, and phone
      .populate("items.product_id", "name category")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await VendorActivity.countDocuments(query)

    // Add vendor name and email to response for easier frontend handling
    const activitiesWithVendorDetails = activities.map((activity) => ({
      ...activity.toObject(),
      vendorName: activity.vendor_id?.name || "Unknown",
      vendorEmail: activity.vendor_id?.email || "Unknown",
    }))

    res.json({
      success: true,
      data: activitiesWithVendorDetails,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get vendor activities error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get vendor's own activities
// @route   GET /api/vendors/my-activities
// @access  Private (Vendor only)
const getMyActivities = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query

    // Build query for current vendor
    const query = { vendor_id: req.user.userId }

    if (startDate || endDate) {
      query.date = {}
      if (startDate) {
        query.date.$gte = new Date(startDate)
      }
      if (endDate) {
        query.date.$lte = new Date(endDate)
      }
    }

    // Populate vendor_id with email only
    const activities = await VendorActivity.find(query)
      .populate({ path: "vendor_id", select: "email" })
      .populate("items.product_id", "name category")
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await VendorActivity.countDocuments(query)

    // Calculate totalAmount for each activity and flatten vendor email
    const activitiesWithTotal = activities.map((activity) => {
      const totalAmount = activity.items.reduce(
        (sum, item) => sum + (item.total || (item.quantity * (item.price || 0)) || 0),
        0
      )
      const items = activity.items.map(item => ({
        ...item._doc,
        productName: item.productName || item.product_id?.name || "",
      }))
      return {
        ...activity.toObject(),
        vendorEmail: activity.vendor_id?.email || "",
        vendor_id: undefined, // Remove vendor_id from response
        totalAmount,
        items,
      }
    })

    res.json({
      success: true,
      data: activitiesWithTotal,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get my activities error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Create vendor activity
// @route   POST /api/vendors/activities
// @access  Private (Vendor only)
const createVendorActivity = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { date, location, items } = req.body

    // Check if activity already exists for this vendor on this date
    const existingActivity = await VendorActivity.findOne({
      vendor_id: req.user.userId,
      date: {
        $gte: moment(date).startOf("day").toDate(),
        $lte: moment(date).endOf("day").toDate(),
      },
    })

    if (existingActivity) {
      return res.status(400).json({
        success: false,
        message: "Activity already exists for this date. Please update the existing activity.",
      })
    }

    // Validate and enrich items with product details
    const enrichedItems = []
    for (const item of items) {
      const product = await Product.findById(item.product_id)
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.product_id} not found`,
        })
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not active`,
        })
      }

      enrichedItems.push({
        product_id: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        total: item.quantity * product.price,
      })
    }

    // Calculate totalAmount
    const totalAmount = enrichedItems.reduce((sum, item) => sum + item.total, 0)

    const activityData = {
      vendor_id: req.user.userId,
      date: new Date(date),
      location,
      items: enrichedItems,
      totalAmount, // <-- This is required by your schema!
    }

    const activity = await VendorActivity.create(activityData)
    await activity.populate("items.product_id", "name category")

    res.status(201).json({
      success: true,
      message: "Vendor activity created successfully",
      data: activity,
    })
  } catch (error) {
    console.error("Create vendor activity error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Update vendor activity
// @route   PUT /api/vendors/activities/:id
// @access  Private (Vendor only)
const updateVendorActivity = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const activity = await VendorActivity.findById(req.params.id)
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      })
    }

    // Check if the activity belongs to the current vendor
    if (activity.vendor_id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this activity",
      })
    }

    const { location, items } = req.body

    // Validate and enrich items with product details
    if (items && items.length > 0) {
      const enrichedItems = []
      for (const item of items) {
        const product = await Product.findById(item.product_id)
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product with ID ${item.product_id} not found`,
          })
        }

        enrichedItems.push({
          product_id: product._id,
          productName: product.name,
          quantity: item.quantity,
          price: product.price,
          total: item.quantity * product.price,
        })
      }
      activity.items = enrichedItems
    }

    if (location) {
      activity.location = location
    }

    activity.totalAmount = activity.items.reduce((sum, item) => sum + item.total, 0);
    await activity.save()
    await activity.populate("items.product_id", "name category")

    res.json({
      success: true,
      message: "Vendor activity updated successfully",
      data: activity,
    })
  } catch (error) {
    console.error("Update vendor activity error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Delete vendor activity
// @route   DELETE /api/vendors/activities/:id
// @access  Private (Vendor only)
const deleteVendorActivity = async (req, res) => {
  try {
    const activity = await VendorActivity.findById(req.params.id)
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      })
    }

    // Check if the activity belongs to the current vendor
    if (activity.vendor_id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this activity",
      })
    }

    await VendorActivity.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Vendor activity deleted successfully",
    })
  } catch (error) {
    console.error("Delete vendor activity error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get vendor statistics
// @route   GET /api/vendors/stats
// @access  Private (Admin only)
const getVendorStats = async (req, res) => {
  try {
    const totalVendors = await User.countDocuments({ role: "vendor" })
    const activeVendors = await User.countDocuments({ role: "vendor", isActive: true })

    // Get total activities
    const totalActivities = await VendorActivity.countDocuments()

    // Get activities this month
    const startOfMonth = moment().startOf("month").toDate()
    const endOfMonth = moment().endOf("month").toDate()

    const activitiesThisMonth = await VendorActivity.countDocuments({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    })

    // Get total revenue
    const revenueData = await VendorActivity.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ])

    // Get revenue this month
    const revenueThisMonth = await VendorActivity.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          monthlyRevenue: { $sum: "$totalAmount" },
        },
      },
    ])

    // Get top performing vendors
    const topVendors = await VendorActivity.aggregate([
      {
        $group: {
          _id: "$vendor_id",
          totalRevenue: { $sum: "$totalAmount" },
          totalActivities: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "vendor",
        },
      },
      {
        $unwind: "$vendor",
      },
      {
        $sort: { totalRevenue: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          vendorEmail: "$vendor.email",
          totalRevenue: 1,
          totalActivities: 1,
        },
      },
    ])

    res.json({
      success: true,
      data: {
        totalVendors,
        activeVendors,
        inactiveVendors: totalVendors - activeVendors,
        totalActivities,
        activitiesThisMonth,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        monthlyRevenue: revenueThisMonth[0]?.monthlyRevenue || 0,
        topVendors,
      },
    })
  } catch (error) {
    console.error("Get vendor stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get selected products for a vendor
// @route   GET /api/vendors/:id/products
// @access  Private (Admin only)
const getProductsByVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;

    // Find products selected by this vendor
    const products = await VendorProduct.find({ vendor_id: vendorId })
      .populate('product_id', 'name category price') // Populate product details
      .select('product_id');

    res.json({
      success: true,
      data: products.map(vp => vp.product_id),
    });
  } catch (error) {
    console.error("Get products by vendor error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get products by multiple vendors
// @route   POST /api/vendors/products
// @access  Private (Admin only)
const getProductsByVendors = async (req, res) => {
  try {
    const { vendors } = req.body; // Array of { id, name }
    if (!vendors || vendors.length === 0) {
      return res.status(400).json({ success: false, message: "No vendors provided" });
    }

    const products = await Promise.all(
      vendors.map(async (vendor) => {
        const vendorProducts = await VendorProduct.find({ vendor_id: vendor.id })
          .populate("product_id", "name category price")
          .populate("vendor_id", "name");
        return vendorProducts.map((vp) => ({
          vendor_id: { name: vendor.name },
          product_id: vp.product_id,
        }));
      })
    );

    res.json({ success: true, data: products.flat() });
  } catch (error) {
    console.error("Error fetching products by vendors:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getVendorActivities,
  getMyActivities,
  createVendorActivity,
  updateVendorActivity,
  deleteVendorActivity,
  getVendorStats,
  getProductsByVendor,
  getProductsByVendors,
}
