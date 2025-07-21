const Bill = require("../models/Bill")
const VendorProduct = require("../models/VendorProduct")
const Product = require("../models/Product")
const { validationResult } = require("express-validator")
const mongoose = require("mongoose") // Import mongoose
const moment = require("moment") // already imported
const VendorActivity = require("../models/VendorActivity")
const nodemailer = require("nodemailer")
const twilio = require("twilio")
const axios = require("axios")
const Customer = require("../models/Customer")

// Setup Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Setup Twilio Client
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)

// Helper function to send bill
const generateInvoiceHtml = (bill) => {
  // You can further improve this HTML and add inline CSS as needed
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border:1px solid #eee; border-radius:8px; overflow:hidden;">
    <div style="background:#222; color:#fff; padding:16px 24px; display:flex; justify-content:space-between;">
      <div style="text-align:right; font-size:13px;">
        <div><b>Bill No:</b> ${bill.billNumber}</div>
        <div><b>Date:</b> ${new Date(bill.createdAt).toLocaleDateString("en-IN")}</div>
      </div>
    </div>
    <div style="padding:24px;">
      <h2 style="margin:0 0 8px 0;">Billing to</h2>
      <div style="margin-bottom:16px;">
        <div><b>${bill.customer?.name || ""}</b></div>
        <div>${bill.customer?.email || ""}</div>
        <div>${bill.customer?.phone || ""}</div>
      </div>
      <h3 style="margin:24px 0 8px 0; border-bottom:1px solid #eee; padding-bottom:4px;">Products</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
        <thead>
          <tr>
            <th align="left" style="border-bottom:1px solid #eee; padding:8px 0;">Product</th>
            <th align="center" style="border-bottom:1px solid #eee; padding:8px 0;">Qty</th>
            <th align="right" style="border-bottom:1px solid #eee; padding:8px 0;">Unit Price</th>
            <th align="right" style="border-bottom:1px solid #eee; padding:8px 0;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${bill.items.map(item => `
            <tr>
              <td style="padding:6px 0;">${item.productName}</td>
              <td align="center">${item.quantity}</td>
              <td align="right">₹${item.price}</td>
              <td align="right">₹${item.total}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div style="margin-bottom:8px;">
        <b>Location:</b> ${bill.location || "-"}
      </div>
    
      <table style="width:100%; margin-top:24px;">
        <tr>
          <td align="right" style="padding:4px 0;">Subtotal:</td>
          <td align="right" style="padding:4px 0;">₹${bill.subtotal}</td>
        </tr>
        <tr>
          <td align="right" style="padding:8px 0; font-weight:bold; border-top:1px solid #eee;">Total:</td>
          <td align="right" style="padding:8px 0; font-weight:bold; border-top:1px solid #eee;">₹${bill.totalAmount}</td>
        </tr>
      </table>
      <div style="margin-top:32px; font-size:12px; color:#888;">
        This is an electronically generated invoice and does not require a signature.<br/>
        Thank you for your business!
      </div>
    </div>
  </div>
  `
}

const sendBillToCustomer = async (bill) => {
  const customerEmail = bill.customer?.email;
  const customerPhone = bill.customer?.phone;
  const amount = bill.totalAmount;
  const billId = bill.billNumber || bill._id;

  // Generate HTML invoice
  const html = generateInvoiceHtml(bill);

  // Send Email
  if (customerEmail) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: "Your Invoice - Bill Paid",
        html, // <-- send as HTML
      });
      console.log(`Email sent to ${customerEmail}`);
    } catch (error) {
      console.error("Error sending email:", error.message);
    }
  }

  // Send SMS via Fast2SMS
  if (customerPhone) {
    const mobile = customerPhone.replace('+', '').startsWith('91')
      ? customerPhone.replace('+', '')
      : '91' + customerPhone;
    const message = `Your invoice ${bill.billNumber} for ₹${bill.totalAmount} is ready. Thank you!`;

    try {
      const res = await axios.post(
        'https://www.fast2sms.com/dev/bulkV2',
        {
          authorization: process.env.FAST2SMS_KEY,
          sender_id: process.env.FAST2SMS_SENDER || 'FSTSMS',
          message,
          route: 't', // for 24×7 transactional
          numbers: mobile,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('SMS sent via Fast2SMS:', res.data);
    } catch (err) {
      console.error('Fast2SMS error:', err.response?.data || err.message);
    }
  }
}

// @desc    Get vendor's bills
// @route   GET /api/vendors/bills
// @access  Private (Vendor only)
const getVendorBills = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query

    // Build query
    const query = { vendor_id: req.user.userId }

    if (status && status !== "all") {
      query.status = status
    }

    if (search) {
      query.$or = [
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
        { billNumber: { $regex: search, $options: "i" } },
      ]
    }

    const bills = await Bill.find(query)
      .populate("items.product_id", "name category")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Bill.countDocuments(query)

    res.json({
      success: true,
      data: bills,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get vendor bills error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get all bills for admin (excluding drafts)
// @route   GET /api/bills
// @access  Private (Admin only)
const getAllBills = async (req, res) => {
  try {
    const { page = 1, limit = 10, vendor_id, status } = req.query

    // Build query - exclude drafts for admin
    const query = { status: { $ne: "draft" } }

    if (vendor_id) {
      query.vendor_id = vendor_id
    }

    if (status && status !== "all") {
      query.status = status
    }

    const bills = await Bill.find(query)
      .populate("vendor_id", "email phone")
      .populate("items.product_id", "name category")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Bill.countDocuments(query)

    res.json({
      success: true,
      data: bills,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get all bills error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get bill by ID
// @route   GET /api/bills/:id
// @access  Private
const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("vendor_id", "email phone")
      .populate("items.product_id", "name category")

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      })
    }

    // Check permissions
    if (req.user.role === "vendor" && bill.vendor_id._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this bill",
      })
    }

    // Admin cannot see draft bills
    if (req.user.role === "admin" && bill.status === "draft") {
      return res.status(403).json({
        success: false,
        message: "Draft bills are not accessible to admin",
      })
    }

    res.json({
      success: true,
      data: bill,
    })
  } catch (error) {
    console.error("Get bill by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Create bill
// @route   POST /api/vendors/bills
// @access  Private (Vendor only)
const createBill = async (req, res) => {
  try {
    const { customer, items, location, notes, status = "draft" } = req.body;

    // Check if customer exists by phone number
    let existingCustomer = await Customer.findOne({ phone: customer.phone });

    if (!existingCustomer) {
      // Create a new customer if not found
      existingCustomer = await Customer.create({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      });
    }

    // Prepare bill items
    const enrichedItems = [];
    for (const item of items) {
      const vendorProduct = await VendorProduct.findOne({
        vendor_id: req.user.userId,
        product_id: item.product_id,
        isActive: true,
      }).populate("product_id");

      if (!vendorProduct || !vendorProduct.product_id.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product_id} not found in your selection or inactive`,
        });
      }

      enrichedItems.push({
        product_id: vendorProduct.product_id._id,
        productName: vendorProduct.product_id.name,
        quantity: item.quantity,
        price: vendorProduct.product_id.price,
        stock_unit: vendorProduct.product_id.stock_unit,
        total: item.quantity * vendorProduct.product_id.price,
      });
    }

    // Calculate subtotal and totalAmount
    const subtotal = enrichedItems.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = subtotal;

    // Generate a bill number
    const billNumber = `BILL-${Date.now()}`;

    // Create bill data
    const billData = {
      vendor_id: req.user.userId,
      customer: {
        name: existingCustomer.name,
        email: existingCustomer.email,
        phone: existingCustomer.phone,
      }, // Populate customer fields
      items: enrichedItems,
      location,
      notes,
      status,
      subtotal,
      totalAmount,
      billNumber,
    };

    const bill = await Bill.create(billData);

    // Update customer's purchase history
    existingCustomer.purchaseHistory.push({
      bill_id: bill._id,
      date: bill.createdAt,
      totalAmount: bill.totalAmount,
    });
    await existingCustomer.save();

    res.status(201).json({
      success: true,
      message: "Bill created successfully",
      data: bill,
    });
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// @desc    Update bill
// @route   PUT /api/vendors/bills/:id
// @access  Private (Vendor only)
const updateBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      })
    }

    // Check if bill belongs to vendor
    if (bill.vendor_id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this bill",
      })
    }

    const { customer, items, location, notes, status } = req.body

    // If items are being updated, validate them
    if (items && items.length > 0) {
      const enrichedItems = []
      for (const item of items) {
        const vendorProduct = await VendorProduct.findOne({
          vendor_id: req.user.userId,
          product_id: item.product_id,
          isActive: true,
        }).populate("product_id")

        if (!vendorProduct || !vendorProduct.product_id.isActive) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.product_id} not found in your selection or inactive`,
          })
        }

        enrichedItems.push({
          product_id: vendorProduct.product_id._id,
          productName: vendorProduct.product_id.name,
          quantity: item.quantity,
          price: vendorProduct.product_id.price,
          stock_unit: vendorProduct.product_id.stock_unit,
          total: item.quantity * vendorProduct.product_id.price,
        })
      }
      bill.items = enrichedItems
    }

    // Update other fields
    if (customer) bill.customer = customer
    if (location) bill.location = location
    if (notes !== undefined) bill.notes = notes
    if (status) bill.status = status

    await bill.save()
    await bill.populate("items.product_id", "name category")

    res.json({
      success: true,
      message: "Bill updated successfully",
      data: bill,
    })
  } catch (error) {
    console.error("Update bill error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Update bill status
// @route   PUT /api/vendors/bills/:id/status
// @access  Private (Vendor only)
const updateBillStatus = async (req, res) => {
  try {
    const { status } = req.body

    const bill = await Bill.findById(req.params.id)
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      })
    }

    // Check if bill belongs to vendor
    if (bill.vendor_id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this bill",
      })
    }

    const prevStatus = bill.status
    bill.status = status
    await bill.save()

    // --- VendorActivity update logic ---
    const billDate = moment(bill.createdAt).startOf("day").toDate()
    let activity = await VendorActivity.findOne({
      vendor_id: req.user.userId,
      date: {
        $gte: billDate,
        $lte: moment(billDate).endOf("day").toDate(),
      },
    })

    const items = bill.items.map(item => ({
      product_id: item.product_id,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    }));
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    // If bill is now paid and was not paid before, add items to activity
    if (status === "paid" && prevStatus !== "paid") {
      if (!activity) {
        // Calculate totalAmount for the activity
        const items = bill.items.map(item => ({
          product_id: item.product_id,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        }));
        const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

        // Create new activity for the day
        await VendorActivity.create({
          vendor_id: req.user.userId,
          date: billDate,
          location: bill.location,
          items,
          totalAmount,
        })
      } else {
        // Add/update items in activity
        for (const billItem of bill.items) {
          const existingItem = activity.items.find(
            item => item.product_id.toString() === billItem.product_id.toString()
          )
          if (existingItem) {
            existingItem.quantity += billItem.quantity
            existingItem.total += billItem.total
          } else {
            activity.items.push({
              product_id: billItem.product_id,
              productName: billItem.productName,
              quantity: billItem.quantity,
              price: billItem.price,
              total: billItem.total,
            })
          }
        }
        activity.totalAmount = activity.items.reduce((sum, item) => sum + item.total, 0);
        await activity.save()
      }
    }

    // If bill was paid and is now not paid, remove items from activity
    if (prevStatus === "paid" && status !== "paid" && activity) {
      for (const billItem of bill.items) {
        const existingItem = activity.items.find(
          item => item.product_id.toString() === billItem.product_id.toString()
        )
        if (existingItem) {
          existingItem.quantity -= billItem.quantity
          existingItem.total -= billItem.total
          // Remove item if quantity is zero or less
          if (existingItem.quantity <= 0) {
            activity.items = activity.items.filter(
              item => item.product_id.toString() !== billItem.product_id.toString()
            )
          }
        }
      }
      activity.totalAmount = activity.items.reduce((sum, item) => sum + item.total, 0);
      await activity.save()
    }
    // --- End VendorActivity update logic ---

    res.json({
      success: true,
      message: "Bill status updated successfully",
      data: bill,
    })
  } catch (error) {
    console.error("Update bill status error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Delete bill
// @route   DELETE /api/vendors/bills/:id
// @access  Private (Vendor only)
const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      })
    }

    // Check if bill belongs to vendor
    if (bill.vendor_id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this bill",
      })
    }

    await Bill.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Bill deleted successfully",
    })
  } catch (error) {
    console.error("Delete bill error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get bill statistics
// @route   GET /api/vendors/bills/stats
// @access  Private (Vendor only)
const getBillStats = async (req, res) => {
  try {
    const vendorId = req.user.userId

    const totalBills = await Bill.countDocuments({ vendor_id: vendorId })
    const paidBills = await Bill.countDocuments({ vendor_id: vendorId, status: "paid" })
    const unpaidBills = await Bill.countDocuments({ vendor_id: vendorId, status: "unpaid" })
    const draftBills = await Bill.countDocuments({ vendor_id: vendorId, status: "draft" })

    // Calculate revenue (only from paid bills)
    const revenueData = await Bill.aggregate([
      { $match: { vendor_id: new mongoose.Types.ObjectId(vendorId), status: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ])

    const totalRevenue = revenueData[0]?.totalRevenue || 0

    res.json({
      success: true,
      data: {
        totalBills,
        paidBills,
        unpaidBills,
        draftBills,
        totalRevenue,
      },
    })
  } catch (error) {
    console.error("Get bill stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  getVendorBills,
  getAllBills,
  getBillById,
  createBill,
  updateBill,
  updateBillStatus,
  deleteBill,
  getBillStats,
}
