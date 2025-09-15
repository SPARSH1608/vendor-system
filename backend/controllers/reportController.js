const VendorActivity = require("../models/VendorActivity");
const User = require("../models/User");

// Helper to parse date from query or return undefined
function parseDate(dateStr) {
  return dateStr ? new Date(dateStr) : undefined;
}

// 1. Which vendor sold how much product at each location (with date filter)
exports.vendorSales = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = parseDate(startDate);
      if (endDate) query.date.$lte = parseDate(endDate);
    }

    const activities = await VendorActivity.find(query).lean();

    // Flatten items and enrich with vendor and location
    const results = [];
    for (const activity of activities) {
      const vendor = await User.findById(activity.vendor_id).lean();
      for (const item of activity.items) {
        results.push({
          vendorName: vendor ? vendor.name : "Unknown",
          placeName: activity.location,
          productName: item.productName,
          quantity: item.quantity,
          date: activity.date,
        });
      }
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. On each place, how much each product sold (with date filter)
exports.productSalesByPlace = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = parseDate(startDate);
      if (endDate) query.date.$lte = parseDate(endDate);
    }

    const activities = await VendorActivity.find(query).lean();

    // Flatten items with date for each sale
    const results = [];
    for (const activity of activities) {
      for (const item of activity.items) {
        results.push({
          placeName: activity.location,
          productName: item.productName,
          totalSold: item.quantity,
          date: activity.date,
        });
      }
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Specific vendor sales report (with date filter)
exports.vendorSpecificSales = async (req, res) => {
  try {
    const { vendorId, startDate, endDate } = req.query;
    if (!vendorId) return res.status(400).json({ error: "vendorId is required" });

    const query = { vendor_id: vendorId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const activities = await VendorActivity.find(query).lean();

    const results = [];
    for (const activity of activities) {
      for (const item of activity.items) {
        results.push({
          placeName: activity.location,
          productName: item.productName,
          quantity: item.quantity,
          date: activity.date,
        });
      }
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};