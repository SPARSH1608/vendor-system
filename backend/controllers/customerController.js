const Customer = require("../models/Customer");

const getCustomerByPhone = async (req, res) => {
    console.log("getCustomerByPhone called with phone:", req.params.phone);
    // Validate phone number format if necessary
  try {
    const { phone } = req.params;

    const customer = await Customer.findOne({ phone }).populate("purchaseHistory.bill_id", "billNumber totalAmount createdAt");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer by phone:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getCustomerByPhone,
};